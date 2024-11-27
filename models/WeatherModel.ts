// deno-lint-ignore-file no-explicit-any
import { OptionalId, ObjectId, MongoServerError, Document } from "mongodb";
import { weathersColl } from "../config/db.ts";
import { Weather } from "./WeatherSchema.ts";
import { getPaginatedData } from "./modelFactory.ts";
import { AggregationBuilder } from "../utils/AggregationBuilder.ts";

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
        {
          limit: 1,
          projection: { deviceName: 1 },
          collation: { locale: "en", strength: 2 },
        }
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
    {
      sort: { createdAt: -1 },
      limit: 1,
      projection: { createdAt: 1, _id: 0 },
      collation: { locale: "en", strength: 2 },
    }
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

async function buildMatchParams(
  // deno-lint-ignore ban-types
  params: { longitude: number; latitude: number } | { deviceName: string } | {},
  recentMonths?: number,
  createdAt?: Date | object | string
): Promise<Record<string, any>> {
  const matchParams: Record<string, any> = {};

  if ("longitude" in params && "latitude" in params) {
    matchParams.geoLocation = {
      $geoIntersects: {
        $geometry: {
          type: "Point",
          coordinates: [params.longitude, params.latitude],
        },
      },
    };
  } else if ("deviceName" in params) {
    matchParams.deviceName = params.deviceName;
  }

  if (recentMonths && !createdAt) {
    const latestDate =
      "longitude" in params
        ? await findLatestDateByLocation(params.longitude, params.latitude)
        : "deviceName" in params
        ? await findLatestDateByDevice(params.deviceName)
        : new Date();

    const startDate = new Date(latestDate);
    startDate.setMonth(startDate.getMonth() - recentMonths);
    matchParams.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(latestDate),
    };
  }
  return matchParams;
}

export async function aggregateWeatherByLocationOrDevice(
  // deno-lint-ignore ban-types
  params: {},
  operation: string,
  aggField: string,
  groupBy: "$geoLocation" | "$deviceName" | null,
  recentMonths?: number,
  createdAt?: Date | object | string
): Promise<Document[]>;
export async function aggregateWeatherByLocationOrDevice(
  params: { longitude: number; latitude: number },
  operation: string,
  aggField: string,
  groupBy: "$geoLocation" | "$deviceName" | null,
  recentMonths?: number,
  createdAt?: Date | object | string
): Promise<Document[]>;
export async function aggregateWeatherByLocationOrDevice(
  params: { deviceName: string },
  operation: string,
  aggField: string,
  groupBy: "$geoLocation" | "$deviceName" | null,
  recentMonths?: number,
  createdAt?: Date | object | string
): Promise<Document[]>;
export async function aggregateWeatherByLocationOrDevice(
  // deno-lint-ignore ban-types
  params: { longitude: number; latitude: number } | { deviceName: string } | {},
  operation: string,
  aggField: string,
  groupBy: "$geoLocation" | "$deviceName" | null,
  recentMonths?: number,
  createdAt?: Date | object | string
): Promise<Document[]> {
  const matchParams = await buildMatchParams(params, recentMonths, createdAt);
  // groupBy = "deviceName" in params ? "$deviceName" : "$geoLocaiton";

  const aggBuilder = new AggregationBuilder({
    operation,
    aggField,
    createdAt,
    recentMonths,
  });

  const pipeline = aggBuilder
    .match(matchParams)
    .project({ deviceName: 1, createdAt: 1, [aggField]: 1 })
    .group2(operation, aggField, groupBy, {
      docs: {
        $push: {
          deviceName: "$deviceName",
          createdAt: "$createdAt",
          [`${aggField}`]: `$${aggField}`,
        },
      },
    })
    .aggFilter({
      input: "$docs",
      as: "doc",
      cond: { $eq: [`$$doc.${aggField}`, `$${operation}_${aggField}`] },
    })
    .unwind("$docs")
    .replaceRoot({ newRoot: "$docs" })
    .sort({ createdAt: -1 })
    .limit(5)
    .build();

  console.log("Aggregation Pipeline:", JSON.stringify(pipeline, null, 2));
  try {
    const result = await weathersColl
      .aggregate(pipeline, { collation: { locale: "en", strength: 2 } })
      .toArray();

    const explain = await weathersColl
      .aggregate(pipeline)
      .explain("executionStats");
    console.log(explain);

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
