import { Module } from "@nestjs/common";
import { MongooseModule, MongooseModuleAsyncOptions } from "@nestjs/mongoose";
import { MongoConfigModule } from "src/config/database/mongo/config.module";
import { MongoConfigService } from "src/config/database/mongo/config.service";
import { Contact } from "src/models/contacts/entities/contact.entity";
import { GroupMessage } from "src/models/groups/entities/group-message.entity";
import { GroupUser } from "src/models/groups/entities/group-user.entity";
import { Group } from "src/models/groups/entities/group.entity";
import { Message } from "src/models/messages/entities/message.entity";
import { User } from "src/models/users/entities/user.entity";

/**
 * Import and provide base mongoose (mongodb) related classes.
 *
 * @module
 */
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [MongoConfigModule],
      useFactory: async (mongoConfigService: MongoConfigService) => ({
        type: "mongo",
        host: mongoConfigService.host,
        port: mongoConfigService.port,
        username: mongoConfigService.username,
        password: mongoConfigService.password,
        database: mongoConfigService.database,
        entities: [User, Message, Contact, Group, GroupUser, GroupMessage],
        synchronize: true,
        useNewUrlParser: true,
      }),
      inject: [MongoConfigService],
    } as MongooseModuleAsyncOptions),
  ],
})
export class MongoDatabaseProviderModule {}
