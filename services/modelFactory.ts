// deno-lint-ignore-file no-explicit-any
import { Collection, Document } from "mongodb";
import { AggregationBuilder } from "./AggregationBuilder.ts";

export async function getPaginatedData<T extends Document>(
  collection: Collection<T>,
  query: Record<string, any> = {},
  limit: number = 10,
  page: number = 1,
  sort?: Record<string, -1 | 1>,
  group?: Record<string, any>,
  project?: Record<string, any>
) {
  const aggregationBuilder = new AggregationBuilder(query);

  // const matchCriteria = AggregationBuilder.parseQueryToMatch(query);
  // sortCriteria is for dealing with sort in query param
  const sortCriteria = AggregationBuilder.parseSort(query) || undefined;

  const pipeline = aggregationBuilder
    .match()
    .sort({ ...sortCriteria, ...sort })
    .project(project)
    .group(group)
    .paginate(limit, page)
    .build();

  console.log(pipeline);

  const result = await collection.aggregate(pipeline).toArray();

  const explain = await collection.aggregate(pipeline).explain();
  console.log(explain);

  const data: T[] = result[0]?.data || [];
  const totalCount: number = result[0]?.totalCount[0]?.totalCount || 0;

  const { totalPages, currentPage } = AggregationBuilder.calculatePagination(
    totalCount,
    limit,
    page
  );

  return { totalCount, totalPages, currentPage, data };
}
