import { Injectable } from '@nestjs/common';
import { LogClass } from 'src/common/decorators/log-class.decorator';
import { GroupsRepository } from './repositories/groups.repository';
import { GroupUsersRepository } from './repositories/group-users.repository';
import { GroupMessagesRepository } from './repositories/group-messages.repository';
import { HttpService } from '@nestjs/axios';

@Injectable()
@LogClass()
export class GroupsService {
  constructor(
    private readonly groupsRepository: GroupsRepository,
    private readonly groupMessagesRepository: GroupMessagesRepository,
    private readonly groupUsersRepository: GroupUsersRepository,
    private readonly httpService: HttpService,
  ) {}

  /***********  GROUP USERS  ************/

  /* Single Message Typing Set */
  async groupById(groupsId: string) {
    const contactList = await this.groupUsersRepository.getGroupById(groupsId);
    return contactList;
  }

  /* Single Message Typing Set */
  async groupContactsList(groupsId: string, userId: string) {
    const contactList = await this.groupUsersRepository.getGroupContactList(
      groupsId,
      userId,
    );
    return contactList;
  }

  /* Group Search */
  async searchGroupData(name: string, userId: string) {
    const contactList = await this.groupUsersRepository.searchGroupData(
      name,
      userId,
    );
    return contactList;
  }

  /* Unread Group User Get */
  async unreadGroupUser(groupsId: string) {
    const unreadUser = await this.groupUsersRepository.find({
      group_id: groupsId,
    });
    return unreadUser;
  }

  /* Update Unread Message */
  async updateUnreadGroupUser(
    groupsId: string,
    contactId: string,
    unread: number,
  ) {
    const messageUpdate = await this.groupUsersRepository.updateMany(
      { group_id: groupsId, contact_id: contactId },
      { unread },
    );
    return messageUpdate;
  }

  /* Contact Detail get By User Id */
  async contactListByUser(userId: string) {
    const contactList = await this.groupUsersRepository.getContactListByUser(
      userId,
    );
    return contactList;
  }

  /* Update All Unread Message Update */
  async updateUnreadGroupMessage(
    groupsId: string,
    userId: string,
    unread: number,
  ) {
    const messageUpdate = await this.groupUsersRepository.updateMany(
      { group_id: groupsId, contact_id: userId },
      { unread },
    );
    return messageUpdate;
  }

  /* Update All Unread Message Update */
  async updateAllUnreadGroupMessage(groupsId: string, unread: number) {
    const messageUpdate = await this.groupUsersRepository.updateMany(
      { group_id: groupsId },
      { unread },
    );
    return messageUpdate;
  }

  /* Delete Group Member */
  async groupDeleteMember(id: string, group_id: string) {
    const groupDelete = await this.groupUsersRepository.remove({
      contact_id: id,
      group_id: group_id,
    });
    return groupDelete;
  }

  /* Delete Group All Member */
  async groupMemberDelete(id: string) {
    const groupDelete = await this.groupUsersRepository.remove({
      group_id: id,
    });
    return groupDelete;
  }

  /* Group User Delete */
  async deleteGroupUser(id: string, group_id: string) {
    const groupUserDelete = await this.groupUsersRepository.remove({
      contact_id: id,
      group_id: group_id,
    });
    return groupUserDelete;
  }

  /***********  GROUP MESSAGES  ************/

  /* Single Group Message Search */
  async groupSearchData(name: string, id: string) {
    const groupMessage =
      await this.groupMessagesRepository.searchGroupMessagesData(name, id);
    return groupMessage;
  }

  /* Group Message Get */
  async groupsMessage(id: string, startm = 0) {
    const groupMessage = await this.groupMessagesRepository.getGroupMessages(
      id,
      startm,
    );
    return groupMessage;
  }

  /* Group message Update */
  async groupMessageUpdate(id: string, message: string) {
    const messageUpdate = await this.groupMessagesRepository.updateOne(
      { id },
      { message },
    );
    return messageUpdate;
  }

  /* Remove Group Attached file */
  async groupFileDelete(id: string) {
    const messageDelete = await this.groupMessagesRepository.remove({ id });
    return messageDelete;
  }

  /* All Group Message Delete */
  async allGroupMessageDelete(id: string) {
    const groupDelete = await this.groupMessagesRepository.remove({
      group_id: id,
    });
    return groupDelete;
  }

  /* Single All Message Delete */
  async singleGroupMessageDelete(contactId: string, groupId: string) {
    const groupDelete = await this.groupMessagesRepository.remove({
      group_id: contactId,
      sender_id: groupId,
    });
    return groupDelete;
  }

  /* Single All Message Delete */
  async groupSenderMessage(contactId: string, groupId: string) {
    const groupMsg = await this.groupMessagesRepository.find({
      group_id: contactId,
      sender_id: groupId,
    });
    return groupMsg;
  }

  /***********  GROUPS  ************/

  /* Message Update */
  async groupData(id: string) {
    const groupData = await this.groupsRepository.findById(id);
    return groupData;
  }

  /* Delete Group */
  async groupDelete(id: string) {
    const groupDelete = await this.groupsRepository.remove({ id });
    return groupDelete;
  }

  /* Group name Update */
  async groupNameUpdate(id: string, name: string) {
    const messageUpdate = await this.groupsRepository.updateOne(
      { id },
      { name },
    );
    return messageUpdate;
  }
}
