// @deno-types="npm:@types/express-serve-static-core@4.19.5"
import {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express-serve-static-core";
import { OptionalId } from "mongodb";
import { ContextRunner } from "express-validator";
import { asyncHandlerT } from "../middlewares/asyncHandler.ts";
import {
  getAllWeathers,
  deleteWeather,
  getWeather,
  insertWeather,
  updateWeather,
} from "../models/WeatherModel.ts";
import { Weather, WeatherInput } from "../models/WeatherSchema.ts";
import {
  validateBodyFactory,
  validateDate,
  validateNumber,
  validateText,
} from "../middlewares/validation.ts";
import { ClientError } from "../errors/ClientError.ts";

// Define the validation rules for weather-related fields
const weatherValidations: Record<keyof WeatherInput, ContextRunner> = {
  _id: validateText("_id", 1, 50, false),
  deviceName: validateText("deviceName", 1, 50),
  precipitation: validateNumber("precipitation", "float", -100, 100),
  temperature: validateNumber("temperature", "float"),
  atmosphericPressure: validateNumber("atmosphericPressure", "float"),
  maxWindSpeed: validateNumber("maxWindSpeed", "float"),
  solarRadiation: validateNumber("solarRadiation", "float"),
  vaporPressure: validateNumber("vaporPressure", "float"),
  humidity: validateNumber("humidity", "float"),
  windDirection: validateNumber("windDirection", "float"),
  longitude: validateNumber("longitude", "float", -180, 180),
  latitude: validateNumber("latitude", "float", -90, 90),
  createdAt: validateDate("createdAt", false),
  lastModifiedAt: validateDate("lastModifiedAt", false),
  createdBy: validateText("createdBy", 1, 50, false),
  lastModifiedBy: validateText("lastModifiedBy", 1, 50, false),
};

export const validateWeatherInput = () =>
  validateBodyFactory<WeatherInput>(weatherValidations)([
    "_id",
    "deviceName",
    "precipitation",
    "temperature",
    "atmosphericPressure",
    "solarRadiation",
    "vaporPressure",
    "humidity",
    "windDirection",
    "longitude",
    "latitude",
    "createdAt",
    "lastModifiedAt",
    "createdBy",
    "lastModifiedBy",
  ]);

// const createIndicators = () => {};
// const updateIndicators = () => {};

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

// export const validateWeatherInput = validateBody([
//   validateText("deviceName", 1, 50, true),
//   validateNumber("precipitation", "float", -100, 100),
//   validateNumber("temperature", "float"),
//   validateNumber("atmosphericPressure", "float"),
//   validateNumber("maxWindSpeed", "float"),
//   validateNumber("solarRadiation", "float"),
//   validateNumber("vaporPressure", "float"),
//   validateNumber("humidity", "float"),
//   validateNumber("windDirection", "float"),
//   validateNumber("longitude", "float", -180, 180),
//   validateNumber("latitude", "float", -90, 90),
// ]);

const getValidatedWeatherInput = (inputData: WeatherInput) => {
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

const getValidatedWeatherInputArr = (
  validInputData: WeatherInput | WeatherInput[]
) => {
  if (Array.isArray(validInputData)) {
    return validInputData.map(
      ({ longitude, latitude, ...restInput }: WeatherInput) => {
        return {
          ...restInput,
          geoLocation: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
        };
      }
    );
  } else {
    const { longitude, latitude, ...restInput } = validInputData;
    return {
      ...restInput,
      geoLocation: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
    };
  }
};

export const createWeatherAction = asyncHandlerT(
  async (req: Request, res: Response, _next: NextFunction) => {
    const inputData: OptionalId<Weather> = {
      ...getValidatedWeatherInput(req.body),
      createdAt: req.body.createdAt ?? new Date(),
      createdBy: req.body.createdBy ?? req.user._id,
    };
    const newWeather = await insertWeather(inputData);

    res.status(201).json({
      success: true,
      data: newWeather,
    });
  }
);

// export const createWeathersAction = asyncHandlerT(
//   async (req: Request, res: Response, _next: NextFunction) => {
//     const inputData = getValidatedWeatherInput(req.body);
//   }
// );

export const updateWeatherAction = asyncHandlerT(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const inputData: OptionalId<Weather> = {
      ...getValidatedWeatherInput(req.body),
      lastModifiedAt: req.body.lastModifiedAt ?? new Date(),
      lastModifiedBy: req.body.lastModifiedBy ?? req.user._id,
    };

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
