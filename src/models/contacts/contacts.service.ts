import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { LogClass } from 'src/common/decorators/log-class.decorator';
import { ContactsRepository } from './contacts.repository';
import { ResponseOut } from 'src/common/interfaces/response.interface';
import { ContactDocument } from './entities/contact.entity';
import { ContactEmail } from './dto/contact-email.dto';

@Injectable()
@LogClass()
export class ContactsService {
  constructor(
    private readonly contactsRepository: ContactsRepository,
    private readonly httpService: HttpService,
  ) {}

  /* Contact Match */
  async contactEmail(
    email: string,
    createBy: Date,
  ): Promise<ResponseOut<ContactEmail>> {
    const contacts: ContactDocument | ContactDocument[] =
      await this.contactsRepository.find({
        email: email,
        created_by: createBy,
      });

    if (contacts?.length === 1) {
      return {
        statusCode: 200,
        status: 'success',
        message: 'contact by email address',
        data: { contacts: contacts[0] },
      };
    } else if (contacts.length > 1) {
      return {
        statusCode: 300,
        status: 'too many results',
        message: 'found more than one contact. Returning all',
        data: { contacts },
      };
    } else {
      return {
        statusCode: 400,
        status: 'bad request',
        message: 'No contacts found',
        data: { contacts: [] },
      };
    }
  }

  /* Get All Contact User wise */
  async contactList(userId: string) {
    const users = await this.contactsRepository.getAllContacts(userId);
    return users;
  }

  /* Contact List search */
  async searchContactData(name: string, userId: string) {
    const searchedContacts = await this.contactsRepository.contactListSearch(
      name,
      userId,
    );

    return searchedContacts;
  }

  /* User Id Wise contact Get */
  async userJoin(userId: string) {
    return this.contactsRepository.getContactsByUserIdWise(userId);
  }

  /* Current user name edit */
  async receiverNameUpdate(userId: string, receiverId: string, name: string) {
    const messageUpdate = await this.contactsRepository.updateOne(
      { created_by: userId, user_id: receiverId },
      { name },
    );
    return messageUpdate;
  }

  async getContactListByUserId(userId: string, createdBy: Date) {
    return this.contactsRepository.getContactListByUserId(userId, createdBy);
  }

  /* Delete Contact */
  async contactDelete(receiverId: string, userId: string) {
    const contactDelete = await this.contactsRepository.remove({
      user_id: { $in: [receiverId, userId] },
      created_by: { $in: [userId, receiverId] },
    });

    return contactDelete;
  }
}
