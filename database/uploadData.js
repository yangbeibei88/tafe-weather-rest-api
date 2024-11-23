import fs from "node:fs";
import { URL } from "node:url";
import { weathersColl } from "../config/db.ts";

const dataPath = new URL("./SensorData_Final_NoWind.json", import.meta.url)
  .pathname;

console.log(dataPath);

const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

console.log(data.length); // 120360

const dataArr = data.map((item) => {
  let obj = {};

  obj.deviceName = item["Device Name"];
  obj.precipitation = item["Precipitation mm/h"];
  obj.temperature = item["Temperature (°C)"];
  obj.atmosphericPressure = item["Atmospheric Pressure (kPa)"];
  obj.maxWindSpeed = item["Max Wind Speed (m/s)"];
  obj.solarRadiation = item["Solar Radiation (W/m2)"];
  obj.vaporPressure = item["Vapor Pressure (kPa)"];
  obj.humidity = item["Humidity (%)"];
  obj.windDirection = item["Wind Direction (°)"];
  obj.geoLocation = {
    type: "Point",
    coordinates: [item["Latitude"], item["Longitude"]],
  };
  obj.createdAt = new Date(parseInt(item["Time"]["$date"]["$numberLong"], 10));

  return obj;
});

const chunkArray = (arr, size) =>
  arr.reduce((acc, _, i) => {
    if (i % size === 0) {
      acc.push(arr.slice(i, i + size));
    }
    return acc;
  }, []);

// console.log(dataArr);

const importData = async () => {
  try {
    const chunkData = chunkArray(dataArr, 1000);

    for (const batch of chunkData) {
      try {
        const result = await weathersColl.insertMany(batch);
        console.log(`Inserted batch: ${result.insertedCount} documents`);
      } catch (error) {
        console.error("Error inserting batch:", error);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

importData();
