import { ObjectId } from "mongodb";
import {
  GeoJSONGeometryType,
  GeoLocation,
  MongoJSONSchema,
} from "../utils/utilTypes.ts";

export interface Weather {
  _id: ObjectId;
  deviceName: string;
  precipitation: number;
  temperature: number;
  atmosphericPressure: number;
  maxWindSpeed: number;
  solarRadiation: number;
  vaporPressure: number;
  humidity: number;
  windDirection: number;
  createdAt: Date;
  createdBy?: ObjectId;
  lastModifiedAt?: Date;
  lastModifiedBy?: ObjectId;
  geoLocation?: GeoLocation<GeoJSONGeometryType>;
  longitude: number;
  latitude: number;
}

type WeatherWithoutId = Omit<Weather, "_id">;

// export type WeatherInput = Omit<OptionalId<Weather>, "geoLocation"> & {
//   longitude: number;
//   latitude: number;
// };
export type WeatherInput = Omit<
  Weather,
  | "geoLocation"
  | "_id"
  | "createdBy"
  | "lastModifiedBy"
  | "createdAt"
  | "lastModifiedAt"
> & {
  longitude: number;
  latitude: number;
};

export const coordinateSchema: MongoJSONSchema = {
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

export const weatherSchema: MongoJSONSchema = {
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
      anyOf: [
        {
          bsonType: "date",
          description: "A valid BSON date.",
        },
        {
          bsonType: "null",
          description: "The field can be null.",
        },
        {
          bsonType: "object",
          required: ["$date"],
          properties: {
            $date: {
              bsonType: "object",
              required: ["$numberLong"],
              properties: {
                $numberLong: {
                  bsonType: "string",
                  description:
                    "The field must include a timestamp as a string.",
                },
              },
            },
          },
          description: "An object representation of the date.",
        },
      ],
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
    geoLocation: {
      bsonType: "object",
      description: "Must be an object if the field exists",
      required: ["type", "coordinates"],
      anyOf: [
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

// DON'T USE TIMESERIES!
// const timeSeriesOptions: TimeSeriesCollectionOptions = {
//   timeField: "createdAt",
//   metaField: "deviceName",
//   granularity: "minutes",
// };

// // Create the timeseries collection with the validator
// export const createWeathersCollection = async (database: Db) => {
//   try {
//     await database.createCollection("weathers", {
//       timeseries: timeSeriesOptions,
//       validator: {
//         $jsonSchema: weatherSchema,
//       },
//       validationLevel: "strict",
//       validationAction: "error",
//     });
//     console.log("Weather collection created successfully.");
//   } catch (error) {
//     if (
//       error instanceof MongoServerError &&
//       error.codeName === "NamespaceExists"
//     ) {
//       console.log("Collection already exists");
//       return;
//     } else {
//       console.error("Error creating weathers collection: ", error);
//     }
//   }
// };

// const weathersColl = database.collection<Weather>("weathers");

// const point: Weather = {
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

/**
 * Raw sample data
 */
// {
//   "Device Name": "Woodford_Sensor",
//   "Precipitation mm/h": 0.085,
//   "Time": {
//     "$date": {
//       "$numberLong": "1620359044000"
//     }
//   },
//   "Latitude": 152.77891,
//   "Longitude": -26.95064,
//   "Temperature (°C)": 22.74,
//   "Atmospheric Pressure (kPa)": 128.02,
//   "Max Wind Speed (m/s)": 4.94,
//   "Solar Radiation (W/m2)": 113.21,
//   "Vapor Pressure (kPa)": 1.73,
//   "Humidity (%)": 73.84,
//   "Wind Direction (°)": 155.6
// }

// {
//   "deviceName": "Woodford_Sensor",
//   "precipitation": 0.085,
//   "temperature": 23.85,
//   "atmosphericPressure": 128.01,
//   "maxWindSpeed": 5.17,
//   "solarRadiation": 531.86,
//   "vaporPressure": 1.77,
//   "humidity": 71.23,
//   "windDirection": 149.28,
//   "longitude": 152.77891,
//   "latitude": -26.95064
// }
