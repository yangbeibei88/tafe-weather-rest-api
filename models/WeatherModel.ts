import { OptionalId, ObjectId, MongoServerError } from "mongodb";
import { weathersColl } from "../config/db.ts";
import { Weather } from "./WeatherSchema.ts";
import { AggregationBuilder } from "../utils/AggregationBuilder.ts";

// const weathersColl = database.collection<OptionalId<Weather>>("weathers");

export const getAllWeathers = async (reqQuery = { page: 1, limit: 10 }) => {
  try {
    // const cursor = weathersColl.find<Weather>(
    //   {},
    //   { sort: { createdAt: -1 }, limit: 10 }
    //   // { limit: 10 }
    // );

    const matchCriteria = AggregationBuilder.parseQueryToMatch(reqQuery);
    const pipeline = new AggregationBuilder()
      .match(matchCriteria)
      .sort({ createdAt: -1 })
      .build();

    const result = await weathersColl.aggregate(pipeline).toArray();

    const totalCount = result[0].totalCount[0]?.totalCount || 0;

    const { totalPages, currentPage } = AggregationBuilder.calculatePagination(
      totalCount,
      reqQuery.limit,
      reqQuery.page
    );

    return {
      totalCount,
      totalPages,
      currentPage,
      data: result[0].data,
    };

    // let page: number = 1;
    // let pageSize: number = 10;

    // const aggCursor = weathersColl.aggregate([
    //   { $sort: { createdAt: -1 } },
    //   {
    //     $facet: {
    //       metadata: [{ $count: "totalCount" }],
    //       data: [{ $skip: (page - 1) * pageSize }, { $limit: pageSize }],
    //     },
    //   },
    // ]);

    // const aggResult = await aggCursor.toArray();
    // return { page, pageSize, aggResult };

    // const results = await cursor.toArray();
    // return results;
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

export const insertWeather = async (weather: OptionalId<Weather>) => {
  try {
    const result = await weathersColl.insertOne({
      ...weather,
      createdAt: new Date(),
    });
    return { id: result.insertedId, ...weather };
  } catch (error) {
    console.log(error);
  }
};

export const updateWeather = async (
  id: string,
  weather: OptionalId<Weather>
) => {
  try {
    const result = await weathersColl.findOneAndUpdate(
      { _id: new ObjectId(id) },
      // { $set: weather, $currentDate: { lastModifiedAt: true } },
      { $set: { ...weather, lastModifiedAt: new Date() } },
      { upsert: true }
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
