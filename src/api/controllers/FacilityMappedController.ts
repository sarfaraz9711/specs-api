import 'reflect-metadata';
import {
    Post,
    JsonController,
    Get,
    Body,
    Authorized

} from 'routing-controllers';
import { getManager } from 'typeorm';
import { FacilityMap } from '../models/FacilityMap';

@JsonController('/facility')
export class FacilityMapController {
    facilityModel:any
    constructor() {
        this.facilityModel = getManager().getRepository(FacilityMap)
    }
  
@Post('/add')
@Authorized()
public async addData(@Body() data:any){
    const check = await this.facilityModel.find({where: {facilityCode:data.facilityCode}})
    let result:any
    let returnResult:any={}
    if(check.length==0 || data.id){
    result = await this.facilityModel.save(data)
    returnResult.data=result
    returnResult.status=200
    returnResult.message='save date Successfully'
    }else{
        returnResult.data=null
        returnResult.status=300
        returnResult.message='facility code already available'
    }
    return returnResult
}

@Get('/list')
@Authorized()
public async getList(){
    const result = await this.facilityModel.find()
    console.log("resultresult",result)
    return {
        status:200,
        message:'Get Data Successfully',
        data:result
    }
}

@Post('/update-order-facility')
@Authorized()
public async updateOrderFacilityCode(@Body() data:any){
    const facility = await this.facilityModel.findOne({where: {facilityCode:data.facilityCode}})
    await getManager().query(`UPDATE order_product SET facility_code = '${facility.facilityCode}' , facility_name = '${facility.facilityName}' WHERE order_product_id = ${data.orderProductId}`)

    return {
        status:200,
        message:'Successfully update the data',
        data:null
    }
}

}
