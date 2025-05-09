import { IsEmail, IsEmpty, IsNotEmpty, IsString } from "class-validator";

export class AuthCreateDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    fullname: string;

    usertype: string;

}