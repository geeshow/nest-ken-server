import { Test, TestingModule } from '@nestjs/testing';
import { AuthsService } from './auths.service'; // Adjust the import according to your file structure
import { Model } from 'mongoose';
import { GoogleAuth, GoogleAuthDocument } from "./google-auth.schema";
import { GoogleRequestDto } from "./dtos/google.dto";
import { JwtService } from "@nestjs/jwt";
import { getModelToken } from "@nestjs/mongoose";
import { NotFoundException } from "@nestjs/common"; // Adjust the import according to your file structure

type MockGoogleAuthModel = {
  findOneAndUpdate: jest.Mock,
  findOne: jest.Mock,
} & Partial<Model<GoogleAuth>>;

type MockJwtService = {
  sign: jest.Mock,
  verify: jest.Mock,
} & Partial<JwtService>;

describe('AuthsService', () => {
  let mockGoogleAuthModel: MockGoogleAuthModel
  let mockJwtService: MockJwtService;
  let service: AuthsService;
  const googleLoginData: GoogleRequestDto = {
    provider: 'google',
    providerId: 'providerId',
    email: 'test@example.com',
    givenName: 'John',
    familyName: 'Doe',
    profilePictureUrl: 'http://example.com/pic.jpg',
    googleAccessToken: 'access_token',
    googleRefreshToken: 'refresh_token',
  };
  
  beforeEach(async () => {
    mockGoogleAuthModel = {
      findOneAndUpdate: jest.fn(),
      findOne: jest.fn(),
    }
    mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    }
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthsService,
        {
          provide: getModelToken('GoogleAuth'),
          useValue: mockGoogleAuthModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();
    
    service = module.get<AuthsService>(AuthsService);
  });
  
  describe('googleLogin', () => {
    it('should create or update a user and return JWT and refreshToken', async () => {
      const jwtToken = 'sample_jwt_token';
      const refreshToken = 'sample_refresh_token';
      const expectedUserData = {
        ...googleLoginData,
        refreshToken: refreshToken,
      };
      
      mockGoogleAuthModel.findOneAndUpdate.mockResolvedValue(expectedUserData);
      jest.spyOn(service, 'createJwtToken').mockReturnValue(jwtToken);
      jest.spyOn(service, 'createRefreshToken').mockReturnValue(refreshToken);
      
      const result = await service.googleLogin(googleLoginData);
      
      expect(result).toEqual({
        jwt: jwtToken,
        refreshToken: refreshToken,
      });
      
      expect(mockGoogleAuthModel.findOneAndUpdate).toHaveBeenCalledWith(
        { providerId: googleLoginData.providerId },
        expect.any(Object),
        { upsert: true, new: true },
      );
      
      expect(service.createJwtToken).toHaveBeenCalledWith(expectedUserData);
      expect(service.createRefreshToken).toHaveBeenCalledWith(googleLoginData.email);
    });
  });

  describe('refreshJwt', () => {
    it('should return a new JWT', async () => {
      const jwtToken = 'sample_jwt_token';
      const refreshToken = 'sample_refresh_token';
      const expectedUserData = {
        ...googleLoginData,
        refreshToken: refreshToken,
      };
      
      mockGoogleAuthModel.findOne.mockResolvedValue(expectedUserData);
      mockJwtService.verify.mockReturnValue(true);
      jest.spyOn(service, 'createJwtToken').mockReturnValue(jwtToken);
      
      const result = await service.refreshJwt(refreshToken);
      
      expect(result).toEqual({
        jwt: jwtToken,
      });
    });
    
    it('should throw not found exception', async () => {
      const refreshToken = 'sample_refresh_token';
      mockJwtService.verify.mockReturnValue(false);
      
      // 예외가 발생하는지 검증합니다.
      await expect(service.refreshJwt(refreshToken))
        .rejects
        .toThrow(NotFoundException);
    });
  });
  
  describe('createJwtToken', () => {
    it('should return a JWT', () => {
      const userData = {
        _id: 'id',
        providerId: 'providerId',
        givenName: 'John',
        familyName: 'Doe',
        email: 'test@email.com',
        profilePictureUrl: 'http://example.com/pic.jpg',
      } as GoogleAuthDocument
      mockJwtService.sign.mockReturnValue('jwt_token');
      
      const result = service.createJwtToken(userData);
      
      expect(result).toEqual('jwt_token');
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        id: userData._id,
        name: userData.givenName,
        email: userData.email,
        profilePictureUrl: userData.profilePictureUrl,
      }, {
        expiresIn: '1d',
        issuer: `${process.env.HOST_URL}`,
        audience: `${process.env.HOST_URL}`,
      });
    })
  });
  
  describe('createRefreshToken', () => {
    it('should return a refresh token', () => {
      const email = 'test@email.com';
      mockJwtService.sign.mockReturnValue('refresh_token');
      
      const result = service.createRefreshToken(email);
      
      expect(result).toEqual('refresh_token');
      expect(mockJwtService.sign).toHaveBeenCalledWith({ email }, { expiresIn: '14d' });
    });
  });
});
