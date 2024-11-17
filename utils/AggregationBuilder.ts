export class AggregationBuilder {
  query: any;
  queryString: any;
  constructor(query: any, queryString: any) {
    // MongoDB query
    this.query = query;
    // queryString: req.query
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"] as const;
    excludedFields.forEach((item) => delete queryObj[item]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {}

  limitFields() {}

  paginate() {}
}
