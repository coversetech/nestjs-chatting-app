import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import validator from "validator";
import { ModelEntity, ModelEntitySchema } from "src/models/model.entity";

export type UserDocument = HydratedDocument<User>;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class User extends ModelEntity {
  @Prop({
    type: String,
    required: [true, "A user must have a name"],
    maxlength: [10, "Username must be less than or equal to 10 characters."],
  })
  name: string;

  @Prop({
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  })
  email: string;

  @Prop({
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
  })
  password: string;

  @Prop({
    type: String,
    default: 1,
  })
  notification: string;

  @Prop({
    type: String,
    default: 1,
  })
  isMuted: string;

  @Prop({
    type: String,
    required: [true, "Please provide a location"],
  })
  location: string;

  @Prop({ type: mongoose.Schema.Types.Date })
  passwordChangedAt: Date;

  @Prop({ type: String })
  passwordResetToken: string;

  @Prop({ type: mongoose.Schema.Types.Date })
  passwordResetExpires: Date;

  @Prop({
    type: Boolean,
    default: false,
  })
  active: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.add(ModelEntitySchema);
