import { registerAs } from '@nestjs/config';
export default registerAs('mongo', () => ({
  database: process.env.DATABASE,
  password: process.env.DATABASE_PASSWORD,
  username: process.env.DATABASE_USERNAME,
  port: process.env.DATABASE_PORT,
  host: process.env.DATABASE_HOST,
}));
