import { HydratedDocument } from 'mongoose';

/**
 * Extracts the underlying document type from a Mongoose `HydratedDocument`.
 * This utility type is useful for working with Mongoose models and their hydrated versions.
 *
 * @template T The type of the `HydratedDocument`.
 * @returns The type of the document if `T` is a `HydratedDocument`, otherwise `never`.
 */
export type ExtractDocType<T> = T extends HydratedDocument<infer U> ? U : never;
