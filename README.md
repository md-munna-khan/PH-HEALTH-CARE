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
## 60-5 Overview & Implementation of Specialty and Doctor Specialty

![alt text](image.png)

- prisma/schema/specialty.prisma

```ts
model Specialties {
    id                String              @id @default(uuid())
    title             String
    icon              String
    doctorSpecialties DoctorSpecialties[]

    @@map("specialties")
}

model DoctorSpecialties {
    specialitiesId String
    specialities   Specialties @relation(fields: [specialitiesId], references: [id])

    doctorId String
    doctor   Doctor @relation(fields: [doctorId], references: [id])

    @@id([specialitiesId, doctorId])
    @@map("doctor_specialties")
}
```

- src/app/modules/specialties/specialties.controller.ts

```ts
import { Request, Response } from "express";
import httpStatus from "http-status";
import { SpecialtiesService } from "./specialties.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";

const inserIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await SpecialtiesService.inserIntoDB(req);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialties created successfully!",
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const result = await SpecialtiesService.getAllFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialties data fetched successfully",
    data: result,
  });
});

const deleteFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await SpecialtiesService.deleteFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialty deleted successfully",
    data: result,
  });
});

export const SpecialtiesController = {
  inserIntoDB,
  getAllFromDB,
  deleteFromDB,
};
```

- src/app/modules/specialties/specialties.routes.ts

```ts
import express, { NextFunction, Request, Response } from "express";
import { SpecialtiesController } from "./specialties.controller";
import { SpecialtiesValidtaion } from "./specialties.validation";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../helper/fileUploader";

const router = express.Router();

// Task 1: Retrieve Specialties Data

/**
- Develop an API endpoint to retrieve all specialties data.
- Implement an HTTP GET endpoint returning specialties in JSON format.
- ENDPOINT: /specialties
*/
router.get("/", SpecialtiesController.getAllFromDB);

router.post(
  "/",
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = SpecialtiesValidtaion.create.parse(JSON.parse(req.body.data));
    return SpecialtiesController.inserIntoDB(req, res, next);
  }
);

// Task 2: Delete Specialties Data by ID

/**
- Develop an API endpoint to delete specialties by ID.
- Implement an HTTP DELETE endpoint accepting the specialty ID.
- Delete the specialty from the database and return a success message.
- ENDPOINT: /specialties/:id
*/

router.delete(
  "/:id",
  auth(UserRole.ADMIN, UserRole.ADMIN),
  SpecialtiesController.deleteFromDB
);

export const SpecialtiesRoutes = router;
```

- src/app/modules/specialties/specialties.service.ts

```ts
import { Request } from "express";
import { fileUploader } from "../../helper/fileUploader";
import { prisma } from "../../shared/prisma";
import { Specialties } from "@prisma/client";

const inserIntoDB = async (req: Request) => {
  const file = req.file;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.icon = uploadToCloudinary?.secure_url;
  }

  const result = await prisma.specialties.create({
    data: req.body,
  });

  return result;
};

const getAllFromDB = async (): Promise<Specialties[]> => {
  return await prisma.specialties.findMany();
};

const deleteFromDB = async (id: string): Promise<Specialties> => {
  const result = await prisma.specialties.delete({
    where: {
      id,
    },
  });
  return result;
};

export const SpecialtiesService = {
  inserIntoDB,
  getAllFromDB,
  deleteFromDB,
};
```

- src/app/modules/specialties/specialties.validation.ts

```ts
import { z } from "zod";

const create = z.object({
  title: z.string({
    error: "Title is required!",
  }),
});

export const SpecialtiesValidation = {
  create,
};
```


![alt text](image-8.png)
## 60-6 Implementing Doctor Searching Functionality, 60-7 Fixing Errors in Doctor Searching, 60-8 Implementing Doctor Profile Update, 60-9 Creating & Deleting Doctor Specialties, 60-10 Filtering Doctors by Specialty and Task

- doctor.constant.ts 

```ts 
export const doctorFilterableFields = ["email", "contactNumber", "gender", "appointmentFee", "specialties", "searchTerm"]

export const doctorSearchableFields = ["name", "email", "contactNumber"]
```
- doctor.interface.ts 

```ts 
import { Gender } from "@prisma/client";

export type IDoctorUpdateInput = {
    email: string;
    contactNumber: string;
    gender: Gender;
    appointmentFee: number;
    name: string;
    address: string;
    registrationNumber: string;
    experience: number;
    qualification: string;
    currentWorkingPlace: string;
    designation: string;
    isDeleted: boolean;
    specialties: {
        specialtyId: string;
        isDeleted?: boolean;
    }[]
}
```
- doctor.routes.ts 

```ts 
import express from "express";
import { DoctorController } from "./doctor.controller";

const router = express.Router();

router.get(
    "/",
    DoctorController.getAllFromDB
)

router.patch(
    "/:id",
    DoctorController.updateIntoDB
)
export const DoctorRoutes = router;
```
- doctor.controller.ts 

```ts 
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { IJWTPayload } from "../../types/common";
import pick from "../../helper/pick";
import { DoctorService } from "./doctor.service";
import sendResponse from "../../shared/sendResponse";
import { doctorFilterableFields } from "./doctor.constant";

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const fillters = pick(req.query, doctorFilterableFields)

    const result = await DoctorService.getAllFromDB(fillters, options);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Doctor fetched successfully!",
        meta: result.meta,
        data: result.data
    })
})

const updateIntoDB = catchAsync(async (req: Request, res: Response) => {

    const { id } = req.params;

    const result = await DoctorService.updateIntoDB(id, req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Doctor updated successfully!",
        data: result
    })
})


export const DoctorController = {
    getAllFromDB,
    updateIntoDB
}
```
- doctor.service.ts 

```ts 
import { Doctor, Prisma } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";

import { prisma } from "../../shared/prisma";
import { doctorSearchableFields } from "./doctor.constant";
import { IDoctorUpdateInput } from "./doctor.interface";


const getAllFromDB = async (filters: any, options: IOptions) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
    const { searchTerm, specialties, ...filterData } = filters;

    const andConditions: Prisma.DoctorWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: doctorSearchableFields.map((field) => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    }

    // "", "medicine"
    if (specialties && specialties.length > 0) {
        andConditions.push({
            doctorSpecialties: {
                some: {
                    specialities: {
                        title: {
                            contains: specialties,
                            mode: "insensitive"
                        }
                    }
                }
            }
        })
    }

    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map((key) => ({
            [key]: {
                equals: (filterData as any)[key]
            }
        }))

        andConditions.push(...filterConditions)
    }

    const whereConditions: Prisma.DoctorWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.doctor.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            doctorSpecialties: {
                include: {
                    specialities: true
                }
            }
        }
    });

    const total = await prisma.doctor.count({
        where: whereConditions
    })

    return {
        meta: {
            total,
            page,
            limit
        },
        data: result
    }
}

const updateIntoDB = async (id: string, payload: Partial<IDoctorUpdateInput>) => {
    const doctorInfo = await prisma.doctor.findUniqueOrThrow({
        where: {
            id
        }
    });

    const { specialties, ...doctorData } = payload;

    return await prisma.$transaction(async (tnx) => {
        if (specialties && specialties.length > 0) {
            const deleteSpecialtyIds = specialties.filter((specialty) => specialty.isDeleted);

            for (const specialty of deleteSpecialtyIds) {
                await tnx.doctorSpecialties.deleteMany({
                    where: {
                        doctorId: id,
                        specialitiesId: specialty.specialtyId
                    }
                })
            }

            const createSpecialtyIds = specialties.filter((specialty) => !specialty.isDeleted);

            for (const specialty of createSpecialtyIds) {
                await tnx.doctorSpecialties.create({
                    data: {
                        doctorId: id,
                        specialitiesId: specialty.specialtyId
                    }
                })
            }

        }

        const updatedData = await tnx.doctor.update({
            where: {
                id: doctorInfo.id
            },
            data: doctorData,
            include: {
                doctorSpecialties: {
                    include: {
                        specialities: true
                    }
                }
            }

            //  doctor - doctorSpecailties - specialities 
        })

        return updatedData
    })


}

export const DoctorService = {
    getAllFromDB,
    updateIntoDB
}

```

```json 
{
    "name":"Dr.Munna",
    "specialties":[
        {
            "specialtyId":"f9f48fb3-9632-4381-b09b-f6e007ca2886",
            "isDeleted":false
        }
    ]
}
```