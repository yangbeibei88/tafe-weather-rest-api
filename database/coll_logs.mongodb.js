const database = "tafe-weather-api";
use(database);
db; // "tafe-weather-api"

const coordinateSchema = {
  bsonType: "array",
  minItems: 2,
  maxItems: 2,
  items: [
    {
      bsonType: ["double", "int"],
      minimum: -180,
      maximum: 180,
      description: "Longitude must be between -180 and 180 degrees",
    },
    {
      bsonType: ["double", "int"],
      minimum: -90,
      maximum: 90,
      description: "Latitude must be between -90 and 90 degrees",
    },
  ],
  additionalItems: false,
  description: "An array of two numbers representing [longitude, latitude]",
};

const weatherSchema = {
  bsonType: "object",
  title: "weather object validation",
  required: [
    "_id",
    "deviceName",
    "precipitation",
    "temperature",
    "atmosphericPressure",
    "maxWindSpeed",
    "solarRadiation",
    "vaporPressure",
    "humidity",
    "windDirection",
    "geoLocation",
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
      description: "The current timestamp when the document is created.",
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
    geoLocation: {
      bsonType: "object",
      description: "Must be an object if the field exists",
      required: ["type", "coordinates"],
      oneOf: [
        // Point
        {
          properties: {
            type: { enum: ["Point"], type: "string" },
            coordinates: coordinateSchema,
          },
          additionalItems: false,
        },
        // LineString or MultiPoint
        {
          properties: {
            type: { enum: ["LineString", "MultiPoint"], type: "string" },
            coordinates: {
              bsonType: "array",
              minItems: 1,
              items: coordinateSchema,
              description:
                "An array of [longitude, latitude] points representing the geometry",
            },
          },
          additionalProperties: false,
        },
        // Polygon or MultiLineString
        {
          properties: {
            type: { enum: ["Polygon", "MultiLineString"], type: "string" },
            coordinates: {
              bsonType: "array",
              minItems: 1,
              items: {
                bsonType: "array",
                minItems: 4,
                items: coordinateSchema,
              },
              description:
                "Any array of linear rings representing the geometry",
            },
          },
          additionalProperties: false,
        },
        // MultiPolygon
        {
          properties: {
            type: { enum: ["MultiPolygon"], type: "string" },
            coordinates: {
              bsonType: "array",
              minItems: 1,
              items: {
                bsonType: "array",
                minItems: 1,
                items: {
                  bsonType: "array",
                  minItems: 4,
                  items: coordinateSchema,
                },
              },
              description: "Any array of polygons representing the geometry",
            },
          },
          additionalProperties: false,
        },
      ],
    },
  },
  additionalProperties: false,
};

db.createCollection("logs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      title: "log object validation",
      required: ["_id", "weatherReading"],
      properties: {
        _id: {
          bsonType: "objectId",
        },
        deletedAt: {
          bsonType: "date",
          description: "The current timestamp when the document is deleted",
        },
        deletedBy: {
          bsonType: ["objectId", "null"],
          description: "User objectId refer to who deleted the document",
        },
        weatherReading: weatherSchema,
      },
      additionalProperties: false,
    },
  },
  validationLevel: "strict",
  validationAction: "error",
});
