import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import config from './config';
import cron from 'node-cron';
import router from './app/routes';
import cookieParser from "cookie-parser"
import { PaymentController } from './app/modules/payment/payment.controller';
import { AppointmentService } from './app/modules/appointment/appointment.service';
const app: Application = express();
// for stripe webhook
app.post(
"/webhook",
  express.raw({ type: "application/json" }), // important for signature verification
  PaymentController.handleStripeWebhookEvent
);

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

//parser
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));


cron.schedule('* * * * *', () => {
 try {
    console.log("node cron called at",new Date())
    AppointmentService.cancelUnpaidAppointments()
 } catch (err) {
    console.error(err)
 }
});
// --- cron job (await + try/catch inside async callback) ---
cron.schedule('* * * * *', async () => {
  console.log("node cron called at", new Date());
  try {
    // await করুন, এবং ensure cancelUnpaidAppointments নিজের মধ্যে try/catch আছে
    await AppointmentService.cancelUnpaidAppointments();
  } catch (err) {
    // এখানে কখনোই uncaught রেখে দেবেন না — সব লগ করুন এবং প্রয়োজনীয় alert দিন
    console.error('Error while running cancelUnpaidAppointments cron:', err);
    // optional: send to Sentry / email / logging service
  }
});
// routes
app.use("/api/v1",router)

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