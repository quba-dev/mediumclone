import {userType} from "@app/user/types/user.type";

export interface UserResponseInterface{
    user: userType &{token:string};
}