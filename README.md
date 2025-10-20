# ERROR-HANDLING-VALIDATION-AND-DOCTOR-SPECIALTY-MANAGEMENT

Github Link : https://github.com/Apollo-Level2-Web-Dev/ph-health-care-server/tree/part-5

## 60-1 Prisma Error Handling – Part 1

- middlewares -> globalErrorHandlers.ts

```ts
import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  let success = false;
  let message = err.message || "Something went wrong!";
  let error = err;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code == "P2002") {
      (message = "Duplicate key error"), (error = error.meta);
    }
    if (error.code == "P1000") {
      (message = "Authentication failed against database server!"),
        (error = error.meta);
    }
    if (error.code == "P2003") {
      (message = "Foreign key constraint failed on the field!"),
        (error = error.meta);
    }
    if (error.code == "P2007") {
      (message = "Data validation error!"), (error = error.meta);
    }
  }

  res.status(statusCode).json({
    success,
    message,
    error,
  });
};

export default globalErrorHandler;
```