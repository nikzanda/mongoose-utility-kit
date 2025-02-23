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

  const id = populatedDocument?.id || populatedDocument?._id;
  if (id) {
    return id.toString();
  }

  throw new Error('document incorrect');
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
 * @param {HydratedDocType | Types.ObjectId} docOrId - The document instance or ObjectId to find.
 * @param {Model<any, any, any, any, HydratedDocType>} MongooseModel
 * - The Mongoose model used to query the database.
 * @param {Error | (() => Error)} [err]
 * - Optional error or a function that returns an error to throw if the document is not found.
 * @returns {Promise<HydratedDocType>} A promise that resolves to the hydrated document instance.
 * @throws {Error} - Throws an error if the document is not found and no custom error is provided.
 */
export const findOrReturnInstance = async <HydratedDocType extends Document>(
  docOrId: HydratedDocType | Types.ObjectId,
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
 * @param {(HydratedDocType | Types.ObjectId)[]} docOrIds
 * - An array of document instances or ObjectIds to find.
 * @param {Model<any, any, any, any, HydratedDocType>} MongooseModel
 * - The Mongoose model used to query the database.
 * @returns {Promise<HydratedDocType[]>}
 * A promise that resolves to an array of hydrated document instances.
 */
export const findOrReturnManyInstances = async <HydratedDocType extends Document>(
  docOrIds: (HydratedDocType | Types.ObjectId)[],
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
