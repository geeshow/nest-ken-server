import { Injectable, NotFoundException } from '@nestjs/common';
import { GoogleRequestDto } from './dtos/google.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GoogleAuth, GoogleAuthDocument } from './GoogleAuth.schema';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenRequestDto, RefreshTokenResponseDto } from './dtos/refresh-token-request.dto';
import { IUser } from './dtos/ReqUser.dto';

@Injectable()
export class AuthsService {
  constructor(
    @InjectModel('GoogleAuth')
    private googleAuthModel: Model<GoogleAuth>,
    private readonly jwtService: JwtService,
  ) {}

  async googleLogin(googleLoginData: GoogleRequestDto) {
    const upsertUserData = {
      providerId: googleLoginData.providerId,
      givenName: googleLoginData.givenName,
      familyName: googleLoginData.familyName,
      email: googleLoginData.email,
      profilePictureUrl: googleLoginData.profilePictureUrl,
      googleAccessToken: googleLoginData.googleAccessToken,
      refreshToken: await this.createRefreshToken(googleLoginData.email),
    } as GoogleAuthDocument;

    const userData = await this.googleAuthModel.findOneAndUpdate(
      { providerId: googleLoginData.providerId },
      upsertUserData,
      { upsert: true, new: true },
    );

    if (!userData) {
      throw new NotFoundException('User not found');
    }

    return {
      jwt: this.createJwtToken(userData),
      refreshToken: userData.refreshToken,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto> {
    this.jwtService.verify(refreshTokenDto.refreshToken);
    const user = await this.googleAuthModel.findOne({ refreshToken: refreshTokenDto.refreshToken });
    if (!user) throw new NotFoundException('Refresh token not found');

    return {
      jwt: this.createJwtToken(user),
    };
  }

  private createJwtToken(user: GoogleAuthDocument) {
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

  private async createRefreshToken(email: string) {
    return this.jwtService.sign({ email }, { expiresIn: '14d' });
  }
}
