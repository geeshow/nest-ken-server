import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

console.log(process.env.NODE_ENV);
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const corsOptions: CorsOptions = {
    origin: [
      'http://localhost:8080',
    ],
    methods: ['OPTIONS', 'PATCH', 'GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: '*',
    exposedHeaders: ['Access', 'Refresh'],
    credentials: true,
  };
  
  app.enableCors(corsOptions);
  
  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT'));
}
bootstrap();
