import { Db, MongoServerError, ObjectId } from "mongodb";
import { Weather, weatherSchema } from "./WeatherModel.ts";
import {
  GeoJSONGeometryType,
  MongoDBRef,
  MongoJSONSchema,
} from "../utils/utilTypes.ts";
import { database } from "../config/db.ts";

interface Log<T extends GeoJSONGeometryType> {
  _id?: ObjectId;
  deletedAt?: Date;
  deletedBy?: MongoDBRef;
  weatherReading: Weather;
}

type LogWithoutId<T extends GeoJSONGeometryType> = Omit<Log<T>, "_id">;

const logSchema: MongoJSONSchema = {
  bsonType: "object",
  title: "log object validation",
  required: ["weatherReading"],
  properties: {
    deletedAt: {
      bsonType: "date",
      description: "The current timestamp when the document is deleted",
    },
    deletedBy: {
      bsonType: "string",
      required: ["$ref", "$id"],
      properties: {
        $ref: {
          bsonType: "string",
          enum: ["users"],
          description: "The collection the DBRef points to",
        },
        $id: {
          bsonType: "objectId",
          description: "The objectId of the referenced document",
        },
        $db: {
          bsonType: "string",
          enum: ["tafe-weather-api"],
          description: "database name where the referenced document resides",
        },
      },
      description: "DBRef for the user who deleted the reference",
    },
    weatherReading: weatherSchema,
  },
};

const createLogsCollection = async (database: Db) => {
  try {
    await database.createCollection("logs", {
      validator: {
        $jsonSchema: logSchema,
      },
      validationLevel: "strict",
      validationAction: "error",
    });
  } catch (error) {
    if (
      error instanceof MongoServerError &&
      error.codeName === "NamespaceExists"
    ) {
      console.log("Collection already exists");
      return;
    } else {
      console.error("Error creating log collection: ", error);
    }
  }
};
