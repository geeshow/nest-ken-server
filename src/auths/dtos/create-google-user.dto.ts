import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateGoogleUserRequestDto {
    @IsString()
    userType: string = 'FOUNDER';

    @IsString()
    @IsOptional()
    houseId: string;

    @IsString()
    accessToken: string;

    @IsBoolean()
    @IsOptional()
    isAgreeEmail?: boolean;

    @IsOptional()
    @IsString()
    position?: string;

    @IsOptional()
    @IsString()
    sector?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsOptional()
    @IsString()
    businessEmail?: string;

    @IsOptional()
    @IsString()
    funnels?: string;

    @IsOptional()
    @IsString()
    round?: string;
}
