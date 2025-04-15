import User, { UserHydratedDocument } from './initializers/models/user';

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
});

describe('toMap', () => {
  it('should return a map with the found documents', async () => {
    const users = await User
      .find()
      .toMap();
    expect(users).toBeTruthy();
    expect(users.has(user._id.toString())).toBe(true);
    expect(users.get(user._id.toString())!).toBeInstanceOf(User);
  });

  it('should return a map with lean documents', async () => {
    const users = await User
      .find()
      .lean()
      .toMap();
    expect(users).toBeTruthy();
    expect(users.has(user._id.toString())).toBe(true);
    expect(users.get(user._id.toString())!).not.toBeInstanceOf(User);
  });

  it('should correctly handle a single document', async () => {
    const userFound = await User
      .findById(user._id)
      .toMap();
    expect(userFound).toBeTruthy();
    expect(userFound.has(user._id.toString())).toBe(true);
    expect(userFound.get(user._id.toString())!).toBeInstanceOf(User);
  });

  it('should correctly handle a single document with lean', async () => {
    const userFound = await User
      .findById(user._id)
      .lean()
      .toMap();
    expect(userFound).toBeTruthy();
    expect(userFound.has(user._id.toString())).toBe(true);
    expect(userFound.get(user._id.toString())!).not.toBeInstanceOf(User);
  });

  it('should return an empty map if no documents are found', async () => {
    const users = await User
      .find({ email: 'non-existent@email.com' })
      .toMap();
    expect(users).toBeTruthy();
    expect(users.size).toBe(0);
  });
});

describe('toRecords', () => {
  it('should return a map with the found documents', async () => {
    const users = await User
      .find()
      .toRecords();
    expect(users).toBeTruthy();
    expect(users[user.id]).toBeInstanceOf(User);
  });

  it('should return a map with lean documents', async () => {
    const users = await User
      .find()
      .lean()
      .toRecords();
    expect(users).toBeTruthy();
    expect(users[user._id.toString()]).not.toBeInstanceOf(User);
  });

  it('should correctly handle a single document', async () => {
    const userFound = await User
      .findById(user._id)
      .toRecords();
    expect(userFound).toBeTruthy();
    expect(userFound[user._id.toString()]).toBeInstanceOf(User);
  });

  it('should correctly handle a single document with lean', async () => {
    const userFound = await User
      .findById(user._id)
      .lean()
      .toRecords();
    expect(userFound).toBeTruthy();
    expect(userFound[user._id.toString()]).not.toBeInstanceOf(User);
  });

  it('should return an empty map if no documents are found', async () => {
    const users = await User
      .find({ email: 'non-existent@email.com' })
      .toRecords();
    expect(users).toBeTruthy();
    expect(Object.keys(users)).toHaveLength(0);
  });
});
