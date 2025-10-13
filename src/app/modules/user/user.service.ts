import { prisma } from "../../shared/prisma";
import { createInputPatient } from "./user.insterface";
import bcrypt from "bcryptjs";
const createPatient = async (payload :createInputPatient)=>{
const hashedPassword = await bcrypt.hash(payload.password,10)

const result = await prisma.$transaction(async (tnx)=>{
    await tnx.user.create({
        data:{
            email:payload.email,
            password:hashedPassword
        }
    });
    return await tnx.patient.create({
        data:{
            name:payload.name,
            email:payload.email
        }
    })
})
return result

}
export const UserService ={
    createPatient
}