import { HydratedDocument, QueryWithHelpers, Schema } from 'mongoose';
import { ExtractRawDocType, ExtractVirtualsType } from '../types';

/**
 * Interface for query helpers that support converting results to a record (object).
 *
 * @template T The type of the `HydratedDocument`.
 */
export interface ToRecordsQueryHelpers<RawDocType, HydratedDocType, TVirtuals> {
  /**
   * Query helper for transforming query results into a `Record<string, T>` object,
   * including virtual properties.
   *
   * @template RawDocType - The type representing the raw document as returned by MongoDB.
   * @template HydratedDocType - The type representing the hydrated Mongoose document.
   * @template TVirtuals - The type representing virtual properties added to the raw document.
   *
   * @remarks
   * - This overload is used when the query returns documents that include virtuals.
   * - The result is a plain object (`Record<string, RawDocType & TVirtuals>`) where each key
   *   corresponds to the document's `_id` (as a string), and the value includes both
   *   raw fields and virtuals.
   *
   * @example
   * ```ts
   * const records = await Model.find().toRecords();
   * // records is of type Record<string, RawDocType & TVirtuals>
   * ```
   */
  toRecords(
    this: QueryWithHelpers<(RawDocType & TVirtuals)[], HydratedDocType>
  ): QueryWithHelpers<Record<string, RawDocType & TVirtuals>, HydratedDocType>;
  /**
   * Query helpers for transforming query results into a record (object) keyed by document IDs.
   *
   * @template RawDocType - The type representing the raw document as returned by MongoDB.
   * @template HydratedDocType - The type representing the hydrated Mongoose document.
   *
   * Provides overloaded `toRecords` methods for use with Mongoose queries, allowing the result
   * array to be converted into a record where each key is the document's `_id` (as a string)
   * and the value is the corresponding document.
   *
   * @example
   * // Usage in a Mongoose query:
   * const records = await Model.find().toRecords();
   * // records is of type Record<string, HydratedDocType>
   */
  toRecords(
    this: QueryWithHelpers<HydratedDocType[], HydratedDocType>
  ): QueryWithHelpers<Record<string, HydratedDocType>, HydratedDocType>;
  /**
   * Query helpers for transforming query results into a record (object) keyed by document IDs.
   *
   * @template RawDocType - The type representing the raw document as returned by MongoDB.
   * @template HydratedDocType - The type representing the hydrated Mongoose document.
   *
   * Provides overloaded `toRecords` methods for use with Mongoose queries, allowing the result
   * array to be converted into a record where each key is the document's `_id` (as a string)
   * and the value is the corresponding document.
   *
   * @example
   * // Usage in a Mongoose query:
   * const records = await Model.find().toRecords();
   * // records is of type Record<string, RawDocType>
   */
  toRecords(
    this: QueryWithHelpers<RawDocType[], HydratedDocType>
  ): QueryWithHelpers<Record<string, RawDocType>, HydratedDocType>;
}

/**
 * Mongoose plugin to add the `toRecords` method to queries.
 *
 * @template T The type of the `HydratedDocument`.
 * @param schema The Mongoose schema to extend.
 */
const toRecordsPlugin = <T extends HydratedDocument<any>>(
  schema: Schema<
    any,
    any,
    any,
    ToRecordsQueryHelpers<ExtractRawDocType<T>,
    T,
    ExtractVirtualsType<T>>,
    any,
    any,
    any
  >,
) => {
  // eslint-disable-next-line no-param-reassign
  schema.query.toRecords = function toRecords(this) {
    const result = this.transform((docs: any) => {
      if (!docs) {
        return {};
      }
      if (Array.isArray(docs)) {
        return Object.fromEntries(docs.map((doc: any) => [doc._id.toString(), doc]));
      }
      return {
        [docs._id.toString()]: docs,
      };
    });
    return result;
  };
};

export default toRecordsPlugin;
