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
# 57-3 Building File Upload Helper with Multer

- For Image Uploading we will use third party package named `cloudinary` with `multer`
- Install Multer

```
npm i multer
```

- install types for multer

```
npm i --save-dev @types/multer
```

- dummy multer functionality
- app -> helper -> fileUploader.ts

```ts
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/tmp/my-uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });
```
- Now Lets Fix this and optimize for our system. 

![alt text](image-5.png)

app -> helper -> fileUploader.ts

```ts
import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // cb(null, '/tmp/my-uploads')
        cb(null, path.join(process.cwd(), "/uploads")) //C:\Users\Sazid\my-project\uploads

    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

const upload = multer({ storage: storage })
```
- Now Install Cloudinary

```
npm install cloudinary
```
- app -> helper -> fileUploader.ts

```ts 
import multer from 'multer'
import path from 'path'
import { v2 as cloudinary } from 'cloudinary'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // cb(null, '/tmp/my-uploads')
        cb(null, path.join(process.cwd(), "/uploads")) //C:\Users\Sazid\my-project\uploads

    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

const upload = multer({ storage: storage })

// for cloudinary 
const uploadToCloudinary =  async (file : Express.Multer.File) =>{
    
}
```
![alt text](image-5.png)