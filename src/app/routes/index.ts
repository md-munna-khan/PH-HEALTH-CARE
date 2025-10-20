import express from 'express';
import { userRoutes } from '../modules/user/user.route';
import { authRoutes } from '../modules/auth/auth.routes';
import { SchedulesRoutes } from '../modules/schedule/schedule.routes';
import { doctorSchedulerRoutes } from '../modules/doctorSchedule/doctorSchedule.route';



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
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;