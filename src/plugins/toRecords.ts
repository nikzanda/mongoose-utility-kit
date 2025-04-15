import { HydratedDocument, QueryWithHelpers, Schema } from 'mongoose';
import { ExtractDocType } from '../types';

/**
 * Interface for query helpers that support converting results to a record (object).
 *
 * @template T The type of the `HydratedDocument`.
 */
export interface ToRecordsQueryHelpers<T extends HydratedDocument<any>> {
  /**
   * Converts the query results into a record (object) where the key is the document's _id.
   *
   * @returns A QueryWithHelpers instance that returns a Record of documents.
   */
  toRecords(): QueryWithHelpers<
    Record<string, T>,
    T,
    ToRecordsQueryHelpers<T>,
    ExtractDocType<T>
  >,
}

/**
 * Function to transform query results into a record (object).
 *
 * @template T The type of the `HydratedDocument`.
 * @this QueryWithHelpers instance.
 * @returns The transformed query result as a Record.
 */
function toRecords<T extends HydratedDocument<any>>(
  this: QueryWithHelpers<
    Record<string, T>,
    T,
    ToRecordsQueryHelpers<T>,
    ExtractDocType<T>
  >,
) {
  const result = this.transform((docs: any) => {
    if (!docs) {
      return {};
    }
    if (Array.isArray(docs)) {
      return Object.fromEntries(
        docs.map((doc: any) => [doc._id.toString(), doc]),
      ) as Record<string, T>;
    }
    return {
      [docs._id.toString()]: docs,
    };
  });
  return result;
}

/**
 * Mongoose plugin to add the `toRecords` method to queries.
 *
 * @template T The type of the `HydratedDocument`.
 * @param schema The Mongoose schema to extend.
 */
const toRecordsPlugin = <T extends HydratedDocument<any>>(
  schema: Schema<any, any, any, ToRecordsQueryHelpers<T>, any, any, any>,
) => {
  // eslint-disable-next-line no-param-reassign
  schema.query.toRecords = toRecords;
};

export default toRecordsPlugin;
