import {Module} from "@nestjs/common";
import {profileController} from "@app/profile/profile.controller";
import {ProfileService} from "@app/profile/profile.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserEntity} from "@app/user/user.entity";
import {followEntity} from "@app/profile/follow.entity";


@Module({
    controllers:[profileController],
    providers:[ProfileService],
    imports:[TypeOrmModule.forFeature([UserEntity,followEntity])]

})
export class profileModule{

}