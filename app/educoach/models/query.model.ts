import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import { Types } from "mongoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

export class QueryReply {
  @prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
  _id!: Types.ObjectId;

  @prop({ type: Types.ObjectId, required: true })
  author_id!: Types.ObjectId;

  @prop({ type: String, required: true })
  author_name!: string;

  @prop({ type: Boolean, default: false })
  is_instructor!: boolean;

  @prop({ type: String, required: true })
  body!: string;

  @prop({ type: Boolean, default: false })
  is_accepted!: boolean;

  @prop({ type: Date, default: () => new Date() })
  created_at!: Date;
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_queries",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class Query extends CommonTypegooseEntity {
  @prop({ type: Types.ObjectId, required: true })
  author_id!: Types.ObjectId;

  @prop({ type: String, required: true })
  author_name!: string;

  @prop({ type: String, required: true })
  title!: string;

  @prop({ type: String, required: false, default: "" })
  body!: string;

  @prop({ type: Types.ObjectId, required: false, default: null })
  course_id?: Types.ObjectId | null;

  @prop({ type: () => [QueryReply], default: [] })
  replies!: QueryReply[];

  @prop({ type: Boolean, default: false })
  is_resolved!: boolean;
}

export const QueryModel = getModelForClass(Query);
