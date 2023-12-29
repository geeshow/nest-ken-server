import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseSchema } from '../common/schema/base.schema';

export type GoogleAuthDocument = GoogleAuth & Document;

@Schema()
export class GoogleAuth extends BaseSchema {
  @Prop({ required: true, unique: true })
  providerId: string;

  @Prop({ required: true })
  givenName: string;

  @Prop({ required: true })
  familyName: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  profilePictureUrl?: string;

  @Prop()
  googleAccessToken: string;

  @Prop()
  refreshToken: string;
}

export const GoogleAuthSchema = SchemaFactory.createForClass(GoogleAuth);
