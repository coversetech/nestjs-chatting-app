import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Group } from './group.entity';
import { Contact } from 'src/models/contacts/entities/contact.entity';
import { ModelEntity, ModelEntitySchema } from 'src/models/model.entity';

export type GroupUserDocument = HydratedDocument<GroupUser>;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class GroupUser extends ModelEntity {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true,
  })
  contactId: Contact;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true })
  groupId: Group;

  @Prop({ type: Number, default: 0 })
  unread: number;

  @Prop({ type: Number, default: 0 })
  isAdmin: number;
}

export const GroupUserSchema = SchemaFactory.createForClass(GroupUser);
GroupUserSchema.add(ModelEntitySchema);
