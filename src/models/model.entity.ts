import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, Types } from 'mongoose';
import { Transform } from 'class-transformer';

export type ModelEntityDocument = HydratedDocument<ModelEntity>;

@Schema({
  toJSON: {
    getters: true,
    virtuals: true,
  },
})
export class ModelEntity {
  @Transform(({ value }) => value.toString())
  @Prop({ default: Types.ObjectId, auto: true })
  _id: ObjectId;

  @Prop({ default: 'Anonymous' })
  createdBy: string;

  @Prop({ default: () => new Date() })
  @Transform((value) => value || new Date(), { toClassOnly: true })
  createdAt: Date;

  @Prop({ default: null })
  updatedBy: string;

  @Prop({ default: null })
  updatedAt: Date;
}

export const ModelEntitySchema = SchemaFactory.createForClass(ModelEntity);
