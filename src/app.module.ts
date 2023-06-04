import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthenticationModule } from "./authentication/authentication.module";
import { ChatModule } from "./chat/chat.module";
import { WsThrottlerGuard } from "./common/guards/ws-throttler.guard";
import { AppConfigModule } from "./config/app/config.module";
import { ContactsSeedModule } from "./database/seeders/contacts/seed.module";
import { ContactsSeedService } from "./database/seeders/contacts/seed.service";
import { GroupsSeedModule } from "./database/seeders/groups/seed.module";
import { MessagesSeedModule } from "./database/seeders/messages/seed.module";
import { MessagesSeedService } from "./database/seeders/messages/seed.service";
import { UsersSeedModule } from "./database/seeders/users/seed.module";
import { MongoDatabaseProviderModule } from "./providers/database/mongo/provider.module";
import { NodeMailerProviderModule } from "./providers/mail/provider.module";
import { ThrottleProviderModule } from "./providers/throttle/provider.module";

@Module({
  imports: [
    NodeMailerProviderModule,
    AppConfigModule,
    AuthenticationModule,
    MongoDatabaseProviderModule,
    ContactsSeedModule,
    GroupsSeedModule,
    MessagesSeedModule,
    UsersSeedModule,
    ChatModule,
    ThrottleProviderModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ContactsSeedService,
    MessagesSeedService,
    {
      provide: APP_GUARD,
      useClass: WsThrottlerGuard,
    },
  ],
})
export class AppModule {}
