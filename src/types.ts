import { HydratedDocument } from 'mongoose';

/**
 * Extracts the underlying document type from a Mongoose `HydratedDocument`.
 * This utility type is useful for working with Mongoose models and their hydrated versions.
 *
 * @template T The type of the `HydratedDocument`.
 * @returns The type of the document if `T` is a `HydratedDocument`, otherwise `never`.
 */
export type ExtractRawDocType<T> = T extends HydratedDocument<infer U> ? U : never;

/**
 * Extracts the virtuals type from a Mongoose `HydratedDocument`.
 * This utility type is useful for accessing the shape of virtual properties
 * defined on Mongoose schemas.
 *
 * @template T The type of the `HydratedDocument`.
 * @returns The type of the virtuals if `T` is a `HydratedDocument`, otherwise `never`.
 *
 * @example
 * ```ts
 * type Virtuals = ExtractVirtualsType<HydratedDocument<MyDoc, MyVirtuals>>;
 * // Virtuals is inferred as MyVirtuals
 * ```
 */
export type ExtractVirtualsType<T> = T extends HydratedDocument<any, infer U> ? U : never;
