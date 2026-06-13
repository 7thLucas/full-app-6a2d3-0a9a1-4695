import { prop, getModelForClass, modelOptions, Ref } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

export enum ContentTier {
  Free = "free",
  Paid = "paid",
}

export enum LessonType {
  Video = "video",
  Notes = "notes",
  PDF = "pdf",
}

// ─── Lesson ─────────────────────────────────────────────────────────────────

@modelOptions({
  schemaOptions: {
    collection: "tbl_lessons",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class Lesson extends CommonTypegooseEntity {
  @prop({ type: String, required: true, trim: true })
  title!: string;

  @prop({ type: String, required: false, default: "" })
  description!: string;

  @prop({ type: String, enum: LessonType, default: LessonType.Video })
  type!: LessonType;

  /** URL of video, PDF path, or rich-text notes HTML */
  @prop({ type: String, required: false, default: "" })
  content_url!: string;

  /** Rich-text notes body (HTML) for type=notes */
  @prop({ type: String, required: false, default: "" })
  notes_body!: string;

  /** Duration in seconds (for videos) */
  @prop({ type: Number, required: false, default: 0 })
  duration_seconds!: number;

  @prop({ type: String, enum: ContentTier, default: ContentTier.Free })
  tier!: ContentTier;

  @prop({ type: Number, default: 0 })
  sort_order!: number;

  @prop({ type: Boolean, default: true })
  is_published!: boolean;
}

export const LessonModel = getModelForClass(Lesson);

// ─── Topic ───────────────────────────────────────────────────────────────────

@modelOptions({
  schemaOptions: {
    collection: "tbl_topics",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class Topic extends CommonTypegooseEntity {
  @prop({ type: String, required: true, trim: true })
  title!: string;

  @prop({ type: Number, default: 0 })
  sort_order!: number;

  @prop({ ref: () => Lesson, default: [] })
  lessons!: Ref<Lesson>[];
}

export const TopicModel = getModelForClass(Topic);

// ─── Course ──────────────────────────────────────────────────────────────────

@modelOptions({
  schemaOptions: {
    collection: "tbl_courses",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class Course extends CommonTypegooseEntity {
  @prop({ type: String, required: true, trim: true })
  title!: string;

  @prop({ type: String, required: false, default: "" })
  description!: string;

  @prop({ type: String, required: false, default: "" })
  thumbnail_url!: string;

  @prop({ type: String, enum: ContentTier, default: ContentTier.Free })
  tier!: ContentTier;

  @prop({ type: Number, default: 0 })
  price!: number;

  @prop({ type: String, required: false, default: "" })
  category!: string;

  @prop({ ref: () => Topic, default: [] })
  topics!: Ref<Topic>[];

  @prop({ type: Boolean, default: true })
  is_published!: boolean;

  @prop({ type: Number, default: 0 })
  sort_order!: number;
}

export const CourseModel = getModelForClass(Course);
