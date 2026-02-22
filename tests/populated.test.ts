import { Types } from 'mongoose';
import {
  areIdsEqual,
  ensurePopulated,
  findOrReturnInstance,
  findOrReturnManyInstances,
  getPopulatedDocumentId,
  isPopulated,
  toObjectId,
} from '../src';
import User, { UserHydratedDocument } from './initializers/models/user';
import Comment, { IComment } from './initializers/models/comment';

let user: UserHydratedDocument;
let user2: UserHydratedDocument;

beforeAll(async () => {
  user = await User.create({
    name: 'Nicolò',
    surname: 'Zandarin',
    email: 'nicolo.zandarin@email.com',
    password: 'password',
    address: {
      streetAddress: '',
      postalCode: '',
      city: '',
      province: '',
      country: 'Italy',
    },
  });

  user2 = await User.create({
    name: 'Mario',
    surname: 'Rossi',
    email: 'mario.rossi@email.com',
    password: 'password2',
    address: {
      streetAddress: '',
      postalCode: '',
      city: '',
      province: '',
      country: 'Italy',
    },
  });

  await Comment.create({
    user,
    text: 'post comment',
  });
});

const checkType = (u: any): u is UserHydratedDocument => u instanceof User;

describe('getPopulatedDocumentId', () => {
  it('should return the string representation of a Types.ObjectId', async () => {
    const comment = await Comment
      .findOne()
      .orFail();
    const result = getPopulatedDocumentId(comment.user);
    expect(result).toBe(user.id);
  });

  it('should return the id property if it exists', async () => {
    const comment = await Comment
      .findOne()
      .populate<{ user: UserHydratedDocument }>('user')
      .orFail();
    const result = getPopulatedDocumentId(comment.user);
    expect(result).toBe(user.id);
  });

  it('should return the _id property if id does not exist', async () => {
    const comment = await Comment
      .findOne()
      .lean()
      .populate<{ user: IComment['user'] }>('user')
      .orFail();
    const result = getPopulatedDocumentId(comment.user);
    expect(result).toBe(user.id);
  });

  it('should handle null or undefined input gracefully', () => {
    expect(() => getPopulatedDocumentId(null as any)).toThrow('Expected a populated document or ObjectId, got: object');
    expect(() => getPopulatedDocumentId(undefined as any)).toThrow('Expected a populated document or ObjectId, got: undefined');
  });
});

describe('findOrReturnInstance', () => {
  it('should find a document by ID', async () => {
    const comment = await Comment
      .findOne()
      .orFail();
    const result = await findOrReturnInstance(comment.user!, User);
    expect(result.id).toBe(user.id);
    expect(result.name).toBe(user.name);
    expect(result.fullName).toBe(user.fullName);
    expect(result.address.country).toBe(user.address.country);
    expect(checkType(result)).toBe(true);
  });

  it('return the extracted user instance', async () => {
    const comment = await Comment
      .findOne()
      .populate<{ user: UserHydratedDocument }>('user')
      .orFail();
    const result = await findOrReturnInstance(comment.user, User);
    expect(result.id).toBe(user.id);
    expect(result.name).toBe(user.name);
    expect(result.fullName).toBe(user.fullName);
    expect(result.address.country).toBe(user.address.country);
    expect(checkType(result)).toBe(true);
  });

  it('should throw an error if the document is not found', async () => {
    const invalidId = new Types.ObjectId();
    await expect(findOrReturnInstance(invalidId, Comment)).rejects.toThrow();
  });

  it('should throw a custom Error instance when document is not found', async () => {
    const invalidId = new Types.ObjectId();
    const customError = new Error('Custom not found error');
    await expect(
      findOrReturnInstance(invalidId, Comment, customError),
    ).rejects.toThrow('Custom not found error');
  });

  it('should throw an error from factory function when document is not found', async () => {
    const invalidId = new Types.ObjectId();
    const errorFactory = () => new Error('Factory error message');
    await expect(
      findOrReturnInstance(invalidId, Comment, errorFactory),
    ).rejects.toThrow('Factory error message');
  });

  it('should find a document by string ID', async () => {
    const result = await findOrReturnInstance(user._id.toString(), User);
    expect(result.id).toBe(user.id);
    expect(result.name).toBe(user.name);
    expect(checkType(result)).toBe(true);
  });
});

describe('findOrReturnManyInstances', () => {
  it('should return documents from mixed instances and ObjectIds', async () => {
    const result = await findOrReturnManyInstances(
      [user, user2._id],
      User,
    );
    expect(result).toHaveLength(2);
    const ids = result.map((u) => u.id);
    expect(ids).toContain(user.id);
    expect(ids).toContain(user2.id);
    result.forEach((u) => {
      expect(checkType(u)).toBe(true);
    });
  });

  it('should return instances directly when all are already documents', async () => {
    const result = await findOrReturnManyInstances([user, user2], User);
    expect(result).toHaveLength(2);
    const ids = result.map((u) => u.id);
    expect(ids).toContain(user.id);
    expect(ids).toContain(user2.id);
  });

  it('should find documents when all are ObjectIds', async () => {
    const result = await findOrReturnManyInstances(
      [user._id, user2._id],
      User,
    );
    expect(result).toHaveLength(2);
    const ids = result.map((u) => u.id);
    expect(ids).toContain(user.id);
    expect(ids).toContain(user2.id);
  });

  it('should return an empty array for empty input', async () => {
    const result = await findOrReturnManyInstances([], User);
    expect(result).toHaveLength(0);
  });

  it('should silently ignore non-existent ObjectIds', async () => {
    const nonExistentId = new Types.ObjectId();
    const result = await findOrReturnManyInstances(
      [user, nonExistentId],
      User,
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(user.id);
  });

  it('should handle string IDs in the input array', async () => {
    const result = await findOrReturnManyInstances(
      [user, user2._id.toString()],
      User,
    );
    expect(result).toHaveLength(2);
    const ids = result.map((u) => u.id);
    expect(ids).toContain(user.id);
    expect(ids).toContain(user2.id);
  });

  it('should find documents when all are string IDs', async () => {
    const result = await findOrReturnManyInstances(
      [user._id.toString(), user2._id.toString()],
      User,
    );
    expect(result).toHaveLength(2);
    const ids = result.map((u) => u.id);
    expect(ids).toContain(user.id);
    expect(ids).toContain(user2.id);
  });
});

describe('isPopulated', () => {
  it('should return false for an ObjectId', async () => {
    const comment = await Comment
      .findOne()
      .orFail();
    expect(isPopulated(comment.user)).toBe(false);
  });

  it('should return true for a populated document', async () => {
    const comment = await Comment
      .findOne()
      .populate<{ user: UserHydratedDocument }>('user')
      .orFail();
    expect(isPopulated(comment.user)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isPopulated(null as any)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isPopulated(undefined as any)).toBe(false);
  });

  it('should return true for a plain object with _id', () => {
    const plainObj = { _id: new Types.ObjectId(), name: 'test' };
    expect(isPopulated(plainObj as any)).toBe(true);
  });
});

describe('toObjectId', () => {
  it('should return the same ObjectId when given an ObjectId', () => {
    const objectId = new Types.ObjectId();
    const result = toObjectId(objectId);
    expect(result).toBe(objectId);
  });

  it('should create an ObjectId from a valid hex string', () => {
    const hex = new Types.ObjectId().toString();
    const result = toObjectId(hex);
    expect(result).toBeInstanceOf(Types.ObjectId);
    expect(result.toString()).toBe(hex);
  });

  it('should return _id from a Document', () => {
    const result = toObjectId(user);
    expect(result).toBeInstanceOf(Types.ObjectId);
    expect(result.toString()).toBe(user._id.toString());
  });

  it('should throw for an invalid hex string', () => {
    expect(() => toObjectId('not-a-valid-objectid')).toThrow();
  });
});

describe('areIdsEqual', () => {
  it('should return true for the same ObjectId', () => {
    expect(areIdsEqual(user._id, user._id)).toBe(true);
  });

  it('should return true for an ObjectId and its string representation', () => {
    expect(areIdsEqual(user._id, user._id.toString())).toBe(true);
  });

  it('should return true for a Document and its ObjectId', () => {
    expect(areIdsEqual(user, user._id)).toBe(true);
  });

  it('should return true for two Documents with the same _id', () => {
    expect(areIdsEqual(user, user)).toBe(true);
  });

  it('should return false for different IDs', () => {
    expect(areIdsEqual(user._id, user2._id)).toBe(false);
  });

  it('should return false when first argument is null', () => {
    expect(areIdsEqual(null, user._id)).toBe(false);
  });

  it('should return false when second argument is null', () => {
    expect(areIdsEqual(user._id, null)).toBe(false);
  });

  it('should return false when first argument is undefined', () => {
    expect(areIdsEqual(undefined, user._id)).toBe(false);
  });

  it('should return false when both arguments are null', () => {
    expect(areIdsEqual(null, null)).toBe(false);
  });

  it('should return true for a populated document and an ObjectId', async () => {
    const comment = await Comment
      .findOne()
      .populate<{ user: UserHydratedDocument }>('user')
      .orFail();
    expect(areIdsEqual(comment.user, user._id)).toBe(true);
  });
});

describe('ensurePopulated', () => {
  it('should return the populated document', async () => {
    const comment = await Comment
      .findOne()
      .populate<{ user: UserHydratedDocument }>('user')
      .orFail();
    const result = ensurePopulated(comment.user);
    expect(result.name).toBe(user.name);
    expect(checkType(result)).toBe(true);
  });

  it('should throw when given an ObjectId', async () => {
    const comment = await Comment
      .findOne()
      .orFail();
    expect(() => ensurePopulated(comment.user)).toThrow('Expected a populated document, got: object');
  });

  it('should throw when given null', () => {
    expect(() => ensurePopulated(null as any)).toThrow('Expected a populated document, got: object');
  });

  it('should throw when given undefined', () => {
    expect(() => ensurePopulated(undefined as any)).toThrow('Expected a populated document, got: undefined');
  });
});
