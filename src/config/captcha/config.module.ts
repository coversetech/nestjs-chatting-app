import * as Joi from "@hapi/joi";
import { Module } from "@nestjs/common";
import configuration from "./configuration";
import { CaptchaConfigService } from "./config.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
/**
 * Import and provide captcha configuration related classes.
 *
 * @module
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        CAPTCHA_SECRET: Joi.string().default(""),
        CAPTCHA_SITEKEY: Joi.string().default(""),
      }),
    }),
  ],
  providers: [ConfigService, CaptchaConfigService],
  exports: [ConfigService, CaptchaConfigService],
})
export class CaptchaConfigModule {}
