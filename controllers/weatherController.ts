// @deno-types="npm:@types/express@4.17.21"
import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { getWeather, insertWeather } from "../models/WeatherModel.ts";
import { Weather } from "../models/WeatherSchema.ts";
import {
  validateBody,
  validateNumber,
  validateText,
} from "../middlewares/validation.ts";
import { OptionalId } from "mongodb";

export const showWeatherAction = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    // if param id is valid, call findOne
    const weather = await getWeather(req.params.id);

    if (!weather) {
      res.status(404).json({
        msg: "Not Found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: weather,
    });
  }
);

export const validateWeatherInput = validateBody([
  validateText("deviceName", 1, 50, true),
  validateNumber("precipitation", "float"),
  validateNumber("temperature", "float"),
  validateNumber("atmosphericPressure", "float"),
  validateNumber("maxWindSpeed", "float"),
  validateNumber("solarRadiation", "float"),
  validateNumber("vaporPressure", "float"),
  validateNumber("humidity", "float"),
  validateNumber("windDirection", "float"),
  validateNumber("longitude", "float", -180, 180),
  validateNumber("latitude", "float", -90, 90),
]);

export const createWeatherAction = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const inputData: OptionalId<Weather> = {
      deviceName: req.body.deviceName,
      precipitation: req.body.precipitation,
      temperature: req.body.temperature,
      atmosphericPressure: req.body.atmosphericPressure,
      maxWindSpeed: req.body.maxWindSpeed,
      solarRadiation: req.body.solarRadiation,
      vaporPressure: req.body.vaporPressure,
      humidity: req.body.humidity,
      windDirection: req.body.windDirection,
      geoLocation: {
        type: "Point",
        coordinates: [req.body.longitude, req.body.latitude],
      },
    };
    const weather = await insertWeather(inputData);

    res.status(201).json({
      success: true,
      data: weather,
    });
  }
);
