import { ObjectId } from "mongodb";
import { Weather } from "./WeatherModel.ts";

interface Log {
  _id: ObjectId;
  deletedAt: Date;
  deletedBy: ObjectId;
  weatherReading: Weather;
}

type LogWithoutId = Omit<Log, "_id">;
