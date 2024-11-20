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
} from "../controllers/weatherController.ts";
import { validateParams, validateQuery } from "../middlewares/validation.ts";
import { protect, authorisedTo } from "../controllers/authController.ts";

export const weatherRouter = Router();

// protect all weather routes
weatherRouter.use(protect);

// Get all weathers
weatherRouter.get(
  "/",
  validateQuery(),
  authorisedTo("admin", "teacher", "student"),
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
  "/bulk",
  authorisedTo("admin", "teacher", "sensor"),
  validateWeatherInput(),
  createWeathersAction
);

// Update one or more new weather readings
// weatherRouter.put("/");

// delete one or more new weather readings
// weatherRouter.delete("/");

// TODO: UPLOAD WEATHER DATA THROUGH FILES (JSON, CSV)

// Get one weather reading
weatherRouter.get(
  "/:id",
  authorisedTo("admin", "teacher", "student"),
  validateParams(),
  showWeatherAction
);

// update one weather reading
weatherRouter.put(
  "/:id",
  authorisedTo("admin", "teacher"),
  validateParams(),
  validateWeatherInput(),
  updateWeatherAction
);

// delete one or more weather readings
weatherRouter.delete(
  "/:id",
  authorisedTo("admin", "teacher"),
  validateParams(),
  deleteWeatherAction
);
