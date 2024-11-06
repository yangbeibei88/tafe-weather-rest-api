import {
  Db,
  MongoServerError,
  ObjectId,
  TimeSeriesCollectionOptions,
} from "mongodb";
import {
  GeoJSONGeometryType,
  GeoLocation,
  MongoJSONSchema,
} from "../utils/utilTypes.ts";

export interface Weather {
  _id?: ObjectId;
  deviceName: string;
  precipitation: number;
  temperature: number;
  atmosphericPressure: number;
  maxWindSpeed: number;
  solarRadiation: number;
  vaporPressure: number;
  humidity: number;
  windDirection: number;
  createdAt?: Date;
  updatedAt?: Date;
  updatedBy?: ObjectId;
  geoLocation?: GeoLocation<GeoJSONGeometryType>;
}

type WeatherWithoutId = Omit<Weather, "_id">;

const coordinateSchema: MongoJSONSchema = {
  bsonType: "array",
  minItems: 2,
  maxItems: 2,
  items: [
    {
      bsonType: "double",
      minimum: -180,
      maximum: 180,
      description: "Longitude must be between -180 and 180 degrees",
    },
    {
      bsonType: "double",
      minimum: -90,
      maximum: 90,
      description: "Latitude must be between -90 and 90 degrees",
    },
  ],
  additionalItems: false,
  description: "An array of two numbers representing [longitude, latitude]",
};

const weatherSchema: MongoJSONSchema = {
  bsonType: "object",
  title: "weather object validation",
  required: [
    "deviceName",
    "precipitation",
    "temperature",
    "atmosphericPressure",
    "maxWindSpeed",
    "solarRadiation",
    "vaporPressure",
    "humidity",
    "windDirection",
  ],
  properties: {
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
      bsonType: "date",
      description: "The current timestamp when the document is created.",
    },
    updatedAt: {
      bsonType: "date",
      description: "The current timestamp when the document is updated",
    },
    createdBy: {
      bsonType: "objectId",
      description: "The user id which the document is created by",
    },
    updateBy: {
      bsonType: "objectId",
      description: "The user id which the document is updated by",
    },
    geoLocation: {
      bsonType: "object",
      description: "Must be an object if the field exists",
      required: ["type", "coordinates"],
      oneOf: [
        // Point
        {
          properties: {
            type: { enum: ["Point"] },
            coordinates: coordinateSchema,
          },
          additionalItems: false,
        },
        // LineString or MultiPoint
        {
          properties: {
            type: { enum: ["LineString", "MultiPoint"] },
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
            type: { enum: ["Polygon", "MultiLineString"] },
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
            type: { enum: ["MultiPolygon"] },
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

const timeSeriesOptions: TimeSeriesCollectionOptions = {
  timeField: "createdAt",
  metaField: "deviceName",
  granularity: "minutes",
};

// Create the timeseries collection with the validator
export const createWeathersCollection = async (database: Db) => {
  try {
    await database.createCollection("weathers", {
      timeseries: timeSeriesOptions,
      validator: {
        $jsonSchema: weatherSchema,
      },
      validationLevel: "strict",
    });
    console.log("Weather collection created successfully.");
  } catch (error) {
    if (
      error instanceof MongoServerError &&
      error.codeName === "NamespaceExits"
    ) {
      console.log("Collection already exists");
      return;
    } else {
      console.error("Error creating collection: ", error);
    }
  }
};

// const weatherColl = database.collection<Weather>("weathers");

// const point: Weather<"Point"> = {
//   deviceName: "xyz",
//   precipitation: 100,
//   temperature: 50,
//   atmosphericPressure: 100,
//   maxWindSpeed: 100,
//   solarRadiation: 100,
//   vaporPressure: 100,
//   humidity: 100,
//   windDirection: 100,
//   geoLocation: {
//     type: "Point",
//     coordinates: [100, 100],
//   },
// };
