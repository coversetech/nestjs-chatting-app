import * as Joi from '@hapi/joi';
import { Module } from '@nestjs/common';
import configuration from './configuration';
import { ThrottleConfigService } from './config.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
/**
 * Import and provide throttling configuration related classes.
 *
 * @module
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        THROTTLE_TTL: Joi.string().default('60'),
        THROTTLE_LIMIT: Joi.string().default('10'),
      }),
    }),
  ],
  providers: [ConfigService, ThrottleConfigService],
  exports: [ConfigService, ThrottleConfigService],
})
export class ThrottleConfigModule {}
