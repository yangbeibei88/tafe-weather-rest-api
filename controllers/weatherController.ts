// @deno-types="npm:@types/express"
import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { param, validationResult } from "express-validator";
import { getWeather, insertWeather } from "../models/WeatherModel.ts";
import { ObjectId } from "mongodb";
import { Weather } from "../models/WeatherSchema.ts";

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

export const validateWeatherInput = asyncHandler(async (req, res, next) => {
  if (req.params.id) {
    const existingWeatherData = await getWeather(req.params.id);
  }
});

export const createWeatherAction = asyncHandler(async (req, res, next) => {
  // 1) validate & sanitise data
  // 2) insert data
  // const insertedData = await insertWeather()
  // 3) return json message
});
