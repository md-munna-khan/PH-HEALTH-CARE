# Reviews-Patient-Health-data-account-management
GitHub Repo:  https://github.com/Apollo-Level2-Web-Dev/ph-health-care-server/tree/part-8



ERD: https://drive.google.com/file/d/1x7Bi_oiIAUjNGINIz3rUYaXUUBvAduEs/view?usp=sharing

## 63-1 Designing Review, Patient Health Data, and Medical Report Schemas & Creating Review

![alt text](image-21.png)

- review.routes.ts 

```ts 
import { UserRole } from '@prisma/client';
import express from 'express';
import auth from '../../middlewares/auth';
import { ReviewController } from './review.controller';
const router = express.Router()


router.post("/",
    auth(UserRole.PATIENT),
    ReviewController.insertIntoDB
)

export const ReviewRoutes = router;


```
- review.controller.ts 

```ts 
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { IJWTPayload } from "../../types/common";
import sendResponse from "../../shared/sendResponse";
import httpStatus from 'http-status';
import { ReviewService } from "./review.service";

const insertIntoDB = catchAsync(async(req:Request &{user?:IJWTPayload}, res:Response) =>{
    const user = req.user
    const result = await ReviewService.insertIntoDB(user as IJWTPayload, req.body)

    sendResponse(res, {
        statusCode : httpStatus.OK,
        success: true,
        message : "Review Created Successfully",
        data : result
    })
})

export const ReviewController ={
    insertIntoDB
} 
```
- review.service.ts 

```ts 
import ApiError from "../../errors/ApiError"
import { prisma } from "../../shared/prisma"
import { IJWTPayload } from "../../types/common"
import httpStatus from 'http-status';

const insertIntoDB = async (user: IJWTPayload, payload: any) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email
        }
    })

    const appointmentData = await prisma.appointment.findFirstOrThrow({
        where: {
            id: payload.appointmentId
        }
    })

    if (patientData.id !== appointmentData.patientId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "This is Not Your Appointment")
    }

    
}

export const ReviewService = {
    insertIntoDB
} 
```

## 63-2 Creating Review – Part 2

- user.prisma

```prisma 
model Doctor {
    id                  String   @id @default(uuid())
    name                String
    email               String   @unique
    profilePhoto        String?
    contactNumber       String
    address             String
    registrationNumber  String
    experience          Int      @default(0)
    gender              Gender
    appointmentFee      Int
    qualification       String
    currentWorkingPlace String
    designation         String
    averageRating       Float    @default(0.0) // average rating added
    isDeleted           Boolean  @default(false)
    createdAt           DateTime @default(now())
    updatedAt           DateTime @updatedAt

    user User @relation(fields: [email], references: [email])

    doctorSchedules   DoctorSchedules[]
    doctorSpecialties DoctorSpecialties[]
    appointments      Appointment[]
    prescriptions     Prescription[]
    reviews           Review[]

    @@map("doctors")
}
```
- review.service.ts 

```ts 
import ApiError from "../../errors/ApiError"
import { prisma } from "../../shared/prisma"
import { IJWTPayload } from "../../types/common"
import httpStatus from 'http-status';

const insertIntoDB = async (user: IJWTPayload, payload: any) => {
    const patientData = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email
        }
    })

    const appointmentData = await prisma.appointment.findFirstOrThrow({
        where: {
            id: payload.appointmentId
        }
    })

    if (patientData.id !== appointmentData.patientId) {
        throw new ApiError(httpStatus.BAD_REQUEST, "This is Not Your Appointment")
    }

    return await prisma.$transaction(async (tnx) => {
        const result = await tnx.review.create({
            data: {
                appointmentId: appointmentData.id,
                doctorId: appointmentData.doctorId,
                patientId: appointmentData.patientId,
                rating: payload.rating,
                comment: payload.comment
            }
        });

        const avgRating = await tnx.review.aggregate({
            _avg: {
                rating: true
            },
            where: {
                doctorId: appointmentData.doctorId
            }
        })

        await tnx.doctor.update({
            where: {
                id: appointmentData.doctorId
            },
            data: {
                averageRating: avgRating._avg.rating as number
            }
        })

        return result
    })

}

export const ReviewService = {
    insertIntoDB
} 
```
## 63-3 Implementing Review Creation & Including Reviews in Data Retrieval

- postman 

```json 
{
    "appointmentId": "d37c4dda-be78-446a-b4d8-dbdad9f05bac",
    "rating": 4.8,
    "comment": "The Doctor is Bad"
}
```

- showing doctor reviews

- doctor.service.ts 

```ts 
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
            },
            reviews: {
                select: {
                    rating: true
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

const getByIdFromDB = async (id: string): Promise<Doctor | null> => {
    const result = await prisma.doctor.findUnique({
        where: {
            id,
            isDeleted: false,
        },
        include: {
            doctorSpecialties: {
                include: {
                    specialities: true,
                },
            },
            doctorSchedules: {
                include: {
                    schedule: true
                }
            },
            reviews: true
        },
    });
    return result;
};

```
## 63-4 Creating or Updating Patient Health Data – Part 1, 63-5 Creating or Updating Patient Health Data – Part 2
```prisma
model PatientHealthData {
    id                  String        @id @default(uuid())
    patientId           String        @unique
    patient             Patient       @relation(fields: [patientId], references: [id])
    gender              Gender
    dateOfBirth         String
    bloodGroup          BloodGroup
    hasAllergies        Boolean?      @default(false)
    hasDiabetes         Boolean?      @default(false)
    height              String
    weight              String
    smokingStatus       Boolean?      @default(false)
    dietaryPreferences  String?
    pregnancyStatus     Boolean?      @default(false)
    mentalHealthHistory String?
    immunizationStatus  String?
    hasPastSurgeries    Boolean?      @default(false)
    recentAnxiety       Boolean?      @default(false)
    recentDepression    Boolean?      @default(false)
    maritalStatus       MaritalStatus @default(UNMARRIED)
    createdAt           DateTime      @default(now())
    updatedAt           DateTime      @updatedAt

    @@map("patient_health_datas")
}

model MedicalReport {
    id         String   @id @default(uuid())
    patientId  String
    patient    Patient  @relation(fields: [patientId], references: [id])
    reportName String
    reportLink String
    createdAt  DateTime @default(now())
    updatedAt  DateTime @updatedAt

    @@map("madical_reports")
}

```

- if we are planning to do something like if we have field that will create data if not exist and if exists that will update we will use `upsert`

- patient.route.ts 
```ts
import express from 'express';
import { PatientController } from './patient.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.patch(
    '/',
    auth(UserRole.PATIENT),
    PatientController.updateIntoDB
);



export const PatientRoutes = router;
```

- patient.controller.ts 

```ts 
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import { patientFilterableFields } from './patient.constant';
import pick from '../../helper/pick';
import { PatientService } from './patient.service';
import sendResponse from '../../shared/sendResponse';
import { IJWTPayload } from '../../types/common';

const updateIntoDB = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const user = req.user;
    const result = await PatientService.updateIntoDB(user as IJWTPayload, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Patient updated successfully',
        data: result,
    });
});

export const PatientController = {
    updateIntoDB
};
```
- patient.service.ts 

```ts 
import { Patient, Prisma, UserStatus } from '@prisma/client';
import { IPatientFilterRequest } from './patient.interface';
import { IOptions, paginationHelper } from '../../helper/paginationHelper';
import { patientSearchableFields } from './patient.constant';
import { prisma } from '../../shared/prisma';
import { IJWTPayload } from '../../types/common';



// PatientHealthData, MedicalReport, patient

const updateIntoDB = async (user: IJWTPayload, payload: any) => {
    const { medicalReport, patientHealthData, ...patientData } = payload;

    const patientInfo = await prisma.patient.findUniqueOrThrow({
        where: {
            email: user.email,
            isDeleted: false
        }
    });

    return await prisma.$transaction(async (tnx) => {
        await tnx.patient.update({
            where: {
                id: patientInfo.id
            },
            data: patientData
        })

        if (patientHealthData) {
            await tnx.patientHealthData.upsert({
                where: {
                    patientId: patientInfo.id
                },
                update: patientHealthData,
                create: {
                    ...patientHealthData,
                    patientId: patientInfo.id
                }
            })
        }

        if (medicalReport) {
            await tnx.medicalReport.create({
                data: {
                    ...medicalReport,
                    patientId: patientInfo.id
                }
            })
        }

        const result = await tnx.patient.findUnique({
            where: {
                id: patientInfo.id
            },
            include: {
                patientHealthData: true,
                medicalReports: true
            }
        })
        return result;
    })



}

export const PatientService = {
    updateIntoDB
};
```

- postman 

```json 
{
    "name" : "Sazid", // update

    "medicalReport" :{ // create
        "reportName" : "Past Surgery 2",
        "reportLink" : "reportLink2"
    },
    "patientHealthData" :{ // create or update
        "gender" : "MALE",
        "dateOfBirth" : "20-01-1976",
        "bloodGroup" : "B_POSITIVE",
        "height" : "5 feet 8 inch",
        "weight" : "76kg"
    }
}
```
