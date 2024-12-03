const database = "tafe-weather-api";
use(database);
db; // "tafe-weather-api"
db.weathers
  .aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date("2020-12-07"),
          $lte: new Date("2021-05-31"),
        },
        deviceName: "woodford_sensor",
      },
    },
    {
      $sort: {
        humidity: -1,
        createdAt: -1,
      },
    },
    {
      $project: {
        deviceName: 1,
        createdAt: 1,
        humidity: 1,
        _id: 0,
      },
    },
    {
      $group: {
        _id: "$deviceName",
        max_humidity: {
          $max: "$humidity",
        },
        min_humidity: {
          $min: "$humidity",
        },
        avg_humidity: {
          $avg: "$humidity",
        },
        median_humidity: {
          $median: {
            input: "$humidity",
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
        humidity: {
          max: {
            value: "$max_humidity",
            deviceName: "$max_deviceName",
          },
          min: {
            value: "$min_humidity",
            deviceName: "$min_deviceName",
          },
          avg: "$avg_humidity",
          median: "$median_humidity",
        },
      },
    },
  ])
  .explain("executionStats");

db.weathers
  .aggregate(
    [
      {
        $match: {
          longitude: 152.77891,
          latitude: -26.95064,
          createdAt: {
            $gte: new Date("2020-12-07"),
            $lte: new Date("2021-05-07"),
          },
        },
      },
      {
        $project: {
          longitude: 1,
          latitude: 1,
          deviceName: 1,
          precipitation: 1,
          createdAt: 1,
          _id: 0,
        },
      },
      {
        $sort: {
          precipitation: -1,
          createdAt: -1,
        },
      },
      {
        $group: {
          // _id: "$geoLocation",
          _id: { longitude: "$longitude", latitude: "$latitude" },
          max_precipitation: {
            $max: "$precipitation",
          },
          min_precipitation: {
            $min: "$precipitation",
          },
          avg_precipitation: {
            $avg: "$precipitation",
          },
          median_precipitation: {
            $median: {
              input: "$precipitation",
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
          location: "$_id",
          precipitation: {
            max: {
              value: "$max_precipitation",
              deviceName: "$max_deviceName",
            },
            min: {
              value: "$min_precipitation",
              deviceName: "$min_deviceName",
            },
            avg: "$avg_precipitation",
            median: "$median_precipitation",
          },
        },
      },
    ]
    // {
    //   hint: {
    //     longitude: 1,
    //     latitude: 1,
    //     createdAt: -1,
    //     precipitation: -1,
    //   },
    // }
  )
  .explain("executionStats");
