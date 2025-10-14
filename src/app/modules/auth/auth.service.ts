import { UserStatus } from "@prisma/client"
import { prisma } from "../../shared/prisma"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { email } from "zod"

const login = async (payload:{ email:string,password:string})=>{
const user = await prisma.user.findUniqueOrThrow({
   where:{
      email:payload.email,
      status:UserStatus.ACTIVE
   }
})
const isCorrectPassword = await bcrypt.compare(payload.password,user.password);
if(!isCorrectPassword){
throw new Error("password is incorrect")
}
const accessToken =  jwt.sign({email:user.email,role:user.role},"abcd",{
   algorithm:"HS256",
   expiresIn:"1h"
});
const refreshToken =  jwt.sign({email:user.email,role:user.role},"abcd",{
   algorithm:"HS256",
   expiresIn:"90d"
});
return{
    accessToken,
refreshToken
}

}


 export const authServices={
    login
 }