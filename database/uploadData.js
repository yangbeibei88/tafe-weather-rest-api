import fs from "node:fs";
import { URL } from "node:url";
import { weathersColl } from "../config/db.ts";

const dataPath = new URL("./SensorData_Final_NoWind.json", import.meta.url)
  .pathname;

console.log(dataPath);

const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

console.log(data.length); // 120360

const sample = {
  "Device Name": "Woodford_Sensor",
  "Precipitation mm/h": 0.085,
  Time: {
    $date: {
      $numberLong: "1620359044000",
    },
  },
  Latitude: 152.77891,
  Longitude: -26.95064,
  "Temperature (°C)": 22.74,
  "Atmospheric Pressure (kPa)": 128.02,
  "Max Wind Speed (m/s)": 4.94,
  "Solar Radiation (W/m2)": 113.21,
  "Vapor Pressure (kPa)": 1.73,
  "Humidity (%)": 73.84,
  "Wind Direction (°)": 155.6,
};

const dataArr = data
  .filter((item) => {
    return Object.keys(sample).every((key) => Object.keys(item).includes(key));
  })
  .map((item) => {
    let obj = {};

    obj.deviceName = item["Device Name"].trim().toLowerCase();
    obj.precipitation = item["Precipitation mm/h"] || 0;
    obj.temperature = item["Temperature (°C)"] || 0;
    obj.atmosphericPressure = item["Atmospheric Pressure (kPa)"] || 0;
    obj.maxWindSpeed = item["Max Wind Speed (m/s)"] || 0;
    obj.solarRadiation = item["Solar Radiation (W/m2)"] || 0;
    obj.vaporPressure = item["Vapor Pressure (kPa)"] || 0;
    obj.humidity = item["Humidity (%)"] || 0;
    obj.windDirection = item["Wind Direction (°)"] || 0;
    obj.geoLocation = {
      type: "Point",
      coordinates: [item["Latitude"], item["Longitude"]],
    };
    obj.createdAt = new Date(
      parseInt(item["Time"]["$date"]["$numberLong"], 10)
    );

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
