import { OptionalId } from "mongodb";
import { client, database } from "../config/db.ts";
import { Weather } from "./WeatherSchema.ts";

const weathersColl = database.collection<OptionalId<Weather>>("weathers");

export const insertWeather = async (weather: OptionalId<Weather>) => {
  try {
    await client.connect();
    const result = await weathersColl.insertOne(weather);
    return { id: result.insertedId, ...result };
  } catch (error) {
    console.log(error);
  } finally {
    await client.close();
  }
};
