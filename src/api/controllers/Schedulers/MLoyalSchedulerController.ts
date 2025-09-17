import 'reflect-metadata';
import { Get, JsonController, Req, Res } from 'routing-controllers';
import { OrderProduct } from '../../models/OrderProduct';
import { In, IsNull, MoreThan, getManager } from 'typeorm';
import { Order } from '../../models/Order';
import moment from 'moment';

@JsonController('/mloyalscheduler')
export class MLoyalSchedulerController {

    @Get('/push-all-order-billing-data')
    public async pushOrderBillingData(@Req() req: any, @Res() res: any): Promise<any> {
        let userId = process.env.USER_ID;
        let password = process.env.MLOYAL_PASSWORD;
        const axios = require('axios')
        const orderRepo = getManager().getRepository(Order)
        const orders = await orderRepo.find({
            where: { sentOnMloyal: IsNull(), orderStatusId: In(["1", "4", "12"]), sentOnUc: 1, createdDate:MoreThan('2024-09-01')}
        });
        const ordersLength = orders.length;
        let orderSyncedCount = 0;
        if (orders && ordersLength > 0) {

            const fs = require("fs");
            var logger = fs.createWriteStream('logs/mLoyalOrderSendData.txt', {
               flags: 'a' // 'a' means appending (old data will be preserved)
            })
            var writeLine = (line) => logger.write(`\n${line}`);
            let timeString = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            for (let i = 0; i < ordersLength; i++) {
                const dateObj = new Date(orders[i].createdDate);
                const billDate = `${dateObj.getFullYear()}-${('0' + (dateObj.getMonth() + 1)).slice(-2)}-${('0' + dateObj.getDate()).slice(-2)}`;
                const billTime = `${dateObj.getFullYear()}-${('0' + (dateObj.getMonth() + 1)).slice(-2)}-${('0' + dateObj.getDate()).slice(-2)} ${('0' + dateObj.getHours()).slice(-2)}:${('0' + dateObj.getMinutes()).slice(-2)}:${('0' + dateObj.getSeconds()).slice(-2)}`;
                //bill_grand_total = With Tax Amount
                //bill_gross_amount = Without Tax Amount
                //bill_net_amount same as bill_grand_total
 
          
                let payloadData = {
                    "objClass": [
                        {
                            "store_code": "ONLINE",
                            "bill_transaction_type": "Sale",
                            "bill_date": billDate,
                            "bill_no": orders[i].orderPrefixId,
                            "bill_grand_total": orders[i].total.toString(),
                            "bill_discount": orders[i].discountAmount ? orders[i].discountAmount.toString() : "0",
                            "bill_tax": "0",
                            "bill_gross_amount": orders[i].total.toString(),
                            "bill_net_amount": orders[i].total.toString(),
                            "bill_tender_type": "Cash",
                            "bill_time": billTime,
                            "bill_status": "New",
                            "bill_transcation_no": `${orders[i].paymentType}-${orders[i].orderPrefixId}`,
                            "customer_fname": orders[i].shippingFirstname,
                            "customer_mobile": orders[i].telephone,
                            "customer_email": orders[i].email,
                            "output": []
                        }
                    ]
                }


                let lineItems = [];
                const ordersProducts = await getManager().getRepository(OrderProduct).find({
                    where: { orderId: orders[i].orderId }
                });
                const orderProductLength = ordersProducts && ordersProducts.length;
                if (orderProductLength > 0) {
                    for (let r = 0; r < orderProductLength; r++) {
                        lineItems.push({
                            "item_code": ordersProducts[r].skuName,
                            "item_name": ordersProducts[r].name,
                            "item_rate": ordersProducts[r].productPrice,
                            "item_net_amount": ordersProducts[r].total,
                            "item_gross_amount": ordersProducts[r].productPrice,
                            "item_quantity": ordersProducts[r].quantity,
                            "item_tax": ordersProducts[r].tax,
                            "item_status": "New"

                        })
                    }
                }

                payloadData.objClass[0].output = lineItems;
                var config = {
                    method: 'post',
                    url: "https://redchief.mloyalcapture.com/service.svc/INSERT_BILLING_DATA_ACTION",
                    headers: {
                        "userid": userId,
                        "pwd": password,
                        "Content-Length": (JSON.stringify(payloadData)).length,
                        "Content-Type": "application/json; charset=utf-8"
                    },
                    data: JSON.stringify(payloadData)
                };


                await axios(config).then(async (res: any) => {

                    if (res.data.INSERT_BILLING_DATA_ACTIONResult.Success) {
                        let updateStatusOrder = orders[i];
                        updateStatusOrder.sentOnMloyal = 1;
                        await orderRepo.save(orders[i]);
                        orderSyncedCount++;
                        writeLine(`mLoyal:[Request: ${JSON.stringify(payloadData)}}, [Response: ${JSON.stringify(res.data)}] and Date [${timeString}]` );   
                    }

                }).catch((error: any) => {
                    console.error("Error:", error);

                })

            }
        }

        const successResponse: any = {
            status: 1,
            message: 'Billing Data sent to Mloyal successfully.',
            data: `${orderSyncedCount} orders Billing Data sent to Mloyal successfully.`,
        };
        return res.status(200).send(successResponse);
    }


}