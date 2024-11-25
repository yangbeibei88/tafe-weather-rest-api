// deno-lint-ignore-file no-explicit-any
import { OptionalId, ObjectId, MongoServerError } from "mongodb";
import { weathersColl } from "../config/db.ts";
import { Weather } from "./WeatherSchema.ts";
import { getPaginatedData } from "./modelFactory.ts";

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

export const findMaxPrecipitationByLocation = async (
  longitude: number,
  latitude: number,
  recentMonths: number
) => {
  try {
    const latestDate = await findLatestDateByLocation(longitude, latitude);
    const startDate = new Date(latestDate);
    startDate.setMonth(startDate.getMonth() - recentMonths);
    const result = await weathersColl
      .aggregate([
        {
          // Stage 1: Match docs for the specifc location and date range
          $match: {
            geoLocation: {
              $geoIntersects: {
                $geometry: {
                  type: "Point",
                  coordinates: [longitude, latitude],
                },
              },
            },
            createdAt: { $gte: startDate, $lte: latestDate },
          },
        },
        {
          // Stage 2: limit necessory fields
          $project: {
            deviceName: 1,
            createdAt: 1,
            precipitation: 1,
          },
        },
        {
          // Stage 3: group by geoLocation and find the max precipitation
          $group: {
            _id: "$geoLocation",
            maxPrecipitation: { $max: "$precipitation" },
            docs: {
              $push: {
                deviceName: "$deviceName",
                createdAt: "$createdAt",
                precipitation: "$precipitation",
              },
            },
          },
        },
        {
          // Stage 4: Filter docs matching the max precipation
          $project: {
            docs: {
              $filter: {
                input: "$docs",
                as: "doc",
                cond: { $eq: ["$$doc.precipitation", "$maxPrecipitation"] },
              },
            },
          },
        },
        // {
        //   // Step 3: Match all documents with the maximum precipitation for the location
        //   $lookup: {
        //     from: "weathers",
        //     let: {
        //       location: "$_id",
        //       maxPrecipitation: "$maxPrecipitation",
        //     },
        //     pipeline: [
        //       {
        //         $match: {
        //           $expr: {
        //             $and: [
        //               { $eq: ["$geoLocation", "$$location"] },
        //               { $eq: ["$recipitation", "$$maxPrecipitation"] },
        //             ],
        //           },
        //         },
        //       },
        //       {
        //         $project: {
        //           _id: 0,
        //           deviceName: 1,
        //           createdAt: 1,
        //           precipitation: 1,
        //         },
        //       },
        //     ],
        //     as: "machingDocs",
        //   },
        // },
        // Step 5: Flattern the array of matching docs
        { $unwind: "$docs" },
        // Step 6: Replace the root with the matching docs fields
        { $replaceRoot: { newRoot: "$docs" } },
        // Step 7: sort the result by createdAt in desc
        { $sort: { createdAt: -1 } },
      ])
      .toArray();
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const findMaxPrecipitationByDevice = async (
  deviceName: string,
  recentMonths: number
) => {
  try {
    const latestDate = await findLatestDateByDevice(deviceName);
    const startDate = new Date(latestDate);
    startDate.setMonth(startDate.getMonth() - recentMonths);
    const result = await weathersColl
      .aggregate([
        {
          // Stage 1: Match docs for the specifc device and date range
          $match: {
            deviceName,
            createdAt: { $gte: startDate, $lte: latestDate },
          },
        },
        {
          // Stage 2: limit necessory fields
          $project: {
            deviceName: 1,
            createdAt: 1,
            precipitation: 1,
          },
        },
        {
          // Stage 3: group by geoLocation and find the max precipitation
          $group: {
            _id: "$geoLocation",
            maxPrecipitation: { $max: "$precipitation" },
            docs: {
              $push: {
                deviceName: "$deviceName",
                createdAt: "$createdAt",
                precipitation: "$precipitation",
              },
            },
          },
        },
        {
          // Stage 4: Filter docs matching the max precipation
          $project: {
            docs: {
              $filter: {
                input: "$docs",
                as: "doc",
                cond: { $eq: ["$$doc.precipitation", "$maxPrecipitation"] },
              },
            },
          },
        },

        // Step 5: Flattern the array of matching docs
        { $unwind: "$docs" },
        // Step 6: Replace the root with the matching docs fields
        { $replaceRoot: { newRoot: "$docs" } },
        // Step 7: sort the result by createdAt in desc
        { $sort: { createdAt: -1 } },
      ])
      .toArray();
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const findMaxTemperatureByDevice = async (
  startDate: Date,
  endDate: Date,
  deviceName?: string
) => {
  try {
    const result = await weathersColl
      .aggregate([
        {
          // Stage 1: Match docs within the given time range
          $match: { deviceName, createdAt: { $gte: startDate, $lte: endDate } },
        },
        {
          // Stage 2: limit necessory fields
          $project: {
            deviceName: 1,
            createdAt: 1,
            temperature: 1,
          },
        },

        {
          // Stage 3: group by deviceName to find the max temperature
          $group: {
            _id: "$deviceName",
            maxTemperature: { $max: "$temperature" },
            docs: {
              $push: {
                deviceName: "$deviceName",
                createdAt: "$createdAt",
                temperature: "$temperature",
              },
            },
          },
        },
        {
          // Stage 4: Filter docs matching the max temperature
          $project: {
            docs: {
              $filter: {
                input: "$docs",
                as: "doc",
                cond: { $eq: ["$$doc.temperature", "$maxTemperature"] },
              },
            },
          },
        },
        {
          // Step 5: Flattern the array of docs
          $unwind: "$docs",
        },
        {
          // Step 6: Replace the root with the flatterned doc fields
          $replaceRoot: { newRoot: "$docs" },
        },
        {
          // Step 7: sort by createdAt in desc
          $sort: { createdAt: -1 },
        },
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
