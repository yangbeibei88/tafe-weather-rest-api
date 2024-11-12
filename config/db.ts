import {
  Collection,
  MongoClient,
  MongoClientOptions,
  OptionalId,
  ServerApiVersion,
} from "mongodb";
import { Weather } from "../models/WeatherSchema.ts";
import { User } from "../models/UserSchema.ts";
import { Log } from "../models/LogSchema.ts";

const uri = Deno.env.get("MONGO_URI")!;
const dbName = Deno.env.get("MONGO_DBNAME");
console.log(uri);

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

try {
  // await database connection
  await mongoClient.connect();
  console.log(`'${dbName}' MongoDB database connected successfully 🚀`);

  // set up collections only if the connection was successful
  weathersColl = database.collection<OptionalId<Weather>>("weathers");
  usersColl = database.collection<OptionalId<User>>("users");
  logsColl = database.collection<OptionalId<Log>>("logs");
} catch (error) {
  console.error("MongoDB connection error:", error);
  Deno.exit(1);
}

export { weathersColl, usersColl, logsColl };

// export { weathersColl };
// export const connectDB = async () => {
//   try {
//     // connect the client to the server
//     await client.connect();

//     // send a ping to confirm a successful connection
//     await client.db(dbName).command({ ping: 1 });
//     console.log("DB connected!");

//     // create collections
//     // await initDB(database);
//   } catch (error) {
//     console.error(error);
//   }

//   // finally {
//   //   // Because Node.js driver auto calls MongoClient.connect() when perform CRUD
//   //   // when the API initially connect the MongoDB, explicitly verify if the connection is resolved
//   //   // The client will close if finish/error
//   //   await client.close();
//   // }
// };
