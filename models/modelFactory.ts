// deno-lint-ignore-file no-explicit-any
import { Collection, Document } from "mongodb";
import { AggregationBuilder } from "../utils/AggregationBuilder.ts";

export async function getPaginatedData<T extends Document>(
  collection: Collection<T>,
  query: Record<string, any> = {},
  limit: number = 10,
  page: number = 1,
  group?: Record<string, any>,
  project?: Record<string, any>
) {
  const aggregationBuilder = new AggregationBuilder(query);

  // const matchCriteria = AggregationBuilder.parseQueryToMatch(query);
  const sortCriteria = AggregationBuilder.parseSort(query) || undefined;

  const pipeline = aggregationBuilder
    .match()
    .sort(sortCriteria)
    .group(group)
    .project(project)
    .paginate(limit, page)
    .build();

  const result = await collection.aggregate(pipeline).toArray();

  const explain = await collection.aggregate(pipeline).explain();
  console.log(explain);

  const data = result[0]?.data || [];
  const totalCount = result[0]?.totalCount[0]?.totalCount || 0;

  const { totalPages, currentPage } = AggregationBuilder.calculatePagination(
    totalCount,
    limit,
    page
  );

  return { totalCount, totalPages, currentPage, data };
}

export async function getStatsData<T extends Document>(
  collection: Collection<T>,
  query: Record<string, any> = {},
  group?: Record<string, any>,
  project?: Record<string, any>
) {
  const aggregationBuilder = new AggregationBuilder(query);
}
