import { OrderRepository } from "../../../repositories/OrderRepository";
import { Service } from "typedi";
import { OrmRepository } from "typeorm-typedi-extensions";
import { getManager } from "typeorm";
import moment from "moment";
import { Order } from "../../../models/Order";
import { OrderProduct } from "../../../models/OrderProduct";
import { PaymentItems } from "../../../models/PaymentItems";
import { PineLabsTransaction } from "../../../models/PineLabs/PineLabsTransaction";
import { PineOrder } from "../../../models/PineLabs/PineOrder";
import { ProductImage } from "../../../models/ProductImage";
import { Product } from "../../../models/ProductModel";
import { env } from "../../../../env";
// import { Order } from "../../../models/Order";
import { Payment as Payments } from '../../../models/Payment';
import { PluginRepository } from "../../../repositories/PluginRepository";
import { PaytmOrder } from "../../../models/Paytm/PaytmOrder";
import { PaytmTransaction } from "../../../models/Paytm/PaytmTransaction";
import { IngenicoTransactions } from "../../../models/Ingenico/ingenicoTransactions";
import { IngenicoOrderData } from "../../../models/Ingenico/IngenicoOrderData";
import { OrderLog } from "../../../models/OrderLog";
import { OrderProductLog } from "../../../models/OrderProductLog";
@Service()
export class PaymentDoubleVerificationService {
    constructor(
        @OrmRepository() private _orderRepo: OrderRepository,
        @OrmRepository() private _plugin: PluginRepository
    ) { }

    public async findOrderDetails(paymentType: any): Promise<any> {

        let time = moment.duration("00:30:00");
        var date = moment(new Date());
        let newDate = date.subtract(time);



        let _m = await this._orderRepo.createQueryBuilder();
        _m.select('*');
        _m.where('payment_status = :paymentStatus', { paymentStatus: 0 });
        _m.andWhere('payment_details is not null');
        _m.andWhere("payment_method != 2");
        _m.andWhere("payment_type = :payment_type", { payment_type: paymentType });
        _m.andWhere('created_date < :nmDate');
        _m.setParameter("nmDate",moment(newDate).format('YYYY-MM-DD HH:mm:ss'));
        //_m.take(1);
        let _data = await _m.execute();
        return _data;
    }

    public async _doUpdateOrderDetails(orderData: any): Promise<any> {
        let isSaved = await this._orderRepo.save(orderData);
        return isSaved;
    }


    public async _doPaymentPineLabs(paymentId: any, plural_order_id: any, _j: any): Promise<any> {

        const orderProductRepository = getManager().getRepository(OrderProduct);
        const productImageRepository = getManager().getRepository(ProductImage);
        const productRepository = getManager().getRepository(Product);

        const pineOrderRepository = getManager().getRepository(PineOrder);
        const pineOrderTransactionRepository = getManager().getRepository(PineLabsTransaction);

        const paymentRepository = getManager().getRepository(Payments);
        const paymentItemsRepository = getManager().getRepository(PaymentItems);


        if (paymentId && plural_order_id) {

            //const paymentDetails = await stripe.paymentIntents.retrieve(session.payment_intent);
            const pineDetail = await pineOrderRepository.findOne({
                where: {
                    pineRefId: plural_order_id,
                },
            });
            // if (!pineDetail) {
            //     req.flash('errors', ['Invalid Payment Details']);
            //     return res.redirect('error');
            // }
            const orderRepository = getManager().getRepository(Order);
            const orderData: any = await orderRepository.findOne(pineDetail.orderId);
            // if (!orderData) {
            //     req.flash('errors', ['Invalid Order Id']);
            //     return res.redirect('error');
            // }
            //const setting = await settingRepository.findOne();
            //const currencySymbol = await currencyRepository.findOne(setting.storeCurrencyId);
            //orderData.currencyRight = currencySymbol.symbolRight;
            //orderData.currencyLeft = currencySymbol.symbolLeft;
            //const orderStatus = await orderRepository.findOne({where: {orderId: pineDetail.orderId, paymentFlag: 1}});
            // if (orderStatus) {
            //     req.flash('errors', ['Already Paid for this Order']);
            //     return res.redirect('error');
            // }
            //const intvalue = Math.round(_j.order_data.amount);



            // if (_j.payment_info_data.payment_status === 'CAPTURED' && _j.merchant_data.order_id === pineDetail.pineRefId) {

            if (_j.payment_info_data.payment_status === 'CAPTURED' && orderData.orderPrefixId === _j.merchant_data.order_id) {
                const transactionsParams = new PineLabsTransaction();
                transactionsParams.paymentType = _j.payment_info_data.payment_mode;
                transactionsParams.pineOrderId = pineDetail.id;
                transactionsParams.paymentData = JSON.stringify(_j);
                transactionsParams.paymentStatus = 1;
                await pineOrderTransactionRepository.save(transactionsParams);
                pineDetail.status = 1;
                await pineOrderRepository.save(pineDetail);
                orderData.paymentFlag = 1;
                orderData.paymentStatus = 1;
                orderData.paymentProcess = 1;
                orderData.paymentType = 'PineLabsPluralSingleCart';
                orderData.paymentDetails = _j.payment_info_data.payment_id;
                orderData.discountAmount = Number(orderData.discountAmount);
                await orderRepository.save(orderData);
                const paymentParams = new Payments();
                paymentParams.orderId = pineDetail.orderId;
                const date = new Date();
                paymentParams.paidDate = moment(date).format('YYYY-MM-DD HH:mm:ss');
                paymentParams.paymentNumber = _j.payment_info_data.payment_id;
                paymentParams.paymentAmount = orderData.total;
                paymentParams.paymentInformation = JSON.stringify(_j);
                const payments = await paymentRepository.save(paymentParams);
                const productDetailData = [];
                let i;
                let saleOrderItems = [];
                const orderProduct = await orderProductRepository.find({ where: { orderId: orderData.orderId }, select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice', 'discountedAmount', 'discountAmount', 'couponDiscountAmount', 'basePrice', 'skuName'] });
                for (i = 0; i < orderProduct.length; i++) {
                    const paymentItems = new PaymentItems();
                    paymentItems.paymentId = payments.paymentId;
                    paymentItems.orderProductId = orderProduct[i].orderProductId;
                    paymentItems.totalAmount = orderProduct[i].total;
                    paymentItems.productName = orderProduct[i].name;
                    paymentItems.productQuantity = orderProduct[i].quantity;
                    paymentItems.productPrice = orderProduct[i].productPrice;
                    await paymentItemsRepository.save(paymentItems);
                    const productInformation = await orderProductRepository.findOne({ where: { orderProductId: orderProduct[i].orderProductId }, select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice', 'discountedAmount', 'discountAmount', 'basePrice', 'varientName', 'skuName', 'taxValue', 'taxType', 'productVarientOptionId', 'orderProductPrefixId', 'couponDiscountAmount', 'basePrice'] });
                    const productImageData: any = await productRepository.findOne(productInformation.productId);
                    const productImageDetail = await productImageRepository.findOne({ where: { productId: productInformation.productId } });
                    productImageData.productInformationData = productInformation;
                    productImageData.productImage = productImageDetail;
                    productDetailData.push(productImageData);
 
                    const quantity = +orderProduct[i].quantity
                    const skuName = orderProduct[i].skuName
                    for(let i=0; i<quantity; i++){
                        saleOrderItems.push({
                            "itemSku": env.uniComm.testMode == "ON" ? "10532336" : skuName,
                            "code": env.uniComm.testMode == "ON" ? "10532336" : skuName+"-"+i,
                            "shippingMethodCode": "STD",
                            "totalPrice": Math.round(productInformation.productPrice),
                            "sellingPrice": Math.round(productInformation.productPrice),
                            'discount':Math.round(+productInformation.discountAmount+(productInformation.discountAmount*productInformation.taxValue/100)),
                            // "sellingPrice": Math.round(+productInformation.basePrice+(productInformation.basePrice*productInformation.taxValue/100)),
                            'packetNumber':0,
                            'prepaidAmount':0,
                            'giftWrap':false
                        });
                    }
                }

                const { UnicommeService: dd } = require('../../services/admin/UnicomService');
                let c = new dd();
                await c.sendOrderToUC(orderData, saleOrderItems);

                return "success";
                //return res.status(200).send(await this._m.getMessage(405)).end();
            } else {
                const transactionsParams = new PineLabsTransaction();
                transactionsParams.paymentType = 'FAILURE';
                transactionsParams.pineOrderId = pineDetail.id;
                transactionsParams.paymentData = JSON.stringify(_j);
                transactionsParams.paymentStatus = 2;
                await pineOrderTransactionRepository.save(transactionsParams);
                pineDetail.status = 2;
                await pineOrderRepository.save(pineDetail);
                orderData.paymentFlag = 2;
                orderData.paymentStatus = 2;
                orderData.orderStatusId = 11;
                await orderRepository.save(orderData);

                await this.updateFailOrder(orderData.orderId, 11);

                return "failed-not-update";

                //return res.status(404).send(await this._m.getMessage(406)).end();
            }
            // res.render('pages/stripe/success', {
            //     title: 'Stripe',
            //     storeUrl: env.storeUrl,
            //     layout: 'pages/layouts/auth',
            // });

        } else {
            const pineDetail = await pineOrderRepository.findOne({
                where: {
                    pineRefId: plural_order_id,
                },
            });

            const orderRepository = getManager().getRepository(Order);
            const orderData: any = await orderRepository.findOne(pineDetail.orderId);

            const transactionsParams = new PineLabsTransaction();
            transactionsParams.paymentType = 'FAILURE';
            transactionsParams.pineOrderId = pineDetail.id;
            transactionsParams.paymentData = null;
            transactionsParams.paymentStatus = 2;
            await pineOrderTransactionRepository.save(transactionsParams);
            pineDetail.status = 2;
            await pineOrderRepository.save(pineDetail);
            orderData.paymentFlag = 2;
            orderData.paymentStatus = 2;
            orderData.orderStatusId = 11;
            await orderRepository.save(orderData);
            return "failed-payment-not-recieved";
            //return res.status(404).send(await this._m.getMessage(406)).end();
        }
    }

    public async getsavedPaymentMethod(pluginName: any): Promise<any> {
        const condition: any = {};
        condition.where = {};
        condition.where = { 'pluginName': pluginName };
        //condition.take = 1;
        return this._plugin.findOne(condition);
    }




    public async _doPaymentPaytm(orderId: any, paymentData: any): Promise<any> {

        const orderProductRepository = getManager().getRepository(OrderProduct);
        const productImageRepository = getManager().getRepository(ProductImage);
        const productRepository = getManager().getRepository(Product);

        const paytmOrderRepository = getManager().getRepository(PaytmOrder);
        const paytmOrderTransactionRepository = getManager().getRepository(PaytmTransaction);

        const paymentRepository = getManager().getRepository(Payments);
        const paymentItemsRepository = getManager().getRepository(PaymentItems);

        let _j = paymentData["body"];

        const paytmDetail = await paytmOrderRepository.findOne({
            where: {
                paytmRefId: _j["orderId"]
            }
        });
        const orderRepository = getManager().getRepository(Order);
        // const orderData: any = await orderRepository.findOne(paytmDetail.orderId);
        const orderData: any = await orderRepository.findOne({ where :
             { orderPrefixId : orderId}
            });
            
        if ((paymentData["body"]["resultInfo"]["resultStatus"] == 'TXN_SUCCESS')) {

            


            if(paytmDetail){
                const transactionsParams = new PaytmTransaction();
                transactionsParams.paymentType = _j.paymentMode;
                transactionsParams.paytmOrderId = paytmDetail.id;
                transactionsParams.paymentData = JSON.stringify(_j);
                transactionsParams.paymentStatus = 1;
                await paytmOrderTransactionRepository.save(transactionsParams);
    
                paytmDetail.status = 1;
                paytmDetail.paytmRefId = _j.txnId;
                await paytmOrderRepository.save(paytmDetail);

            }
            
            const paymentParams = new Payments();
            paymentParams.orderId = orderData.orderId;

            orderData.paymentFlag = 1;
            orderData.paymentStatus = 1;
            orderData.paymentProcess = 1;
            orderData.paymentType = 'paytm';
            orderData.paymentDetails = _j.txnId;
            await orderRepository.save(orderData);

            
            const date = new Date();
            paymentParams.paidDate = moment(date).format('YYYY-MM-DD HH:mm:ss');
            paymentParams.paymentNumber = _j.txnId;
            paymentParams.paymentAmount = _j.txnAmount;
            paymentParams.paymentInformation = JSON.stringify(_j);
            const payments = await paymentRepository.save(paymentParams);

            const productDetailData = [];
            let i;
            let saleOrderItems = [];
            const orderProduct = await orderProductRepository.find({ where: { orderId: orderData.orderId }, select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice', 'discountedAmount', 'discountAmount', 'couponDiscountAmount', 'basePrice', 'skuName'] });

            for (i = 0; i < orderProduct.length; i++) {
                const paymentItems = new PaymentItems();
                paymentItems.paymentId = payments.paymentId;
                paymentItems.orderProductId = orderProduct[i].orderProductId;
                paymentItems.totalAmount = orderProduct[i].total;
                paymentItems.productName = orderProduct[i].name;
                paymentItems.productQuantity = orderProduct[i].quantity;
                paymentItems.productPrice = orderProduct[i].productPrice;
                await paymentItemsRepository.save(paymentItems);
                const productInformation = await orderProductRepository.findOne({ where: { orderProductId: orderProduct[i].orderProductId }, select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice', 'discountedAmount', 'discountAmount', 'basePrice', 'varientName', 'skuName', 'taxValue', 'taxType', 'productVarientOptionId', 'orderProductPrefixId', 'couponDiscountAmount', 'basePrice'] });
                const productImageData: any = await productRepository.findOne(productInformation.productId);
                const productImageDetail = await productImageRepository.findOne({ where: { productId: productInformation.productId } });
                productImageData.productInformationData = productInformation;
                productImageData.productImage = productImageDetail;
                productDetailData.push(productImageData);


                const quantity = +orderProduct[i].quantity
                const skuName = orderProduct[i].skuName
                for(let i=0; i<quantity; i++){
                    saleOrderItems.push({
                        "itemSku": env.uniComm.testMode == "ON" ? "10532336" : skuName,
                        "code": env.uniComm.testMode == "ON" ? "10532336" : skuName+"-"+i,
                        "shippingMethodCode": "STD",
                        "totalPrice": Math.round(productInformation.productPrice),
                        "sellingPrice": Math.round(productInformation.productPrice),
                        'discount':Math.round(+productInformation.discountAmount+(productInformation.discountAmount*productInformation.taxValue/100)),
                        // "sellingPrice": Math.round(+productInformation.basePrice+(productInformation.basePrice*productInformation.taxValue/100)),
                        'packetNumber':0,
                        'prepaidAmount':0,
                        'giftWrap':false
                    });
                }
            }




            /*********************************/
            const { UnicommeService: dd } = require('../../../services/admin/UnicomService');
            let c = new dd();
            await c.sendOrderToUC(orderData, saleOrderItems);

            /**************************************/

            return 'success-transaction';
        } else {
            if(paytmDetail){
                const transactionsParams = new PaytmTransaction();
                transactionsParams.paymentType = _j.resultInfo.resultStatus;
                transactionsParams.paytmOrderId = paytmDetail.id;
                transactionsParams.paymentData = JSON.stringify(_j);
                transactionsParams.paymentStatus = _j.resultInfo.resultStatus=='PENDING'?0:2;
                await paytmOrderTransactionRepository.save(transactionsParams);
    
                paytmDetail.status = _j.resultInfo.resultStatus=='PENDING'?0:2;;
                await paytmOrderRepository.save(paytmDetail);
    
                orderData.paymentFlag = 2;
                orderData.paymentStatus = _j.resultInfo.resultStatus=='PENDING'?0:2;
                orderData.orderStatusId=_j.resultInfo.resultStatus=='PENDING'?13:11
                await orderRepository.save(orderData);
                await this.updateFailOrder(orderData.orderId,_j.resultInfo.resultStatus=='PENDING'?13:11);
                return 'failed-transaction';
            }else{
                orderData.paymentFlag = 2;
                orderData.paymentStatus = 2;
                orderData.orderStatusId=_j.resultInfo.resultStatus=='PENDING'?13:11
                await orderRepository.save(orderData);
                await this.updateFailOrder(orderData.orderId,_j.resultInfo.resultStatus=='PENDING'?13:11);
    
                return 'no-payment-failed-transaction';
            }
            
        }
    }





    

    public async _doPaymentIngenico(orderPrefixId: any, paymentData: any,orderDataTotal:any): Promise<any> {
        //let statusOfTransaction = paymentData["paymentMethod"]["paymentTransaction"]["statusCode"];
        const orderRepository = getManager().getRepository(Order);
        if (Object.keys(paymentData).length > 0) {
            let txn_status = paymentData["paymentMethod"]["paymentTransaction"]["statusCode"];
            
            let ingenicResponseData:any;

            let ingenicoPayment = getManager().getRepository(IngenicoOrderData);
            const IngenicoTransactionsRepository = getManager().getRepository(IngenicoTransactions);

            let currentPay = await ingenicoPayment.findOne({
                where : {
                    payRef : orderPrefixId
                }
            });

            ingenicResponseData = IngenicoTransactionsRepository.findOne({
                where : {
                    payOrderId : currentPay.id
                }
            });

           ingenicResponseData.payOrderId = currentPay.id;
           ingenicResponseData.txnStatus = paymentData["paymentMethod"]["paymentTransaction"]["statusCode"];
           ingenicResponseData.txnMsg = paymentData["paymentMethod"]["paymentTransaction"]["statusMessage"];
           ingenicResponseData.txnErrMsg = paymentData["paymentMethod"]["paymentTransaction"]["errorMessage"];
           ingenicResponseData.clntTxnRef = paymentData["merchantTransactionIdentifier"];
           ingenicResponseData.tpslBankCd = paymentData["paymentMethod"]["bankSelectionCode"];
           ingenicResponseData.tpslTxnId = paymentData["paymentMethod"]["paymentTransaction"]["identifier"];
           ingenicResponseData.txnAmt = paymentData["paymentMethod"]["paymentTransaction"]["amount"];
           ingenicResponseData.clntRqstMeta = `{email:${orderDataTotal.email},mobile:${orderDataTotal.telephone}}`;
           ingenicResponseData.tpslTxnTime = paymentData["paymentMethod"]["paymentTransaction"]["dateTime"];
           ingenicResponseData.balAmt = paymentData["paymentMethod"]["paymentTransaction"]["balanceAmount"];

        //    ingenicResponseData.cardId = null;
        //    ingenicResponseData.aliasName = null;
        //    ingenicResponseData.BankTransactionID = null;
        //    ingenicResponseData.manDateRegNo = null;
           ingenicResponseData.token = paymentData["paymentMethod"]["token"];
           //ingenicResponseData.hash = null;
           ingenicResponseData.finalResponse = JSON.stringify(paymentData);
            

           await IngenicoTransactionsRepository.save(ingenicResponseData);


            
            const paymentRepository = getManager().getRepository(Payments);
            const orderProductRepository = getManager().getRepository(OrderProduct);
            
            const paymentItemsRepository = getManager().getRepository(PaymentItems);
            const productRepository = getManager().getRepository(Product);
            const productImageRepository = getManager().getRepository(ProductImage);
           
            

            if (txn_status === '0300') { //Success
               
                currentPay.payStatus = "1";
                currentPay.tpslTxnId = ingenicResponseData.tpslTxnId
                await ingenicoPayment.save(currentPay);
                
                const orderData = await orderRepository.findOne({
                    where: {
                        orderPrefixId: orderPrefixId,
                    },
                });

                orderData.paymentFlag = 1;
                orderData.paymentStatus = 1;
                orderData.paymentProcess = 1;
                orderData.paymentType = 'ingenico';
                orderData.paymentDetails = ingenicResponseData.tpslTxnId;
                orderData.discountAmount = Number(orderData.discountAmount);
                await orderRepository.save(orderData);


                const paymentParams = new Payments();
                paymentParams.orderId = orderData.orderId;
                const date = new Date();
                paymentParams.paidDate = moment(date).format('YYYY-MM-DD HH:mm:ss');
                paymentParams.paymentNumber = ingenicResponseData.tpslTxnId;
                paymentParams.paymentAmount = Number(ingenicResponseData.txnAmt);
                paymentParams.paymentInformation = JSON.stringify(ingenicResponseData);
                const payments = await paymentRepository.save(paymentParams);

                const productDetailData = [];
                let i;
                let saleOrderItems = [];
                const orderProduct = await orderProductRepository.find({ where: { orderId: orderData.orderId }, select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice', 'discountedAmount', 'discountAmount', 'couponDiscountAmount', 'basePrice', 'skuName'] });

                for (i = 0; i < orderProduct.length; i++) {
                    const paymentItems = new PaymentItems();
                    paymentItems.paymentId = payments.paymentId;
                    paymentItems.orderProductId = orderProduct[i].orderProductId;
                    paymentItems.totalAmount = orderProduct[i].total;
                    paymentItems.productName = orderProduct[i].name;
                    paymentItems.productQuantity = orderProduct[i].quantity;
                    paymentItems.productPrice = orderProduct[i].productPrice;
                    await paymentItemsRepository.save(paymentItems);
                    const productInformation = await orderProductRepository.findOne({ where: { orderProductId: orderProduct[i].orderProductId }, select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice', 'discountedAmount', 'discountAmount', 'basePrice', 'varientName', 'skuName', 'taxValue', 'taxType', 'productVarientOptionId', 'orderProductPrefixId', 'couponDiscountAmount', 'basePrice'] });
                    const productImageData: any = await productRepository.findOne(productInformation.productId);
                    const productImageDetail = await productImageRepository.findOne({ where: { productId: productInformation.productId } });
                    productImageData.productInformationData = productInformation;
                    productImageData.productImage = productImageDetail;
                    productDetailData.push(productImageData);
                    const quantity = +orderProduct[i].quantity
                    const skuName = orderProduct[i].skuName
                    for(let i=0; i<quantity; i++){
                        saleOrderItems.push({
                            "itemSku": env.uniComm.testMode == "ON" ? "10532336" : skuName,
                            "code": env.uniComm.testMode == "ON" ? "10532336" : skuName+"-"+i,
                            "shippingMethodCode": "STD",
                            "totalPrice": Math.round(productInformation.productPrice),
                            "sellingPrice": Math.round(productInformation.productPrice),
                            'discount':Math.round(+productInformation.discountAmount+(productInformation.discountAmount*productInformation.taxValue/100)),
                            // "sellingPrice": Math.round(+productInformation.basePrice+(productInformation.basePrice*productInformation.taxValue/100)),
                            'packetNumber':0,
                            'prepaidAmount':0,
                            'giftWrap':false
                        });
                    }
                }



                /*********************************/
                const { UnicommeService : dd } = require('../../../services/admin/UnicomService');
                
                let c = new dd();
                await c.sendOrderToUC(orderData, saleOrderItems)
                
               return `success-payment-${txn_status}`;
            } else {
                    currentPay.payStatus = txn_status=='0396'?'0':'2';
                    currentPay.tpslTxnId = ingenicResponseData.tpslTxnId
                    ingenicoPayment.save(currentPay);


                    const orderData = await orderRepository.findOne({
                        where: {
                            orderPrefixId: orderPrefixId,
                        },
                    });
    
                    orderData.paymentFlag = 2;
                    orderData.paymentStatus = txn_status=='0396'?0:2;
                    orderData.orderStatusId = txn_status=='0396'?13:11
                    orderData.paymentProcess = 2;
                    orderData.paymentType = 'ingenico';
                    orderData.paymentDetails = ingenicResponseData.tpslTxnId;
                    orderData.discountAmount = Number(orderData.discountAmount);
                    await orderRepository.save(orderData);
                    await this.updateFailOrder(orderData.orderId,txn_status=='0396'?13:11);

                    return `failed-payment-${txn_status}`;
            } 
        }else{
            const orderData = await orderRepository.findOne({
                where: {
                    orderPrefixId: orderPrefixId,
                },
            });

            orderData.paymentFlag = 2;
            orderData.paymentStatus = 2;
            orderData.paymentProcess = 2;
            await orderRepository.save(orderData);
            await this.updateFailOrder(orderData.orderId,11);

            return `failed-payment-{no-transaction}`;
        }
    }



    public async updateFailOrder(orderId:any, statusId:any):Promise<any>{

        await getManager().getRepository(OrderProduct).createQueryBuilder('op')
        .update()
        .set({orderStatusId:statusId})
        .where(
            {orderId : orderId}
        ).execute();


        await getManager().getRepository(OrderLog).createQueryBuilder('ol')
        .update()
        .set({orderStatusId:statusId})
        .where(
            {orderId : orderId}
        ).execute();


        await getManager().getRepository(OrderProductLog).createQueryBuilder('opl')
        .update()
        .set({orderStatusId:statusId})
        .where(
            {orderId : orderId}
        ).execute();
    }
}