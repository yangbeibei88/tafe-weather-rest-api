import { ObjectId } from "mongodb";
import { Weather, weatherSchema } from "./WeatherSchema.ts";
import { MongoJSONSchema } from "../utils/utilTypes.ts";

export interface Log {
  _id: ObjectId;
  deletedAt?: Date;
  deletedBy?: ObjectId;
  weatherReading: Weather;
}

type LogWithoutId = Omit<Log, "_id">;

export const logSchema: MongoJSONSchema = {
  bsonType: "object",
  title: "log object validation",
  required: ["_id", "weatherReading"],
  properties: {
    _id: {
      bsonType: "objectId",
    },
    deletedAt: {
      bsonType: "date",
      description: "The current timestamp when the document is deleted",
    },
    deletedBy: {
      bsonType: ["objectId", "null"],
      description: "User objectId refer to who deleted the document",
    },
    weatherReading: weatherSchema,
  },
  additionalProperties: false,
};

// const createLogsCollection = async (database: Db) => {
//   try {
//     await database.createCollection("logs", {
//       validator: {
//         $jsonSchema: logSchema,
//       },
//       validationLevel: "strict",
//       validationAction: "error",
//     });
//   } catch (error) {
//     if (
//       error instanceof MongoServerError &&
//       error.codeName === "NamespaceExists"
//     ) {
//       console.log("Collection already exists");
//       return;
//     } else {
//       console.error("Error creating log collection: ", error);
//     }
//   }
// };
