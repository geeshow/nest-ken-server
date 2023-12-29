import { Injectable, NotFoundException } from '@nestjs/common';
import { GoogleRequestDto } from './dtos/google.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GoogleAuth, GoogleAuthDocument } from './google-auth.schema';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenResponseDto } from './dtos/refresh-token-request.dto';
import { IUser } from './dtos/ReqUser.dto';

@Injectable()
export class AuthsService {
  constructor(
    @InjectModel('GoogleAuth')
    private googleAuthModel: Model<GoogleAuth>,
    private readonly jwtService: JwtService,
  ) {}

  async googleLogin(googleLoginData: GoogleRequestDto) {
    const refreshToken = this.createRefreshToken(googleLoginData.email);
    const upsertUserData = {
      providerId: googleLoginData.providerId,
      givenName: googleLoginData.givenName,
      familyName: googleLoginData.familyName,
      email: googleLoginData.email,
      profilePictureUrl: googleLoginData.profilePictureUrl,
      googleAccessToken: googleLoginData.googleAccessToken,
      refreshToken: refreshToken,
    } as GoogleAuthDocument;

    const userData = await this.googleAuthModel.findOneAndUpdate(
      { providerId: googleLoginData.providerId },
      upsertUserData,
      { upsert: true, new: true },
    );
    
    return {
      jwt: this.createJwtToken(userData),
      refreshToken: refreshToken,
    };
  }

  async refreshJwt(refreshToken: string): Promise<RefreshTokenResponseDto> {
    if (!this.jwtService.verify(refreshToken)) {
      throw new NotFoundException('Refresh token not found');
    }
    
    const user = await this.googleAuthModel.findOne({ refreshToken });
    if (!user) throw new NotFoundException('Refresh token not found');

    return {
      jwt: this.createJwtToken(user),
    };
  }

  createJwtToken(user: GoogleAuthDocument) {
    const jwtPayload = {
      id: user._id,
      name: user.givenName,
      email: user.email,
      profilePictureUrl: user.profilePictureUrl,
    } as IUser;

    return this.jwtService.sign(jwtPayload, {
      expiresIn: '1d',
      issuer: `${process.env.HOST_URL}`,
      audience: `${process.env.HOST_URL}`,
    });
  }

  createRefreshToken(email: string) {
    return this.jwtService.sign({ email }, { expiresIn: '14d' });
  }
}
