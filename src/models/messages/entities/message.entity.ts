import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/models/users/entities/user.entity';
import { ModelEntity, ModelEntitySchema } from 'src/models/model.entity';

export type MessageDocument = HydratedDocument<Message>;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class Message extends ModelEntity {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  senderId: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  receiverId: User;

  @Prop({
    type: String,
  })
  fileUpload: string;

  @Prop({ type: Number, default: 0 })
  unread: number;

  @Prop({ type: Number, default: 0 })
  flag: number;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.add(ModelEntitySchema);
