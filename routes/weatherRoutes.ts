// @deno-types="npm:@types/express"
import { Router } from "express";
import {
  createWeatherAction,
  showWeatherAction,
  updateWeatherAction,
  validateWeatherInput,
} from "../controllers/weatherController.ts";
import { validateParams } from "../middlewares/validation.ts";

export const weatherRouter = Router();

// Get all weathers
weatherRouter.get("/");

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
weatherRouter.delete("/:id");
