import 'reflect-metadata';
import { JsonController, Post, Req, Res } from 'routing-controllers';
import { CommonService } from '../common/commonService';
import { PluginService } from '../services/PluginService';
@JsonController('/common-list')

export class CategoryController {
    constructor(
        private pluginService : PluginService,
        private _m : CommonService
    ){

    }


    // Get Payment Name API
    /**
     * @api {post} /api/common-list/get-payment-name Get Payment Name
     * @apiGroup Common Item
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} paymentId payment Id
     * @apiParamExample {json} Input
     * {
     *      "paymentId" : 12,
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully created new Category.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/add-category
     * @apiErrorExample {json} Category error
     * HTTP/1.1 500 Internal Server Error
     */

    @Post('/get-payment-name/:paymentId')
    public async getPaymentName(@Req() req:any, @Res() res:any):Promise<any>{
        let payId = req.params.paymentId;
        const plugin = await this.pluginService.findOne({ where: { id: payId } });

        if(plugin){
            return res.status(200).send(await this._m.getMessage(200,plugin));
        }else{
            return res.status(200).send(await this._m.getMessage(300));
        }
         
    }
}