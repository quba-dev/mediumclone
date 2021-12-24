import {ArticleEntity} from "@app/article/article.entity";

export type articleType= Omit<ArticleEntity,'updateTimeStamp'>