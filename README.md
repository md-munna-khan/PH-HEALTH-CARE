# USER-RETRIEVAL-QUERY-OPTIMIZATION-AND-AUTHENTICATION-MIDDLEWARE
## 58-1 Fetch All Users with Pagination

- user.routes.ts

```ts
import express, { NextFunction, Request, Response } from "express";
import { UserController } from "./user.controller";

const router = express.Router();

router.get("/", UserController.getAllFromDB);

export const UserRoutes = router;
```

- user.controller.ts

```ts
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../shared/sendResponse";

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const { page, limit } = req.query;
  const result = await UserService.getAllFromDB({
    page: Number(page),
    limit: Number(limit),
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User Retrieved Successfully",
    data: result,
  });
});

export const UserController = {
  getAllFromDB,
};
```

- user.service.ts

```
{{URL}}/user?limit=11&page=1
```

```ts
import bcrypt from "bcryptjs";

const getAllFromDB = async ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) => {
  const skip = (page - 1) * limit;
  const result = await prisma.user.findMany({
    skip,
    take: limit,
  });
  return result;
};

export const UserService = {
  getAllFromDB,
};
```

## 58-2 Fetch All Users with Searching and Sorting

```
{{URL}}/user?sortBy=createdAt&sortOrder=desc
```

- user.controller.ts

```ts
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../shared/sendResponse";

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const { page, limit, searchTerm, sortBy, sortOrder } = req.query;
  const result = await UserService.getAllFromDB({
    page: Number(page),
    limit: Number(limit),
    searchTerm,
    sortBy,
    sortOrder,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User Retrieved Successfully",
    data: result,
  });
});

export const UserController = {
  getAllFromDB,
};
```

- user.service.ts

```ts
import bcrypt from "bcryptjs";
import { prisma } from "../../shared/prisma";
import { Request } from "express";

const getAllFromDB = async ({
  page,
  limit,
  searchTerm,
  sortBy,
  sortOrder,
}: {
  page: number;
  limit: number;
  searchTerm?: any;
  sortBy: any;
  sortOrder: any;
}) => {
  const pageNumber = page || 1;
  const limitNumber = limit || 10;

  const skip = (pageNumber - 1) * limitNumber;
  const result = await prisma.user.findMany({
    skip,
    take: limitNumber,
    where: {
      email: {
        contains: searchTerm,
        mode: "insensitive",
      },
    },
    orderBy:
      sortBy && sortOrder
        ? {
            [sortBy]: sortOrder,
          }
        : {
            createdAt: "asc",
          },
  });
  return result;
};

export const UserService = {
  getAllFromDB,
};
```