// src/lib/mongodb.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * We augment the global namespace so TypeScript knows about
 * our cache. We have to use `var` here per TS global-augmentation
 * rules—but we disable the ESLint no-var rule just for this line.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const cache =
  global.mongooseCache ||
  (global.mongooseCache = {
    conn: null,
    promise: null,
  });

export default async function dbConnect() {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    const opts = { bufferCommands: false };
    cache.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => mongooseInstance);
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
