// eslint-disable-next-line import/no-extraneous-dependencies
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, disconnect } from 'mongoose';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await connect(mongod.getUri());
});

afterAll(async () => {
  await disconnect();
  await mongod.stop();
});
