import { Prop } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

export abstract class BaseSchema {
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  _id?: Types.ObjectId;

  @Prop({ type: Date, required: true, default: Date.now })
  createdAt?: Date;

  @Prop({ type: Date, required: true, default: Date.now })
  updatedAt?: Date;

  @Prop({ required: true, default: false })
  isDeleted?: boolean = false;
}
