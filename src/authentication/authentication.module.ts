import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { MailerHelper } from "src/common/helpers/mailer.helper";
import { JwtConfigModule } from "src/config/jwt/config.module";
import { UsersModule } from "src/models/users/users.module";
import { JwtProviderModule } from "src/providers/jwt/provider.module";
import { LocalStrategy } from "../common/guards/local.guard";
import { AuthenticationController } from "./authentication.controller";
import { AuthenticationService } from "./authentication.service";
import { JwtStrategy } from "./jwt.strategy";
import { AppConfigModule } from "src/config/app/config.module";

@Module({
  imports: [
    PassportModule,
    HttpModule,
    JwtProviderModule,
    UsersModule,
    JwtConfigModule,
    AppConfigModule,
  ],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    LocalStrategy,
    MailerHelper,
    JwtStrategy,
    JwtService,
  ],
})
export class AuthenticationModule {}
