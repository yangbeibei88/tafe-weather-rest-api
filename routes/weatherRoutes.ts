// @deno-types="npm:@types/express@4.17.21"
import { Router } from "express";
import {
  createWeatherAction,
  createWeathersAction,
  deleteWeatherAction,
  listWeathersAction,
  listWeatherStatsAction,
  listStationStatsAction,
  showWeatherAction,
  updateWeatherAction,
  validateWeatherInput,
  showStationStatsAction,
} from "../controllers/weatherController.ts";
import {
  validatePathParams,
  validateQueryParams,
} from "../middlewares/validation.ts";
import { protect, authorisedTo } from "../controllers/authController.ts";

export const weatherRouter = Router();

// protect all weather routes
weatherRouter.use(protect);

// Get all weathers
weatherRouter.get(
  "/",
  authorisedTo("admin", "teacher", "student"),
  validateQueryParams(),
  listWeathersAction
);

// Create one new weather reading
weatherRouter.post(
  "/",
  authorisedTo("admin", "teacher", "sensor"),
  validateWeatherInput(),
  createWeatherAction
);

// Create many weather readings
weatherRouter.post(
  "/batch",
  authorisedTo("admin", "teacher", "sensor"),
  validateWeatherInput(),
  createWeathersAction
);

// // Aggregation all locations
// weatherRouter.get(
//   "/aggregate/locations",
//   authorisedTo("admin", "teacher", "student"),
//   validateQueryParams(),
//   listWeatherStatsAction
// );
// // Aggregation all devices
// weatherRouter.get(
//   "/aggregate/devices",
//   authorisedTo("admin", "teacher", "student"),
//   validateQueryParams(),
//   listWeatherStatsAction
// );

// Aggregation by single location
weatherRouter.get(
  "/aggregate/locations/@:longitude,:latitude",
  authorisedTo("admin", "teacher", "student"),
  validatePathParams(),
  validateQueryParams(),
  showStationStatsAction
);

// Aggregation by single device
weatherRouter.get(
  "/aggregate/devices/:deviceName",
  authorisedTo("admin", "teacher", "student"),
  validatePathParams(),
  validateQueryParams(),
  listWeatherStatsAction
);

// weatherRouter.get(
//   "/:deviceName/stats",
//   authorisedTo("admin", "teacher", "student"),
//   validatePathParams(),
//   validateQueryParams(),
//   listStationStatsAction
// );

// Update one or more new weather readings
// weatherRouter.put("/");

// delete one or more new weather readings
// weatherRouter.delete("/");

// Get one weather reading
weatherRouter.get(
  "/:id",
  authorisedTo("admin", "teacher", "student"),
  validatePathParams(),
  showWeatherAction
);

// update one weather reading
weatherRouter.put(
  "/:id",
  authorisedTo("admin", "teacher"),
  validatePathParams(),
  validateWeatherInput(),
  updateWeatherAction
);

// delete one or more weather readings
weatherRouter.delete(
  "/:id",
  authorisedTo("admin", "teacher"),
  validatePathParams(),
  deleteWeatherAction
);
