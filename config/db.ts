import { MongoClient, MongoClientOptions, ServerApiVersion } from "mongodb";
import { createWeathersCollection } from "../models/WeatherModel.ts";

const uri = Deno.env.get("MONGO_URI")!;
const dbName = Deno.env.get("MONGO_DBNAME");
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
} as MongoClientOptions);

export const database = client.db(dbName);

export const connectDB = async () => {
  try {
    // connect the client to the server
    await client.connect();

    // send a ping to confirm a successful connection
    await client.db(dbName).command({ ping: 1 });
    console.log("DB connected!");

    // create collections
    // await initDB(database);
  } catch (error) {
    console.error(error);
  } finally {
    // Because Node.js driver auto calls MongoClient.connect() when perform CRUD
    // when the API initially connect the MongoDB, explicitly verify if the connection is resolved
    // The client will close if finish/error
    await client.close();
  }
};

// create collections if not exist
// const initDB = async (database: Db) => {
//   await Promise.all([createWeathersCollection(database)]);
// };
