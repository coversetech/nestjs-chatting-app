import { Module } from "@nestjs/common";
import { ContactsModule } from "src/models/contacts/contacts.module";
import { GroupsModule } from "src/models/groups/groups.module";
import { MessagesModule } from "src/models/messages/messages.module";
import { UsersModule } from "src/models/users/users.module";
import { ChatGateway } from "./chat.getway";
import { VideoCallGateway } from "./video-call.gateway";

@Module({
  providers: [ChatGateway, VideoCallGateway],
  imports: [UsersModule, GroupsModule, MessagesModule, ContactsModule],
})
export class ChatModule {}
