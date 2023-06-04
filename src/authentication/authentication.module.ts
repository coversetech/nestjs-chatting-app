import { JwtStrategy } from './jwt.strategy';
import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { UsersRepository } from 'src/models/users/users.repository';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '../common/guards/local.guard';
import { HttpModule } from '@nestjs/axios';
import { MailerHelper } from 'src/common/helpers/mailer.helper';
import { JwtProviderModule } from 'src/providers/jwt/provider.module';

@Module({
  imports: [PassportModule, HttpModule, JwtProviderModule],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    UsersRepository,
    LocalStrategy,
    MailerHelper,
    JwtStrategy,
  ],
})
export class AuthenticationModule {}
