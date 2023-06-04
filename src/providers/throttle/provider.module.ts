import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottleConfigModule } from 'src/config/throttle/config.module';
import { ThrottleConfigService } from 'src/config/throttle/config.service';

/**
 * Import and provide base throttling related classes.
 *
 * @module
 */
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ThrottleConfigModule],
      useFactory: async (throttleConfigService: ThrottleConfigService) => ({
        ttl: parseInt(throttleConfigService.ttl),
        limit: parseInt(throttleConfigService.limit),
      }),
      inject: [ThrottleConfigService],
    }),
  ],
})
export class ThrottleProviderModule {}
