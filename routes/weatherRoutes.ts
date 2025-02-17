// @deno-types="npm:@types/express@4.17.21"
import { Router } from "express";
import {
  createWeatherAction,
  createWeathersAction,
  deleteWeatherAction,
  listWeathersAction,
  showWeatherAction,
  updateWeatherAction,
  validateWeatherInput,
  showStationStatsAction,
  showDeviceStatsAction,
  listStationStatsAction,
  listDeviceStatsAction,
  listWeathersByDeviceAction,
} from "../controllers/weatherController.ts";
import {
  validatePathParams,
  validateQueryParams,
} from "../middlewares/validation.ts";
import { protect, authorisedTo } from "../controllers/authController.ts";

export const weatherRouter = Router();

// protect all weather routes
weatherRouter.use(protect);

// Get all weather readings - P
weatherRouter.get(
  "/",
  authorisedTo("admin", "teacher", "student", "test"),
  validateQueryParams(["limit", "page", "createdAt"]),
  listWeathersAction
);

// Create one new weather reading - P
weatherRouter.post(
  "/",
  authorisedTo("admin", "teacher", "sensor"),
  validateWeatherInput(),
  createWeatherAction
);

// Create many weather readings - P
weatherRouter.post(
  "/batch",
  authorisedTo("admin", "teacher", "sensor"),
  validateWeatherInput(),
  createWeathersAction
);

// Aggregation all devices - P
weatherRouter.get(
  "/devices/aggregate",
  authorisedTo("admin", "teacher", "student", "test"),
  validateQueryParams(["aggField", "createdAt", "recentMonths"]),
  listDeviceStatsAction
);

// Get weather reading by device - P
weatherRouter.get(
  "/devices/:deviceName",
  authorisedTo("admin", "teacher", "sensor", "test"),
  validatePathParams(),
  validateQueryParams(["limit", "page", "createdAt"]),
  listWeathersByDeviceAction
);

// Aggregation by single device - P
weatherRouter.get(
  "/devices/:deviceName/aggregate",
  authorisedTo("admin", "teacher", "student", "test"),
  validatePathParams(),
  validateQueryParams(["aggField", "createdAt", "recentMonths"]),
  showDeviceStatsAction
);

// Get one weather reading - P
weatherRouter.get(
  "/:id",
  authorisedTo("admin", "teacher", "student", "test"),
  validatePathParams(),
  showWeatherAction
);

// update one weather reading - P
weatherRouter.put(
  "/:id",
  authorisedTo("admin", "teacher"),
  validatePathParams(),
  validateWeatherInput(),
  updateWeatherAction
);

// delete one or more weather readings - P
weatherRouter.delete(
  "/:id",
  authorisedTo("admin", "teacher"),
  validatePathParams(),
  deleteWeatherAction
);

// Aggregation all locations
weatherRouter.get(
  "/stations/aggregate",
  authorisedTo("admin", "teacher", "student", "test"),
  validateQueryParams(["aggField", "createdAt", "recentMonths"]),
  listStationStatsAction
);

// Aggregation by single location
weatherRouter.get(
  "/stations/@:longitude,:latitude/aggregate",
  authorisedTo("admin", "teacher", "student", "test"),
  validatePathParams(),
  validateQueryParams(["aggField", "createdAt", "recentMonths"]),
  showStationStatsAction
);

// Update one or more new weather readings
// weatherRouter.put("/");

// delete one or more new weather readings
// weatherRouter.delete("/");
