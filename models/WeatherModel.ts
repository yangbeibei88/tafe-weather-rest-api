// deno-lint-ignore-file no-explicit-any
import { OptionalId, ObjectId, MongoServerError } from "mongodb";
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

export const findMaxPrecipitationBySensor = async (
  deviceName: string,
  recentMonths: number
) => {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - recentMonths);
    const result = await weathersColl
      .aggregate([
        { $match: { deviceName, createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: "$deviceName",
            maxPrecipitation: { $max: "$precipitation" },
          },
        },
        {
          $lookup: {
            from: "weathers",
            let: {
              deviceName: "$_id.deviceName",
              maxPrecipitation: "$_id.maxPrecipitation",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["deviceName", "$$deviceName"] },
                      { $eq: ["recipitation", "$$maxPrecipitation"] },
                    ],
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  deviceName: 1,
                  createdAt: 1,
                  precipitation: 1,
                },
              },
            ],
            as: "machingDocs",
          },
        },
        { $unwind: "$machingDocs" },
        { $replaceRoot: { newRoot: "$matchingDocs" } },
      ])
      .toArray();
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const findMaxTemperature = async (startDate: Date, endDate: Date) => {
  try {
    const result = await weathersColl
      .aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: "$deviceName", maxTemp: { $max: "$temperature" } } },
        {
          $lookup: {
            from: "weathers",
            let: {
              deviceName: "$_id.deviceName",
              maxPrecipitation: "$_id.maxTemp",
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$deviceName", "$$deviceName"] },
                      { $eq: ["$temperature", "$$maxTemp"] },
                    ],
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  deviceName: 1,
                  temperature: 1,
                  createdAt: 1,
                },
              },
            ],
            as: "matchingDocs",
          },
        },
        { $unwind: "$matchingDocs" },
        { $replaceRoot: { newRoot: "$matchingDocs" } },
      ])
      .toArray();

    return result;
  } catch (error) {
    console.log(error);
  }
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
