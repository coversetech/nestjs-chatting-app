import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
/**
 * Service dealing with mail config based operations.
 *
 * @class
 */
@Injectable()
export class MailConfigService {
  constructor(private configService: ConfigService) {}

  get username(): string {
    return this.configService.get<string>('mail.username');
  }
  get password(): string {
    return this.configService.get<string>('mail.password');
  }
  get host(): string {
    return this.configService.get<string>('mail.host');
  }
  get port(): string {
    return this.configService.get<string>('mail.port');
  }
  get fromUser(): string {
    return this.configService.get<string>('mail.fromUser');
  }
  get fromAddress(): string {
    return this.configService.get<string>('mail.fromAddress');
  }
}
