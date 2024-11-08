import { OptionalId } from "mongodb";
import { database } from "../config/db.ts";
import { Weather } from "./WeatherSchema.ts";

const weathersColl = database.collection<OptionalId<Weather>>("weathers");
