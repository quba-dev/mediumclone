import {articleType} from "@app/article/types/article.type";


export interface ArticlesResponseInterface{
    articles: articleType[]
    articlesCount:number
}