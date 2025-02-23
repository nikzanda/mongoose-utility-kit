# mongoose-utility-kit 🛠️

Utility functions to simplify common `mongoose` operations. Designed for `TypeScript` and `mongoose` projects with strict type safety.

## Features

- **Type-safe**: Built with TypeScript for robust type checking.
- **Efficient**: Reduces redundant database queries.
- **Flexible**: Handles both document instances and ObjectIds seamlessly.
- **Population Ready**: Designed for mongoose documents with populated references.

## Installation

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
import { Types, PopulatedDoc } from 'mongoose';
import { UserHydratedDocument } from './user';

export interface IComment {
  user: PopulatedDoc<UserHydratedDocument>;
  text: string;
}
```

## Usage

### 1. `getPopulatedDocumentId`
Handle both populated documents and ObjectIds safely:
```ts
import { getPopulatedDocumentId } from 'mongoose-utility-kit';

// With ObjectId reference
const comment = await Comment
  .findById(someId)
  .orFail();
getPopulatedDocumentId(comment.user); // "507f191e810c19729de860ea"

// With populated document
const comment = await Comment
  .findById(someId)
  .populate<{ user: UserHydratedDocument }>('user')
  .orFail();
getPopulatedDocumentId(comment.user); // "507f191e810c19729de860ea"
```

### 2. `findOrReturnInstance`
```ts
// With ObjectId reference
const comment = await Comment
  .findById(someId)
  .orFail();
findOrReturnInstance(comment.user, UserModel);

// With populated document
const comment = await Comment
  .findById(someId)
  .populate<{ user: UserHydratedDocument }>('user')
  .orFail();
findOrReturnInstance(comment.user, UserModel);
```

### 3. `findOrReturnManyInstances`
```ts
const inputs: (UserHydratedDocument | Types.ObjectId)[] = [
  existingUserDocument,
  new Types.ObjectId()
];

const users = await findOrReturnManyInstances(inputs, UserModel);
```

## API Documentation

### `getPopulatedDocumentId`
```ts
function getPopulatedDocumentId<HydratedDocType extends Document>(
  populatedDocument: PopulatedDoc<HydratedDocType>
): string
```
**Handles:** Both populated documents and raw ObjectIds  
**Throws:** If no valid ID found (`Error('document incorrect')`)

### `findOrReturnInstance`
```ts
async function findOrReturnInstance<HydratedDocType extends Document>(
  docOrId: HydratedDocType | Types.ObjectId,
  MongooseModel: Model<any, any, any, any, HydratedDocType>,
  err?: Error | (() => Error)
): Promise<HydratedDocType>
```
**Throws:** Default error or custom error if document not found

### `findOrReturnManyInstances`
```ts
async function findOrReturnManyInstances<HydratedDocType extends Document>(
  docOrIds: (HydratedDocType | Types.ObjectId)[],
  MongooseModel: Model<any, any, any, any, HydratedDocType>
): Promise<HydratedDocType[]>
```

## Development

```sh
yarn test
```
Tests use `mongodb-memory-server` for in-memory MongoDB testing.

## Compatibility
- mongoose 6.x+
- TypeScript 4.5+
- Node.js 16+

## License
MIT
