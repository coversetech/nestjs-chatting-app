import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Group, GroupSchema } from "./entities/group.entity";
import { GroupsController } from "./groups.controller";
import { GroupsService } from "./groups.service";
import { GroupsRepository } from "./repositories/groups.repository";
import { GroupMessagesRepository } from "./repositories/group-messages.repository";
import { GroupUsersRepository } from "./repositories/group-users.repository";
import { GroupUser, GroupUserSchema } from "./entities/group-user.entity";
import {
  GroupMessage,
  GroupMessageSchema,
} from "./entities/group-message.entity";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: GroupUser.name, schema: GroupUserSchema },
      { name: GroupMessage.name, schema: GroupMessageSchema },
    ]),
  ],
  controllers: [GroupsController],
  providers: [
    GroupsService,
    GroupsRepository,
    GroupMessagesRepository,
    GroupUsersRepository,
  ],
  exports: [
    GroupsService,
    GroupsRepository,
    GroupMessagesRepository,
    GroupUsersRepository,
  ],
})
export class GroupsModule {}
