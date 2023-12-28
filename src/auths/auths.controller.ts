import { Body, Controller, Get, Post, Query, Redirect, Req, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthsService } from './auths.service';
import { GoogleRequestDto } from './dtos/google.dto';
import { RefreshTokenRequestDto } from './dtos/refresh-token-request.dto';
import { ReqUser } from '../common/decorators/req-user.decorator';
import { IUser } from './dtos/ReqUser.dto';

@Controller('auth')
export class AuthsController {
  private callbackHost: string;
  constructor(private authsService: AuthsService) {}

  @Get('google')
  @Redirect('google/login-action', 302)
  async googleAuth(@Query('host') host: string) {
    this.callbackHost = host;
    if (!host) {
      this.callbackHost = process.env.HOST_URL;
    }
  }

  @Get('google/login-action')
  @UseGuards(AuthGuard('google'))
  async googleLoginAction() {}

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const redirectUrl = this.callbackHost + '/login/google';
    const { jwt, refreshToken } = await this.authsService.googleLogin(req.user as GoogleRequestDto);

    res.cookie('refreshToken', refreshToken, {
      // httpOnly: true,
      // secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    res.redirect(`${redirectUrl}?jwt=${jwt}`);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getMyInfo(@ReqUser() user: IUser) {
    return user;
  }

  @Post('refresh-token')
  async refreshToken(@Body(ValidationPipe) refreshTokenRequestDto: RefreshTokenRequestDto) {
    return await this.authsService.refreshToken(refreshTokenRequestDto);
  }
}
