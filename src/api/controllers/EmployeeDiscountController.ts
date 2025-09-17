import 'reflect-metadata';
import {
    Post,
    JsonController,
    UploadedFile,
    QueryParams,
    Get,
    Authorized,
    Body,
    UseBefore

} from 'routing-controllers';
import { getManager } from 'typeorm';
import { EmployeeDiscount } from '../models/EmployeeDiscount';
import { EmployeeDiscountClaim } from '../models/EmployeeDiscountClaim';
import { CheckCustomerMiddleware } from '../middlewares/checkTokenMiddleware';
@JsonController('/employee')
export class EmployeeDiscountController {
    constructor() {
    }


    @Post('/add-employee')
    @Authorized(['admin', 'create-customer'])
    public async addEmployee(@UploadedFile('file') files: any): Promise<any> {
        const csv = require("csvtojson");
        let b = files.originalname;
        if (files.mimetype == "text/csv" && b.substring(b.lastIndexOf("."), b.length) == ".csv") {
            const fileData = await csv().fromString((files.buffer).toString());
            const emRepo = getManager().getRepository(EmployeeDiscount)
            let empArray: any[] = []
            let allMobile:string[]=[]
            let allEmail:string[]=[]
            let allId:string[]=[]
            fileData.forEach((item: any) => {
                allMobile.push("'"+item["Mobile"]+"'")
                allEmail.push("'"+item["Email"]+"'")
                allId.push("'"+item["Employee ID"]+"'")
            }); 
            const allMobileString = allMobile
            const allEmailString = allEmail
            const allIdString = allId
            const result = await getManager().query(`select * from employee_discount where mobile_no IN (${allMobileString}) or employee_id IN (${allIdString}) or employee_email IN (${allEmailString})`)
            

            if(result.length>0){
                return {
                    status: 500,
                    message: "Records already available",
                    data: result
                }
        }else{
            fileData.forEach((element: any) => {
                empArray.push({
                    employeeId: element["Employee ID"],
                    mobileNo: element["Mobile"],
                    emaployeeName: element["Name"],
                    emaployeeEmail: element["Email"],
                    isActive: 1
                })
            });
            await emRepo.save(empArray)
            return {
                status: 200,
                message: "Successfully add " + empArray.length + " records"
            }
        }
        }
    }

    @Post('/update-employee')
    @Authorized(['admin', 'create-customer'])
    public async updateEmployee(@UploadedFile('file') files: any): Promise<any> {
        const csv = require("csvtojson");
        let b = files.originalname;
        if (files.mimetype == "text/csv" && b.substring(b.lastIndexOf("."), b.length) == ".csv") {
            const fileData = await csv().fromString((files.buffer).toString());
            const emRepo = getManager().getRepository(EmployeeDiscount)
            fileData.forEach(async (element: any) => {
                const active: any = (element["Active"].toUpperCase()) == 'YES' ? 1 : 0
                await emRepo.createQueryBuilder().update().set({ isActive: active })
                    .where('mobile_no=:mobileNo', { mobileNo: element["Mobile"] })
                    .andWhere('employee_id=:employeeId', { employeeId: element["Employee ID"] })
                    .execute()

            });
            return {
                status: 200,
                message: "Successfully update " + fileData.length + " records"
            }
        }
    }
    @Get('/download-employee')
    public async downloadEmployee(@QueryParams() query: any): Promise<any> {
        const emRepo = getManager().getRepository(EmployeeDiscount)
        const result = await emRepo.find({
            where: { isActive: query.active },
            select: ['employeeId', 'mobileNo', 'emaployeeName', 'emaployeeEmail', 'isActive']
        })
        return {
            status: 200,
            message: "Successfully download records",
            data: result
        }
    }

    @UseBefore(CheckCustomerMiddleware)
    @Get('/employee-details-by-mobile')
    public async employeeDetailsByMobile(@QueryParams() query: any): Promise<any> {
        const emRepo = getManager().getRepository(EmployeeDiscount)
        const result = await emRepo.findOne({
            where: [{ isActive: 1, mobileNo: query.mobileNo }, { isActive: 1, emaployeeEmail: query.email }],
        })
        let data: any
        if (result) {
            data = {
                status: 200,
                message: "Successfully records",
                data: result
            }
        } else {
            data = {
                status: 500,
                message: "record not found",
            }
        }
        return data
    }

    @Post('/employee-discount-claim-save')
    @Authorized()
    public async employeeDiscountClaimSave(@Body() payload: any) {
        const emRepo = getManager().getRepository(EmployeeDiscountClaim)
        await emRepo.save(payload)
        return {
            status: 200,
            message: "Success"
        }
    }
    @Get('/order-by-employee')
    @Authorized()
    public async orderByEmployee(): Promise<any> {
        const emRepo = getManager().getRepository(EmployeeDiscountClaim)
        const result = await emRepo.createQueryBuilder('edc')
            .select(['ed.employee_id employeeId, ed.mobile_no mobileNo, ed.employee_name employeeName, edc.order_prefix_id orderId, edc.order_amount orderAmount, edc.discount_amount discountAmount, edc.coupon_name couponName'])
            .innerJoin(EmployeeDiscount, 'ed', 'edc.employee_mobile_no=ed.mobile_no')
            .execute()
        return {
            status: 200,
            message: "Successfully download records",
            data: result
        }
    }
}
