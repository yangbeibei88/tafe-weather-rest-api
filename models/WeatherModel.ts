import { ObjectId } from "mongodb";

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
  createdAt?: Date;
  updatedAt?: Date;
  updatedBy?: ObjectId;
  geoLocation: {
    type:
      | "Point"
      | "LineString"
      | "Polygon"
      | "MultiPoint"
      | "MultiLineString"
      | "MultiPolygon";
    coordinates: [number[]] | number[];
  };
}

type WeatherWithoutId = Omit<Weather, "_id">;
