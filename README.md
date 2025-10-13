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