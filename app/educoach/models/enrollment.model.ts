import { prop, getModelForClass, modelOptions, Ref } from "@typegoose/typegoose";
import { Types } from "mongoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

@modelOptions({
  schemaOptions: {
    collection: "tbl_enrollments",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class Enrollment extends CommonTypegooseEntity {
  @prop({ type: Types.ObjectId, required: true })
  user_id!: Types.ObjectId;

  @prop({ type: Types.ObjectId, required: true })
  course_id!: Types.ObjectId;

  /** Sorted list of completed lesson IDs */
  @prop({ type: () => [Types.ObjectId], default: [] })
  completed_lessons!: Types.ObjectId[];

  @prop({ type: Date, required: false, default: null })
  paid_at?: Date | null;

  @prop({ type: Boolean, default: false })
  is_paid!: boolean;
}

export const EnrollmentModel = getModelForClass(Enrollment);
