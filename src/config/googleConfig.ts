import { registerAs } from '@nestjs/config';

export default registerAs('google', () => ({
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  HOST_URL: process.env.HOST_URL,
}));
