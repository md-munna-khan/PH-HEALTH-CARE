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


## 58-5 Create Pagination Helper Function, 58-6 Apply Prisma Where Conditions for User Data Retrieval, 58-7 Overview of Metadata, Searching, Sorting, Filtering & Pagination

- helper -> pick.ts

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

  console.log(finalObject);

  return finalObject;
};

export default pick;
```

- helper -> paginationHelper.ts

```ts
type IOptions = {
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: string;
};

type IOptionsResult = {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
};
const calculatePagination = (options: IOptions): IOptionsResult => {
  const page: number = Number(options.page) || 1;
  const limit: number = Number(options.limit) || 10;
  const skip: number = Number(page - 1) * limit;

  const sortBy: string = options.sortBy || "createdAt";
  const sortOrder: string = options.sortOrder || "desc";

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
};

export const paginationHelper = {
  calculatePagination,
};
```

- user.constant.ts

```ts
export const userSearchableFields = ["email"];
export const userFilterableField = ["status", "role", "email", "searchTerm"];
```

- user.controller.ts

```ts
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../shared/sendResponse";
import pick from "../../helper/pick";
import { userFilterableField } from "./user.contant";

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  // common  -> page page, limit, sortBy, sortOrder, --> pagination, sorting
  // random -> fields , searchTerm --> searching, filtering

  // const filters = pick(req.query, ["status", "role", "email", "searchTerm"])

  // const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"])

  const filters = pick(req.query, userFilterableField);

  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);

  // const { page, limit, searchTerm, sortBy, sortOrder, role, status } = req.query
  const result = await UserService.getAllFromDB(filters, options);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User Retrieved Successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const UserController = {
  getAllFromDB,
};
```

- user.service.ts

```ts
import bcrypt from "bcryptjs";
import { createPatientInput } from "./user.interface";
import { prisma } from "../../shared/prisma";
import { Request } from "express";
import { fileUploader } from "../../helper/fileUploader";
import { Admin, Doctor, Prisma, UserRole } from "@prisma/client";
import { paginationHelper } from "../../helper/paginationHelper";
import { userSearchableFields } from "./user.contant";

const getAllFromDB = async (params: any, options: IOptions) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = params;

    const andConditions: Prisma.UserWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: userSearchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    }

    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: (filterData as any)[key]
                }
            }))
        })
    }

    const whereConditions: Prisma.UserWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {}

    const result = await prisma.user.findMany({
        skip,
        take: limit,

        where: whereConditions,
        orderBy: {
            [sortBy]: sortOrder
        }
    });

    const total = await prisma.user.count({
        where: whereConditions
    });
    return {
        meta: {
            page,
            limit,
            total
        },
        data: result
    };
}

export const UserService = {
  getAllFromDB,
};
```
## 58-8 Implement Authentication Middleware, 58-9 Debug and Fix Issues in Auth Middleware, 58-10 Final Fixes and Full Module Overview
- we will verify role from the decoded token and then we will let them see all users 
- install cookie parser 

```
npm i cookie-parser
```

```
npm i --save-dev @types/cookie-parser
```

- app.ts use of cookie parser 

```ts 
import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import config from './config';
import cookieParser from 'cookie-parser'

import router from './app/routes';

const app: Application = express();
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

//parser
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", router)


app.get('/', (req: Request, res: Response) => {
    res.send({
        message: "Server is running..",
        environment: config.node_env,
        uptime: process.uptime().toFixed(2) + " sec",
        timeStamp: new Date().toISOString()
    })
});


app.use(globalErrorHandler);

app.use(notFound);

export default app;
```
- middlewares -> auth.ts 

```ts 
import { NextFunction, Request, Response } from "express"
import { jwtHelper } from "../helper/jwtHelper";

const auth = (...roles: string[]) => {
    return async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
        try {
            const token = req.cookies.accessToken;

            if (!token) {
                throw new Error("You are Not Authorized!")
            }

            const verifyUser = jwtHelper.verifyToken(token, "abcd")

            req.user = verifyUser

            if (roles.length && !roles.includes(verifyUser.role)) {
                throw new Error("You are Not Authorized!")
            }

            next()

        } catch (error) {
            next(error)
        }
    }
}

export default auth
```
- helper -> jwtHelper.ts 

```ts 
import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
const generateToken = (payload: any, secret: Secret, expiresIn: string) => {
    //  generate access token 
    const token = jwt.sign(payload, secret, {
        algorithm: "HS256",
        expiresIn
    } as SignOptions
    )

    return token
}

const verifyToken = (token: string, secret: Secret) => {
    return jwt.verify(token, secret) as JwtPayload
}

export const jwtHelper = {
    generateToken,
    verifyToken
}
```
- user.route.ts 

```ts 
import express, { NextFunction, Request, Response } from 'express'
import { UserController } from './user.controller'
import { fileUploader } from '../../helper/fileUploader'
import { UserValidation } from './user.validation'
import { UserRole } from '@prisma/client'
import auth from '../../middlewares/auth'


const router = express.Router()

router.get("/", auth(UserRole.ADMIN), UserController.getAllFromDB)



export const UserRoutes = router 
```
- user.controller.ts 

```ts 
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../shared/sendResponse";
import pick from "../../helper/pick";
import { userFilterableFields } from "./user.constant";



const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
    // common  -> page page, limit, sortBy, sortOrder, --> pagination, sorting
    // random -> fields , searchTerm --> searching, filtering 

    // const filters = pick(req.query, ["status", "role", "email", "searchTerm"])

    // const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"])

    const filters = pick(req.query, userFilterableFields) // searching , filtering
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]) // pagination and sorting




    // const { page, limit, searchTerm, sortBy, sortOrder, role, status } = req.query
    const result = await UserService.getAllFromDB(filters, options)
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User Retrieved Successfully",
        meta: result.meta,
        data: result.data
    })
})



export const UserController = {
    getAllFromDB
}
```
- user.service.ts 

```ts 
import bcrypt from "bcryptjs";
import { createPatientInput } from "./user.interface";
import { prisma } from "../../shared/prisma";
import { Request } from "express";
import { fileUploader } from "../../helper/fileUploader";
import { Admin, Doctor, Prisma, UserRole } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { userSearchableFields } from "./user.constant";



const getAllFromDB = async (params: any, options: IOptions) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = params;

    const andConditions: Prisma.UserWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: userSearchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    }

    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: (filterData as any)[key]
                }
            }))
        })
    }

    const whereConditions: Prisma.UserWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {}

    const result = await prisma.user.findMany({
        skip,
        take: limit,

        where: whereConditions,
        orderBy: {
            [sortBy]: sortOrder
        }
    });

    const total = await prisma.user.count({
        where: whereConditions
    });
    return {
        meta: {
            page,
            limit,
            total
        },
        data: result
    };
}



export const UserService = {
    getAllFromDB
}
```