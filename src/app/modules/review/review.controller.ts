



import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { IJWTPayload } from "../../types/common";
import sendResponse from "../../shared/sendResponse";
import { ReviewService } from "./review.service";


const insertIntoDB = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const user = req.user;
    const result = await ReviewService.insertIntoDB(user as IJWTPayload,req.body)

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Prescription created successfully!",
        data: result
    })
})


export const ReviewController = {
   insertIntoDB
}