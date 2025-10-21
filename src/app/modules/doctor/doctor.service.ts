

import { Doctor, Prisma } from "@prisma/client";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { doctorSearchableFields } from "./doctor.constant";
import { prisma } from "../../shared/prisma";

import { IDoctorUpdateInput } from "./doctor.interface";



const getAllFromDB = async (filters: any, options: IOptions) => {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options);
    const {searchTerm,specialties,...filterData}=filters
    const andConditions:Prisma.DoctorWhereInput[]=[]
   
  if(searchTerm){
andConditions.push({
        OR:doctorSearchableFields.map((field)=>({
[field]:{
    contains:searchTerm,
    mode:"insensitive"
}
    }))
})
  }
  if(Object.keys(filterData).length >0){
    const filterConditions = Object.keys(filterData).map((key)=>({
        [key]:{
            equals:(filterData as any)[key]
        }
    }))
    andConditions.push(...filterConditions)
  }
const whereConditions:Prisma.DoctorWhereInput=andConditions.length>0?{AND:andConditions}:{}

const result = await prisma.doctor.findMany({
    where:whereConditions,
    skip,
    take:limit,
    orderBy:{
        [sortBy]:sortOrder
    }
});
const total = await prisma.doctor.count({
    where:whereConditions
})
return{
    meta:{
        total,
        page,
        limit
    },
    data:result
}
}

const updateIntoDB = async(id:string,payload:Partial<IDoctorUpdateInput>)=>{
const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where:{
        id
    }
})

const {specialties,...doctorData}=payload;
if(specialties && specialties.length >0){
const deleteSpecialtyIds = specialties.filter((specialty)=>specialty.isDeleted)

for(const specialty of deleteSpecialtyIds){
    await prisma.doctorSpecialties.deleteMany({
        where:{
            doctorId:id,
            specialitiesId:specialty.specialtyId
        }
    })
}

const createSpecialtyIds = specialties.filter((specialty)=> !specialty.isDeleted)
for(const specialty of createSpecialtyIds){
    await prisma.doctorSpecialties.create({
        data:{
            doctorId:id,
            specialitiesId:specialty.specialtyId
        }
    })
}
}

const updateData = await prisma.doctor.update({
    where:{
        id:doctorInfo.id
    },
    data:doctorData,
    include:{
        doctorSpecialties:{
            include:{
                specialities:true
            }
        }
    }
    // doctor - doctorSpecialities - specialities - 
})
return updateData
}

export const DoctorService = {
    getAllFromDB,
    updateIntoDB
}
