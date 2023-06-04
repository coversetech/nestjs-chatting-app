import * as Joi from '@hapi/joi';
import { Module } from '@nestjs/common';
import configuration from './configuration';
import { MailConfigService } from './config.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
/**
 * Import and provide mail configuration related classes.
 *
 * @module
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        EMAIL_USERNAME: Joi.string().default(''),
        EMAIL_PASSWORD: Joi.string().default(''),
        EMAIL_HOST: Joi.string().default('smtp.mailtrap.io'),
        EMAIL_PORT: Joi.string().default('2525'),
        EMAIL_FROM_NAME: Joi.string().default('Chadi Osseiran'),
        EMAIL_FROM_ADDRESS: Joi.string()
          .email()
          .default('chadiosseiran@gmail.com'),
      }),
    }),
  ],
  providers: [ConfigService, MailConfigService],
  exports: [ConfigService, MailConfigService],
})
export class MailConfigModule {}
