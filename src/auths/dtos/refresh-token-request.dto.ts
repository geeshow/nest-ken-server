import { IsString } from 'class-validator';

export class RefreshTokenRequestDto {
    @IsString()
    refreshToken: string;
}

export class RefreshTokenResponseDto {
    @IsString()
    jwt: string;
}
