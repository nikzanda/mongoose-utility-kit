# mongoose-utility-kit

A set of utility functions and plugins to simplify common `mongoose` operations. Designed for `TypeScript` and `mongoose` projects with strict type safety.

[![npm](https://nodei.co/npm/mongoose-utility-kit.png)](https://www.npmjs.com/package/mongoose-utility-kit)

## Features

- **Type-safe**: Built with TypeScript for robust type checking.
- **Efficient**: Reduces redundant database queries and simplifies data transformations.
- **Flexible**: Handles documents, ObjectIds, and string IDs seamlessly.
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

export interface IUserDocumentOverrides { /* ... */ }

export interface IUserVirtuals { /* ... */ }

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

#### `isPopulated`

Type guard to check if a `PopulatedDoc` field is a populated document or an ObjectId:

```ts
import { isPopulated } from "mongoose-utility-kit";

const comment = await Comment.findById(someId).orFail();

if (isPopulated(comment.user)) {
  // TypeScript knows comment.user is UserHydratedDocument
  console.log(comment.user.name);
} else {
  // comment.user is an ObjectId
  console.log(comment.user.toString());
}
```

#### `ensurePopulated`

Assertion version of `isPopulated`. Returns the populated document or throws if the field is not populated:

```ts
import { ensurePopulated } from "mongoose-utility-kit";

const comment = await Comment.findById(someId).populate("user").orFail();
const user = ensurePopulated(comment.user);
// TypeScript knows user is UserHydratedDocument
console.log(user.name);

// Without population — throws Error
const comment2 = await Comment.findById(someId).orFail();
ensurePopulated(comment2.user); // Error: Expected a populated document
```

#### `getPopulatedDocumentId`

Extract the `_id` as a string from a field that may or may not be populated:

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

#### `toObjectId`

Convert a string, ObjectId, or Document to a `Types.ObjectId`:

```ts
import { toObjectId } from "mongoose-utility-kit";

// From an ObjectId — returns as-is
toObjectId(someObjectId);

// From a string — constructs a new ObjectId
toObjectId("507f191e810c19729de860ea");

// From a Document — extracts _id
toObjectId(userDocument);

// Throws on invalid string
toObjectId("invalid"); // Error!
```

#### `areIdsEqual`

Compare two values by their underlying MongoDB ID. Accepts strings, ObjectIds, Documents, and populated documents. Returns `false` for `null` or `undefined`:

```ts
import { areIdsEqual } from "mongoose-utility-kit";

areIdsEqual(user._id, comment.user);               // true (ObjectId vs PopulatedDoc)
areIdsEqual(user, "507f191e810c19729de860ea");       // true (Document vs string)
areIdsEqual(user._id, otherUser._id);               // false
areIdsEqual(null, user._id);                         // false
```

#### `findOrReturnInstance`

Avoid redundant queries: returns the document if already hydrated, otherwise fetches it by ID. Accepts ObjectIds and string IDs:

```ts
import { findOrReturnInstance } from "mongoose-utility-kit";

// With ObjectId — fetches from DB
const user = await findOrReturnInstance(comment.user, UserModel);

// With string ID — fetches from DB
const user = await findOrReturnInstance("507f191e810c19729de860ea", UserModel);

// With populated document — returns it directly, no DB query
const user = await findOrReturnInstance(comment.user, UserModel);

// With custom error
const user = await findOrReturnInstance(
  someId,
  UserModel,
  new Error("User not found"),
);

// With error factory
const user = await findOrReturnInstance(
  someId,
  UserModel,
  () => new Error("User not found"),
);
```

#### `findOrReturnManyInstances`

Batch version of `findOrReturnInstance`. Separates already-hydrated documents from IDs, performs a single `$in` query for the missing ones, and returns the combined result. Accepts ObjectIds and string IDs:

```ts
import { findOrReturnManyInstances } from "mongoose-utility-kit";

const inputs = [
  existingUserDocument,          // already hydrated — no query needed
  new Types.ObjectId("..."),     // ObjectId — will be fetched
  "507f191e810c19729de860ea",    // string ID — will be fetched
];

const users = await findOrReturnManyInstances(inputs, UserModel);
```

### Mongoose Plugins

These plugins add query helpers that transform results into `Map` or `Record` objects, keyed by `_id`.

- **toMap()**: Returns a `Map<string, Document>`.
- **toRecords()**: Returns a `Record<string, Document>` (plain object).

#### Integration

1. Import the plugins and type helpers:

    ```ts
    import {
      toMap, ToMapQueryHelpers,
      toRecords, ToRecordsQueryHelpers,
    } from "mongoose-utility-kit";
    ```

2. Register the plugins with your schema:

    ```ts
    type MyModelHydratedDocument = HydratedDocument<IMyModel>;

    // TVirtuals defaults to {}, so it can be omitted when not using virtuals
    type MyModelType = Model<
      IMyModel,
      ToMapQueryHelpers<IMyModel, MyModelHydratedDocument> &
        ToRecordsQueryHelpers<IMyModel, MyModelHydratedDocument>,
      {},
      {},
      MyModelHydratedDocument
    >;

    const schema = new mongoose.Schema<IMyModel, MyModelType>({
      name: String,
      value: Number,
    });

    schema.plugin(toMap);
    schema.plugin(toRecords);

    const MyModel = mongoose.model<IMyModel, MyModelType>("MyModel", schema);
    ```

    With virtuals, pass the virtuals type as the third generic parameter:

    ```ts
    ToMapQueryHelpers<IMyModel, MyModelHydratedDocument, IMyModelVirtuals>
    ```

#### Examples

```ts
// Converts the query result to a Map
const myMap = await MyModel.find({}).toMap();
// Map<string, MyModelHydratedDocument>

// Converts the query result to a Record
const myRecords = await MyModel.find({}).toRecords();
// Record<string, MyModelHydratedDocument>

// Works with lean queries
const leanMap = await MyModel.find({}).lean().toMap();
// Map<string, IMyModel>

// Works with lean queries + virtuals
const leanMap = await MyModel.find({})
  .lean<(IMyModel & IMyModelVirtuals)[]>({ virtuals: true })
  .toMap();
// Map<string, IMyModel & IMyModelVirtuals>
```

## API Reference

### `isPopulated`

```ts
function isPopulated<HydratedDocType extends Document>(
  value: PopulatedDoc<HydratedDocType>
): value is HydratedDocType;
```

**Returns:** `true` if the value is a populated document, `false` if it's an ObjectId, `null`, or `undefined`.

### `ensurePopulated`

```ts
function ensurePopulated<HydratedDocType extends Document>(
  value: PopulatedDoc<HydratedDocType>
): HydratedDocType;
```

**Returns:** The populated document with its type narrowed.
**Throws:** `Error` if the value is not a populated document.

### `getPopulatedDocumentId`

```ts
function getPopulatedDocumentId<HydratedDocType extends Document>(
  populatedDocument: PopulatedDoc<HydratedDocType>
): string;
```

**Handles:** Both populated documents and raw ObjectIds.
**Throws:** `Error` if the value has no valid `_id`.

### `toObjectId`

```ts
function toObjectId(
  value: string | Types.ObjectId | Document
): Types.ObjectId;
```

**Returns:** A `Types.ObjectId`.
**Throws:** `Error` if a string value is not a valid 24-character hex ObjectId.

### `areIdsEqual`

```ts
function areIdsEqual(
  a: string | Types.ObjectId | Document | PopulatedDoc<any> | null | undefined,
  b: string | Types.ObjectId | Document | PopulatedDoc<any> | null | undefined
): boolean;
```

**Returns:** `true` if both values resolve to the same ID string. Returns `false` if either value is `null` or `undefined`.

### `findOrReturnInstance`

```ts
async function findOrReturnInstance<HydratedDocType extends Document>(
  docOrId: HydratedDocType | Types.ObjectId | string,
  MongooseModel: Model<any, any, any, any, HydratedDocType>,
  err?: Error | (() => Error)
): Promise<HydratedDocType>;
```

**Throws:** Default error or custom error if document not found.

### `findOrReturnManyInstances`

```ts
async function findOrReturnManyInstances<HydratedDocType extends Document>(
  docOrIds: (HydratedDocType | Types.ObjectId | string)[],
  MongooseModel: Model<any, any, any, any, HydratedDocType>
): Promise<HydratedDocType[]>;
```

> **Note:** Non-existent IDs are silently omitted from the result (consistent with `find({ _id: { $in: [...] } })` behavior). String IDs are converted to ObjectIds internally.

### `ToMapQueryHelpers`

```ts
interface ToMapQueryHelpers<RawDocType, HydratedDocType, TVirtuals = {}> { ... }
```

### `ToRecordsQueryHelpers`

```ts
interface ToRecordsQueryHelpers<RawDocType, HydratedDocType, TVirtuals = {}> { ... }
```

## Development

```sh
yarn test
```

Tests use `mongodb-memory-server` for in-memory MongoDB testing.

## Compatibility

- mongoose 8.x / 9.x
- TypeScript 5.0+
- Node.js 18+

## License

MIT
