import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ContactsController } from "./contacts.controller";
import { ContactsService } from "./contacts.service";
import { Contact, ContactSchema } from "./entities/contact.entity";
import { ContactsRepository } from "./contacts.repository";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Contact.name, schema: ContactSchema }]),
  ],
  controllers: [ContactsController],
  providers: [ContactsRepository, ContactsService],
  exports: [ContactsRepository, ContactsService],
})
export class ContactsModule {}
