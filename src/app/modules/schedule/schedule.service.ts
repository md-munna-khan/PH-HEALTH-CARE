import { addHours, addMinutes, format } from "date-fns";
import { prisma } from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { Prisma } from "@prisma/client";

const insertIntoDB = async (payload:any)=>{
const {startTime,endtime,startDate,endDate}=payload;
const intervalTime = 30
const schedules = []
const currentDate = new Date(startDate)
const lastDate= new Date(endDate);

while(currentDate <= lastDate){
    const startDateTime = new Date(
     addMinutes(
           addHours(
            `${format(currentDate,"yyyy-MM-dd")}`,
            Number(startTime.split(":")[0])
        ),
           Number(startTime.split(":")[1])
     )
    )
    const endDateTime = new Date(
     addMinutes(
           addHours(
            `${format(currentDate,"yyyy-MM-dd")}`,
            Number(endtime.split(":")[0])
        ),
           Number(endtime.split(":")[1])
     )
    )

    while(startDateTime < endDateTime){
        const slotStartDatetime = startDateTime // 10:30
        const slotEndDatetime = addMinutes(startDateTime,intervalTime)//10:30
        const scheduleData={
            startDateTime:slotStartDatetime,
            endDateTime:slotEndDatetime
        }
        const existingSchedule = await prisma.schedule.findFirst({
            where:scheduleData
        })

        if(!existingSchedule){
            const result = await prisma.schedule.create({
            data:scheduleData
            });
            schedules.push(result)
        }

        slotStartDatetime.setMinutes(slotStartDatetime.getMinutes()+ intervalTime)
    }
    currentDate.setDate(currentDate.getDate()+1)
}


    return schedules
    }

  const  schedulesForDoctor = async (
    options:IOptions,
    filters:any
)=>{
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
  const {startDateTime:filterStartDateTime,endDateTime:filterEndDateTime} = filters
 const andConditions: Prisma.ScheduleWhereInput[] = [];
 if(filterStartDateTime && filterEndDateTime){
    andConditions.push({
        AND:[{
            startDateTime:{
                gte:filterStartDateTime
            }
        },
        {
            endDateTime:{
                lte:filterEndDateTime
            }
        }
    ]
    })
 }
    const whereConditions: Prisma.ScheduleWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {}
const result = await prisma.schedule.findMany({
    where:whereConditions,
    skip,
    take:limit,
    orderBy:{
        [sortBy]:sortOrder
    }
});
const total = await prisma.schedule.count({
    where:whereConditions
});
  return {
        meta: {
            page,
            limit,
            total
        },
        data: result
    };

  }

const deleteScheduleFromDB=async (id:string)=>{
return await prisma.schedule.delete({
    where:{
        id
    }
})
}

export const ScheduleService={
    insertIntoDB,
    schedulesForDoctor,
    deleteScheduleFromDB
}