import { ObjectId } from "mongodb";
import { Weather } from "./WeatherModel.ts";
import { GeoJSONGeometryType } from "../utils/utilTypes.ts";

interface Log<T extends GeoJSONGeometryType> {
  _id?: ObjectId;
  deletedAt?: Date;
  deletedBy?: ObjectId;
  weatherReading: Weather<T>;
}

type LogWithoutId<T extends GeoJSONGeometryType> = Omit<Log<T>, "_id">;
