# TASK-SCHEDULING-DASHBOARD-ANALYSIS-BONUS

https://github.com/Apollo-Level2-Web-Dev/ph-health-care-server/tree/part-9

https://github.com/Apollo-Level2-Web-Dev/rate-limiting


## 64-1 Designing Strategy to Cancel Unpaid Appointments

- The strategy will be like when we book an appointment we will get 30 minutes of time to complete the payment. If not paid withing the 30 minute the payment and the appointment will be deleted and the isBooked status will be false again. 

![alt text](image-23.png)

- basically we will create a cron job  using `node cron npm` that will call in every minute and check if unpaid and if 30 minute exceeded then will do the operation for the unpaid appointments. 

```
npm i node-cron
```
- install the node cron

## 64-2 Implementing Task Scheduling with Node Cron

- appointment.service.ts 

```ts 
import { stripe } from "../../helper/stripe";
import { prisma } from '../../shared/prisma';
import { IJWTPayload } from "../../types/common";
import { v4 as uuidv4 } from 'uuid';
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { AppointmentStatus, PaymentStatus, Prisma, UserRole } from "@prisma/client";
import ApiError from "../../errors/ApiError";
import httpStatus from 'http-status'


const cancelUnpaidAppointments = async () => {
    const thirtyMinuteAgo = new Date(Date.now() - 30 * 60 * 1000)
    //  time prior 30 minute 

    // find the appointments that are unpaid and created thirty minute before
    const unPaidAppointments = await prisma.appointment.findMany({
        where: {
            createdAt: {
                lte: thirtyMinuteAgo
            },
            paymentStatus: PaymentStatus.UNPAID
        }
    })

    const appointmentIdsToCancel = unPaidAppointments.map(appointment => appointment.id);

    await prisma.$transaction(async (tnx) => {
        // delete the payment
        await tnx.payment.deleteMany({
            where: {
                appointmentId: {
                    in: appointmentIdsToCancel
                }
            }
        })

        // delete appointment 

        await tnx.appointment.deleteMany({
            where: {
                id: {
                    in: appointmentIdsToCancel
                }
            }
        })

        // update the isBooked Status 
        for (const unPaidAppointment of unPaidAppointments) {
            await tnx.doctorSchedules.update({
                where: {
                    doctorId_scheduleId: {
                        doctorId: unPaidAppointment.doctorId,
                        scheduleId: unPaidAppointment.scheduleId
                    }
                },
                data: {
                    isBooked: false
                }
            })
        }

    })
}

export const AppointmentService = {
    cancelUnpaidAppointments
};
```
## 64-3 Testing Unpaid Appointment Cancellations

- now lets use node cron to call the function in every minutes 

- as app.ts runs continuously so we have to do cronjob here.

 ```
# ┌────────────── second (optional)
 # │ ┌──────────── minute
 # │ │ ┌────────── hour
 # │ │ │ ┌──────── day of month
 # │ │ │ │ ┌────── month
 # │ │ │ │ │ ┌──── day of week
 # │ │ │ │ │ │
 # │ │ │ │ │ │
 # * * * * * *
 ```

- app.ts

```ts 
// added for cronjob - 5 start means it will call in every minute  
cron.schedule('* * * * *', () => {
    try {
        console.log('Node Cron called at', new Date());
        AppointmentService.cancelUnpaidAppointments()

    } catch (error) {
        console.log(error)
    }

});
// ___________________
```
- full app.ts 

```ts 
import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import config from './config';
import router from './app/routes';
import cookieParser from 'cookie-parser'
import { PaymentController } from './app/modules/payment/payment.controller';

import cron from 'node-cron';
import { AppointmentService } from './app/modules/appointment/appointment.service';


const app: Application = express();

app.post(
    "/webhook",
    express.raw({ type: "application/json" }),
    PaymentController.handleStripeWebhookEvent
);
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));

//parser
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


// added for cronjob - 5 start means it will call in every minute  
cron.schedule('* * * * *', () => {
    try {
        console.log('Node Cron called at', new Date());
        AppointmentService.cancelUnpaidAppointments()

    } catch (error) {
        console.log(error)
    }

});
// ___________________

app.use("/api/v1", router);

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
