import {UserEntity} from "@app/user/user.entity";

export type userType= Omit<UserEntity,'hashPassword'>