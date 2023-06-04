import { JwtService } from "@nestjs/jwt";
import { JwtConfigService } from "src/config/jwt/config.service";
import { UserDocument } from "src/models/users/entities/user.entity";
import { Response } from "express";
import { AppConfigService } from "src/config/app/config.service";
import { SignInResponse } from "./interfaces/login.interface";
import { ResponseOut } from "src/common/interfaces/response.interface";
import { Injectable } from "@nestjs/common";
import { LogMethod } from "src/common/decorators/log-method.decorator";

@Injectable()
export class JwtStrategy {
  constructor(
    private jwtService: JwtService,
    private readonly jwtConfig: JwtConfigService,
    private readonly appConfig: AppConfigService
  ) {}

  @LogMethod()
  createSendToken(
    user: UserDocument,
    statusCode: number,
    res: Response,
    msg: string
  ): ResponseOut<SignInResponse> {
    const token = this.signToken(user.email, String(user._id));
    const cookieOptions: Record<string, any> = {
      expires: new Date(
        Date.now() +
          parseInt(this.jwtConfig.cookieExpiresIn) * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };
    if (this.appConfig.env === "production") {
      cookieOptions.secure = true;
    }

    res.cookie("jwt", token, cookieOptions);
    res.cookie("user_id", user.id, cookieOptions);

    /* Remove password from output */
    user.password = undefined;
    return {
      statusCode,
      status: "success",
      message: msg,
      data: { user, token },
    };
  }

  @LogMethod()
  private signToken(email: string, id: string | number) {
    const payload = { email, sub: id };

    return this.jwtService.sign(payload, {
      expiresIn: this.jwtConfig.expiresIn,
    });
  }
}
