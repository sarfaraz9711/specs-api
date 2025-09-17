import 'reflect-metadata';
import {
    Post,
    JsonController,
    Get,
    Body,
    Param

} from 'routing-controllers';
import { getManager } from 'typeorm';
import { OrderStatusHistory } from '../models/OrderStatusHistory';
import moment from 'moment';
import { OrderStatus } from '../models/OrderStatus';
import { OrderCancelRequests } from '../models/OrderCancelRequests';
@JsonController('/order-status-history')
export class OrderStatusHistoryController {
    constructor() {}
  
@Post('/save')
public async saveOrderStatusHistory(@Body() data:any){
    const orderHistoryService =  getManager().getRepository(OrderStatusHistory)
    let resultJson:any={}
    try{
        const getResult = await orderHistoryService.findOne({where: {
            orderProductId:data.orderProductId,
            orderStatusId:data.orderStatusId,
        }})
        console.log("getResult",getResult)
        console.log(11111)
        if(data.orderStatusId==22 && false){
            await getManager().query(`UPDATE tm_order_return SET return_status = '2' WHERE order_product_id=${data.orderProductId}`)
        }
        if(!getResult || data.orderStatusId==9 || data.orderStatusId==6 || data.orderStatusId==10 || data.orderStatusId==21 || data.orderStatusId==22){
            console.log(2222)
        const result = await orderHistoryService.save(data)
        if(data.orderStatusId==9 || data.orderStatusId==6 || data.orderStatusId==10){
            console.log(3333)
            const status:any = data.orderStatusId==10?1:0 
                await getManager().query(`UPDATE order_status_history SET active=${status}, modified_date=DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 HOUR), INTERVAL 30 MINUTE) WHERE order_product_id=${data.orderProductId} AND order_status_id IN (4,12,19,20)`)
        }
        resultJson.status=200
        resultJson.message='Saved data successfully'
        resultJson.data=result
        }else{
            let orderStatusId:any
            if(data.orderStatusId==4 || data.orderStatusId==5){
                const jsonReplaceStatus:any= {
                 '4':'20',
                 '5':'19',
                 '32':'5,19'
                }
                const getResult = await orderHistoryService.findOne({where: {
                    orderProductId:data.orderProductId,
                    orderStatusId:jsonReplaceStatus[data.orderStatusId],
                    completed:0
                }})
                if(getResult){
                orderStatusId=data.orderStatusId==4?'4,20':'5,12'
                }else{
                orderStatusId=data.orderStatusId
                }
                if(data.orderStatusId==5 || data.orderStatusId==4){
                    const request:any={
                        active:0,
                        completed:0,
                        orderProductId:data.orderProductId,
                        orderStatusId:jsonReplaceStatus[data.orderStatusId],
                    }
                    this.updateOrderHistory(request)
                }
            }else{
                orderStatusId=data.orderStatusId
            }
            const request:any={
                active:data.active,
                completed:data.completed,
                orderProductId:data.orderProductId,
                orderStatusId:orderStatusId,
                actionDate: data.actionDate,
                statusCodeRemark:data.statusCodeRemark
            }
            if(getResult.completed==0){
            this.updateOrderHistory(request)
            }
        resultJson.status=200
        resultJson.message='Updated Data successfully'
        resultJson.data=null
        }
    }catch(err){
        const fs = require("fs");
        var logger = fs.createWriteStream('logs/saveOrderStatusHistory.txt', {
           flags: 'a' // 'a' means appending (old data will be preserved)
        })
        var writeLine = (line) => logger.write(`\n${line}`);
        const currentDate = new Date();
        writeLine(`${JSON.stringify(data)} Date: ${moment(currentDate).format('YYYY-MM-DD HH:mm:ss')}`)
        resultJson.status=500
        resultJson.message='Server Error'
        resultJson.data=null
    }
    console.log("resultJson",resultJson)
    return resultJson
}


public async updateOrderHistory(data:any){
    console.log("datadatadatadatadata2232",data)
    const actionDate:any = data.actionDate?data.actionDate:moment(new Date()).format('YYYY-MM-DD hh:mm:ss')
    const remark:any = data.statusCodeRemark?`'${data.statusCodeRemark}'`:null
    await getManager().query(`UPDATE order_status_history SET active=${data.active}, modified_date=DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 HOUR), INTERVAL 30 MINUTE), completed=${data.completed}, action_date='${actionDate}', status_code_remark=${remark} WHERE order_product_id in (${data.orderProductId}) AND order_status_id IN (${data.orderStatusId})`)
}

public async saveStatusHistory(orderId:any, orderPrefixId:any, orderProducts:any, length:number, orderStatusId:any, active:number, completed:number,date:number, statusCodeRemark?:any){
    console.log(orderId, orderPrefixId, orderProducts, length, orderStatusId, active, completed, date,statusCodeRemark)
    try{
    const orderStatusRep = getManager().getRepository(OrderStatus)
    const orderStatusName:any = await orderStatusRep.findOne(orderStatusId);
    let sequence:number=0
    if(orderStatusId==1 || orderStatusId==6 || orderStatusId==10){
        sequence=1
    }else if(orderStatusId==20){
        sequence=2
    }else if(orderStatusId==4 || orderStatusId==32 ){
        sequence=3
    }else if(orderStatusId==12 || orderStatusId==32){
        sequence=4
    }else if(orderStatusId==5 || orderStatusId==19){
        sequence=6
    }else if(orderStatusId==21 || orderStatusId==22 || orderStatusId==23 || orderStatusId==24 || orderStatusId==25 || orderStatusId==26 || orderStatusId==29 || orderStatusId==30 || orderStatusId==31|| orderStatusId==33 || orderStatusId==34 || orderStatusId==35 ){
        sequence=7
    }else if(orderStatusId==9){
        sequence=8
    }else if(orderStatusId==18){
        sequence=9
    }else if(orderStatusId==17){
        sequence=10
    }
    for(let i=0; i<length; i++){
        let dateSet:any
        if(date==1){
            dateSet=moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
        }else if(date==0){
            dateSet=null
        }else{
            dateSet=date
        }
        const requestJson:any = {
            orderId,
            orderPrefixId,
             orderProductId:orderProducts[i].orderProductId,
              orderStatusName:orderStatusName.name,
              orderStatusId,
              active,
              completed,
              sequence,
              actionDate:dateSet,
              statusCodeRemark
           }
           console.log("requestJson",requestJson)

        await this.saveOrderStatusHistory(requestJson)
    }
    }catch(error){
        const fs = require("fs");
        var logger = fs.createWriteStream('logs/saveStatusHistory.txt', {
           flags: 'a' // 'a' means appending (old data will be preserved)
        })
        var writeLine = (line) => logger.write(`\n${line}`);
        const currentDate = new Date();
        writeLine(`${JSON.stringify({orderId, orderPrefixId, orderProducts, length, orderStatusId, active, completed, date,statusCodeRemark})} Date: ${moment(currentDate).format('YYYY-MM-DD HH:mm:ss')}`)
        console.log("catch",error)
    }
}

@Get('/get-data-by-order-product-id/:orderProductId')
public async getDataByOrderProductId(@Param('orderProductId') orderProductId:any){
    const orderHistoryService =  getManager().getRepository(OrderStatusHistory)
    let resultJson:any={}
    try{
        const result = await orderHistoryService.createQueryBuilder('orderHistory')
  .where('orderHistory.orderProductId = :orderProductId', { orderProductId })
  .orderBy(`CASE WHEN orderHistory.orderStatusName = 'Expected Delivery' THEN 1 ELSE 0 END`, 'ASC')
  .addOrderBy('orderHistory.actionDate IS NULL', 'ASC')
  .addOrderBy('CAST(orderHistory.actionDate AS DATETIME(6))', 'ASC')
  .getMany();

        if(result.length>0){
            resultJson.status=200
            resultJson.message='Get data successfully'
            resultJson.data=result
        }else{
            resultJson.status=300
            resultJson.message='Data not found'
            resultJson.data=null
        }
    }catch{
        resultJson.status=500
        resultJson.message='Server Error'
        resultJson.data=null
    }


    return resultJson
}

@Get('/get-cancel-request-by-order-id/:orderId')
public async getCancelRequestByOrderId(@Param('orderId') orderId:any){
    const orderCancelRequestRepo = getManager().getRepository(OrderCancelRequests);
    const result = await orderCancelRequestRepo.find({where:{orderId}})    
    return {
        status:200,
        message:'Get Data Successfully',
        data:result
    }
}

}
