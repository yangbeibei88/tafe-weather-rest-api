import { MongoClient, ServerApiVersion } from "mongodb";

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
});

export const database = client.db(dbName);

export const connectDB = async () => {
  try {
    // connect the client to the server
    await client.connect();

    // send a ping to confirm a successful connection
    await client.db(dbName).command({ ping: 1 });
    console.log("DB connected!");
  } catch (error) {
    console.error(error);
  } finally {
    // Because Node.js driver auto calls MongoClient.connect() when perform CRUD
    // when the API initially connect the MongoDB, explicitly verify if the connection is resolved
    // The client will close if finish/error
    await client.close();
  }
};
