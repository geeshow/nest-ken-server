// google.strategy.ts
import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigType } from '@nestjs/config';
import { GoogleRequestDto } from '../dtos/google.dto';
import googleConfig from '../../config/googleConfig';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(googleConfig.KEY) private config: ConfigType<typeof googleConfig>,
  ) {
    super({
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      passReqToCallback: true, // 요청 객체를 callback 함수에 전달
      callbackURL: config.HOST_URL + '/auth/google/redirect',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const user = {
      provider: 'google',
      providerId: profile.id,
      email: profile.emails[0].value,
      givenName: profile.name.givenName,
      familyName: profile.name.familyName,
      profilePictureUrl: profile.photos[0].value,
      googleAccessToken: accessToken,
      googleRefreshToken: refreshToken,
    } as GoogleRequestDto;
    user.givenName =
      user.givenName.trim() === '' ? user.email.split('@')[0] : user.givenName;
    done(null, user);
  }
}
