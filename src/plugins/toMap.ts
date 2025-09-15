/* eslint-disable max-len */
import { HydratedDocument, QueryWithHelpers, Schema } from 'mongoose';
import { ExtractRawDocType, ExtractVirtualsType } from '../types';

/**
 * Interface for query helpers that support converting results to a `Map`.
 *
 * @template T The type of the `HydratedDocument`.
 */
export interface ToMapQueryHelpers<RawDocType, HydratedDocType, TVirtuals> {
  /**
   * Query helper interface for converting query results into a `Map` keyed by string,
   * including virtual properties.
   *
   * @template RawDocType - The type representing the raw document as returned by MongoDB.
   * @template HydratedDocType - The type representing the hydrated Mongoose document.
   * @template TVirtuals - The type representing virtual properties added to the raw document.
   *
   * @remarks
   * - This overload of `toMap` is used when the query returns documents that include virtuals.
   * - The result is a `Map<string, RawDocType & TVirtuals>`, where the key is typically derived
   *   from a document property such as `_id`.
   *
   * @example
   * ```typescript
   * const docsMap = await Model.find().toMap();
   * // docsMap is a Map<string, RawDocType & TVirtuals>
   * ```
   */
  toMap(
    this: QueryWithHelpers<(RawDocType & TVirtuals)[], HydratedDocType>
  ): QueryWithHelpers<Map<string, RawDocType & TVirtuals>, HydratedDocType>;
  /**
   * Query helper interface for converting query results into a `Map` keyed by string.
   *
   * @template RawDocType - The type representing the raw document as returned by MongoDB.
   * @template HydratedDocType - The type representing the hydrated Mongoose document.
   *
   * @remarks
   * - The `toMap` method transforms an array of documents returned by a query into a `Map<string, T>`,
   *   where the key is typically derived from a document property (e.g., `_id` as a string).
   *
   * @example
   * ```typescript
   * const docsMap = await Model.find().toMap();
   * // docsMap is a Map<string, HydratedDocType>
   * ```
   */
  toMap(
    this: QueryWithHelpers<HydratedDocType[], HydratedDocType>
  ): QueryWithHelpers<Map<string, HydratedDocType>, HydratedDocType>;
  /**
   * Query helper interface for converting query results into a `Map` keyed by string.
   *
   * @template RawDocType - The type representing the raw document as returned by MongoDB.
   * @template HydratedDocType - The type representing the hydrated Mongoose document.
   *
   * @remarks
   * - The `toMap` method transforms an array of documents returned by a query into a `Map<string, T>`,
   *   where the key is typically derived from a document property (e.g., `_id` as a string).
   *
   * @example
   * ```typescript
   * const docsMap = await Model.find().toMap();
   * // docsMap is a Map<string, RawDocType>
   * ```
   */
  toMap(
    this: QueryWithHelpers<RawDocType[], HydratedDocType>
  ): QueryWithHelpers<Map<string, RawDocType>, HydratedDocType>;
}

/**
 * Mongoose plugin to add the `toMap` method to queries.
 *
 * @template T The type of the `HydratedDocument`.
 * @param schema The Mongoose schema to extend.
 */
const toMapPlugin = <T extends HydratedDocument<any>>(
  schema: Schema<any, any, any, ToMapQueryHelpers<ExtractRawDocType<T>, T, ExtractVirtualsType<T>>, any, any, any>,
) => {
  // eslint-disable-next-line no-param-reassign
  schema.query.toMap = function (this) {
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
  };
};

export default toMapPlugin;
