import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailConfigModule } from 'src/config/mail/config.module';
import { MailConfigService } from 'src/config/mail/config.service';

/**
 * Import and provide base nodemailer related classes.
 *
 * @module
 */
@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [MailConfigModule],
      useFactory: async (mailConfigService: MailConfigService) => ({
        transport: {
          host: mailConfigService.host,
          port: parseInt(mailConfigService.port),
          pool: true,
          /* ignoreTLS: true,
          secure: false, */
          auth: {
            user: mailConfigService.username,
            pass: mailConfigService.password,
          },
        },
        defaults: {
          from: `"${mailConfigService.fromUser}" <${mailConfigService.fromAddress}>`,
        },
      }),
      inject: [MailConfigService],
    }),
  ],
})
export class NodeMailerProviderModule {}
