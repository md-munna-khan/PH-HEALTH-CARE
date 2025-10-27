import { Patient, Prisma, UserStatus } from '@prisma/client';
import { IPatientFilterRequest } from './patient.interface';
import { IOptions, paginationHelper } from '../../helper/paginationHelper';
import { patientSearchableFields } from './patient.constant';
import { prisma } from '../../shared/prisma';
import { IJWTPayload } from '../../types/common';


const getAllFromDB = async (
    filters: IPatientFilterRequest,
    options: IOptions,
) => {
    const { limit, page, skip } = paginationHelper.calculatePagination(options);
    const { searchTerm, ...filterData } = filters;

    const andConditions = [];

    if (searchTerm) {
        andConditions.push({
            OR: patientSearchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: 'insensitive',
                },
            })),
        });
    }

    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map(key => {
                return {
                    [key]: {
                        equals: (filterData as any)[key],
                    },
                };
            }),
        });
    }
    andConditions.push({
        isDeleted: false,
    });

    const whereConditions: Prisma.PatientWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.patient.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : {
                    createdAt: 'desc',
                }
    });
    const total = await prisma.patient.count({
        where: whereConditions,
    });

    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
};

const getByIdFromDB = async (id: string): Promise<Patient | null> => {
    const result = await prisma.patient.findUnique({
        where: {
            id,
            isDeleted: false,
        },
    });
    return result;
};


const softDelete = async (id: string): Promise<Patient | null> => {
    return await prisma.$transaction(async transactionClient => {
        const deletedPatient = await transactionClient.patient.update({
            where: { id },
            data: {
                isDeleted: true,
            },
        });

        await transactionClient.user.update({
            where: {
                email: deletedPatient.email,
            },
            data: {
                status: UserStatus.DELETED,
            },
        });

        return deletedPatient;
    });
};

// PatientHealthData, MedicalReport, patient

const updateIntoDB= async (user:IJWTPayload,payload:any)=>{
    const {medicalReport,patientHealthData,...patientdData}=payload;

    const patientInfo =await prisma.patient.findUniqueOrThrow({
        where:{
            email: user.email,
            isDeleted:false
        }
    });
    await prisma.$transaction(async(tnx)=>{
        await tnx.patient.update({
            where:{
                id:patientInfo.id
            },
            data:patientdData
        })
    })

    
}

export const PatientService = {
    getAllFromDB,
    getByIdFromDB,
    softDelete,
    updateIntoDB
};