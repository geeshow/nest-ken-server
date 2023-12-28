import { IsBoolean, IsString } from 'class-validator';

interface IGoogleLoginResponseDto {
  isSignup: boolean;
  accessToken: string;
  jwt?: string;
  refreshToken?: string;
  isSubscribeNewsletter?: boolean;
}

export class GoogleLoginResponseDto implements IGoogleLoginResponseDto {
  @IsBoolean()
  isSignup: boolean;

  @IsString()
  accessToken: string;

  @IsString()
  jwt?: string;

  @IsString()
  refreshToken?: string;

  @IsString()
  isSubscribeNewsletter?: boolean;

  toDto(document: any): IGoogleLoginResponseDto {
    return {
      isSignup: document.isSignup,
      accessToken: document.accessToken,
      jwt: document.jwt,
      refreshToken: document.refreshToken,
      isSubscribeNewsletter: document.isSubscribeNewsletter ?? false,
    };
  }
}
