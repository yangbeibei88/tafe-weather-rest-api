// @deno-types="npm:@types/express-serve-static-core@4.19.5"
import {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express-serve-static-core";
import { asyncHandlerT } from "../middlewares/asyncHandler.ts";
import { OptionalId } from "mongodb";
import {
  getAllWeathers,
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
import { ClientError } from "../errors/ClientError.ts";

export const listWeathersAction = asyncHandlerT(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;
    const result = await getAllWeathers(req.query, limit, page);

    res.status(200).json({
      success: true,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: result.currentPage,
      limit,
      data: result.data,
    });
  }
);

export const showWeatherAction: RequestHandler = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // if param id is valid, call findOne
    const weather = await getWeather(req.params.id);

    if (!weather) {
      next(new ClientError({ code: 404 }));
      return;
    }

    res.status(200).json({
      success: true,
      data: weather,
    });
  }
) as RequestHandler;

export const validateWeatherInput = validateBody([
  validateText("deviceName", 1, 50, true),
  validateNumber("precipitation", "float", -100, 100),
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

const getValidatedWeatherInput = (
  inputData: Omit<OptionalId<Weather>, "geoLocation"> & {
    longitude: number;
    latitude: number;
  }
) => {
  const weatherInputData: OptionalId<Weather> = {
    deviceName: inputData.deviceName,
    precipitation: inputData.precipitation,
    temperature: inputData.temperature,
    atmosphericPressure: inputData.atmosphericPressure,
    maxWindSpeed: inputData.maxWindSpeed,
    solarRadiation: inputData.solarRadiation,
    vaporPressure: inputData.vaporPressure,
    humidity: inputData.humidity,
    windDirection: inputData.windDirection,
    geoLocation: {
      type: "Point",
      coordinates: [inputData.longitude, inputData.latitude],
    },
  };

  return weatherInputData;
};

export const createWeatherAction = asyncHandlerT(
  async (req: Request, res: Response, _next: NextFunction) => {
    const inputData = getValidatedWeatherInput(req.body);
    const newWeather = await insertWeather(inputData);

    res.status(201).json({
      success: true,
      data: newWeather,
    });
  }
);

export const updateWeatherAction = asyncHandlerT(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const inputData = getValidatedWeatherInput(req.body);

    console.log(inputData);

    const updatedWeather = await updateWeather(req.params.id, inputData);

    res.status(200).json({
      success: true,
      data: updatedWeather,
    });
  }
);

export const deleteWeatherAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const deletedWeather = await deleteWeather(req.params.id);

    if (!deletedWeather?.deletedCount) {
      next(
        new ClientError({
          code: 404,
          message: "No documents matched the query. Deleted 0 documents.",
        })
      );

      return;
    }

    res.status(204).json({
      success: true,
      msg: "Successfully deleted one document.",
      deletedWeather,
    });
  }
);
