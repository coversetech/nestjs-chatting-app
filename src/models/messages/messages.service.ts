import { Injectable } from '@nestjs/common';
import { LogClass } from 'src/common/decorators/log-class.decorator';
import { MessagesRepository } from './messages.repository';
import { HttpService } from '@nestjs/axios';

@Injectable()
@LogClass()
export class MessagesService {
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly httpService: HttpService,
  ) {}

  /* All Message Delete */
  async allMessageDelete(id: string, uid: string) {
    const messageDelete = await this.messagesRepository.remove({
      $or: [
        { $and: [{ receiver_id: id }, { sender_id: uid }] },
        { $and: [{ sender_id: id }, { receiver_id: uid }] },
      ],
    });
    return messageDelete;
  }

  /* All Sender Message Delete */
  async allSenderMessageDelete(id: string) {
    const messageDelete = await this.messagesRepository.remove({
      sender_id: id,
    });
    return messageDelete;
  }

  /* Last Message */
  async lastMsg(userId: string, receiverId: string) {
    const contactList = await this.messagesRepository.findTheLastMessage(
      userId,
      receiverId,
    );
    return contactList;
  }

  /* Single Message Search */
  async messageSearchData(name: string, userId: string, receiverId: string) {
    const message = await this.messagesRepository.searchMessagesData(
      name,
      userId,
      receiverId,
    );
    return message;
  }

  /* Unread Message Get */
  async sendUnreadMsg(receiver_id: string) {
    const message = await this.messagesRepository.find({
      receiver_id: receiver_id,
      unread: '0',
    });
    return message;
  }

  /* Receiver Message Get */
  async receiverMessage(id: string) {
    const message = await this.messagesRepository.getReceiverMessage(id);
    return message;
  }

  /* Message Update */
  async messageUpdate(id: string, message: string, flag: number) {
    const messageUpdate = await this.messagesRepository.updateOne(
      { id },
      {
        message,
        flag,
      },
    );
    return messageUpdate;
  }

  /* Contact wise sender and receiver message */
  async userMessage(id: string, startm: number) {
    const message = await this.messagesRepository.getUserMessages(id, startm);
    return message;
  }

  /* Update Unread Message */
  async updateUnreadMsg(receiver_Id: string, unread: number) {
    const message_update = await this.messagesRepository.updateMany(
      { sender_id: receiver_Id },
      { unread },
    );
    return message_update;
  }

  /* Single Message Delete */
  async messageDelete(id: string, flag: number) {
    /* Soft Delete */
    const message_delete = await this.messagesRepository.updateOne(
      { id },
      {
        flag,
      },
    );
    return message_delete;
  }
}
