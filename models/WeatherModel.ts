import { OptionalId, ObjectId } from "mongodb";
import { client, database } from "../config/db.ts";
import { Weather } from "./WeatherSchema.ts";

const weathersColl = database.collection<OptionalId<Weather>>("weathers");

export const getWeather = async (id: string) => {
  try {
    await client.connect();
    const result = await weathersColl.findOne(new ObjectId(id));
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

export const updateWeather = async (weather: Weather) => {
  try {
    await client.connect();
    const result = await weathersColl.findOneAndUpdate(
      { _id: weather._id },
      { $set: weather, $currentDate: { lastModifiedAt: true } },
      { upsert: true }
    );
    return result;
  } catch (error) {
    console.log(error);
  } finally {
    await client.close();
  }
};
