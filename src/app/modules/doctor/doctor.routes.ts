

import express from "express";
import { DoctorController } from "./doctor.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
const router = express.Router();

router.get(
    "/",
    DoctorController.getAllFromDB
);

router.post("/suggestion", DoctorController.getAISuggestions);

router.get('/:id', DoctorController.getByIdFromDB);

router.patch(
    "/:id",
    auth(UserRole.ADMIN, UserRole.DOCTOR),
    DoctorController.updateIntoDB
);

router.delete(
    '/:id',
    auth(UserRole.ADMIN),
    DoctorController.deleteFromDB
);

router.delete(
    '/soft/:id',
    auth(UserRole.ADMIN),
    DoctorController.softDelete);



export const DoctorRoutes = router;