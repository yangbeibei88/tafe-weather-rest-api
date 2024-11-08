// @deno-types="npm:@types/express"
import { Router } from "express";

export const weatherRouter = Router();

// Get all weathers
weatherRouter.get("/");

// Create one or more new weather readings
weatherRouter.post("/");

// Update one or more new weather readings
weatherRouter.put("/");

// delete one or more new weather readings
weatherRouter.delete("/");

// TODO: UPLOAD WEATHER DATA THROUGH FILES (JSON, CSV)

// Get a single weatherReading
weatherRouter.get("/:weatherReadingId");

// update one
weatherRouter.put("/:weatherReadingId");

// delete one or more weather readings
weatherRouter.delete("/:weatherReadingId");
