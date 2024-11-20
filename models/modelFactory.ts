// deno-lint-ignore-file no-explicit-any
import { Collection } from "mongodb";
import { AggregationBuilder } from "../utils/AggregationBuilder.ts";

export async function getPaginatedData<T>(
  collection: Collection<T>,
  query: Record<string, any> = {},
  limit: number = 10,
  page: number = 1,
  group?: Record<string, any>,
  project?: Record<string, any>
) {
  const matchCriteria = AggregationBuilder.parseQueryToMatch(query);
  const sortCriteria = AggregationBuilder.parseSort(query) || undefined;

  const aggregationBuilder = new AggregationBuilder()
    .match(matchCriteria)
    .sort(sortCriteria)
    .group(group)
    .project(project)
    .paginate(limit, page);

  const pipeline = aggregationBuilder.build();

  const result = await collection.aggregate(pipeline).toArray();

  const data = result[0]?.data || [];
  const totalCount = result[0]?.totalCount[0]?.totalCount || 0;

  const { totalPages, currentPage } = AggregationBuilder.calculatePagination(
    totalCount,
    limit,
    page
  );

  return { totalCount, totalPages, currentPage, data };
}
