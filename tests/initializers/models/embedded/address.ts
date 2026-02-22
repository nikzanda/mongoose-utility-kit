import {
  HydratedSingleSubdocument,
  Schema,
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

const addressSchema = new Schema<IAddress>({
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
}, { _id: false });

export default addressSchema;
