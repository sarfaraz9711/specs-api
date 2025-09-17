// import moment from 'moment';
import 'reflect-metadata';
import { Get, JsonController, Post, Req, Res } from 'routing-controllers';
import { PaytmService } from '../../services/payment/PaytmService';
import {UnicommeService} from '../../services/admin/UnicomService'
import moment from 'moment';
import { getManager } from 'typeorm';
import { Order } from '../../models/Order';
import { PaytmOrder } from '../../models/Paytm/PaytmOrder';
@JsonController('/payment-paytm')
export class PaytmPaymentController {
    constructor(
        private _p: PaytmService,
        private _unicommeService: UnicommeService
    ) {
    }

    @Get('/secure/create-token')
    public async createToken(@Res() response: any): Promise<any> {

        // const accountSid = "AC2c862456c1f3c561145a3818575050b9";//process.env.TWILIO_ACCOUNT_SID;
        // const authToken = "88b1761a43f421c50f6fab51e4a2d08d";//process.env.TWILIO_AUTH_TOKEN;
        // const client = require('twilio')(accountSid, authToken,{
        //     lazyLoading: true
        // });

        // let _d = await client.messages
        //     .create({
        //         from: 'whatsapp:+14155238886',
        //         body: 'Your Yummy Cupcakes Company order of 1 dozen frosted cupcakes has shipped and should be delivered on July 10, 2019. Details: http://www.yummycupcakes.com/',
        //         to: 'whatsapp:+919015084307' 
        //     });
        //     //+13609269115

        //     return response.status(200).send(_d);


        // let c = moment().format('2022-10-19 HH:mm:ss');
        
        let _c = await this._p.createToken({
            "productDetails": [
                { price: 200 },
                { price: 300 },
                { price: 400 },
                { price: 500 },
                { price: 600 }
            ]
        }, "SPU-2022101351", 4, 5);
        return response.status(200).send(_c);
    }

    
        @Post('/paytm-webhook')
        public async paytmWebhook(@Req() req: any, @Res() res: any){
        if(req.body){
            try{
                const fs = require("fs");
                var logger = fs.createWriteStream('logs/paytmWebhook.txt', {
                   flags: 'a' // 'a' means appending (old data will be preserved)
                })
                var writeLine = (line) => logger.write(`\n${line}`);
                const currentDate = new Date();
                writeLine(`${JSON.stringify(req.body)} Date: ${moment(currentDate).format('YYYY-MM-DD HH:mm:ss')}`)
                try{
                const paytmResponse:any = req.body
                console.log("paytmResponse",paytmResponse)
                const orderTable:any = '`order`'
                const orderProduct:any = await getManager().query(`SELECT o.order_id orderId, op.order_status_id orderStatusId, op.sku_name skuName, op.product_price productPrice, op.discount_amount discountAmount, op.tax_value taxValue, op.quantity quantity from ${orderTable} o inner join order_product op on op.order_id =o.order_id where o.order_prefix_id='${paytmResponse.ORDERID}'`);
                console.log("orderProductorderProduct",orderProduct)
                const PaytmChecksum = require('paytmchecksum');
            const isVerifySignature = PaytmChecksum.verifySignature(paytmResponse, process.env.PAYTM_MERCHANT_KEY, paytmResponse.CHECKSUMHASH)
            console.log("isVerifySignatureisVerifySignatureisVerifySignature",isVerifySignature)
                if(paytmResponse.STATUS=='TXN_SUCCESS' && isVerifySignature){
                const orderRepository = getManager().getRepository(Order);
                const orderData: any = await orderRepository.findOne(orderProduct[0].orderId);
                const length:number= orderProduct.length
                let saleOrderItems:any[]=[]
                for(let i=0; i<length;i++){
                const productInformation:any = orderProduct[i]
                const skuName = productInformation.skuName
                console.log("productInformation.quantity",productInformation.quantity)
                for(let j=0; j<+productInformation.quantity; j++){
                saleOrderItems.push({
                    "itemSku": skuName,
                    "code": skuName+"-"+j,
                    "shippingMethodCode": "STD",
                    "totalPrice": Math.round(productInformation.productPrice),
                    "sellingPrice": Math.round(productInformation.productPrice),
                    'discount':Math.round(+productInformation.discountAmount+(productInformation.discountAmount*productInformation.taxValue/100)),
                    'packetNumber':0,
                    'prepaidAmount':0,
                    'giftWrap':false
                });
            }
            }
                orderData.paymentStatus = 1;
                orderData.paymentProcess = 1;
                orderData.paymentFlag = 1;
                orderData.paymentType = 'paytm';
             await this._unicommeService.sendOrderToUC(orderData, saleOrderItems);
             const paytmOrderRepository = getManager().getRepository(PaytmOrder);
             const paytmDetail = await paytmOrderRepository.findOne({where: {orderId: orderData.orderId}});
            paytmDetail.responsePayload = JSON.stringify(paytmResponse);
            paytmDetail.status = 1;
            paytmDetail.paytmRefId = paytmResponse.TXNID;
            console.log("paytmDetail",paytmDetail)
            await paytmOrderRepository.save(paytmDetail);
        }else{
            await getManager().query(`UPDATE order_product op SET op.order_status_id=11 WHERE op.order_id=${orderProduct[0].orderId}`)
            await getManager().query(`UPDATE ${orderTable} o SET o.payment_process=0, o.payment_status=2, o.payment_remark='${paytmResponse.RESPMSG}', o.order_status_id=11 WHERE o.order_id=${orderProduct[0].orderId}`)
            await getManager().query(`UPDATE order_status_history oh SET oh.active=0 WHERE oh.order_id=${orderProduct[0].orderId}`)
        }
        return res.status(200).send({ response: "Payment Status synched successfully"});
        }catch(e){
            console.log("paytm webgook catch 1",e)
            return res.status(200).send({ response: "Something went wrong catch"});
        }
        }catch(e){
            console.log("paytm webgook catch 2",e)
            return res.status(200).send({ response: "Something went wrong"});
        }
    }else{
            console.log("paytm webgook else")
        return res.status(200).send({ response: "No Data Found"});
    }
        }
}
