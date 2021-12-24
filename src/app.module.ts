import {MiddlewareConsumer, Module, RequestMethod} from '@nestjs/common';
import {TagModule} from '@app//tag/tag.module';
import {TypeOrmModule} from "@nestjs/typeorm";
import ormconfig from "../ormconfig";
import {UserModule} from "@app/user/user.module";
import {authMiddleware} from "@app/user/middlewares/auth.middleware";
import {ArticleModule} from "@app/article/article.module";
import {profileModule} from "@app/profile/profile.module";

@Module({
  imports: [TypeOrmModule.forRoot(ormconfig),TagModule,UserModule,ArticleModule,profileModule],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer:MiddlewareConsumer){
    consumer.apply(authMiddleware).forRoutes({
      path:'*',
      method:RequestMethod.ALL
    })
  }
}
