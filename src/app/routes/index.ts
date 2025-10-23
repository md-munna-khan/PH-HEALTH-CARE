import express from 'express';
import { userRoutes } from '../modules/user/user.route';
import { authRoutes } from '../modules/auth/auth.routes';
import { SchedulesRoutes } from '../modules/schedule/schedule.routes';
import { doctorSchedulerRoutes } from '../modules/doctorSchedule/doctorSchedule.route';
import { SpecialtiesRoutes } from '../modules/specialties/specialties.routes';
import { DoctorRoutes } from '../modules/doctor/doctor.routes';
import { AppointmentRoutes } from '../modules/appointment/appointmnet.routes';
import { PrescriptionRoutes } from '../modules/prescription/prescription.routes';



const router = express.Router();

const moduleRoutes = [
 
    {
        path: '/user',
        route: userRoutes
    },
 
    {
        path: '/auth',
        route: authRoutes
    },
 
    {
        path: '/schedule',
        route: SchedulesRoutes
    },
    {
        path: '/doctor-schedule',
        route: doctorSchedulerRoutes
    },
    {
          path: '/specialties',
        route: SpecialtiesRoutes
    },
    {
          path: '/doctor',
        route: DoctorRoutes
    },
    {
          path: '/appointment',
        route: AppointmentRoutes
    },
    {
          path: '/prescription',
        route: PrescriptionRoutes
    },
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;