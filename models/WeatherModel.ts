import { ObjectId } from "mongodb";
import { GeoJSONGeometryType, CoordinatesType } from "../utils/utilTypes.ts";

export interface Weather<T extends GeoJSONGeometryType> {
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
  geoLocation: {
    type: T;
    coordinates: CoordinatesType<T>;
  };
}

type WeatherWithoutId<T extends GeoJSONGeometryType> = Omit<Weather<T>, "_id">;

const point: Weather<"Point"> = {
  deviceName: "xyz",
  precipitation: 100,
  temperature: 50,
  atmosphericPressure: 100,
  maxWindSpeed: 100,
  solarRadiation: 100,
  vaporPressure: 100,
  humidity: 100,
  windDirection: 100,
  geoLocation: {
    type: "Point",
    coordinates: [100, 100],
  },
};

console.log(point);
