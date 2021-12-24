import {Module} from "@nestjs/common";
import {TagController} from "./tag.controller";
import {TagService} from "./tag.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {TagEntity} from "@app/tag/tag.entity";


@Module({
    controllers:[TagController],
    providers:[TagService],
    imports:[TypeOrmModule.forFeature([TagEntity])]

})
export class TagModule{}