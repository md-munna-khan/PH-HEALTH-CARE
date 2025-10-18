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

## 58-3 Fetch All Users with Filtering, 58-4 Implement Pick Function for Query Parameters

- helpers -> pick.ts

```ts
const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Partial<T> => {
  console.log({ obj, keys });

  const finalObject: Partial<T> = {};

  for (const key of keys) {
    if (obj && Object.hasOwnProperty.call(obj, key)) {
      finalObject[key] = obj[key];
    }
  }

  // Object.hasOwnProperty.call(obj, key) checks safely if the obj has its own property key. Using call() avoids issues if obj has a custom hasOwnProperty method or if it was shadowed.Also ensures obj is not null or undefined.

  console.log(finalObject);

  return finalObject;
};

export default pick;
```

```ts
<T extends Record<string, unknown>>

T is a generic type parameter representing the type of the input object.

The constraint extends Record<string, unknown> means:

T must be an object whose keys are strings, and whose values can be anything (unknown).

K extends keyof T

K is another generic type parameter.

keyof T means all the keys of the object T.

So K must be one (or more) of the keys in T.

Parameters:

obj: T → the object you want to extract properties from.

keys: K[] → an array of property names (keys) you want to "pick" from obj.

Return type:

```

- user.controller.ts

```ts
const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  // common  -> page page, limit, sortBy, sortOrder, --> pagination, sorting
  // random -> fields , searchTerm --> searching, filtering

  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

  const { page, limit, searchTerm, sortBy, sortOrder, role, status } =
    req.query;
  const result = await UserService.getAllFromDB({
    page: Number(page),
    limit: Number(limit),
    searchTerm,
    sortBy,
    sortOrder,
    role,
    status,
  });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User Retrieved Successfully",
    data: result,
  });
});
```