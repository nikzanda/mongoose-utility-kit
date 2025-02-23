import {
  Schema,
  Model,
  SchemaTypes,
  SchemaOptions,
  Types,
  HydratedDocument,
  model,
} from 'mongoose';
import addressSchema, { AddressInstance, IAddress } from './embedded/address';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  surname: string;
  email: string;
  password: string;
  address: IAddress;
  createdAt: Date;
  updatedAt: Date;
}

interface IUserDocumentOverrides {
  address: AddressInstance;
}

interface IUserVirtuals {
  id: string;
  fullName: string;
}

export type UserHydratedDocument = HydratedDocument<IUser, IUserDocumentOverrides & IUserVirtuals>;

export type UserModelType = Model<
  IUser,
  {},
  IUserDocumentOverrides,
  IUserVirtuals,
  UserHydratedDocument
>;

const options: SchemaOptions<IUser> = {
  timestamps: true,
  optimisticConcurrency: true,
};

const userSchema = new Schema<IUser, UserModelType>({
  name: {
    type: SchemaTypes.String,
    required: true,
    trim: true,
  },
  email: {
    type: SchemaTypes.String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: SchemaTypes.String,
    required: true,
  },
  address: {
    type: addressSchema,
    required: true,
  },
}, options);

userSchema.index({ name: 1 });

userSchema.virtual('fullName')
  .get(function () {
    return `${this.name} ${this.surname}`;
  });

export default model<IUser, UserModelType>('User', userSchema);
