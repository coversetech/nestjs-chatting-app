import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Group } from "./group.entity";
import { User } from "src/models/users/entities/user.entity";
import { ModelEntity, ModelEntitySchema } from "src/models/model.entity";

export type GroupMessageDocument = HydratedDocument<GroupMessage>;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class GroupMessage extends ModelEntity {
  @Prop({ type: String })
  message: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  senderId: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true })
  groupId: Group;

  @Prop({ type: String })
  fileUpload: string;

  @Prop({ type: Number, default: 0 })
  unread: number;
}

export const GroupMessageSchema = SchemaFactory.createForClass(GroupMessage);
GroupMessageSchema.add(ModelEntitySchema);
