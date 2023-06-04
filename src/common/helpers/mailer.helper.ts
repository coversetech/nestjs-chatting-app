import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { Address } from 'nodemailer/lib/mailer';

export enum NotificationType {
  Verification = 'verification',
  Confirmation = 'confirmation',
  Notice = 'notice',
}

@Injectable()
export class MailerHelper {
  private readonly logger = new Logger(MailerHelper.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendMail(
    to: string | Address | (string | Address)[],
    subject: string,
    message: string,
    from?: string | Address,
    isHtml = true,
    type?: NotificationType,
  ): Promise<void> {
    await this.mailerService
      .sendMail({
        to /* list of receivers */,
        from: from ? from : undefined /* sender address */,
        subject /* Subject line */,
        text: !isHtml ? message : undefined /* plaintext body */,
        html: isHtml ? message : undefined /* HTML body content */,
      })
      .then(() => {
        this.logger.log(`🚀 ${type}: ===> Email has been sent to ${to}`);
      })
      .catch(() => {
        this.logger.error(`Something went wrong when sending to ${to}`);
      });
  }
}
