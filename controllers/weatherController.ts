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
  insertWeathers,
  findGeolocation,
  findDevice,
  aggregateWeatherByLocationOrDevice,
} from "../models/WeatherModel.ts";
import { Weather, WeatherInput } from "../models/WeatherSchema.ts";
import {
  validateBodyFactory,
  validateDate,
  validateNumber,
  validateText,
} from "../middlewares/validation.ts";
import { ClientError } from "../errors/ClientError.ts";
import { objectOmit } from "../utils/helpers.ts";

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

const getValidatedWeatherInput = (
  validInputData: WeatherInput | WeatherInput[]
) => {
  if (Array.isArray(validInputData)) {
    return validInputData.map((obj: WeatherInput) => {
      return {
        ...objectOmit(obj, ["longitude", "latitude"]),
        geoLocation: {
          type: "Point",
          coordinates: [obj.longitude, obj.latitude],
        },
      };
    });
  } else {
    return {
      ...objectOmit(validInputData, ["longitude", "latitude"]),
      geoLocation: {
        type: "Point",
        coordinates: [validInputData.longitude, validInputData.latitude],
      },
    };
  }
};

export const listWeathersAction = asyncHandlerT(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;

    console.log(req.query);

    const defaultDateRange: Record<"createdAt", string | object | Date> = {
      createdAt: { gte: "2021-01-01" },
    };

    const defaultSort: Record<string, -1 | 1> = { createdAt: -1 };

    const result = await getAllWeathers(
      { ...req.query, ...defaultDateRange },
      limit,
      page,
      defaultSort
    );

    res.status(200).json({
      paging: {
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        limit,
      },
      result: result.data,
    });
  }
);

export const listDeviceStatsAction = asyncHandlerT(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { aggField, createdAt, recentMonths } = req.query;
    console.log(req.query);

    const result = await aggregateWeatherByLocationOrDevice(
      {},
      aggField,
      "deviceName",
      recentMonths,
      createdAt
    );

    res.status(200).json({
      result,
    });
  }
);

export const listStationStatsAction = asyncHandlerT(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const { aggField, createdAt, recentMonths } = req.query;
    console.log(req.query);

    const result = await aggregateWeatherByLocationOrDevice(
      {},
      aggField,
      "geoLocation",
      Number(recentMonths),
      createdAt
    );

    res.status(200).json({
      result,
    });
  }
);

export const showStationStatsAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { longitude, latitude } = req.params;
    const { aggField, createdAt, recentMonths } = req.query;

    console.log(req.params);
    console.log(req.query);

    // check if the location exists
    const location = await findGeolocation(Number(longitude), Number(latitude));

    if (!location?.length) {
      return next(
        new ClientError({ code: 404, message: "This location not found." })
      );
    }

    const result = await aggregateWeatherByLocationOrDevice(
      { longitude: Number(longitude), latitude: Number(latitude) },
      aggField,
      "geoLocation",
      Number(recentMonths),
      createdAt
    );

    console.log("Aggregation result:", result);

    res.status(200).json({
      result,
    });
  }
);

export const showDeviceStatsAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { deviceName } = req.params;
    const { aggField, createdAt, recentMonths } = req.query;

    console.log(req.params);
    console.log(req.query);

    // check if the device exists
    const device = await findDevice(deviceName);

    if (!device?.length) {
      return next(
        new ClientError({ code: 404, message: "This device not found." })
      );
    }

    const result = await aggregateWeatherByLocationOrDevice(
      { deviceName },
      aggField,
      "deviceName",
      Number(recentMonths),
      createdAt
    );

    console.log("Aggregation result:", result);

    res.status(200).json({
      result,
    });
  }
);

export const showWeatherAction: RequestHandler = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // if param id is valid, call findOne
    const weather = await getWeather(req.params.id);

    if (!weather) {
      return next(new ClientError({ code: 404 }));
    }

    res.status(200).json({
      result: weather,
    });
  }
) as RequestHandler;

export const createWeatherAction = asyncHandlerT(
  async (req: Request, res: Response, _next: NextFunction) => {
    const inputData: OptionalId<Weather> = {
      ...getValidatedWeatherInput(req.body),
      createdAt: req.body.createdAt ?? new Date(),
      createdBy: req.body.createdBy ?? req.user._id,
    } as OptionalId<Weather>;
    const newWeather = await insertWeather(inputData);

    res.status(201).json({
      success: true,
      data: newWeather,
    });
  }
);

export const createWeathersAction = asyncHandlerT(
  async (req: Request, res: Response, _next: NextFunction) => {
    const inputData: OptionalId<Weather>[] = getValidatedWeatherInput(
      req.body
    ) as OptionalId<Weather>[];

    const payload: OptionalId<Weather>[] = inputData.map((item) => {
      return {
        ...item,
        createdAt: req.body.createdAt ?? new Date(),
        createdBy: req.body.createdBy ?? req.user._id,
      };
    });

    const result = await insertWeathers(payload);

    res.status(201).json({
      count: result?.insertedCount,
      data: result?.insertedIds,
    });
  }
);

export const updateWeatherAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const payload: OptionalId<Weather> = {
      ...getValidatedWeatherInput(req.body),
      lastModifiedAt: req.body.lastModifiedAt ?? new Date(),
      lastModifiedBy: req.body.lastModifiedBy ?? req.user._id,
    } as OptionalId<Weather>;

    console.log(payload);

    const result = await updateWeather(req.params.id, payload);

    if (!result?.matchedCount) {
      return next(
        new ClientError({
          code: 404,
          message: "No documents matched the query. Updated 0 documents.",
        })
      );
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  }
);

export const deleteWeatherAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const result = await deleteWeather(req.params.id);

    if (!result?.deletedCount) {
      next(
        new ClientError({
          code: 404,
          message: "No documents matched the query. Deleted 0 documents.",
        })
      );

      return;
    }

    res.status(204).json({
      result,
    });
  }
);
