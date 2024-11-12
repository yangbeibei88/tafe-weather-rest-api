import {
  Collection,
  MongoClient,
  MongoClientOptions,
  MongoNetworkError,
  MongoServerError,
  OptionalId,
  ServerApiVersion,
} from "mongodb";
import { Weather } from "../models/WeatherSchema.ts";
import { User } from "../models/UserSchema.ts";
import { Log } from "../models/LogSchema.ts";

const uri = Deno.env.get("MONGO_URI")!;
const dbName = Deno.env.get("MONGO_DBNAME");
const maxRetries = Number(Deno.env.get("DB_MAX_RETRIES"));
const retryDelayMs = Number(Deno.env.get("DB_RETRY_DELAY_MS"));
// console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
export const mongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
} as MongoClientOptions);

export const database = mongoClient.db(dbName);

let weathersColl: Collection<OptionalId<Weather>>;
let usersColl: Collection<OptionalId<User>>;
let logsColl: Collection<OptionalId<Log>>;

async function connectWithRetry(retries = maxRetries): Promise<void> {
  while (retries > 0) {
    try {
      // await database connection
      await mongoClient.connect();
      console.log(`'${dbName}' MongoDB database connected successfully 🚀`);

      // set up collections only if the connection was successful
      weathersColl = database.collection<OptionalId<Weather>>("weathers");
      usersColl = database.collection<OptionalId<User>>("users");
      logsColl = database.collection<OptionalId<Log>>("logs");

      // Exit the loop on successful connection
      return;
    } catch (error) {
      if (
        error instanceof MongoNetworkError ||
        (error instanceof MongoServerError &&
          error.hasErrorLabel("RetryableWriteError"))
      ) {
        console.warn(
          `MongoDB connection error: ${error.message}. Retries left: ${
            retries - 1
          }`
        );
        retries -= 1;

        if (retries > 0)
          await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      } else {
        console.error("MongoDB unrecoverable error: ", error);
        // exit for non-recoverable errors
        Deno.exit(1);
      }
    }
  }
  console.error("MongoDb connection failed after maximum retries.");
  // exit if retries exhausted
  Deno.exit(1);
}

await connectWithRetry();

export { weathersColl, usersColl, logsColl };
