import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode: number =err.statusCode|| httpStatus.INTERNAL_SERVER_ERROR;
  let success = false;
  let message = err.message || "Something went wrong!";
  let error = err;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code == "P2002") {
      (message = "Duplicate key error"),
        (error = error.meta),
        (statusCode = httpStatus.CONFLICT);
    }
    if (error.code == "P1000") {
      (message = "Authentication failed against database server!"),
        (error = error.meta),
        (statusCode = httpStatus.BAD_GATEWAY);
    }
    if (error.code == "P2003") {
      (message = "Foreign key constraint failed on the field!"),
        (error = error.meta),
        (statusCode = httpStatus.BAD_REQUEST);
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    message = "Validation Error";
    (error = error.message), (statusCode = httpStatus.BAD_REQUEST);
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    message = "Something Unknown Error Happened!";
    error = error.message;
    statusCode = httpStatus.BAD_REQUEST;
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    message = "Prisma Client Failed To Initialize!";
    error = error.message;
    statusCode = httpStatus.BAD_REQUEST;
  }

  res.status(statusCode).json({
    success,
    message,
    error,
  });
};

export default globalErrorHandler;