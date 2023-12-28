import { IsString } from 'class-validator';

export class GoogleRequestDto {
  @IsString()
  provider: string;

  @IsString()
  providerId: string;

  @IsString()
  email: string;

  @IsString()
  givenName: string;

  @IsString()
  familyName: string;

  @IsString()
  profilePictureUrl: string;

  @IsString()
  googleAccessToken: string;

  @IsString()
  googleRefreshToken: string;
}
