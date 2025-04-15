# mongoose-utility-kit 🛠️

A set of utility functions and plugins to simplify common `mongoose` operations. Designed for `TypeScript` and `mongoose` projects with strict type safety.

[![npm](https://nodei.co/npm/mongoose-utility-kit.png)](https://www.npmjs.com/package/mongoose-utility-kit)

## Features

- **Type-safe**: Built with TypeScript for robust type checking.
- **Efficient**: Reduces redundant database queries and simplifies data transformations.
- **Flexible**: Handles both document instances and ObjectIds seamlessly.
- **Population Ready**: Designed for mongoose documents with populated references.
- **Data Transformation**: Provides plugins to convert query results into `Map` or `Record` objects.

## Installation

[mongoose](https://www.npmjs.com/package/mongoose) >=8 is required as peer dependency

```sh
npm install mongoose-utility-kit
```

or

```sh
yarn add mongoose-utility-kit
```

## TypeScript Usage Notes

These helpers are designed for mongoose projects using TypeScript with proper document typing. For best results:

1. Define your hydrated document types using mongoose's `HydratedDocument`:

```ts
// user.ts
import { HydratedDocument } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
}

export interface IUserDocumentOverrides = { /* ... */ }

export interface IUserVirtuals = { /* ... */ }

export type UserHydratedDocument = HydratedDocument<IUser, IUserDocumentOverrides & IUserVirtuals>;
```

2. Use `PopulatedDoc` for population references:

```ts
// comment.ts
import { Types, PopulatedDoc } from "mongoose";
import { UserHydratedDocument } from "./user";

export interface IComment {
  user: PopulatedDoc<UserHydratedDocument>;
  text: string;
}
```

## Usage

### Utility Functions

#### 1. `getPopulatedDocumentId`

Handle both populated documents and ObjectIds safely:

```ts
import { getPopulatedDocumentId } from "mongoose-utility-kit";

// With ObjectId reference
const comment = await Comment.findById(someId).orFail();
getPopulatedDocumentId(comment.user); // '507f191e810c19729de860ea'

// With populated document
const comment = await Comment.findById(someId)
  .populate<{ user: UserHydratedDocument }>("user")
  .orFail();
getPopulatedDocumentId(comment.user); // '507f191e810c19729de860ea'
```

#### 2. `findOrReturnInstance`

```ts
import { findOrReturnInstance } from "mongoose-utility-kit";

// With ObjectId reference
const comment = await Comment.findById(someId).orFail();
findOrReturnInstance(comment.user, UserModel);

// With populated document
const comment = await Comment.findById(someId)
  .populate<{ user: UserHydratedDocument }>("user")
  .orFail();
findOrReturnInstance(comment.user, UserModel);
```

#### 3. `findOrReturnManyInstances`

```ts
import { findOrReturnManyInstances } from "mongoose-utility-kit";
import { UserHydratedDocument } from "./user";
import { Types } from "mongoose";

const inputs: (UserHydratedDocument | Types.ObjectId)[] = [
  existingUserDocument,
  new Types.ObjectId(),
];

const users = await findOrReturnManyInstances(inputs, UserModel);
```

### Mongoose Plugins

These plugins provide helper methods for Mongoose queries to transform the results into `Map` or `Record` objects (standard JavaScript objects), using the documents' `_id` as the key.

#### Details

- **toMap()**: Returns a `Map` where the key is a string representing the `_id` of each document and the value is the document itself.
- **toRecords()**: Returns a `Record` (a standard JavaScript object) where the key is a string representing the `_id` of each document and the value is the document itself.

#### Integration

1.  Import the plugins:

    ```ts
    import { toMap, toRecords } from "mongoose-utility-kit";
    ```

2.  Register the plugins with your schema:

    ```ts
    type MyModelHydratedDocument = HydratedDocument<IMyModel>;

    type MyModelType = Model<
      IMyModel,
      ToMapQueryHelpers<MyModelHydratedDocument> & ToRecordsQueryHelpers<MyModelHydratedDocument>,
      {},
      {},
      MyModelHydratedDocument
    >;

    const schema = new mongoose.Schema<IMyModel, MyModelType>({
      // Define your schema here
      name: String,
      value: Number,
    });

    schema.plugin(toMap);
    schema.plugin(toRecords);

    const MyModel = mongoose.model<IMyModel, MyModelType>("MyModel", schema);
    ```

#### Examples

```ts
// Converts the query result to a Map
const myMap = await MyModel.find({}).toMap(); // new Map<string, MyModel>

// Converts the query result to a Record
const myRecords = await MyModel.find({}).toRecords(); // Record<string, MyModel>
```

## API Documentation

### `getPopulatedDocumentId`

```ts
function getPopulatedDocumentId<HydratedDocType extends Document>(
  populatedDocument: PopulatedDoc<HydratedDocType>
): string;
```

**Handles:** Both populated documents and raw ObjectIds  
**Throws:** If no valid ID found (`Error('document incorrect')`)

### `findOrReturnInstance`

```ts
async function findOrReturnInstance<HydratedDocType extends Document>(
  docOrId: HydratedDocType | Types.ObjectId,
  MongooseModel: Model<any, any, any, any, HydratedDocType>,
  err?: Error | (() => Error)
): Promise<HydratedDocType>;
```

**Throws:** Default error or custom error if document not found

### `findOrReturnManyInstances`

```ts
async function findOrReturnManyInstances<HydratedDocType extends Document>(
  docOrIds: (HydratedDocType | Types.ObjectId)[],
  MongooseModel: Model<any, any, any, any, HydratedDocType>
): Promise<HydratedDocType[]>;
```

## Development

```sh
yarn test
```

Tests use `mongodb-memory-server` for in-memory MongoDB testing.

## Compatibility

- mongoose 8.x+
- TypeScript 4.5+
- Node.js 16+

## License

MIT
