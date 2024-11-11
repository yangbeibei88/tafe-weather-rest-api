import { OptionalId, ObjectId, MongoServerError } from "mongodb";
import { client, database } from "../config/db.ts";
import { Weather } from "./WeatherSchema.ts";

const weathersColl = database.collection<OptionalId<Weather>>("weathers");

export const getAllWeathers = async () => {
  try {
    await client.connect();
    // TODO: ADD limit, sort, skip, pagination, page later on
    const cursor = weathersColl.find<Weather>(
      {},
      { sort: { createdAt: -1 }, limit: 10 }
    );
    return cursor;
  } catch (error) {
    console.log(error);
  } finally {
    await client.close();
  }
};

export const getWeather = async (id: string) => {
  try {
    await client.connect();
    const result = await weathersColl.findOne<Weather>({
      _id: new ObjectId(id),
    });
    return result;
  } catch (error) {
    console.log(error);
  } finally {
    await client.close();
  }
};

export const insertWeather = async (weather: OptionalId<Weather>) => {
  try {
    await client.connect();
    const result = await weathersColl.insertOne({
      ...weather,
      createdAt: new Date(),
    });
    return { id: result.insertedId, ...result };
  } catch (error) {
    console.log(error);
  } finally {
    await client.close();
  }
};

export const updateWeather = async (
  id: string,
  weather: OptionalId<Weather>
) => {
  try {
    await client.connect();
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
  } finally {
    await client.close();
  }
};

export const deleteWeather = async (id: string) => {
  try {
    await client.connect();
    const result = await weathersColl.deleteOne({
      _id: new ObjectId(id),
    });

    return result;
  } catch (error) {
    console.log(error);
  } finally {
    await client.close();
  }
};
