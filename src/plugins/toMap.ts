import { HydratedDocument, QueryWithHelpers, Schema } from 'mongoose';
import { ExtractDocType } from '../types';

/**
 * Interface for query helpers that support converting results to a `Map`.
 *
 * @template T The type of the `HydratedDocument`.
 */
export interface ToMapQueryHelpers<T extends HydratedDocument<any>> {
  /**
   * Converts the query results into a `Map` where the key is the document's _id.
   *
   * @returns A QueryWithHelpers instance that returns a `Map` of documents.
   */
  toMap(): QueryWithHelpers<
    Map<string, T>,
    T,
    ToMapQueryHelpers<T>,
    ExtractDocType<T>
  >,
}

/**
 * Function to transform query results into a `Map`.
 *
 * @template T The type of the `HydratedDocument`.
 * @this QueryWithHelpers instance.
 * @returns The transformed query result as a `Map`.
 */
function toMap<T extends HydratedDocument<any>>(
  this: QueryWithHelpers<
    Map<string, T>,
    T,
    ToMapQueryHelpers<T>,
    ExtractDocType<T>
  >,
) {
  const result = this.transform((docs: any) => {
    if (!docs) {
      return new Map();
    }
    if (Array.isArray(docs)) {
      return new Map(docs.map((doc: any) => [doc._id.toString(), doc]));
    }
    return new Map([[docs._id.toString(), docs]]);
  });
  return result;
}

/**
 * Mongoose plugin to add the `toMap` method to queries.
 *
 * @template T The type of the `HydratedDocument`.
 * @param schema The Mongoose schema to extend.
 */
const toMapPlugin = <T extends HydratedDocument<any>>(
  schema: Schema<any, any, any, ToMapQueryHelpers<T>, any, any, any>,
) => {
  // eslint-disable-next-line no-param-reassign
  schema.query.toMap = toMap;
};

export default toMapPlugin;
