# Be an Industry-Standard Fullstack Fusionist

Starter Pack: https://github.com/Apollo-Level2-Web-Dev/ph-health-care-server/tree/main



Part-1 : https://github.com/Apollo-Level2-Web-Dev/ph-health-care-server/tree/part-1


## Project Foundation and Database Setup

## 56-1 Introduction to the “PH Health Care” Project
![alt text](image.png)

## 56-2 Requirement Analysis – Part 1
![alt text](image-1.png)

## 56-3 Requirement Analysis – Part 2
![alt text](image-2.png)

## 56-4 Requirement Analysis – Part 3
![alt text](image-3.png)

## 56-6 Setting up Prisma in the Starter Pack
 - install prisma
 ```
 npm add -D prisma

 ```
- install prisma client
```
npm install @prisma/client
```
- prisma init
```
npx prisma init
```
- schema.prisma
```ts
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
- set up Your env
- add postgres database url
```
DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"
```
-migrate
```
npx prisma migrate dev