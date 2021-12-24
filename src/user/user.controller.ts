import {Controller, Get, Post, Body, UsePipes, ValidationPipe, Req, UseGuards, Put} from "@nestjs/common";
import {UserService} from "@app/user/user.service";
import {CreateUserDto} from "@app/user/dto/createUser.dto";
import {UserEntity} from "@app/user/user.entity";
import {UserResponseInterface} from "@app/user/types/userResponse.interface";
import {LoginDto} from "@app/user/dto/login.dto";
import {ExpressRequestInterface} from "@app/types/expressRequest.interface";
import { User } from "./decorators/user.decorator";
import {AuthGuard} from "@app/user/guards/auth.guard";
import {UpdateUserDto} from "@app/user/dto/updateUser.dto";

@Controller()
export class UserController{
    constructor(private readonly userService:UserService) {}
    @Post('users')
    @UsePipes(new ValidationPipe())
    async createUSer(@Body('user') createUserDto:CreateUserDto
    ):Promise<UserResponseInterface>{
        const user=await this.userService.createUser(createUserDto)
        return this.userService.buildUserResponse(user)
    }

    @Post('users/login')
    @UsePipes(new ValidationPipe())
    async login(@Body('user') loginUserDto:LoginDto
    ):Promise<UserResponseInterface>{
        const user= await this.userService.login(loginUserDto)
        return this.userService.buildUserResponse(user)
    }
    @Get('user')
    @UseGuards(AuthGuard)
    async currentUser(@User() user:UserEntity,@User('id') currentUserId:number
    ):Promise<UserResponseInterface>{
        console.log(currentUserId)
        return  this.userService.buildUserResponse(user)
    }

    @Put('user')
    @UseGuards(AuthGuard)
    async updateCurrentUser(
        @User('id')currentUserId:number,
        @Body('user') updateUserDto:UpdateUserDto
    ):Promise<UserResponseInterface>{
        const user= await this.userService.updateUser(currentUserId,updateUserDto)
        return this.userService.buildUserResponse(user)
    }


}