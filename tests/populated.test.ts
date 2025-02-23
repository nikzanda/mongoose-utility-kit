import { Types } from 'mongoose';
import { findOrReturnInstance, getPopulatedDocumentId } from '../src';
import User, { UserHydratedDocument } from './initializers/models/user';
import Comment, { IComment } from './initializers/models/comment';

let user: UserHydratedDocument;

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
    expect(() => getPopulatedDocumentId(null as any)).toThrow('document incorrect');
    expect(() => getPopulatedDocumentId(undefined as any)).toThrow('document incorrect');
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
    const invalidId = new Types.ObjectId(); // Generate an invalid ID
    await expect(findOrReturnInstance(invalidId, Comment)).rejects.toThrow();
  });
});
