import { Weather, coordinateSchema } from "./WeatherSchema.ts";
import { MongoJSONSchema } from "../utils/utilTypes.ts";

export interface Log extends Weather {
  deletedAt: Date;
}

type LogWithoutId = Omit<Log, "_id">;

export const logSchema: MongoJSONSchema = {
  bsonType: "object",
  title: "weather object validation",
  required: [
    "_id",
    "deviceName",
    "precipitation",
    "temperature",
    "atmosphericPressure",
    "maxWindSpeed",
    "solarRadiation",
    "vaporPressure",
    "humidity",
    "windDirection",
    "createdAt",
    "deletedAt",
  ],
  properties: {
    _id: {
      bsonType: "objectId",
    },
    deviceName: {
      bsonType: "string",
      minLength: 1,
      maxLength: 50,
      description: "Must be a string and is required, 1-50 characters",
    },
    precipitation: {
      bsonType: "double",
      description: "Must be a number, unit: mm/h",
    },
    temperature: {
      bsonType: "double",
      description: "Must be a number, unit: celsius degree",
    },
    atmosphericPressure: {
      bsonType: "double",
      description: "Must be a number, unit: kpa",
    },
    maxWindSpeed: {
      bsonType: "double",
      description: "Must be a number, unit: m/s",
    },
    solarRadiation: {
      bsonType: "double",
      description: "Must be a number, unit: w/m2",
    },
    vaporPressure: {
      bsonType: "double",
      description: "Must be a number, unit: kpa",
    },
    humidity: {
      bsonType: "double",
      description: "Must be a number, unit: %",
    },
    windDirection: {
      bsonType: "double",
      description: "Must be a number, unit: degree",
    },
    createdAt: {
      bsonType: ["date", "null"],
      description: "The current timestamp when the document is created.",
    },
    createdBy: {
      bsonType: ["objectId", "null"],
      description: "User objectId refer to who created the document",
    },
    lastModifiedAt: {
      bsonType: ["date", "null"],
      description: "The current timestamp when the document is updated",
    },
    lastModifiedBy: {
      bsonType: ["objectId", "null"],
      description: "User objectId refer to who last modified the document",
    },
    deletedAt: {
      bsonType: ["date", "null"],
      description: "The current timestamp when the document is deleted",
    },
    geoLocation: {
      bsonType: "object",
      description: "Must be an object if the field exists",
      required: ["type", "coordinates"],
      oneOf: [
        // Point
        {
          properties: {
            type: { enum: ["Point"], type: "string" },
            coordinates: coordinateSchema,
          },
          additionalItems: false,
        },
        // LineString or MultiPoint
        {
          properties: {
            type: { enum: ["LineString", "MultiPoint"], type: "string" },
            coordinates: {
              bsonType: "array",
              minItems: 1,
              items: coordinateSchema,
              description:
                "An array of [longitude, latitude] points representing the geometry",
            },
          },
          additionalProperties: false,
        },
        // Polygon or MultiLineString
        {
          properties: {
            type: { enum: ["Polygon", "MultiLineString"], type: "string" },
            coordinates: {
              bsonType: "array",
              minItems: 1,
              items: {
                bsonType: "array",
                minItems: 4,
                items: coordinateSchema,
              },
              description:
                "Any array of linear rings representing the geometry",
            },
          },
          additionalProperties: false,
        },
        // MultiPolygon
        {
          properties: {
            type: { enum: ["MultiPolygon"], type: "string" },
            coordinates: {
              bsonType: "array",
              minItems: 1,
              items: {
                bsonType: "array",
                minItems: 1,
                items: {
                  bsonType: "array",
                  minItems: 4,
                  items: coordinateSchema,
                },
              },
              description: "Any array of polygons representing the geometry",
            },
          },
          additionalProperties: false,
        },
      ],
    },
  },
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
