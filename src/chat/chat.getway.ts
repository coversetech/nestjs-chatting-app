import { Logger } from "@nestjs/common";
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Socket } from "socket.io";
import { LogClass } from "src/common/decorators/log-class.decorator";
import { ContactsRepository } from "src/models/contacts/contacts.repository";
import { ContactsService } from "src/models/contacts/contacts.service";
import { GroupsService } from "src/models/groups/groups.service";
import { GroupMessagesRepository } from "src/models/groups/repositories/group-messages.repository";
import { GroupUsersRepository } from "src/models/groups/repositories/group-users.repository";
import { GroupsRepository } from "src/models/groups/repositories/groups.repository";
import { MessagesRepository } from "src/models/messages/messages.repository";
import { MessagesService } from "src/models/messages/messages.service";
import { UserDocument } from "src/models/users/entities/user.entity";
import { UsersService } from "src/models/users/users.service";
import { Server } from "ws";

@WebSocketGateway({ namespace: "/chat" })
@LogClass()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  users = {};
  private logger: Logger = new Logger(ChatGateway.name);

  constructor(
    private userService: UsersService,
    private groupService: GroupsService,
    private messageService: MessagesService,
    private contactService: ContactsService,
    private groupMessageRepository: GroupMessagesRepository,
    private groupUserRepository: GroupUsersRepository,
    private groupRepository: GroupsRepository,
    private messageRepository: MessagesRepository,
    private contactRepository: ContactsRepository
  ) {}

  // User Joined
  async handleConnection(socket: Socket, userId: string, username: string) {
    // Handle new socket connections
    this.users[socket.id] = userId;
    socket.broadcast.emit("user-connected", userId, username);
    socket.emit("user-list", this.users);
  }

  // User Disconnect
  async handleDisconnect(socket: Socket) {
    // Handle socket disconnections
    socket.broadcast.emit("user-disconnected", this.users[socket.id]);
    socket.emit("user-list", this.users[socket.id]);
    this.userService.userLeave(this.users[socket.id]);
    delete this.users[socket.id];
  }

  // notification muted security
  @SubscribeMessage("userMutedNotification")
  async onUserMutedNotification(
    client: Socket,
    userId: string,
    isMuted: boolean
  ) {
    this.userService.notificationMutedUpdate(userId, isMuted).then((msg) => {
      this.logger.log("notificationMutedUpdate", msg);
    });
  }

  // notification security
  @SubscribeMessage("userNotification")
  async onUserNotification(client: Socket, userId: string, notification: any) {
    this.userService.notificationUpdate(userId, notification).then((msg) => {
      this.logger.log("userNotification", msg);
    });
  }

  // Group name edit
  @SubscribeMessage("updateGroupName")
  async onUpdateGroupName(client: Socket, groupId: string, name: string) {
    this.groupService.groupNameUpdate(groupId, name).then(() => {
      this.groupService.groupById(groupId).then((group) => {
        group.forEach((gu) => {
          for (const key in this.users) {
            if (gu.contact_id == this.users[key]) {
              client.to(key).emit("updateGroupName", { groupId, name });
            }
          }
        });
      });
    });
  }

  // receiver name edit
  @SubscribeMessage("updateReceiverName")
  async onUpdateReceiverName(
    client: Socket,
    userId: string,
    receiverId: string,
    name: string
  ) {
    this.contactService
      .receiverNameUpdate(userId, receiverId, name)
      .then((userInfo) => {
        this.logger.log("updateReceiverName" + userInfo);
      });
  }

  // current user name edit
  @SubscribeMessage("updateUserName")
  async onUpdateUserName(client: Socket, userId: string, name: string) {
    this.userService.userNameUpdate(userId, name).then((userInfo) => {
      client.emit("updateUserName", { userInfo });
    });
  }

  // Current User data
  @SubscribeMessage("currentUser")
  async onCurrentUser(client: Socket, userId: string) {
    this.userService.getUserInfo(userId).then((userInfo) => {
      client.to(client.id).emit("currentUser", { userInfo });
    });
  }

  // Group Sender Message Delete
  @SubscribeMessage("single_Group_Message_delete")
  async onSingleGroupMessageDelete(
    client: Socket,
    receiverId: string,
    userId: string
  ) {
    this.groupService
      .groupSenderMessage(receiverId, userId)
      .then((groupSenderMsg) => {
        this.groupService.groupById(receiverId).then((group) => {
          group.forEach((gu) => {
            for (const key in this.users) {
              if (gu.contact_id == this.users[key]) {
                client.to(key).emit("groupSenderMessage", {
                  groupMsgs: groupSenderMsg,
                });
              }
            }
          });
        });
      });
    this.groupService
      .singleGroupMessageDelete(receiverId, userId)
      .then((msg) => {
        this.logger.log("singleGroupMessageDelete" + msg);
      });
  }

  // All Group Message Delete
  @SubscribeMessage("all_Group_Message_delete")
  async onAllGroupMessageDelete(client: Socket, receiverId: string) {
    this.groupService.allGroupMessageDelete(receiverId).then((msg) => {
      this.logger.log("allGroupMessageDelete" + msg);
    });
    this.groupService.groupById(receiverId).then((group) => {
      const unread = 0;
      this.groupService
        .updateAllUnreadGroupMessage(receiverId, unread)
        .then((groupMsg) => {
          this.logger.log("updateAllUnreadGroupMessage" + groupMsg);
        });
      group.forEach((gu) => {
        for (const key in this.users) {
          if (gu.contact_id == this.users[key]) {
            client.to(key).emit("all_Group_Message_delete", { receiverId });
          }
        }
      });
    });
  }

  // Group User Delete
  @SubscribeMessage("deleteGroupUser")
  async onDeleteGroupUser(client: Socket, id: string, groupId: string) {
    this.groupService.groupById(groupId).then((group) => {
      group.forEach((gu) => {
        for (const key in this.users) {
          if (gu.contact_id == this.users[key]) {
            client.to(key).emit("deleteGroupUser", { id, groupId });
          }
        }
      });
    });
    this.groupService.deleteGroupUser(id, groupId).then((groupUser) => {
      this.logger.log("deleteGroupUser" + groupUser);
    });
  }

  // Delete Group Member
  @SubscribeMessage("group_delete_member")
  async onGroupDeleteMember(client: Socket, id: string, groupId: string) {
    this.groupService.groupDeleteMember(id, groupId).then((message) => {
      this.logger.log("group_delete_member" + message);
    });
    this.groupService.groupById(groupId).then((group) => {
      group.forEach((gu) => {
        for (const key in this.users) {
          if (gu.contact_id == this.users[key]) {
            client.to(key).emit("group_delete_member", { id, groupId });
          }
        }
      });
    });
  }

  // Delete Group
  @SubscribeMessage("group_delete")
  async onGroupDelete(client: Socket, id: string) {
    this.groupService.groupDelete(id).then((message) => {
      this.logger.log("groupDelete" + message);
    });
    this.groupService.groupMemberDelete(id).then((message) => {
      this.logger.log("groupMemberDelete" + message);
    });
    this.groupService.allGroupMessageDelete(id).then((message) => {
      this.logger.log("allGroupMessageDelete" + message);
    });
    this.groupService.groupById(id).then((group) => {
      group.forEach((gu) => {
        for (const key in this.users) {
          if (gu.contact_id == this.users[key]) {
            client.to(key).emit("group_delete", { id });
          }
        }
      });
    });
  }

  // Group Message Delete
  @SubscribeMessage("group_msg_delete")
  async onGroupMessageDelete(
    client: Socket,
    messageId: string,
    groupId: string
  ) {
    this.groupService.groupFileDelete(messageId).then((message) => {
      this.logger.log("groupFileDelete" + message);
    });
    this.groupService.groupById(groupId).then((group) => {
      group.forEach((gu) => {
        for (const key in this.users) {
          if (gu.contact_id == this.users[key]) {
            client.to(key).emit("group_msg_delete", { messageId, groupId });
          }
        }
      });
    });
  }

  // Online User Get
  @SubscribeMessage("online_user")
  async onRetrieveOnlineUser(client: Socket, data: any) {
    this.groupService.groupById(data.groupId).then((group) => {
      group.forEach((gu) => {
        for (const key in this.users) {
          if (gu.contact_id == this.users[key]) {
            client.to(key).emit("online_user", data);
          }
        }
      });
    });
  }

  @SubscribeMessage("groupClick")
  async onGroupClick(
    client: Socket,
    groupId: string,
    userId: string,
    startm: number
  ) {
    // Group Info get
    this.groupService.groupById(groupId).then((group) => {
      group.forEach((gu) => {
        for (const key in this.users) {
          if (gu.user_id == this.users[key]) {
            this.groupService
              .groupContactsList(groupId, userId)
              .then((groups) => {
                client.to(client.id).emit("groupDetail", {
                  groupUsers: groups,
                  groupId: groupId,
                });
              });
          }
        }
      });
    });

    if (startm == 0) {
      const cnt = await this.groupMessageRepository.getGroupMsgsCount(groupId);
      this.groupService.groupsMessage(groupId, startm).then((message) => {
        client.to(client.id).emit("groupMessage", {
          groups: message,
          msgno: cnt,
        });
      });
    } else {
      this.groupService.groupsMessage(groupId, startm).then((message) => {
        client.to(client.id).emit("gchat-pg", {
          groups: message,
        });
      });
    }
  }

  // Group Data Append TopBar
  @SubscribeMessage("contactsDetail")
  async onContactsDetail(client: Socket, groupsId: string, userId: string) {
    this.groupService.groupData(groupsId).then((group) => {
      client.to(client.id).emit("groupInfo", { group: group });
    });

    let i = 0;
    this.groupService.groupContactsList(groupsId, userId).then((group) => {
      client.to(client.id).emit("groupDetail", {
        groupUsers: group,
        groupId: groupsId,
      });
      const unread = 0;
      this.groupService
        .updateUnreadGroupMessage(groupsId, userId, unread)
        .then((group_message) => {
          this.logger.log("updateUnreadGroupMessage" + group_message);
        });
    });

    this.groupService.groupById(groupsId).then((group) => {
      const online = [];
      group.forEach((gu) => {
        for (const key in this.users) {
          if (gu.contact_id == this.users[key]) {
            online[i] = gu.contact_id;
            i++;
          }
        }
      });
      client.to(client.id).emit("onlineContact", { online });
    });
  }

  // Get Contact List
  @SubscribeMessage("contactIdByUser")
  async onRetrieveContactByUser(client: Socket, userId: string) {
    this.groupService.contactListByUser(userId).then((contacts) => {
      client.to(client.id).emit("groupLists", {
        groups: contacts,
      });
    });
  }

  // group message Update
  @SubscribeMessage("groupMessage_update")
  async onGroupMessageUpdate(
    client: Socket,
    messageId: string,
    message: string,
    groupId: string
  ) {
    this.groupService.groupMessageUpdate(messageId, message).then((message) => {
      this.logger.log("groupMessageUpdate" + message);
    });
    this.groupService.groupById(groupId).then((group) => {
      group.forEach((gu) => {
        for (const key in this.users) {
          if (gu.contact_id == this.users[key]) {
            client.to(key).emit("groupMessage_update", {
              messageId,
              message,
              groupId,
            });
          }
        }
      });
    });
  }

  // Contact add in group
  @SubscribeMessage("addGroupContacts")
  async onAddGroupContacts(
    client: Socket,
    contactList: any[],
    groupId: string,
    userId: string
  ) {
    contactList.forEach((contactId) => {
      this.groupUserRepository.create({ contactId, groupId }).then(() => {
        this.groupService.groupById(groupId).then((group) => {
          this.groupService.groupData(groupId).then((groups) => {
            for (const key in this.users) {
              if (contactId == this.users[key]) {
                client.to(key).emit("addGroup", { groups });
              }
            }
          });

          group.forEach((gu) => {
            for (const key in this.users) {
              if (gu.contact_id == this.users[key]) {
                this.groupService
                  .groupContactsList(groupId, userId)
                  .then((groups) => {
                    client.to(key).emit("groupDetail", {
                      groupUsers: groups,
                      groupId,
                    });
                  });
              }
            }
          });
        });
      });
    });
  }
  //-------------------- Unread Group Msg Update -----------------------//
  @SubscribeMessage("unreadGroupMsgUpdate")
  async onUnreadGroupMsgUpdate(
    client: Socket,
    groupId: string,
    userId: string,
    unread: number
  ) {
    this.groupService
      .updateUnreadGroupMessage(groupId, userId, unread)
      .then((message) => {
        this.logger.log("unreadGroupMsgUpdate" + message);
      });
  }

  // Group Message Create
  @SubscribeMessage("group message")
  async onGroupMessage(
    client: Socket,
    message: string,
    senderId: string,
    groupId: string,
    fileUpload: string
  ) {
    this.groupMessageRepository
      .create({
        message,
        senderId,
        groupId,
        fileUpload,
      })
      .then((groupMessage) => {
        const id = groupMessage.id;
        const createdAt = groupMessage.createdAt;
        this.userService.getUserInfo(senderId).then((receiverData) => {
          const receiverName = receiverData.name;
          const receiverImage = ""; /* receiverData.image; */
          this.groupService.groupById(groupId).then((group) => {
            group.forEach((gu) => {
              for (const key in this.users) {
                if (gu.contact_id == this.users[key]) {
                  client.to(key).emit("group message", {
                    id,
                    message,
                    senderId,
                    groupId,
                    receiverName,
                    receiverImage,
                    fileUpload,
                    createdAt,
                  });
                }
              }
            });
          });
        });
      });

    this.groupService.unreadGroupUser(groupId).then((receiverData) => {
      const info = [];
      for (let i = 0; i < receiverData.length; i++) {
        if (receiverData[i]["contact_id"] != senderId) {
          info[i] = receiverData[i];
        }
      }
      info.forEach((receiver) => {
        const unread = receiver.unread + 1;
        this.groupService
          .updateUnreadGroupUser(receiver.groupId, receiver.contact_id, unread)
          .then((receiverData) => {
            this.logger.log("updateUnreadGroupUser" + receiverData);
          });
      });
    });

    this.groupService.groupsMessage(groupId).then((message) => {
      client.to(client.id).emit("groupMessage", {
        groups: message,
      });
    });
  }

  // Group Create
  @SubscribeMessage("createGroups")
  async onCreateGroups(
    client: Socket,
    name: string,
    description: string,
    contactList: any[],
    userId: string
  ) {
    const groups = await this.groupRepository.create({
      name,
      description,
      userId,
    });

    const groupId = groups.id;
    contactList.forEach((con) => {
      for (const key in this.users) {
        if (con == this.users[key]) {
          client.to(key).emit("group-add", {
            groupId,
            name,
            description,
            userId,
            contactList,
          });
        }
      }
    });
    client.to(client.id).emit("group-add", {
      groupId,
      name,
      description,
      userId,
      contactList,
    });

    contactList.forEach(async (contactId) => {
      await this.groupUserRepository.create({
        contactId,
        groupId,
      });
    });
    const contactId = userId;
    const isAdmin = 1;
    await this.groupUserRepository.create({ contactId, groupId, isAdmin });
  }

  // Single Group Message Search
  @SubscribeMessage("groupSearchValue")
  async onGroupSearchValue(
    client: Socket,
    searchVal: string,
    receiverId: string
  ) {
    this.groupService.groupSearchData(searchVal, receiverId).then((message) => {
      client.to(client.id).emit("groupMessage", {
        groups: message,
      });
    });
  }

  // Group Search
  @SubscribeMessage("searchGroupValue")
  async onSearchGroupValue(client: Socket, searchVal: string, userId: string) {
    this.groupService.searchGroupData(searchVal, userId).then((contacts) => {
      client.to(client.id).emit("groupLists", {
        groups: contacts,
      });
    });
  }

  // Single Message Delete
  @SubscribeMessage("message_delete")
  async onMessageDelete(
    client: Socket,
    messageId: string,
    receiverId: string,
    userId: string,
    flag: number
  ) {
    this.messageService.messageDelete(messageId, flag).then((message) => {
      this.logger.log("messageDelete" + message);
    });
    for (const key in this.users) {
      if (receiverId == this.users[key]) {
        client
          .to(key)
          .emit("message_delete", { messageId, receiverId, userId });
      }
    }
    this.contactService.contactList(userId).then((contacts) => {
      client.to(client.id).emit("contactsLists", {
        contacts: contacts,
      });

      contacts.forEach((element) => {
        this.messageService.lastMsg(userId, element.user_id).then((res) => {
          client.to(client.id).emit("isMessage", { messages: res });
          for (const key in this.users) {
            if (receiverId == this.users[key]) {
              client.to(key).emit("isMessage", { messages: res });
            }
          }
        });
      });
    });
  }

  // Group Typing Set
  @SubscribeMessage("group_typing")
  async onGroupTyping(client: Socket, data: any) {
    for (const key in this.users) {
      if (data.receiverId == this.users[key]) {
        client.to(key).emit("group_typing", data);
      }
    }
    this.groupService.groupById(data.receiverId).then((group) => {
      group.forEach((gu) => {
        for (const key in this.users) {
          if (gu.contact_id == this.users[key]) {
            if (key != client.id) {
              client.to(key).emit("group_typing", data);
            }
          }
        }
      });
    });
  }

  // Single Message Typing Set
  @SubscribeMessage("typing")
  async onUserTyping(client: Socket, data: any) {
    for (const key in this.users) {
      if (data.receiverId == this.users[key]) {
        client.to(key).emit("typing", data);
      }
    }
    this.groupService.groupById(data.receiverId).then((group) => {
      group.forEach((gu) => {
        for (const key in this.users) {
          if (gu.contact_id == this.users[key]) {
            if (key != client.id) {
              client.to(key).emit("typing", data);
            }
          }
        }
      });
    });
  }
  //-------------------- Unread Msg Update -----------------------//
  @SubscribeMessage("unreadMsgUpdate")
  async onUnreadMsgUpdate(client: Socket, receiverId: string, unread: number) {
    this.messageService.updateUnreadMsg(receiverId, unread).then((message) => {
      this.logger.log("unreadMsgUpdate" + message);
    });
  }
  // contact wise sender and receiver message
  @SubscribeMessage("userClick")
  async onUserClick(client: Socket, id: string, startm: number) {
    const cnt = await this.messageRepository.getMessagesCount(id);

    if (startm == 0) {
      this.messageService.userMessage(id, startm).then((message) => {
        client.to(client.id).emit("userMessage", {
          msgno: cnt,
          users: message,
        });
      });

      const unread = 1;
      this.messageService.updateUnreadMsg(id, unread).then((message) => {
        this.logger.log("updateUnreadMsg" + message);
      });

      this.messageService.receiverMessage(id).then((message) => {
        client.to(client.id).emit("receiverMessageInfo", {
          users: message,
        });
      });
    } else {
      this.messageService.userMessage(id, startm).then((message) => {
        client.to(client.id).emit("chat-pg", {
          users: message,
        });
      });
    }
  }
  // contact list to topBar
  @SubscribeMessage("chat_online")
  async onChatOnline(client: Socket, id: string) {
    let online = 0;
    for (const key in this.users) {
      if (id == this.users[key]) {
        online = 1;
      }
    }
    client.to(client.id).emit("onlineUser", { online });
  }

  // User Id Wise contact Get
  @SubscribeMessage("userData")
  async onUserData(client: Socket, userId: string) {
    this.contactService.userJoin(userId).then((res) => {
      client.to(client.id).emit("roomUsers", {
        users: res,
      });
    });

    this.contactService.contactList(userId).then((contacts) => {
      client.to(client.id).emit("contactsLists", {
        contacts: contacts,
      });

      contacts.forEach((element) => {
        this.messageService.lastMsg(userId, element.user_id).then((res) => {
          client.to(client.id).emit("isMessage", {
            messages: res,
          });
        });
      });
    });
  }

  // Contact id wise User get
  @SubscribeMessage("contactByUser")
  async onContactByUser(client: Socket, id: string, createdBy: Date) {
    this.contactService
      .getContactListByUserId(id, createdBy)
      .then((contacts) => {
        client.to(client.id).emit("contactInfo", {
          contacts: contacts,
        });
      });
  }

  // Receiver id wise data get
  @SubscribeMessage("receiverId")
  async onRetrieveReceiverId(client: Socket, receiverId: string) {
    this.userService.getUserInfo(receiverId).then((message) => {
      client.emit("receiver_data", {
        users: message,
      });
    });
  }

  // Message Update
  @SubscribeMessage("message_update")
  async onMessageUpdate(
    client: Socket,
    messageId: string,
    message: string,
    receiverId: string,
    userId: string,
    flag: number
  ) {
    this.messageService
      .messageUpdate(messageId, message, flag)
      .then((message) => {
        this.logger.log("messageUpdate" + message);
      });
    for (const key in this.users) {
      if (receiverId == this.users[key]) {
        client.to(key).emit("message_update", {
          messageId,
          message,
          receiverId,
          userId,
          flag,
        });
      }
    }

    this.messageService.lastMsg(userId, receiverId).then((res) => {
      client.to(client.id).emit("isMessage", { messages: res });
      for (const key in this.users) {
        if (receiverId == this.users[key]) {
          client.to(key).emit("isMessage", { messages: res });
        }
      }
    });
  }

  // Message Create
  @SubscribeMessage("chat message")
  async onChatMessage(
    client: Socket,
    message: string,
    senderId: string,
    receiverId: string,
    fileUpload: string,
    flag: number
  ) {
    this.messageRepository
      .create({
        message,
        senderId,
        receiverId,
        fileUpload,
        flag,
      })
      .then(async (messageCreated) => {
        const createdAt = messageCreated.createdAt;
        const id = messageCreated.id;
        this.userService
          .getUserInfo(senderId)
          .then(async (receiverData: UserDocument) => {
            const receiverName = receiverData.name;
            const receiverImage = ""; /* receiverData.image; */
            let myId;
            for (const key in this.users) {
              if (receiverId == this.users[key]) {
                myId = senderId;
                client.to(key).emit("chat message", {
                  id,
                  message,
                  senderId,
                  receiverId,
                  fileUpload,
                  createdAt,
                  receiverName,
                  receiverImage,
                  myId,
                  flag,
                });
              }
              if (senderId == this.users[key]) {
                myId = receiverId;
                client.to(key).emit("chat message", {
                  id,
                  message,
                  senderId,
                  receiverId,
                  fileUpload,
                  createdAt,
                  receiverName,
                  receiverImage,
                  myId,
                  flag,
                });
              }
            }
          });

        await this.contactRepository.updateOne(
          { user_id: senderId },
          { last_msg_date: createdAt },
          { new: true }
        );

        await this.contactRepository.updateOne(
          { user_id: receiverId },
          { last_msg_date: createdAt },
          { new: true }
        );

        await this.messageService
          .receiverMessage(receiverId)
          .then((message) => {
            client
              .to(client.id)
              .emit("receiverMessageInfo", { users: message });
          });
      });
  }

  // Single Message Search
  @SubscribeMessage("messageSearchValue")
  async onMessageSearchValue(
    client: Socket,
    searchVal: string,
    userId: string,
    receiverId: string
  ) {
    this.messageService
      .messageSearchData(searchVal, userId, receiverId)
      .then((message) => {
        client.to(client.id).emit("userMessage", {
          users: message,
        });
      });
  }

  // All Message Delete
  @SubscribeMessage("all_Message_delete")
  async onALlMessageDelete(client: Socket, receiverId: string, userId: string) {
    await this.messageService.allMessageDelete(receiverId, userId);
    for (const key in this.users) {
      if (receiverId == this.users[key]) {
        client.to(client.id).emit("all_Message_delete", { receiverId, userId });
      }
    }
  }

  // Delete Contact
  @SubscribeMessage("contact_delete")
  async onContactDelete(
    client: Socket,
    contactId: string,
    receiverId: string,
    userId: string
  ) {
    await this.contactService.contactDelete(receiverId, userId);
    await this.messageService.allMessageDelete(receiverId, userId);
    await this.messageService.allSenderMessageDelete(receiverId);
    for (const key in this.users) {
      if (receiverId == this.users[key]) {
        client
          .to(key)
          .emit("contact_delete", { contactId, receiverId, userId });
      }
    }
  }

  // User Id Wise Contact Get
  @SubscribeMessage("userContact")
  async onUserContact(client: Socket, userId: string) {
    this.logger.log("userContact");
  }

  // Contact List search
  @SubscribeMessage("searchContactValue")
  async onSearchContactValue(
    client: Socket,
    searchVal: string,
    userId: string
  ) {
    this.contactService
      .searchContactData(searchVal, userId)
      .then((contacts) => {
        client.to(client.id).emit("contactsLists", {
          contacts: contacts,
        });
      });
  }

  // Contacts List
  @SubscribeMessage("contactList")
  async onContactList(
    client: Socket,
    name: string,
    email: string,
    userEmail: string,
    createdBy: Date,
    username: string
  ) {
    this.userService.userEmailMatch(email).then((emailData) => {
      if (emailData != null) {
        if (emailData.email != userEmail) {
          this.contactService
            .contactEmail(email, createdBy)
            .then((contactData) => {
              if (contactData == null) {
                const userId = emailData._id;
                const contact_list = [
                  {
                    name: name,
                    email: email,
                    user_id: userId,
                    createdBy: createdBy,
                  },
                  {
                    name: username,
                    email: userEmail,
                    user_id: createdBy,
                    createdBy: userId,
                  },
                ];
                client.to(client.id).emit("Success", {
                  msg: "Contact added successfully",
                });
                contact_list.forEach(async (element) => {
                  await this.contactRepository
                    .create(element)
                    .then((contact) => {
                      this.contactService
                        .contactList(contact.createdBy)
                        .then((contacts) => {
                          contacts.forEach((contact) => {
                            for (const key in this.users) {
                              if (contact.createdBy == this.users[key]) {
                                client.to(key).emit("contactsLists", {
                                  contacts: contacts,
                                });
                              }
                            }
                          });
                        });

                      this.contactService
                        .userJoin(contact.createdBy)
                        .then((res) => {
                          for (const key in this.users) {
                            if (contact.createdBy == this.users[key]) {
                              client.to(key).emit("roomUsers", { users: res });
                            }
                          }
                        });
                      setTimeout(() => {
                        this.contactService
                          .contactList(contact.createdBy)
                          .then((contacts) => {
                            contacts.forEach((contact) => {
                              for (const key in this.users) {
                                if (contact.createdBy == this.users[key]) {
                                  client.to(key).emit("contactsLists", {
                                    contacts: contacts,
                                  });
                                }
                              }
                              this.messageService
                                .lastMsg(
                                  contact.createdBy,
                                  String(element.user_id)
                                )
                                .then((res) => {
                                  for (const key in this.users) {
                                    if (contact.createdBy == this.users[key]) {
                                      client.to(key).emit("isMessage", {
                                        messages: res,
                                      });
                                    }
                                  }
                                });
                            });
                          });
                      }, 100);
                    });
                });
              } else {
                client.to(client.id).emit("contactsError", {
                  msg: "email already exists",
                });
              }
            });
        } else {
          client.to(client.id).emit("contactsError", {
            msg: "Please use valid email",
          });
        }
      } else {
        client
          .to(client.id)
          .emit("contactsError", { msg: "Email not matched" });
      }
    });
  }

  // Edit and Update
  @SubscribeMessage("editandupdate")
  async onEditAndUpdate(client: Socket, userId: string) {
    this.contactService.contactList(userId).then((contacts) => {
      contacts.forEach((contact) => {
        for (const key in this.users) {
          if (contact.created_by == this.users[key]) {
            client.to(key).emit("contactsLists", { contacts: contacts });
          }
        }
      });
    });
  }
}
