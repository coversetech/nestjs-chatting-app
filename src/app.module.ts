import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './config/app/config.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { GroupsController } from './models/groups/groups.controller';
import { ContactsController } from './models/contacts/contacts.controller';
import { MessagesController } from './models/messages/messages.controller';
import { ContactsService } from './models/contacts/contacts.service';
import { GroupsService } from './models/groups/groups.service';
import { MessagesService } from './models/messages/messages.service';
import { UsersModule } from './models/users/users.module';
import { GroupsModule } from './models/groups/groups.module';
import { MessagesModule } from './models/messages/messages.module';
import { ContactsModule } from './models/contacts/contacts.module';
import { ContactsSeedModule } from './database/seeders/contacts/seed.module';
import { GroupsSeedModule } from './database/seeders/groups/seed.module';
import { MessagesSeedModule } from './database/seeders/messages/seed.module';
import { UsersSeedModule } from './database/seeders/users/seed.module';
import { MessagesSeedService } from './database/seeders/messages/seed.service';
import { ContactsSeedService } from './database/seeders/contacts/seed.service';
import { MongoDatabaseProviderModule } from './providers/database/mongo/provider.module';
import { NodeMailerProviderModule } from './providers/mail/provider.module';
import { APP_GUARD } from '@nestjs/core';
import { WsThrottlerGuard } from './common/guards/ws-throttler.guard';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    NodeMailerProviderModule,
    AppConfigModule,
    AuthenticationModule,
    MongoDatabaseProviderModule,
    UsersModule,
    GroupsModule,
    MessagesModule,
    ContactsModule,
    ContactsSeedModule,
    GroupsSeedModule,
    MessagesSeedModule,
    UsersSeedModule,
    ChatModule,
  ],
  controllers: [
    AppController,
    GroupsController,
    ContactsController,
    MessagesController,
  ],
  providers: [
    AppService,
    ContactsService,
    GroupsService,
    MessagesService,
    ContactsSeedService,
    MessagesSeedService,
    {
      provide: APP_GUARD,
      useClass: WsThrottlerGuard,
    },
  ],
})
export class AppModule {}
