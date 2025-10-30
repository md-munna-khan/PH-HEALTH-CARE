# TASK-SCHEDULING-DASHBOARD-ANALYSIS-BONUS

https://github.com/Apollo-Level2-Web-Dev/ph-health-care-server/tree/part-9

https://github.com/Apollo-Level2-Web-Dev/rate-limiting


## 64-1 Designing Strategy to Cancel Unpaid Appointments

- The strategy will be like when we book an appointment we will get 30 minutes of time to complete the payment. If not paid withing the 30 minute the payment and the appointment will be deleted and the isBooked status will be false again. 

![alt text](image-23.png)

- basically we will create a cron job  using `node cron npm` that will call in every minute and check if unpaid and if 30 minute exceeded then will do the operation for the unpaid appointments. 

```
npm i node-cron
```
- install the node cron