// deno-lint-ignore-file no-explicit-any
import { OptionalId, ObjectId, MongoServerError, Document } from "mongodb";
import { weathersColl } from "../config/db.ts";
import { Weather } from "./WeatherSchema.ts";
import { getPaginatedData } from "./modelFactory.ts";
import { weatherAggregationPipeline } from "../services/weatherAggregationService.ts";

// const weathersColl = database.collection<OptionalId<Weather>>("weathers");

export const getAllWeathers = async (
  query: Record<string, any>,
  limit: number = 10,
  page: number = 1
) => {
  try {
    const result = await getPaginatedData(weathersColl, query, limit, page);

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getWeather = async (id: string) => {
  try {
    const result = await weathersColl.findOne<Weather>({
      _id: new ObjectId(id),
    });
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const findGeolocation = async (longitude: number, latitude: number) => {
  try {
    const result = await weathersColl
      .find<Weather>(
        {
          geoLocation: { type: "Point", coordinates: [longitude, latitude] },
        },
        { limit: 1, projection: { geoLocation: 1 } }
      )
      .toArray();

    return result;
  } catch (error) {
    console.log(error);
  }
};
export const findDevice = async (deviceName: string) => {
  try {
    const result = await weathersColl
      .find<Weather>(
        { deviceName },
        { limit: 1, projection: { deviceName: 1 } }
      )
      .toArray();

    return result;
  } catch (error) {
    console.log(error);
  }
};

const findLatestDateByLocation = async (
  longitude: number,
  latitude: number
) => {
  const cursor = weathersColl.find<Weather>(
    {
      geoLocation: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    },
    { sort: { createdAt: -1 }, limit: 1, projection: { createdAt: 1, _id: 0 } }
  );

  const result = await cursor.toArray();

  if (!result.length) {
    return new Date();
  }

  return result[0].createdAt;
};

const findLatestDateByDevice = async (deviceName: string) => {
  const cursor = weathersColl.find<Weather>(
    { deviceName },
    { sort: { createdAt: -1 }, limit: 1, projection: { createdAt: 1, _id: 0 } }
  );

  const result = await cursor.toArray();

  if (!result.length) {
    return new Date();
  }

  return result[0].createdAt;
};

export const insertWeather = async (weather: OptionalId<Weather>) => {
  try {
    const result = await weathersColl.insertOne({
      ...weather,
    });
    return { id: result.insertedId, ...weather };
  } catch (error) {
    console.log(error);
  }
};

export const insertWeathers = async (weathers: OptionalId<Weather>[]) => {
  try {
    const result = await weathersColl.insertMany(weathers);
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const updateWeather = async (
  id: string,
  weather: OptionalId<Weather>
) => {
  try {
    const result = await weathersColl.updateOne(
      { _id: new ObjectId(id) },
      // { $set: weather, $currentDate: { lastModifiedAt: true } },
      { $set: { ...weather } }
    );
    return result;
  } catch (error) {
    if (error instanceof MongoServerError) {
      console.error("Document validation error:", error.errInfo?.details);
    }
  }
};

export const deleteWeather = async (id: string) => {
  try {
    const result = await weathersColl.deleteOne({
      _id: new ObjectId(id),
    });

    return result;
  } catch (error) {
    console.log(error);
  }
};

export async function aggregateWeatherByLocationOrDevice(
  params: { longitude: number; latitude: number },
  operation: string,
  aggField: string,
  recentMonths?: number,
  createdAt?: Date | object
): Promise<Document[]>;
export async function aggregateWeatherByLocationOrDevice(
  params: { deviceName: string },
  operation: string,
  aggField: string,
  recentMonths?: number,
  createdAt?: Date | object
): Promise<Document[]>;
export async function aggregateWeatherByLocationOrDevice(
  params: { longitude: number; latitude: number } | { deviceName: string },
  operation: string,
  aggField: string,
  recentMonths?: number,
  createdAt?: Date | object
): Promise<Document[]> {
  // determine if location-based or device-based
  const isLocationBased = "longitude" in params && "latitude" in params;

  const matchParams: Record<string, any> = isLocationBased
    ? {
        geoLocation: {
          $geoIntersects: {
            $geometry: {
              type: "Point",
              coordinates: [params.longitude, params.latitude],
            },
          },
        },
      }
    : { deviceName: params.deviceName };

  if (recentMonths && !createdAt) {
    const latestDate = isLocationBased
      ? await findLatestDateByLocation(params.longitude, params.latitude)
      : await findLatestDateByDevice(params.deviceName);
    const startDate = new Date(latestDate);
    startDate.setMonth(startDate.getMonth() - recentMonths);
    matchParams.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(latestDate),
    };
  }

  // console.log("Final Match Params:", matchParams);
  const pipeline = weatherAggregationPipeline(
    operation,
    aggField,
    "$geoLocation",
    { deviceName: 1, createdAt: 1, [aggField]: 1 },
    createdAt,
    recentMonths,
    { createdAt: -1 },
    matchParams,
    {
      docs: {
        $push: {
          deviceName: "$deviceName",
          createdAt: "$createdAt",
          [`${aggField}`]: `$${aggField}`,
        },
      },
    }
  );

  console.log("Aggregation Pipeline:", JSON.stringify(pipeline, null, 2));
  try {
    const result = await weathersColl.aggregate(pipeline).toArray();

    console.log("Aggregation Result:", result);

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
