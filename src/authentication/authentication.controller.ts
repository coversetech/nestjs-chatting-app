import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { LogClass } from "src/common/decorators/log-class.decorator";
import { AuthenticationService } from "./authentication.service";
import { Response, Request } from "express";
import { ResponseOut } from "src/common/interfaces/response.interface";
import { ResetPasswordDTO } from "./dto/reset-pwd.dto";
import { ForgotPwdDTO } from "./dto/forgot-pwd.dto";
import { ForgotPwdResponse } from "./interfaces/forgot-pwd.interface";
import { SignInDTO } from "./dto/login.dto";
import { SignInResponse } from "./interfaces/login.interface";
import { SignUpDTO } from "./dto/sign-up.dto";
import { AuthGuard } from "@nestjs/passport";

@Controller("auth")
@LogClass()
export class AuthenticationController {
  constructor(private readonly authService: AuthenticationService) {}

  @Post("signUp")
  async signup(
    @Body() signupDto: SignUpDTO,
    @Res() res: Response,
    @Req() req: Request
  ): Promise<Response> {
    const result = await this.authService.signUp(signupDto, req);
    return res.status(result.statusCode).json(result);
  }

  @UseGuards(AuthGuard("local"))
  @Post("signIn")
  async signIn(
    @Body() signInDto: SignInDTO,
    @Res() res: Response,
    @Req() req: Request
  ): Promise<Response<ResponseOut<SignInResponse>>> {
    const result = await this.authService.signIn(signInDto, req, res);
    return res.status(result.statusCode).json(result);
  }

  @Post("forgot")
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPwdDTO,
    @Res() res: Response,
    @Req() req: Request
  ): Promise<Response<ResponseOut<ForgotPwdResponse>>> {
    const result = await this.authService.forgotPassword(
      forgotPasswordDto,
      req
    );
    return res.status(result.statusCode).json(result);
  }

  @Patch(":token")
  async resetPassword(
    @Param("token") token: string,
    @Body() resetPasswordDto: ResetPasswordDTO,
    @Res() res: Response
  ): Promise<Response<ResponseOut<null>>> {
    const result = await this.authService.resetPassword(
      token,
      resetPasswordDto
    );

    return res.status(result.statusCode).json(result);
  }

  @Post("logout")
  async logout(@Res() res: Response): Promise<Response<ResponseOut<null>>> {
    await this.authService.logout(res);
    return res.status(200).json({
      statusCode: 200,
      status: "success",
      message: "user logout is a success",
    });
  }
}
