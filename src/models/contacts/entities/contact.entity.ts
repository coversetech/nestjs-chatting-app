import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import validator from "validator";
import { User } from "src/models/users/entities/user.entity";
import { ModelEntity, ModelEntitySchema } from "src/models/model.entity";

export type ContactDocument = HydratedDocument<Contact>;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class Contact extends ModelEntity {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  })
  email: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
  userId: User;

  @Prop({ type: mongoose.Schema.Types.Date })
  lastMsgDate: Date;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
ContactSchema.add(ModelEntitySchema);
