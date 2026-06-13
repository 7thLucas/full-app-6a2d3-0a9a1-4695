import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import { Types } from "mongoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

export class MCQOption {
  @prop({ type: String, required: true })
  text!: string;
}

export class MCQQuestion {
  @prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id!: Types.ObjectId;

  @prop({ type: String, required: true })
  question!: string;

  @prop({ type: () => [MCQOption], required: true })
  options!: MCQOption[];

  /** 0-based index of correct answer */
  @prop({ type: Number, required: true })
  correct_index!: number;

  @prop({ type: String, required: false, default: "" })
  explanation!: string;
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_mcq_tests",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class MCQTest extends CommonTypegooseEntity {
  @prop({ type: String, required: true, trim: true })
  title!: string;

  @prop({ type: String, required: false, default: "" })
  description!: string;

  @prop({ type: Types.ObjectId, required: false, default: null })
  course_id?: Types.ObjectId | null;

  @prop({ type: Types.ObjectId, required: false, default: null })
  topic_id?: Types.ObjectId | null;

  @prop({ type: () => [MCQQuestion], default: [] })
  questions!: MCQQuestion[];

  @prop({ type: Number, required: false, default: 0 })
  time_limit_minutes!: number;

  @prop({ type: Boolean, default: true })
  is_published!: boolean;
}

export const MCQTestModel = getModelForClass(MCQTest);

// ─── MCQ Attempt ─────────────────────────────────────────────────────────────

export class AttemptAnswer {
  @prop({ type: Types.ObjectId, required: true })
  question_id!: Types.ObjectId;

  @prop({ type: Number, required: true })
  selected_index!: number;
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_mcq_attempts",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class MCQAttempt extends CommonTypegooseEntity {
  @prop({ type: Types.ObjectId, required: true })
  user_id!: Types.ObjectId;

  @prop({ type: Types.ObjectId, required: true })
  test_id!: Types.ObjectId;

  @prop({ type: () => [AttemptAnswer], default: [] })
  answers!: AttemptAnswer[];

  @prop({ type: Number, required: true, default: 0 })
  score!: number;

  @prop({ type: Number, required: true, default: 0 })
  total!: number;

  @prop({ type: Date, required: false, default: null })
  completed_at?: Date | null;
}

export const MCQAttemptModel = getModelForClass(MCQAttempt);
