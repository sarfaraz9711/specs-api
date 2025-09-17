import 'reflect-metadata';
import {
    Post, Get,
    JsonController,
    Res,
    Req,
    Param

} from 'routing-controllers';
import { LoyaltyPointService } from '../services/LoyaltyPointService';
import { LoyaltyPoint } from '../models/LoyaltyPoint';
import { CommonService } from "../common/commonService";
import { MLoyalController } from './MLoyal/MLoyalController';
@JsonController('/loyalty-point')
export class LoyaltyPointController {
    constructor(private loyaltyPointService: LoyaltyPointService, private _m: CommonService,
        private _mLoyalController: MLoyalController
        ) {
    }
    // Create Enquiry
    /**
     * @api {post} /api/loyalty-point/save-point Save Loyalty Point API
     * @apiGroup LoyaltyPoint 
     * @apiParam (Request body) {String} redeemId redeemId
     * @apiParam (Request body) {String} balancePoints balancePoints
     * @apiParam (Request body) {String} pointsValue pointsValue
     * @apiParam (Request body) {String} redeemPoints redeemPoints
     * @apiParam (Request body) {String} referenceNo referenceNo
     * @apiParam (Request body) {String} orderId orderId
     * @apiParam (Request body) {String} status status
     * @apiParamExample {json} Input
     * {
     *      "redeemId" : "",
     *      "balancePoints" : "",
     *      "pointsValue" : "",
     *      "redeemPoints" : "",
     *      "referenceNo" : "",
     *      "orderId" : "",
     *      "status" : ""
     *      
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Saved Point.",
     *      "status": "1"
     *      "data" : {}
     * }
     * @apiSampleRequest /api/loyalty-point/save-point
     * @apiErrorExample {json} savePoint error
     * HTTP/1.1 500 Internal Server Error
     */

    @Post('/save-point')
    public async savePoint(@Req() request: any, @Res() response: any): Promise<any> {
        let loyaltyPoint = new LoyaltyPoint();
        loyaltyPoint=request.body
        const result = await this.loyaltyPointService.create(loyaltyPoint);
        if (result) {
            return response.status(200).send(await this._m.getMessage(200, result, "Point saved successfully"));
        } else {
            return response.status(200).send(await this._m.getMessage(500, "", "Point not saved"));
        }
    }

    @Get('/get-point-by-key/:key')
    public async getPointByKey(@Param('key') key: string,  @Res() response: any): Promise<any> {
        const result = await this.loyaltyPointService.findOne({where: { referenceNo:key}}) 
        if(result){
            return response.status(200).send(await this._m.getMessage(200, result, "Get Point successfully"));   
        }else{
            return response.status(500).send(await this._m.getMessage(500, null, "Data not found"));   
        }
    }

    @Get('/reverse-point/:key')
    public async updateStatus(@Param('key') key: string, @Res() response: any, updateValue: any,): Promise<any> {
        let keyValue:string = key?key:updateValue.key; 
        let result = await this.loyaltyPointService.findOne({where: { referenceNo:keyValue}}) 
        result.status=key?"REVERSE":updateValue.status
        result.orderId=key?"":updateValue.orderId
            const result1 = await this.loyaltyPointService.update(result);
            if(key){
            if(result1.affected){
                return response.status(200).send(await this._m.getMessage(200, result, "Point updated Successfully"));   
            }else{
                return response.status(500).send(await this._m.getMessage(500, null, "Data not found"));   
            }
        }
    }

    @Get('/reverse-point-scheduler')
    public async reversePointsScheduler(){
        const allPendingPoints = await this.loyaltyPointService.find({
            where:[{orderId:'',status: "Pending"}, {orderId:null,status: "Pending"}]
        })
        allPendingPoints.forEach(async (element:any) => {
            const reversePointJson={
                "objClass": {
                    "transaction_id": element.referenceNo
                }
            }
            const result = await this._mLoyalController.reversePointByTransactionId(reversePointJson)
            const updateVaue = {
                "key":element.referenceNo,
                "orderId":element.orderId,
                "status":"REVERSE"
            }
            if(result.REVERSE_POINTS_BY_TRANSACTION_IDResult.Success){
                await this.updateStatus(null, null,updateVaue)
            }
        });
        return "Successfully reversed pending points"
    }

}
