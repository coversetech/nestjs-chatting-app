import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
/**
 * Service dealing with captcha config based operations.
 *
 * @class
 */
@Injectable()
export class CaptchaConfigService {
  constructor(private configService: ConfigService) {}

  get secret(): string {
    return this.configService.get<string>("captcha.secret");
  }
  get siteKey(): string {
    return this.configService.get<string>("captcha.siteKey");
  }
}
