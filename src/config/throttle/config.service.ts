import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
/**
 * Service dealing with throttling config based operations.
 *
 * @class
 */
@Injectable()
export class ThrottleConfigService {
  constructor(private configService: ConfigService) {}

  get ttl(): string {
    return this.configService.get<string>('throttle.ttl');
  }
  get limit(): string {
    return this.configService.get<string>('throttle.limit');
  }
}
