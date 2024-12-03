// deno-lint-ignore-file no-explicit-any ban-types
import { OptionalId, ObjectId, MongoServerError, Document } from "mongodb";
import { weathersColl } from "../config/db.ts";
import { Weather } from "./WeatherSchema.ts";
import { getPaginatedData } from "../services/modelFactory.ts";
import { AggregationBuilder } from "../services/AggregationBuilder.ts";

// const weathersColl = database.collection<OptionalId<Weather>>("weathers");

type WeatherDisplayFields = Partial<Record<keyof Weather, 0 | 1>>;
const weatherDisplayFields: WeatherDisplayFields = {
  _id: 0,
  createdAt: 1,
  deviceName: 1,
  precipitation: 1,
  temperature: 1,
  atmosphericPressure: 1,
  maxWindSpeed: 1,
  solarRadiation: 1,
  vaporPressure: 1,
  humidity: 1,
  windDirection: 1,
};

export const getAllWeathers = async (
  query: Record<string, any>,
  limit: number = 10,
  page: number = 1,
  sort: Record<string, any> = { createdAt: -1 }
) => {
  try {
    const result = await getPaginatedData(
      weathersColl,
      query,
      limit,
      page,
      sort,
      undefined,
      weatherDisplayFields
    );
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getWeathersByDevice = async (
  query: Record<string, any>,
  limit: number = 10,
  page: number = 1,
  sort: Record<string, any> = { createdAt: -1 }
) => {
  try {
    const result = await getPaginatedData(
      weathersColl,
      query,
      limit,
      page,
      sort,
      undefined,
      weatherDisplayFields
    );

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
        }
      )
      .toArray();

    return result;
  } catch (error) {
    console.log(error);
  }
};

export const findAllDistinctDevices = async () => {
  try {
    // const result = await weathersColl.distinct("deviceName", {
    //   deviceName: { $ne: null },
    // });
    const deviceDocs = await weathersColl
      .aggregate([
        { $group: { _id: "$deviceName" } },
        { $project: { _id: 0, deviceName: "$_id" } },
      ])
      .toArray();

    const result = deviceDocs.reduce(
      (acc: string[], cur) => [...acc, Object.values(cur).join()],
      []
    );

    // console.log(result);
    return result;
  } catch (error) {
    console.log(error);
    throw error;
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
    }
  );

  const result = await cursor.toArray();

  if (!result.length) {
    return new Date();
  }

  return result[0].createdAt;
};

const findLatestWeather = async () => {
  const cursor = weathersColl.find<Weather>(
    {},
    {
      sort: { createdAt: -1 },
      limit: 1,
      projection: { createdAt: 1, _id: 0 },
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
  params: { longitude: number; latitude: number } | { deviceName: string } | {},
  recentMonths?: number,
  createdAt?: Date | object | string
): Promise<Record<string, any>> {
  const matchParams: Record<string, any> = {};

  if ("longitude" in params && "latitude" in params) {
    // matchParams.geoLocation = {
    //   $geoIntersects: {
    //     $geometry: {
    //       type: "Point",
    //       coordinates: [params.longitude, params.latitude],
    //     },
    //   },
    // };
    matchParams.longitude = params.longitude;
    matchParams.latitude = params.latitude;
  } else if ("deviceName" in params) {
    matchParams.deviceName = params.deviceName;
  } else {
    const allDevices = await findAllDistinctDevices();
    // console.log(allDevices);
    matchParams.deviceName = { $in: allDevices };
  }

  if (!createdAt) {
    const latestDate =
      "longitude" in params
        ? await findLatestDateByLocation(params.longitude, params.latitude)
        : "deviceName" in params
        ? await findLatestDateByDevice(params.deviceName)
        : await findLatestWeather();

    // if `createdAt` not presented, set date range to recent 3 months
    if (!recentMonths) {
      recentMonths = 3;
    }

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
  params: {},
  aggField: string,
  groupBy: "geoLocation" | "deviceName" | null,
  recentMonths?: number,
  createdAt?: Date | object | string
): Promise<Document[]>;
export async function aggregateWeatherByLocationOrDevice(
  params: { longitude: number; latitude: number },
  aggField: string,
  groupBy: "geoLocation" | "deviceName" | null,
  recentMonths?: number,
  createdAt?: Date | object | string
): Promise<Document[]>;
export async function aggregateWeatherByLocationOrDevice(
  params: { deviceName: string },
  aggField: string,
  groupBy: "geoLocation" | "deviceName" | null,
  recentMonths?: number,
  createdAt?: Date | object | string
): Promise<Document[]>;
export async function aggregateWeatherByLocationOrDevice(
  params: { longitude: number; latitude: number } | { deviceName: string } | {},
  aggField: string,
  groupBy: "geoLocation" | "deviceName" | null,
  recentMonths?: number,
  createdAt?: Date | object | string
): Promise<Document[]> {
  const matchParams = await buildMatchParams(params, recentMonths, createdAt);
  // groupBy = "deviceName" in params ? "$deviceName" : "$geoLocaiton";

  console.log(matchParams);

  const aggBuilder = new AggregationBuilder({
    aggField,
    createdAt,
    recentMonths,
  });

  const pipeline = aggBuilder
    .match(matchParams)
    .sort({ [aggField]: -1, createdAt: -1 })
    .project({
      deviceName: 1,
      createdAt: 1,
      [aggField]: 1,
      _id: 0,
    })
    .customGroup([aggField], groupBy, ["createdAt", "deviceName"])
    .customProject([aggField], groupBy, ["createdAt", "deviceName"])
    .build();

  console.log("Aggregation Pipeline:", JSON.stringify(pipeline, null, 2));
  try {
    const result = await weathersColl.aggregate(pipeline).toArray();
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
