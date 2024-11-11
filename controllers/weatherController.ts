// @deno-types="npm:@types/express-serve-static-core@4.19.5"
import { Request, Response, NextFunction } from "express-serve-static-core";
import asyncHandler from "express-async-handler";
import { OptionalId } from "mongodb";
import {
  deleteWeather,
  getWeather,
  insertWeather,
  updateWeather,
} from "../models/WeatherModel.ts";
import { Weather } from "../models/WeatherSchema.ts";
import {
  validateBody,
  validateNumber,
  validateText,
} from "../middlewares/validation.ts";

export const listWeathers = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {}
);

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
    const newWeather = await insertWeather(inputData);

    res.status(201).json({
      success: true,
      data: newWeather,
    });
  }
);

export const updateWeatherAction = asyncHandler(
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

    const updatedWeather = await updateWeather(req.params.id, inputData);

    res.status(200).json({
      success: true,
      data: updatedWeather,
    });
  }
);

export const deleteWeatherAction = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const deletedWeather = await deleteWeather(req.params.id);

    if (!deletedWeather?.deletedCount) {
      res.status(404).json({
        msg: "No documents matched the query. Deleted 0 documents.",
      });

      return;
    }

    res.status(204).json({
      success: true,
      msg: "Successfully deleted one document.",
      deletedWeather,
    });
  }
);
