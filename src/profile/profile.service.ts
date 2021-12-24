import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {profileType} from "@app/profile/types/profile.type";
import {ProfileResponseInterface} from "@app/profile/profileResponse.interface";
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "@app/user/user.entity";
import {Repository} from "typeorm";
import {followEntity} from "@app/profile/follow.entity";


@Injectable()
export class ProfileService{
    constructor(@InjectRepository(UserEntity)
                private readonly userRepository:Repository<UserEntity>,
                @InjectRepository(followEntity)
                private readonly followRepository:Repository<followEntity>) {}

    async getProfile(currentUserId:number,profileUsername:string):Promise<profileType>{
        const user= await this.userRepository.findOne({username:profileUsername})
        if(!user){
            throw new HttpException('No user',HttpStatus.NOT_FOUND)
        }
        const follow= await this.followRepository.findOne({followerId:currentUserId,followingId:user.id})
        return {...user,following:Boolean(follow)}

    }
    async followProfile(currentUserId:number,profileUsername:string):Promise<profileType>{
        const user= await this.userRepository.findOne({username:profileUsername})
        if(!user){
            throw new HttpException('No user',HttpStatus.NOT_FOUND)
        }
        if(currentUserId===user.id){
            throw new HttpException('You can not follow yourself',HttpStatus.BAD_REQUEST)
        }

        const follow = await this.followRepository.findOne({followerId:currentUserId,followingId:user.id})
        if(!follow){
            const createFollow= new followEntity()
            createFollow.followerId=currentUserId
            createFollow.followingId=user.id
            await this.followRepository.save(createFollow)
        }
        return {...user,following:true}

    }
    async deleteFollowProfile(currentUserId:number,profileUsername:string):Promise<profileType> {
        const user = await this.userRepository.findOne({username: profileUsername})
        if (!user) {
            throw new HttpException('No user', HttpStatus.NOT_FOUND)
        }
        if (currentUserId === user.id) {
            throw new HttpException('You can not deleteFollow yourself', HttpStatus.BAD_REQUEST)
        }
        await this.followRepository.delete({followerId:currentUserId,followingId:user.id})

        return {...user,following:false}

    }
    buildProfileResponse(profile:profileType):ProfileResponseInterface{
        delete profile.email
        return { profile }
    }

}