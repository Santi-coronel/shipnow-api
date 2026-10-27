import mongoose from 'mongoose';
import config from '../../src/config/index.js';

before(async () => {
  await mongoose.connect(config.mongoUri);

  // nunca correr los tests contra una base que no sea de test
  if (!mongoose.connection.name.includes('test')) {
    await mongoose.disconnect();
    throw new Error(`La base "${mongoose.connection.name}" no parece de test, abortando`);
  }
});

after(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
