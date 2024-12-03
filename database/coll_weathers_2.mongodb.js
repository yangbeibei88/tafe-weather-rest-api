const database = "tafe-weather-api";
use(database);
db; // "tafe-weather-api"

// Create weathers collections with validator
// db.createCollection("weathers", {
db.runCommand({
  collMod: "weathers",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "weather object validation",
      required: [
        "_id",
        "deviceName",
        "longitude",
        "latitude",
        "precipitation",
        "temperature",
        "atmosphericPressure",
        "maxWindSpeed",
        "solarRadiation",
        "vaporPressure",
        "humidity",
        "windDirection",
        "createdAt",
      ],
      properties: {
        _id: {
          bsonType: "objectId",
        },
        deviceName: {
          bsonType: "string",
          minLength: 1,
          maxLength: 50,
          description: "Must be a string and is required, 1-50 characters",
        },
        longitude: {
          bsonType: ["double", "int"],
          minimum: -180,
          maximum: 180,
          description: "Longitude must be between -180 and 180 degrees",
        },
        latitude: {
          bsonType: ["double", "int"],
          minimum: -90,
          maximum: 90,
          description: "Latitude must be between -90 and 90 degrees",
        },
        precipitation: {
          bsonType: ["double", "int"],
          description: "Must be a number, unit: mm/h",
        },
        temperature: {
          bsonType: ["double", "int"],
          description: "Must be a number, unit: celsius degree",
        },
        atmosphericPressure: {
          bsonType: ["double", "int"],
          description: "Must be a number, unit: kpa",
        },
        maxWindSpeed: {
          bsonType: ["double", "int"],
          description: "Must be a number, unit: m/s",
        },
        solarRadiation: {
          bsonType: ["double", "int"],
          description: "Must be a number, unit: w/m2",
        },
        vaporPressure: {
          bsonType: ["double", "int"],
          description: "Must be a number, unit: kpa",
        },
        humidity: {
          bsonType: ["double", "int"],
          description: "Must be a number, unit: %",
        },
        windDirection: {
          bsonType: ["double", "int"],
          description: "Must be a number, unit: degree",
        },
        createdAt: {
          bsonType: ["date", "null"],
          description: "The current timestamp when the document is created",
        },
        createdBy: {
          bsonType: ["objectId", "null"],
          description: "User objectId refer to who created the document",
        },
        lastModifiedAt: {
          bsonType: ["date", "null"],
          description: "The current timestamp when the document is updated",
        },
        lastModifiedBy: {
          bsonType: ["objectId", "null"],
          description: "User objectId refer to who last modified the document",
        },
      },
      additionalProperties: false,
    },
  },
  validationLevel: "strict",
  validationAction: "error",
});

db.weathers.insertOne({
  deviceName: "Woodford_Sensor",
  precipitation: 0.085,
  temperature: 22.74,
  atmosphericPressure: 128.02,
  maxWindSpeed: 4.49,
  solarRadiation: 113.21,
  vaporPressure: 1.73,
  humidity: 73.84,
  windDirection: 155.6,
  geoLocation: {
    type: "Point",
    coordinates: [152.77891, -26.95064],
  },
});

db.weathers.createIndex(
  { geoLocation: "2dsphere", createdAt: -1 },
  { name: "geoLocation_2dsphere_createdAt_-1" }
);
db.weathers.createIndex({ deviceName: 1 });
db.weathers.createIndex({ createdAt: -1 });
db.weathers.createIndex(
  { deviceName: 1, createdAt: -1 },
  {
    name: "deviceName_1_createdAt_-1_en_ci",
    collation: { locale: "en", strength: 2 },
  }
);

db.weathers.createIndex({
  createdAt: -1,
  humidity: -1,
});

db.weathers.createIndex({
  precipitation: -1,
  createdAt: -1,
});

db.weathers.createIndex(
  {
    geoLocation: "2dsphere",
    precipitation: -1,
    createdAt: -1,
  },
  { name: "geoLocation_2dsphere_precip_-1_createdAt_-1" }
);
db.weathers.createIndex(
  {
    geoLocation: "2dsphere",
    createdAt: -1,
    precipitation: -1,
  },
  { name: "geoLocation_2dsphere_createdAt_-1_precipitation_-1" }
);

db.weathers.createIndex(
  {
    "geoLocation.type": 1,
    "geoLocation.coordinates": 1,
    createdAt: -1,
    precipitation: -1,
  },
  { name: "geoLocation_1_createdAt_-1_precipitation_-1" }
);

db.weathers.createIndex(
  {
    deviceName: 1,
    humidity: -1,
    createdAt: -1,
  },
  {
    name: "deviceName_1_createdAt_-1_humidity_-1_en_ci",
    collation: { locale: "en", strength: 2 },
  }
);

// db.weathers.updateMany({ deviceName: "Yandina_Sensor" }, [
//   {
//     $set: {
//       longitude: { $arrayElemAt: ["$geoLocation.coordinates", 0] },
//       latitude: { $arrayElemAt: ["$geoLocation.coordinates", 1] },
//     },
//   },
// ]);
