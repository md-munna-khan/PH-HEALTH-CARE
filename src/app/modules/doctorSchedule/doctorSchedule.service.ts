import { prisma } from "../../shared/prisma"


const insertIntoDB = async (user:any,payload:any)=>{
const doctorData = await prisma.doctor.findUniqueOrThrow({
    where:{
        email:user.email
    }
});

return {user,payload}
    }

  
export const doctorScheduleService={
    insertIntoDB,
 
}