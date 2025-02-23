import {
  HydratedSingleSubdocument,
  Model,
  Schema,
  SchemaOptions,
  SchemaTypes,
} from 'mongoose';

export interface IAddress {
  streetAddress?: string;
  postalCode?: string;
  city?: string;
  province?: string;
  country?: string;
}

export type AddressInstance = HydratedSingleSubdocument<IAddress>;

type AddressModelType = Model<IAddress, {}, {}, {}, AddressInstance>;

const options: SchemaOptions<IAddress> = {
  _id: false,
};

const addressSchema = new Schema<IAddress, AddressModelType>({
  streetAddress: {
    type: SchemaTypes.String,
    trim: true,
  },
  postalCode: {
    type: SchemaTypes.String,
    trim: true,
  },
  city: {
    type: SchemaTypes.String,
    trim: true,
  },
  province: {
    type: SchemaTypes.String,
    trim: true,
  },
  country: {
    type: SchemaTypes.String,
    trim: true,
  },
}, options);

export default addressSchema;
