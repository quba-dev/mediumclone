import {Module} from "@nestjs/common";
import {ArticleController} from "@app/article/article.controller";
import {ArticleService} from "@app/article/article.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ArticleEntity} from "@app/article/article.entity";
import {UserEntity} from "@app/user/user.entity";
import {followEntity} from "@app/profile/follow.entity";


@Module({
    controllers:[ArticleController],
    providers:[ArticleService],
    imports:[TypeOrmModule.forFeature([ArticleEntity,UserEntity,followEntity])]
})


export class ArticleModule{}