import { Module } from '@nestjs/common';
import { AuthsController } from './auths.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthsService } from './auths.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleAuthSchema } from './google-auth.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'GoogleAuth', schema: GoogleAuthSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET_KEY'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    PassportModule,
  ],
  providers: [AuthsService, GoogleStrategy, JwtStrategy],
  controllers: [AuthsController],
})
export class AuthsModule {}
