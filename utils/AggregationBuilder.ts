// deno-lint-ignore-file no-explicit-any
export class AggregationBuilder {
  private pipeline: any[] = [];
  // private limit: number = 10;
  // private page: number = 1;

  match(criteria: Record<string, any>) {
    this.pipeline.push({ $match: criteria });
    // if (Object.keys(criteria).length > 0) {
    // }
    return this;
  }

  group(grouping: Record<string, any>) {
    this.pipeline.push({ $group: grouping });
    return this;
  }

  sort(sortCriteria: Record<string, 1 | -1>) {
    this.pipeline.push({ $sort: sortCriteria });
    return this;
  }

  project(projection: Record<string, any>) {
    this.pipeline.push({ $project: projection });
    return this;
  }

  set(fields: Record<string, any>) {
    this.pipeline.push({ $set: fields });
    return this;
  }

  unset(fields: string[]) {
    this.pipeline.push({ unset: fields });
    return this;
  }

  paginate(limit: number, page: number) {
    // this.limit = limit > 0 ? limit : 10;
    // this.page = page > 0 ? page : 1;

    const skip = (page - 1) * limit;

    const paginationFacet = {
      totalCount: [{ $count: "totalCount" }],
      data: [{ $skip: skip }, { $limit: limit }],
    };
    this.pipeline.push({ $facet: paginationFacet });
    return this;
  }

  static parseQueryToMatch(query: Record<string, any>) {
    const matchCriteria: Record<string, any> = {};

    for (const key in query) {
      // skip pagination and sort-related keys
      if (key === "limit" || key === "page" || key.startsWith("sort[")) {
        continue;
      }

      matchCriteria[key] = query[key];
    }

    return matchCriteria;
  }

  static calculatePagination(totalCount: number, limit: number, page: number) {
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = Math.min(page, totalPages);

    return { totalPages, currentPage };
  }

  static parseSort(query: Record<string, any>) {
    const sortCriteria: Record<string, 1 | -1> = {};

    for (const key in query) {
      if (key.startsWith("sort[")) {
        // extract field name from `sort[field]`
        const field = key.slice(5, -1);
        const order = parseInt(query[key], 10);
        if (order === 1 || order === -1) {
          sortCriteria[field] = order;
        }
      }
    }
    return sortCriteria;
  }

  build(): any[] {
    return this.pipeline;
  }
}
