// @deno-types="npm:@types/express"
import { Router } from "express";
import {
  createWeatherAction,
  showWeatherAction,
} from "../controllers/weatherController.ts";

export const weatherRouter = Router();

// Get all weathers
weatherRouter.get("/");

// Create one or more new weather readings
weatherRouter.post("/", createWeatherAction);

// Update one or more new weather readings
weatherRouter.put("/");

// delete one or more new weather readings
weatherRouter.delete("/");

// TODO: UPLOAD WEATHER DATA THROUGH FILES (JSON, CSV)

// Get a single weather reading
weatherRouter.get("/:id", showWeatherAction);

// update one
weatherRouter.put("/:id");

// delete one or more weather readings
weatherRouter.delete("/:id");
