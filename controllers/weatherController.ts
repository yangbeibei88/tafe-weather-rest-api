import { asyncHandler } from "../middlewares/asyncHandler.ts";
import { Weather } from "../models/WeatherSchema.ts";

export const createWeatherAction = asyncHandler(async (req, res, next) => {
  // 1) validate & sanitise data
  // 2) insert data
  // 3) return json message
});
