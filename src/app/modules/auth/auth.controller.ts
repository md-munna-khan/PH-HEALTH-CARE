import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";

import sendResponse from "../../shared/sendResponse";
import { authServices } from "./auth.service";


const login = catchAsync(async (req:Request,res:Response)=>{
   const result = await authServices.login(req.body)
   sendResponse(res,{
    statusCode:201,
    success:true,
    message:"Patient created successfully",
    data:result
   })
})

export    const AuthController = {
    login
}