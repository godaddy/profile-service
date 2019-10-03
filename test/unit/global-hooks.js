import mongoose from 'mongoose';
import { Mockgoose } from 'mockgoose';

const mockgoose = new Mockgoose(mongoose);

before(async () => {
  await mockgoose.prepareStorage();
  mongoose.connect('mongodb://foox/bar', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
  await mongoose.connection.on('connected', () => {
    console.log('db connection is now open'); // eslint-disable-line no-console
  });
});

afterEach(() => {
  mockgoose.helper.reset();
});
