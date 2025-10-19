
# Doctor-Schedule-Management

GitHub Link: https://github.com/Apollo-Level2-Web-Dev/ph-health-care-server/tree/part-4

## 59-1 Planning Schedule and Doctor Schedule Creation

![alt text](image-6.png)

- we want the time slot made by admin. 



- If we keep id and schedule in a table then the relation will be build. It like admin will add the schedule and that will be referenced from the schedule table to the doctors.
- The tables are doctor table, schedule table and doctorid+scheduleid table. 
- We will keep status for that the slot has been booked will never be available on that day. 

## 59-2 Writing Prisma Schema for Schedule and Doctor Schedule

![alt text](image-7.png)

- We will take start Time and end time and our system will make slot of 30 min for each patient 

- prisma -0> schema -> schedule.prisma

```prisma 
model Schedule {
    id              String            @id @default(uuid())
    startDateTime   DateTime
    endDateTime     DateTime
    createdAt       DateTime          @default(now())
    updatedAt       DateTime          @updatedAt
    doctorSchedules DoctorSchedules[]

    @@map("schedules")
}

model DoctorSchedules {
    doctorId   String
    doctor     Doctor   @relation(fields: [doctorId], references: [id])
    scheduleId String
    schedule   Schedule @relation(fields: [scheduleId], references: [id])
    isBooked   Boolean  @default(false)
    createdAt  DateTime @default(now())
    updatedAt  DateTime @updatedAt

    @@id([doctorId, scheduleId]) // composite primary key 
    // we have made primary key because these two needs to be different and because a doctor will not be able to see multiple patient at a time 
    @@map("doctor_schedules")
}
```
- user.prisma -> Doctor model 

```prisma
model Doctor {
  id                  String   @id @default(uuid())
  name                String
  email               String   @unique
  profilePhoto        String?
  contactNumber       String
  address             String
  registrationNumber  String
  experience          Int      @default(0)
  gender              Gender
  appointmentFee      Int
  qualification       String
  currentWorkingPlace String
  designation         String
  isDeleted           Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  user                User     @relation(fields: [email], references: [email])

  doctorSchedules DoctorSchedules[]

  @@map("doctors")
}
```

- A Doctor can have many Schedules.
- A Schedule can belong to many Doctors.