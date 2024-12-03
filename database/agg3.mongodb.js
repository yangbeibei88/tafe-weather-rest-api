const database = "tafe-weather-api";
use(database);
db; // "tafe-weather-api"
db.weathers
  .aggregate(
    [
      {
        $match: {
          createdAt: {
            $gte: new Date("2020-12-07"),
            $lte: new Date("2021-05-07"),
          },
          deviceName: {
            $in: ["noosa_sensor", "woodford_sensor", "yandina_sensor"],
          },
        },
      },
      {
        $sort: {
          atmosphericPressure: -1,
          createdAt: -1,
        },
      },
      {
        $project: {
          deviceName: 1,
          createdAt: 1,
          atmosphericPressure: 1,
          _id: 0,
        },
      },
      {
        $group: {
          _id: "$deviceName",
          max_atmosphericPressure: {
            $max: "$atmosphericPressure",
          },
          min_atmosphericPressure: {
            $min: "$atmosphericPressure",
          },
          avg_atmosphericPressure: {
            $avg: "$atmosphericPressure",
          },
          median_atmosphericPressure: {
            $median: {
              input: "$atmosphericPressure",
              method: "approximate",
            },
          },
          max_createdAt: {
            $first: "$createdAt",
          },
          min_createdAt: {
            $last: "$createdAt",
          },
          max_deviceName: {
            $first: "$deviceName",
          },
          min_deviceName: {
            $last: "$deviceName",
          },
        },
      },
      {
        $project: {
          _id: 0,
          deviceName: "$_id",
          atmosphericPressure: {
            max: {
              value: "$max_atmosphericPressure",
              createdAt: "$max_createdAt",
              deviceName: "$max_deviceName",
            },
            min: {
              value: "$min_atmosphericPressure",
              createdAt: "$min_createdAt",
              deviceName: "$min_deviceName",
            },
            avg: {
              value: "$avg_atmosphericPressure",
            },
            median: {
              value: "$median_atmosphericPressure",
            },
          },
        },
      },
    ],
    { hint: { deviceName: 1, "$**": -1, createdAt: -1 } }
  )
  .explain("executionStats");
