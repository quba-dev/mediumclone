import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {CreateArticleDto} from "@app/article/dto/createArticle.dto";
import {UserEntity} from "@app/user/user.entity";
import {ArticleEntity} from "@app/article/article.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {DeleteResult, getRepository, Repository} from "typeorm";
import {ArticleResponseInterface} from "@app/article/types/articleResponse.interface";
import slugify from "slugify";
import {ArticlesResponseInterface} from "@app/article/types/articlesResponse.interface";
import {followEntity} from "@app/profile/follow.entity";


@Injectable()
export class ArticleService{
    constructor(
        @InjectRepository(ArticleEntity)
        private readonly articleRepository:Repository<ArticleEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository:Repository<UserEntity>,
        @InjectRepository(followEntity)
        private readonly followRepository:Repository<followEntity>) {}


    async findAll(currentUserId:number,query:any):Promise<ArticlesResponseInterface>{
        const queryBuilder= getRepository(ArticleEntity)
            .createQueryBuilder('articles')
            .leftJoinAndSelect('articles.author','author')

        queryBuilder.orderBy('articles.createdAt','DESC')
        const articlesCount= await queryBuilder.getCount()
        if(query.tag){
            queryBuilder.andWhere('articles.tagList LIKE :tag',{tag: `%${query.tag}$%`})
        }

        if(query.author){
            const author = await this.userRepository.findOne({username:query.author})
            queryBuilder.andWhere('articles.authorId= :id',{id:author.id})
        }
        if(query.favorited){
            const author = await this.userRepository.findOne({username:query.favorited},{relations:['favorites']})
            const ids= author.favorites.map((el)=>el.id)
            console.log(ids)
            if(ids.length > 0){
                queryBuilder.andWhere('articles.authorId IN (:...ids)',{ids})
            }else {
                queryBuilder.andWhere('1=0');
            }

        }
        if(query.limit){
            queryBuilder.limit(query.limit)
        }
        if(query.offset){
            queryBuilder.offset(query.offset)
        }
        let favoriteIds:number[]=[]
        if(currentUserId){
            const currentuser=await this.userRepository.findOne(currentUserId,{relations:['favorites']})
            favoriteIds= currentuser.favorites.map((favorite)=>favorite.id)
        }


        const articles = await queryBuilder.getMany()
        const articlesWithFavorites= articles.map(article=>{
            const favorited= favoriteIds.includes(article.id)
            return {...article,favorited}
        })

        return {articles:articlesWithFavorites,articlesCount}
    }
    async getFeed(currentUserId:number,query:any):Promise<ArticlesResponseInterface>{
        const follows= await this.followRepository.find({followerId:currentUserId})
        if (follows.length===0){
            return {articles:[],articlesCount:0}
        }
        const followingUserId= follows.map((follow)=>follow.followingId)
        const queryBuilder= getRepository(ArticleEntity)
            .createQueryBuilder('articles')
            .leftJoinAndSelect('articles.author','author')
            .where('articles.authorId IN (:...ids)',{ids:followingUserId})

        queryBuilder.orderBy('articles.createdAt','DESC')
        const articlesCount=await queryBuilder.getCount()

        if(query.limit){
            queryBuilder.limit(query.limit)
        }
        if(query.offset){
            queryBuilder.offset(query.offset)
        }
        const articles= await queryBuilder.getMany()
        return {articles,articlesCount}
    }

    async createArticle(currentUser:UserEntity, createArticleDto:CreateArticleDto
    ):Promise<ArticleEntity>{
        const article= new ArticleEntity()
        Object.assign(article,createArticleDto)
        if(!article.tagList){
            article.tagList=[]
        }
        article.author=currentUser
        article.slug= this.getSlug(createArticleDto.title)
        return await this.articleRepository.save(article)

    }
    async addArticleToFavorites(slug:string,currentUserId:number
    ):Promise<ArticleEntity>{
        const article=await this.findBySlug(slug)
        const user=await this.userRepository.findOne(currentUserId,{relations:['favorites']})
        const IsNotFavorited= user.favorites.findIndex((articleInFavorites)=> articleInFavorites.id===article.id)===-1
        console.log(IsNotFavorited)
        if(IsNotFavorited){
            user.favorites.push(article)
            article.favoritesCount++;
            await this.userRepository.save(user)
            await this.articleRepository.save(article)
        }
        return article
    }
    async deleteArticleFromFavorites(slug:string,currentUserId:number
    ):Promise<ArticleEntity>{
        const article= await this.findBySlug(slug)
        const user= await this.userRepository.findOne(currentUserId,{relations:['favorites']})
        const articleIndex= user.favorites.findIndex((articleInFavorites)=> articleInFavorites.id===article.id)
        console.log(articleIndex)
        if(articleIndex >=0){
            user.favorites.splice(articleIndex,1)
            article.favoritesCount--
            await this.userRepository.save(user)
            await this.articleRepository.save(article)
        }
        return article
    }



    buildArticleResponse(article:ArticleEntity):ArticleResponseInterface{
        return {article}
    }
    async findBySlug(slug:string):Promise<ArticleEntity>{
        return await this.articleRepository.findOne({slug})
    }
    async deleteArticle(slug:string,currentUserId:number):Promise<DeleteResult>{
        const article= await this.findBySlug(slug)
        if(!article){
            throw new HttpException('Article does not exist',HttpStatus.NOT_FOUND)
        }
        if (currentUserId!==article.author.id){
            throw new HttpException('You are not author',HttpStatus.FORBIDDEN)
        }
        return await this.articleRepository.delete({slug})


    }

    private getSlug(title:string):string{
        return slugify(title,{lower:true}) +
            '-' +(Math.random()*Math.pow(36,6) |0)
                .toString(36)
    }

    async updateArticle(currentUserId:number,slug:string,updateArticleDto:CreateArticleDto
    ):Promise<ArticleEntity>{
        const article= await this.findBySlug(slug)
        if(!article){
            throw new HttpException('Article does not exist',HttpStatus.NOT_FOUND)
        }
        if (currentUserId!==article.author.id){
            throw new HttpException('You are not author',HttpStatus.FORBIDDEN)
        }
        Object.assign(article,updateArticleDto)
        return await this.articleRepository.save(article)
    }
}