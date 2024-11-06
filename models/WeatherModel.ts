import { ObjectId } from "mongodb";

import { GeoJSONGeometryType, GeoLocation } from "../utils/utilTypes.ts";
import { database } from "../config/db.ts";

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

database.createCollection("weathers", {
  timeseries: {
    timeField: "createdAt",
    metaField: "deviceName",
    granularity: "minutes",
  },
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "weather object validation",
      required: ["deviceName"],
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
              property: {
                type: { enum: ["Point"] },
                coordinates: {
                  bsonType: "array",
                  minItems: 2,
                  maxItems: 2,
                  items: { bsonType: "double" },
                  description:
                    "An array of two doubles representing [longitude, latitude]",
                },
              },
            },
          ],
        },
      },
    },
  },
});

const weatherColl = database.collection<Weather>("weathers");

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
