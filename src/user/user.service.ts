import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {CreateUserDto} from "@app/user/dto/createUser.dto";
import {UserEntity} from "@app/user/user.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {sign} from "jsonwebtoken"
import {JWT_SECRET} from "@app/config";
import {UserResponseInterface} from "@app/user/types/userResponse.interface";
import {LoginDto} from "@app/user/dto/login.dto";
import {compare} from 'bcrypt'
import {UpdateUserDto} from "@app/user/dto/updateUser.dto";

@Injectable()
export class UserService{
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository:Repository<UserEntity> ) {}


    async createUser(createUserDto:CreateUserDto):Promise<UserEntity>{
        const userByEmail= await this.userRepository.findOne({email:createUserDto.email})
        const userByUsername=await this.userRepository.findOne({username:createUserDto.username})
        if(userByEmail || userByUsername){
            throw new HttpException("Email and username are taken", HttpStatus.UNPROCESSABLE_ENTITY)
        }
        const newUser= new UserEntity()
        Object.assign(newUser,createUserDto)
        return await this.userRepository.save(newUser)
    }
    generateJwt(user:UserEntity):string{
        return sign({
            id:user.id,
            username:user.username,
            email:user.email
        },JWT_SECRET)
    }



    buildUserResponse(user:UserEntity):UserResponseInterface{
        return{
            user:{
                ...user,
                token:this.generateJwt(user)
            }
        }
    }

    async login(loginUserDto:LoginDto):Promise<UserEntity>{
        const user= await this.userRepository.findOne({email:loginUserDto.email},
            {select: ["id","username","bio","password","email","image"]})
        if(!user){
            throw new HttpException('No person with this email',HttpStatus.UNPROCESSABLE_ENTITY)
        }
        const isPassword= await compare(loginUserDto.password,user.password)
        if(!isPassword){
            throw new HttpException('No person with this email',HttpStatus.UNPROCESSABLE_ENTITY)
        }
        delete user.password
        return user
    }
    async findByID(id:number):Promise<UserEntity>{
        return await this.userRepository.findOne(id)
    }
    async updateUser(currentUserId:number,updateUserDto:UpdateUserDto){
        const user= await this.findByID(currentUserId)
        Object.assign(user,updateUserDto)
        return await this.userRepository.save(user)
    }

}