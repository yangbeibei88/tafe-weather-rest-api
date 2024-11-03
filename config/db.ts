import { MongoClient, ServerApiVersion } from "mongodb";

const uri = Deno.env.get("MONGO_URI")!;
console.log(uri);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export const connectDB = async () => {
  try {
    await client.connect();
    console.log("DB connected!");
  } catch (error) {
    console.error(error);
  }
};
