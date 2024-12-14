// @deno-types="npm:@types/express-serve-static-core@4.19.5"
import { Request, Response, NextFunction } from "express-serve-static-core";
import { asyncHandlerT } from "../middlewares/asyncHandler.ts";
import {
  deleteLogById,
  deleteLogs,
  getAllLogs,
  getLog,
} from "../models/LogModel.ts";
import { ClientError } from "../errors/ClientError.ts";

export const listLogsAction = asyncHandlerT(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const page = parseInt(req.query.page, 10) || 1;
    const defaultDateRange: Record<"deletedAt", string | object | Date> = {
      deletedAt: { gte: "2021-01-01" },
    };

    const defaultSort: Record<string, -1 | 1> = { deletedAt: -1 };

    const result = await getAllLogs(
      { ...defaultDateRange, ...req.query },
      limit,
      page,
      defaultSort
    );
    res.status(200).json({
      paging: {
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        limit,
      },
      result: result.data,
    });
  }
);

export const showLogAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const log = await getLog(req.params.id);

    if (!log) {
      return next(new ClientError({ code: 404 }));
    }

    res.status(200).json({
      result: log,
    });
  }
);

export const deleteLogByIdAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const result = await deleteLogById(req.params.id);

    if (!result?.deletedCount) {
      return next(
        new ClientError({
          code: 404,
          message: "No documents matched the query. Deleted 0 documents.",
        })
      );
    }

    res.status(204).json({
      result: {
        deletedCount: result.deletedCount,
      },
    });
  }
);

export const deleteLogsAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log(req.query);
    const result = await deleteLogs({ deletedAt: req.query.deletedAt });

    if (!result?.deletedCount) {
      return next(
        new ClientError({
          code: 404,
          message: "Logs not found in this date range.",
        })
      );
    }

    res.status(204).json({
      result: {
        deletedCount: result.deletedCount,
      },
    });
  }
);
