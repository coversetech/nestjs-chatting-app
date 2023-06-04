import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { ModelEntity, ModelEntitySchema } from 'src/models/model.entity';
import { User } from 'src/models/users/entities/user.entity';

export type GroupDocument = HydratedDocument<Group>;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class Group extends ModelEntity {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: User;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
GroupSchema.add(ModelEntitySchema);
