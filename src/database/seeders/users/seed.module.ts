import { Module } from '@nestjs/common';
import { UsersSeedService } from './seed.service';

@Module({
  providers: [UsersSeedService],
})
export class UsersSeedModule {}
