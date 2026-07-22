import mongoose from 'mongoose';
import fs from 'fs';
import Position from './src/models/Position.js';

const envPath = './.env';
const uri = fs.existsSync(envPath)
  ? (await import('dotenv')).config({ path: envPath }).parsed.MONGO_URI
  : 'mongodb://127.0.0.1:27017/mern-app';

await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const docs = await Position.find({}).limit(10).lean();
console.log(JSON.stringify(docs, null, 2));
await mongoose.disconnect();
