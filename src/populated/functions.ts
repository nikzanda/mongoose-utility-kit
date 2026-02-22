import {
  Document,
  Model,
  PopulatedDoc,
  Types,
} from 'mongoose';

/**
 * Extracts the ID from a populated Mongoose document.
 *
 * This function takes a populated document and returns its ID as a string.
 * If the document is an instance of `ObjectId`, it directly returns its string representation.
 * If the document has an `id` or `_id` property, it returns the corresponding value as a string.
 * If none of these conditions are met, an exception is thrown.
 *
 * @template HydratedDocType - The type of the populated document, extending `Document`.
 * @param {PopulatedDoc<HydratedDocType>} populatedDocument
 * - The populated document from which to extract the ID.
 * @returns {string} The ID of the document as a string.
 * @throws {Error} - Throws an error if the document is invalid or does not contain an ID.
 */
export const getPopulatedDocumentId = <HydratedDocType extends Document>(
  populatedDocument: PopulatedDoc<HydratedDocType>,
): string => {
  if (populatedDocument instanceof Types.ObjectId) {
    return populatedDocument.toString();
  }

  const _id = populatedDocument?._id;
  if (_id) {
    return _id.toString();
  }

  throw new Error(`Expected a populated document or ObjectId, got: ${typeof populatedDocument}`);
};

/**
 * Finds a Mongoose document by its ID or returns the provided instance.
 *
 * This asynchronous function takes either a document instance or an ObjectId.
 * If the provided value is an instance of the specified Mongoose model, it returns that instance.
 * Otherwise, it attempts to find the document by its ID using the provided Mongoose model.
 * If the document is not found, it throws an error, which can be customized
 * through the `err` parameter.
 *
 * @template HydratedDocType - The type of the hydrated document, extending `Document`.
 * @param {HydratedDocType | Types.ObjectId | string} docOrId
 * - The document instance, ObjectId, or string ID to find.
 * @param {Model<any, any, any, any, HydratedDocType>} MongooseModel
 * - The Mongoose model used to query the database.
 * @param {Error | (() => Error)} [err]
 * - Optional error or a function that returns an error to throw if the document is not found.
 * @returns {Promise<HydratedDocType>} A promise that resolves to the hydrated document instance.
 * @throws {Error} - Throws an error if the document is not found and no custom error is provided.
 */
export const findOrReturnInstance = async <HydratedDocType extends Document>(
  docOrId: HydratedDocType | Types.ObjectId | string,
  MongooseModel: Model<any, any, any, any, HydratedDocType>,
  err?: Error | (() => Error),
): Promise<HydratedDocType> => {
  if (docOrId instanceof MongooseModel) {
    return docOrId;
  }

  const result = await MongooseModel
    .findById(docOrId)
    .orFail(err);
  return result;
};

/**
 * Finds multiple Mongoose documents by their IDs or returns the provided instances.
 *
 * This asynchronous function takes an array of document instances or ObjectIds.
 * It returns an array containing the provided instances and any documents found by their IDs.
 * If any of the provided values are instances of the specified Mongoose model,
 * they are included in the result.
 * The function queries the database for any ObjectIds
 * that are not already represented by instances.
 *
 * @template HydratedDocType - The type of the hydrated documents, extending `Document`.
 * @param {(HydratedDocType | Types.ObjectId | string)[]} docOrIds
 * - An array of document instances, ObjectIds, or string IDs to find.
 * @param {Model<any, any, any, any, HydratedDocType>} MongooseModel
 * - The Mongoose model used to query the database.
 * @returns {Promise<HydratedDocType[]>}
 * A promise that resolves to an array of hydrated document instances.
 */
export const findOrReturnManyInstances = async <HydratedDocType extends Document>(
  docOrIds: (HydratedDocType | Types.ObjectId | string)[],
  MongooseModel: Model<any, any, any, any, HydratedDocType>,
): Promise<HydratedDocType[]> => {
  const [result, objectIds] = docOrIds
    .reduce((acc: [HydratedDocType[], Types.ObjectId[]], docOrId) => {
      if (docOrId instanceof MongooseModel) {
        acc[0].push(docOrId);
      }
      else if (docOrId instanceof Types.ObjectId) {
        acc[1].push(docOrId);
      }
      else if (typeof docOrId === 'string') {
        acc[1].push(new Types.ObjectId(docOrId));
      }
      return acc;
    }, [[], []]);
  if (objectIds.length > 0) {
    const docs = await MongooseModel.find({
      _id: {
        $in: objectIds,
      },
    });
    result.push(...docs);
  }
  return result;
};

/**
 * Type guard that checks if a potentially populated Mongoose field
 * is actually a populated document rather than an ObjectId.
 *
 * This is useful for narrowing the type of a `PopulatedDoc<HydratedDocType>`
 * field after conditionally populating a query.
 *
 * @template HydratedDocType - The type of the populated document, extending `Document`.
 * @param {PopulatedDoc<HydratedDocType>} value
 * - The value to check, which may be either a populated document or an ObjectId.
 * @returns {value is HydratedDocType} `true` if the value is a populated document.
 */
export const isPopulated = <HydratedDocType extends Document>(
  value: PopulatedDoc<HydratedDocType>,
): value is HydratedDocType => {
  if (value instanceof Types.ObjectId) {
    return false;
  }
  if (value != null && typeof value === 'object' && ('_id' in value || 'id' in value)) {
    return true;
  }
  return false;
};

/**
 * Converts a string, ObjectId, or Document to a `Types.ObjectId`.
 *
 * If the value is already an `ObjectId`, it is returned as-is.
 * If the value is a Document, its `_id` is returned.
 * If the value is a string, a new `Types.ObjectId` is constructed from it.
 *
 * @param {string | Types.ObjectId | Document} value - The value to convert.
 * @returns {Types.ObjectId} The resulting ObjectId.
 * @throws {Error} If the string is not a valid 24-character hex string.
 */
export const toObjectId = (
  value: string | Types.ObjectId | Document,
): Types.ObjectId => {
  if (value instanceof Types.ObjectId) {
    return value;
  }
  if (typeof value === 'object' && value !== null && '_id' in value) {
    return value._id;
  }
  return new Types.ObjectId(value as string);
};

/**
 * Compares two values by their underlying MongoDB document ID.
 *
 * Each value can be a string, `ObjectId`, `Document`, or `PopulatedDoc`.
 * Returns `false` if either value is `null` or `undefined`.
 *
 * @param {string | Types.ObjectId | Document | PopulatedDoc<any> | null | undefined} a
 * - The first value to compare.
 * @param {string | Types.ObjectId | Document | PopulatedDoc<any> | null | undefined} b
 * - The second value to compare.
 * @returns {boolean} `true` if both values resolve to the same ID string.
 */
export const areIdsEqual = (
  a: string | Types.ObjectId | Document | PopulatedDoc<any> | null | undefined,
  b: string | Types.ObjectId | Document | PopulatedDoc<any> | null | undefined,
): boolean => {
  if (a == null || b == null) {
    return false;
  }

  const normalize = (
    val: string | Types.ObjectId | Document | PopulatedDoc<any>,
  ): string => {
    if (typeof val === 'string') {
      return val;
    }
    if (val instanceof Types.ObjectId) {
      return val.toString();
    }
    if (typeof val === 'object' && '_id' in val) {
      return val._id.toString();
    }
    return String(val);
  };

  return normalize(a) === normalize(b);
};

/**
 * Asserts that a potentially populated Mongoose field is actually a populated document.
 *
 * This is the assertion counterpart of `isPopulated`. If the value is not populated,
 * an error is thrown. Otherwise, the value is returned with its type narrowed to
 * `HydratedDocType`.
 *
 * @template HydratedDocType - The type of the populated document, extending `Document`.
 * @param {PopulatedDoc<HydratedDocType>} value
 * - The value to check, which may be either a populated document or an ObjectId.
 * @returns {HydratedDocType} The populated document.
 * @throws {Error} If the value is not a populated document.
 */
export const ensurePopulated = <HydratedDocType extends Document>(
  value: PopulatedDoc<HydratedDocType>,
): HydratedDocType => {
  if (isPopulated(value)) {
    return value;
  }
  throw new Error(`Expected a populated document, got: ${typeof value}`);
};
