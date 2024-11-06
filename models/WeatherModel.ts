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
  geoLocation: GeoLocation<GeoJSONGeometryType>;
}

type WeatherWithoutId = Omit<Weather, "_id">;

// create `weathers` collection

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
      properties: {},
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
