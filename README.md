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
## 60-2 Prisma Error Handling – Part 2

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
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
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
```
## 60-3 Implementing ApiError Handling

- middlewares -> globalErrorHandlers.ts

```ts
class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string | undefined, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
```

- app -> errors -> ApiError.ts

```ts
class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string | undefined, stack = "") {
    super(message);
    this.statusCode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
```

```ts
if (!isCorrectPassword) {
  throw new ApiError(httpStatus.BAD_REQUEST, "Password Incorrect");
}
```
## 60-4 Applying Zod Validations

- doctorschedule.routes.ts

```ts
import express from "express";
import { DoctorScheduleController } from "./doctorSchedule.controller";
import { UserRole } from "@prisma/client";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { DoctorScheduleValidation } from "./doctorSchedule.validation";
const router = express.Router();

router.post(
  "/",
  auth(UserRole.DOCTOR),
  validateRequest(
    DoctorScheduleValidation.createDoctorScheduleValidationSchema
  ),
  DoctorScheduleController.insertIntoDB
);

export const doctorScheduleRoutes = router;
```

- doctorSchedule.validation.ts

```ts
import z from "zod";

const createDoctorScheduleValidationSchema = z.object({
  body: z.object({
    scheduleIds: z.array(z.string()),
  }),
});

export const DoctorScheduleValidation = {
  createDoctorScheduleValidationSchema,
};
```
