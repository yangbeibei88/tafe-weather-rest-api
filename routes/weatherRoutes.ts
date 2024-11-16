// @deno-types="npm:@types/express@4.17.21"
import { Router } from "express";
import {
  createWeatherAction,
  deleteWeatherAction,
  listWeathers,
  showWeatherAction,
  updateWeatherAction,
  validateWeatherInput,
} from "../controllers/weatherController.ts";
import { validateParams } from "../middlewares/validation.ts";
import { protect } from "../controllers/authController.ts";

export const weatherRouter = Router();

// Get all weathers
weatherRouter.get("/", protect, listWeathers);

// Create one or more new weather readings
weatherRouter.post("/", validateWeatherInput, createWeatherAction);

// Update one or more new weather readings
weatherRouter.put("/");

// delete one or more new weather readings
weatherRouter.delete("/");

// TODO: UPLOAD WEATHER DATA THROUGH FILES (JSON, CSV)

// Get a single weather reading
weatherRouter.get("/:id", validateParams(), showWeatherAction);

// update one
weatherRouter.put(
  "/:id",
  validateParams(),
  validateWeatherInput,
  updateWeatherAction
);

// delete one or more weather readings
weatherRouter.delete("/:id", validateParams(), deleteWeatherAction);
