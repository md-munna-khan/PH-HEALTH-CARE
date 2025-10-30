import { PaymentStatus, UserRole } from "@prisma/client";
import { IJWTPayload } from "../../types/common";
import httpStatus from 'http-status'
import ApiError from "../../errors/ApiError";
import { prisma } from "../../shared/prisma";


const fetchDashboardMetaData = async (user: IJWTPayload) => {
let metadata;
switch(user.role){
    case UserRole.ADMIN:
        metadata ="admin metadata";
        break;
        case UserRole.DOCTOR:
            metadata = "doctor metadata"
            break;
            case UserRole.PATIENT:
                metadata = "patient metadata"
                break;
                default:
                    throw new ApiError(httpStatus.BAD_REQUEST,"Invalid user role")            
}
return metadata
};


const getAdminMetaData = async () => {
    const patientCount = await prisma.patient.count();
    const doctorCount = await prisma.doctor.count();
    const adminCount = await prisma.admin.count();
    const appointmentCount = await prisma.appointment.count()
    const paymentCount = await prisma.payment.count()
const totalRevenue = await prisma.payment.aggregate({
    _sum:{
        amount:true
    },
    where:{
        status:PaymentStatus.PAID
    }
})
  
}



export const MetaService = {
    fetchDashboardMetaData
}