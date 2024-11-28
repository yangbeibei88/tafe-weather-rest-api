const database = "tafe-weather-api";
use(database);
db; // "tafe-weather-api"

db.weathers
  .aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date("2020-12-07"),
          $lte: new Date("2021-05-07"),
        },
        deviceName: "woodford_sensor",
      },
    },
    {
      $project: {
        deviceName: 1,
        createdAt: 1,
        humidity: 1,
      },
    },
    {
      $group: {
        _id: "$deviceName",
        min_humidity: {
          $min: "$humidity",
        },
        docs: {
          $push: {
            deviceName: "$deviceName",
            createdAt: "$createdAt",
            humidity: "$humidity",
          },
        },
      },
    },
    {
      $project: {
        docs: {
          $filter: {
            input: "$docs",
            as: "doc",
            cond: {
              $eq: ["$$doc.humidity", "$min_humidity"],
            },
          },
        },
      },
    },
    {
      $unwind: "$docs",
    },
    {
      $replaceRoot: {
        newRoot: "$docs",
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $limit: 5,
    },
  ])
  .explain("executionStats");
