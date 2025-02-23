import {
  Schema,
  Model,
  SchemaTypes,
  SchemaOptions,
  Types,
  HydratedDocument,
  PopulatedDoc,
  model,
} from 'mongoose';
import { UserHydratedDocument } from './user';

export interface IComment {
  _id: Types.ObjectId;
  user: PopulatedDoc<UserHydratedDocument>;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ICommentDocumentOverrides {}

interface ICommentVirtuals {
  id: string;
}

export type CommentHydratedDocument = HydratedDocument<
  IComment,
  ICommentDocumentOverrides & ICommentVirtuals
>;

export type CommentModelType = Model<
  IComment,
  {},
  ICommentDocumentOverrides,
  ICommentVirtuals,
  CommentHydratedDocument
>;

const options: SchemaOptions<IComment> = {
  timestamps: true,
  optimisticConcurrency: true,
};

const commentSchema = new Schema<IComment, CommentModelType>({
  user: {
    type: SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: SchemaTypes.String,
    trim: true,
  },
}, options);

commentSchema.index({ user: 1 });

export default model<IComment, CommentModelType>('Comment', commentSchema);
