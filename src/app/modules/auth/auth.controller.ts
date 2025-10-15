import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";

import sendResponse from "../../shared/sendResponse";
import { authServices } from "./auth.service";
import { tr } from "zod/v4/locales";


const login = catchAsync(async (req:Request,res:Response)=>{
   const result = await authServices.login(req.body);
   const {accessToken,refreshToken,needPasswordChange}= result;
   res.cookie("accessToken",accessToken,{
    secure:true,
    httpOnly:true,
    sameSite:"none",
    maxAge:1000 * 60 * 60 
   })
   res.cookie("refreshToken",refreshToken,{
    secure:true,
    httpOnly:true,
    sameSite:"none",
    maxAge:1000 * 60 * 60 * 24 * 90
   })
   sendResponse(res,{
    statusCode:201,
    success:true,
    message:"Patient created successfully",
    data:{
        needPasswordChange
    }
   })
})

export    const AuthController = {
    login
}