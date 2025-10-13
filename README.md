# Patient-Management-And-Authentication-Setup

## 57-1 Creating Patient (User) – Part 1
- app.ts 

```ts 
import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import config from './config';

import router from './app/routes';

const app: Application = express();
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

//parser
app.use(express.json());
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

- src -> app -> modules -> user.routes.ts 

```ts 
import express from 'express'
import { UserController } from './user.controller'

const router = express.Router()

router.post("/create-patient",UserController.createPatient )

export const UserRoutes = router 
```
- src -> app -> modules -> user.controller.ts 

```ts
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";

const createPatient = catchAsync(async (req: Request, res: Response) => {
    console.log("Patient Created! ", req.body)
})


export const UserController = {
    createPatient
}
```

## 57-1 Creating Patient (User) – Part 2
- user.routes.ts 

```ts 
import express from 'express';
import { UserRoutes } from '../modules/user/user.routes';


const router = express.Router();

const moduleRoutes = [
    {
        path: '/user',
        route: UserRoutes
    }
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;
```
- user.controller.ts 

```ts 
import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../shared/sendResponse";

const createPatient = catchAsync(async (req: Request, res: Response) => {
    console.log("Patient Created! ", req.body)
    const result = await UserService.createPatient(req.body)

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Patient Created Successfully",
        data: result
    })
})


export const UserController = {
    createPatient
}
```
- user.interface.ts 

```ts 
export type createPatientInput = {
    name : string,
    email : string
    password : string
}
```
- user.service.ts 

```ts 
import bcrypt from "bcryptjs";
import { createPatientInput } from "./user.interface";
import { prisma } from "../../shared/prisma";

const createPatient = async (payload: createPatientInput) => {
    const hashedPassword = await bcrypt.hash(payload.password, 10)

    const result = await prisma.$transaction(async (tnx) => {
        await tnx.user.create({
            data: {
                email: payload.email,
                password: hashedPassword
            }
        })

        return await tnx.patient.create({
            data: {
                name: payload.name,
                email: payload.email
            }
        })
    })

    return result
}

export const UserService = {
    createPatient
}
```