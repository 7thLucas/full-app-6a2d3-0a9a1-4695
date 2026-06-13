import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import { Types } from "mongoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

export enum NotificationType {
  NewLesson = "new_lesson",
  NewQuiz = "new_quiz",
  QueryReply = "query_reply",
  Announcement = "announcement",
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_notifications",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class Notification extends CommonTypegooseEntity {
  /** null means broadcast to all students */
  @prop({ type: Types.ObjectId, required: false, default: null })
  user_id?: Types.ObjectId | null;

  @prop({ type: String, required: true })
  title!: string;

  @prop({ type: String, required: false, default: "" })
  body!: string;

  @prop({ type: String, enum: NotificationType, default: NotificationType.Announcement })
  type!: NotificationType;

  /** Optional deep-link path */
  @prop({ type: String, required: false, default: "" })
  link!: string;

  @prop({ type: Boolean, default: false })
  is_read!: boolean;
}

export const NotificationModel = getModelForClass(Notification);
