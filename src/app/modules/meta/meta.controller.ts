import { Request, Response } from "express";
import { MetaService } from "./meta.service";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import { IJWTPayload } from "../../types/common";
import sendResponse from "../../shared/sendResponse";


const fetchDashboardMetaData = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {

    const user = req.user;
    const result = await MetaService.fetchDashboardMetaData(user as IJWTPayload);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Meta data retrival successfully!",
        data: result
    })
});

export const MetaController = {
    fetchDashboardMetaData
}