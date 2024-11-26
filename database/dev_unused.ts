export const findMaxPrecipitationByLocation = async (
  longitude: number,
  latitude: number,
  recentMonths: number
) => {
  try {
    const latestDate = await findLatestDateByLocation(longitude, latitude);
    const startDate = new Date(latestDate);
    startDate.setMonth(startDate.getMonth() - recentMonths);
    const result = await weathersColl
      .aggregate([
        {
          // Stage 1: Match docs for the specifc location and date range
          $match: {
            geoLocation: {
              $geoIntersects: {
                $geometry: {
                  type: "Point",
                  coordinates: [longitude, latitude],
                },
              },
            },
            createdAt: { $gte: startDate, $lte: latestDate },
          },
        },
        {
          // Stage 2: limit necessory fields
          $project: {
            deviceName: 1,
            createdAt: 1,
            precipitation: 1,
          },
        },
        {
          // Stage 3: group by geoLocation and find the max precipitation
          $group: {
            _id: "$geoLocation",
            maxPrecipitation: { $max: "$precipitation" },
            docs: {
              $push: {
                deviceName: "$deviceName",
                createdAt: "$createdAt",
                precipitation: "$precipitation",
              },
            },
          },
        },
        {
          // Stage 4: Filter docs matching the max precipation
          $project: {
            docs: {
              $filter: {
                input: "$docs",
                as: "doc",
                cond: { $eq: ["$$doc.precipitation", "$maxPrecipitation"] },
              },
            },
          },
        },

        // Step 5: Flattern the array of matching docs
        { $unwind: "$docs" },
        // Step 6: Replace the root with the matching docs fields
        { $replaceRoot: { newRoot: "$docs" } },
        // Step 7: sort the result by createdAt in desc
        { $sort: { createdAt: -1 } },
      ])
      .toArray();
    return result;
  } catch (error) {
    console.log(error);
  }
};
