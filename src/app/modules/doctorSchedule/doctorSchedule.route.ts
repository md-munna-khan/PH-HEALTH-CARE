import express from "express"
import { doctorScheduleController } from "./doctorSchedule.controller"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"
import validateRequest from "../../middlewares/validateRequest"
import { DoctorScheduleValidation } from "./doctorSchedule.Validation"

const router = express.Router()

router.post(
    "/",
    auth(UserRole.DOCTOR),
    validateRequest(DoctorScheduleValidation.createDoctorScheduleValidationSchema),
    doctorScheduleController.insertIntoDB
)

export const doctorSchedulerRoutes =router