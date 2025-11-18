/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import { Get, JsonController, Authorized, QueryParam, Res, Req, Post, Body, Delete, Param, BodyParam, Put, UseBefore, QueryParams } from 'routing-controllers';
import { OrderService } from '../services/OrderService';
import { UpdateOrderChangeStatus } from './requests/UpdateOrderChangeStatus';
import { DeleteOrderRequest } from './requests/DeleteOrderRequest';
import { OrderLogService } from '../services/OrderLogService';
import { OrderProductService } from '../services/OrderProductService';
import { OrderStatusService } from '../services/OrderStatusService';
import { ProductRatingService } from '../services/RatingService';
import { SettingService } from '../services/SettingService';
import { PdfService } from '../services/PdfService';
import { CountryService } from '../services/CountryService';
import { ZoneService } from '../services/zoneService';
import { Payment } from '../models/Payment';
import { PaymentItems } from '../models/PaymentItems';
import { env } from '../../env';

import { PaymentService } from '../services/PaymentService';
import { PaymentItemsService } from '../services/PaymentItemsService';
import * as fs from 'fs';
import moment = require('moment');
import { OrderProductLog } from '../models/OrderProductLog';
import { OrderProductLogService } from '../services/OrderProductLogService';
import { ProductImageService } from '../services/ProductImageService';
import { EmailTemplateService } from '../services/EmailTemplateService';
import { MAILService } from '../../auth/mail.services';
import { AddPaymentRequest } from './requests/AddPaymentRequest';
import { PluginService } from '../services/PluginService';
import { ProductService } from '../services/ProductService';
import { CheckCustomerMiddleware } from '../middlewares/checkTokenMiddleware';
import { PromotionsUsageOrdersService } from '../services/promotions/PromotionUsageOrdersService';
import { createQueryBuilder, getManager, IsNull, Not } from 'typeorm';
import { Sku } from '../models/SkuModel';
import { ProductVarientOption } from '../models/ProductVarientOption';
import { PaytmService } from '../services/payment/PaytmService';
//import {CouponBasedPromosService} from '../services/promotions/CouponBasedPromos/CouponBasedPromoService'
import { IngenicoService } from '../services/payment/IngenicoService';
import { CreditNoteService } from '../services/admin/CreditNoteService';
import { OrderCancelRequests } from '../models/OrderCancelRequests';
import { Order } from '../models/Order';
import { OrderReturn } from '../models/OrderReturn';
import { OrderProduct } from '../models/OrderProduct';
import { RefundBalanceSummaryModel } from '../models/RefundBalanceSummaryModel';
import { EmailTemplate } from '../models/EmailTemplate';
import { EmailModels } from '../models/Schedulers/EmailModel';
import { OrderStatusHistoryController } from './OrderStatusHistoryController';
@JsonController('/order')
export class OrderController {
    constructor(private orderService: OrderService, private orderLogService: OrderLogService,
        private orderProductService: OrderProductService,
        private pdfService: PdfService,
        private countryService: CountryService,
        private zoneService: ZoneService,
        private settingService: SettingService,
        private paymentService: PaymentService,
        private paymentItemsService: PaymentItemsService,
        private orderProductLogService: OrderProductLogService,
        private productImageService: ProductImageService,
        private emailTemplateService: EmailTemplateService,
        private pluginService: PluginService,
        private orderStatusService: OrderStatusService, private productRatingService: ProductRatingService,
        private productService: ProductService,
        private promotionsUsageOrdersService: PromotionsUsageOrdersService,
        private _paytmService: PaytmService,
        // private _couponBasedPromosService:CouponBasedPromosService,
        private _ingenicoService: IngenicoService,
        private _creditNoteRepo: CreditNoteService,
        private _orderStatusHistoryController:OrderStatusHistoryController
    ) {
    }

    // order List API
    /**
     * @api {get} /api/order/orderlist Order List API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {Number} orderId search by orderId
     * @apiParam (Request body) {String} orderStatusId search by orderStatusId
     * @apiParam (Request body) {String} customerName search by customerName
     * @apiParam (Request body) {Number} totalAmount search by totalAmount
     * @apiParam (Request body) {Number} dateAdded search by dateAdded
     * @apiParam (Request body) {Number} count count should be number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get order list",
     *      "data":{
     *      "orderId" : "",
     *      "orderStatusId" : "",
     *      "customerName" : "",
     *      "totalAmount" : "",
     *      "dateAdded" : "",
     *      "dateModified" : "",
     *      "status" : "",
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/order/orderlist
     * @apiErrorExample {json} order error
     * HTTP/1.1 500 Internal Server Error
     */

    @Get('/orderlist-onload')
    @Authorized(['admin', 'list-order'])
    public async orderListOnload(@QueryParam('offset') offset: number, @Res() response: any): Promise<any> {
      
const orderTable:any = "`order`"
const orderList: any = await getManager().query(`SELECT
CASE WHEN u.promotion_type = 'CouponBased' THEN u.discounted_amount ELSE NULL END AS couponAmount,
CASE WHEN u.promotion_type != 'CouponBased' THEN u.discounted_amount ELSE NULL END AS loyaltyPoint,
    p.cn_amount AS creditNoteAmount,
    op.order_product_id AS orderProductId,
    op.order_product_prefix_id AS orderProductPrefixId,
    o.created_date AS createdDate,
    o.order_prefix_id AS orderPrefixId,
    o.order_id AS orderId,
    o.shipping_firstname AS shippingFirstname,
    o.email AS email,
    o.telephone AS mobileNo,
    o.phone_number_alter AS mobileNoAlter,
    o.total AS total,
    o.currency_code AS currencyCode,
    o.currency_symbol_left AS currencySymbolLeft,
    o.currency_symbol_right AS currencySymbolRight,
    op.order_status_id AS orderStatusId,
    op.facility_name AS facilityName,
    op.facility_code AS facilityCode,
    o.modified_date AS modifiedDate,
    o.shipping_address_1 AS shippingAddress1,
    o.shipping_address_2 AS shippingAddress2,
    o.shipping_city AS shippingCity,
    o.shipping_postcode AS shippingPostcode,
    o.shipping_zone AS shippingZone,
    o.order_cancel_reason AS orderCancelReason,
    o.order_cancel_remark AS orderCancelRemark,
    p.cn_source_order_id AS cnCreated,  
    SUM(op.quantity) AS quantity,  
    o.payment_method AS paymentMethod,
    o.sent_on_uc AS sentOnUc,
    o.uc_order_status AS ucOrderStatus,
    o.payment_remark AS paymentRemark
FROM (
    SELECT order_id, created_date, order_prefix_id, shipping_firstname, email, telephone, 
           phone_number_alter, total, currency_code, currency_symbol_left, currency_symbol_right, 
           modified_date, shipping_address_1, shipping_address_2, shipping_city, shipping_postcode, 
           shipping_zone, order_cancel_reason, order_cancel_remark, payment_method, sent_on_uc, 
           uc_order_status, payment_remark
    FROM ${orderTable}
    WHERE payment_process = 1
    ORDER BY created_date DESC
    LIMIT 100 
) o
JOIN order_product op ON o.order_id = op.order_id
LEFT JOIN tt_credit_notes p ON p.cn_source_order_id = o.order_id
LEFT JOIN tt_promotions_usage_orders u ON u.order_id=o.order_id 
GROUP BY 
    op.order_product_id, op.order_product_prefix_id, o.created_date, 
    o.order_prefix_id, o.order_id, o.shipping_firstname, o.email, 
    o.telephone, o.phone_number_alter, o.total, o.currency_code, 
    o.currency_symbol_left, o.currency_symbol_right, op.order_status_id, 
    op.facility_name, op.facility_code, o.modified_date, o.shipping_address_1, 
    o.shipping_address_2, o.shipping_city, o.shipping_postcode, o.shipping_zone, 
    o.order_cancel_reason, o.order_cancel_remark, p.cn_source_order_id, 
    o.payment_method, o.sent_on_uc, o.uc_order_status, o.payment_remark, p.cn_amount, u.promotion_type, u.discounted_amount
ORDER BY o.created_date DESC
LIMIT 100 offset ${offset};`)
   let newOrderList=[];
     for(let i=0;i<orderList.length;i++){
        const cDate = new Date(orderList[i].createdDate,).toLocaleString('en-GB', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'short'
          }); 
        const mDate = new Date(orderList[i].modifiedDate,).toLocaleString('en-GB', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'short'
        });   
        orderList[i].orderCreatedDateInIST=cDate;
        orderList[i].orderModifiedDateInIST=mDate;
     }
    newOrderList=orderList;
        const successResponse: any = {
            status: 1,
            message: 'Successfully shown the order list',
            data: newOrderList,
        };
        return response.status(200).send(successResponse);
    }


    @Get('/orderlist')
    @Authorized(['admin', 'list-order'])
    public async orderList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('orderId') orderId: string, @QueryParam('orderStatusId') orderStatusId: string, @QueryParam('customerName') customerName: string, @QueryParam('email') email: string, @QueryParam('mobileNo') mobileNo: string,
        @QueryParam('totalAmount') totalAmount: string, @QueryParam('dateAdded') dateAdded: string,@QueryParam('toDate') toDate: string,@QueryParam('fromDate') fromDate: string, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
        const select = [
            'OrderProduct.orderProductId as orderProductId',
            'OrderProduct.orderProductPrefixId as orderProductPrefixId',
            'order.createdDate as createdDate',
            'order.orderPrefixId as orderPrefixId',
            'order.orderId as orderId',
            'order.shippingFirstname as shippingFirstname',
            'order.email as email',
            'order.telephone as mobileNo',
            'order.phoneNumberAlter as mobileNoAlter',
            'order.total as total',
            'order.currencyCode as currencyCode',
            'order.currencySymbolLeft as currencySymbolLeft',
            'order.currencySymbolRight as currencySymbolRight',
            'OrderProduct.orderStatusId as orderStatusId',
            'OrderProduct.facilityName as facilityName',
            'OrderProduct.facilityCode as facilityCode',
            'order.modifiedDate as modifiedDate',
            'OrderProduct.orderId as orderId',
            'order.shippingAddress1 as shippingAddress1',
            'order.shippingAddress2 as shippingAddress2',
            'order.shippingCity as shippingCity',
            'order.shippingPostcode as shippingPostcode',
            'order.shippingZone as shippingZone',
            'order.orderCancelReson as orderCancelReson',
            'order.orderCancelRemark as orderCancelRemark',
            'MAX(p.cn_source_order_id) as cnCreated',
            'MAX(p.cn_amount) as creditNoteAmount',
            'SUM(OrderProduct.quantity) as quantity',
            'order.paymentMethod as paymentMethod',
            'order.sentOnUc as sentOnUc',
            'order.ucOrderStatus as ucOrderStatus',
            'order.paymentRemark as paymentRemark',
            'max(CASE WHEN pu.promotionType = "CouponBased" OR pu.promotionType = "employeeCoupon" THEN pu.discountedAmount ELSE NULL END) AS couponAmount',
            'max(CASE WHEN pu.promotionType = "loyalityPoint" THEN pu.discountedAmount ELSE NULL END) AS loyalityPoint'
        ];

        const relations = [
            {
                tableName: 'OrderProduct.order',
                aliasName: 'order',
            },
            {
                tableName: 'tt_credit_notes',
                aliasName: "order",
                op: "left-op"
            },
            {
                tableName: 'tt_promotions_usage_orders',
                aliasName: "order",
                op: "left-pu"
            }
        ];
        const groupBy = [{
            name: 'OrderProduct.orderProductId'
        }];

        const whereConditions = [];

        whereConditions.push(
         {
            name: 'order.paymentProcess',
            op: 'and',
            value: 1,
        },
        {
            name: 'order.shippingFirstname',
            op: 'like',
            value: `'${customerName.toLowerCase()}%'`,
        },
        {
            name: 'order.email',
            op: 'like',
            value: `'${email.toLowerCase()}%'`,
        },
        {
            name: 'order.created_date',
            op: 'GREATEREQUAL',
            value: 'CURDATE() - INTERVAL 30 DAY',
        }
        );

        const searchConditions = [];
        if (mobileNo && mobileNo !== '') {
            searchConditions.push({
                name: ['order.telephone'],
                value: mobileNo.toLowerCase(),
            });

        }

        if (orderId && orderId !== '') {
            searchConditions.push({
                name: ['order.orderPrefixId'],
                value: `'${orderId}'`,
            });

        }

        if (totalAmount && totalAmount !== '') {
            whereConditions.push({
                name: ['order.total'],
                op: 'where',
                value: totalAmount,
            });

        }
          if (fromDate && toDate) {
            whereConditions.push({
                name: ['OrderProduct.created_date'],
                value: (`${fromDate},${toDate}`),
                op:"BETWEEN"
            });
        }
        const sort = [];
        sort.push({
            name: 'order.createdDate',
            order: 'DESC',
        });
        if (count) {
            const orderCount: any = await this.orderProductService.listByQueryBuilder(limit, offset, select, whereConditions, searchConditions, relations, groupBy, sort, true, true);
            const Response: any = {
                status: 1,
                message: 'Successfully got the order count',
                data: orderCount,
            };
            return response.status(200).send(Response);
        }
        const orderList: any = await this.orderProductService.listByQueryBuilder(limit, offset, select, whereConditions, searchConditions, relations, groupBy, sort, false, true);
   let newOrderList=[];
     for(let i=0;i<orderList.length;i++){
        const cDate = new Date(orderList[i].createdDate,).toLocaleString('en-GB', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'short'
          }); 
        const mDate = new Date(orderList[i].modifiedDate,).toLocaleString('en-GB', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'short'
        });   
        orderList[i].orderCreatedDateInIST=cDate;
        orderList[i].orderModifiedDateInIST=mDate;
     }
    newOrderList=orderList;
        const successResponse: any = {
            status: 1,
            message: 'Successfully shown the order list',
            data: newOrderList,
        };
        return response.status(200).send(successResponse);
    }

    @Get('/uc-response-failed-order')
    @Authorized(['admin', 'list-order'])
    public async ucFailedOrderResponse(@QueryParam('orderId') orderId: number,@Res() response: any): Promise<any> {
        // const transactionlist = await this.orderService.transactionList(year);
        const ucResponse = await getManager().query(`SELECT * FROM unicommerce_response where order_id=${orderId}`);

            const successResponse: any = {
                status: 1,
                message: 'Successfully get uc data',
                data:ucResponse[0]
            };
            return response.status(200).send(successResponse);


        }


    //  Order Detail API
    /**
     * @api {get} /api/order/order-detail  Order Detail API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} orderId Order Id
     * @apiParamExample {json} Input
     * {
     *      "orderId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully show the Order Detail..!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/order/order-detail
     * @apiErrorExample {json} Order Detail error
     * HTTP/1.1 500 Internal Server Error
     */
    // Order Detail Function
    @Get('/order-detail')
    @Authorized(['admin', 'view-order'])
    public async orderDetail(@QueryParam('orderId') orderid: number, @Req() request: any, @Res() response: any): Promise<any> {
        const orderData: any = await this.orderService.findOrder({
            where: { orderId: orderid }, select: ['orderId', 'orderStatusId', 'customerId', 'telephone', 'invoiceNo', 'paymentStatus', 'invoicePrefix', 'orderPrefixId', 'shippingCharges','shippingFirstname', 'shippingLastname', 'shippingCompany', 'shippingAddress1',
                'shippingAddress2', 'shippingCity', 'email', 'shippingZone', 'shippingPostcode', 'shippingCountry', 'shippingAddressFormat',
                'paymentFirstname', 'paymentLastname', 'paymentCompany', 'paymentAddress1', 'paymentAddress2', 'paymentCity', 'customerGstNo',
                'paymentPostcode', 'paymentCountry', 'paymentZone', 'paymentAddressFormat', 'total', 'customerId', 'createdDate', 'currencyCode', 'currencySymbolLeft', 'currencySymbolRight', 'discountAmount', 'givenReturnCancelledType', 'paymentMethod','paymentRemark'],
        });


        // const couponResult = await this._couponBasedPromosService.verifyCoupanData({where:{orderId:orderid}})
        // orderData.createCoupan=couponResult?couponResult.couponCode:null
        // orderData.refundType=couponResult?'CN':null
        // orderData.refundAmount=couponResult?couponResult.couponValue:null
        if (orderData.givenReturnCancelledType == "CREDIT_NOTE") {
            const cnFound = await this._creditNoteRepo.getCnDetailByOrderId(orderid);

            orderData.cnDetails = {
                cnCreated: cnFound && cnFound.length > 0 ? cnFound[0].cn_code : null,
                cnAmount: cnFound && cnFound.length > 0 ? cnFound[0].cn_amount : null
            }
        }

        if (!orderData) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid Order Id',
            };
            return response.status(400).send(errorResponse);
        }
        orderData.productList = await this.orderProductService.find({
            where: { orderId: orderid }, select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice', 'trackingUrl', 'trackingNo', 'orderStatusId', 'basePrice', 'taxType', 'taxValue', 'discountAmount', 'discountedAmount', 'couponDiscountAmount', 'orderStatusId', 'varientName',
                'skuName', 'productVarientOptionId', 'orderProductPrefixId', 'modifiedDate','deliveredDate', 'createdDate','facilityCode','facilityName', 'refundAmount','itemCode'],
        }).then((val) => {
            const productVal = val.map(async (value: any) => {
                const rating = await this.productRatingService.findOne({ select: ['rating', 'review'], where: { customerId: orderData.customerId, orderProductId: value.orderProductId, productId: value.productId } });
                const productImage = await this.productImageService.findOne({ select: ['image', 'containerName'], where: { productId: value.productId, defaultImage: 1 } });
                 //------UPC--------------
                 const productUpcData = await this.productService.findOne({ select: ['upc'], where: { productId: value.productId} });
                 //--------------------------------
                const tempVal: any = value;
                tempVal.upc=productUpcData?.upc;
                tempVal.taxType = value.taxType;
                tempVal.taxValue = value.taxValue;
                const mDate = value.modifiedDate?value.modifiedDate:value.createdDate;
               // const mTime = new Date(value.modifiedDate?value.modifiedDate:value.createdDate).toLocaleTimeString(); 
                tempVal.modifiedOrderDateTime = mDate;
                if (productImage) {
                    tempVal.image = productImage.image;
                    tempVal.containerName = productImage.containerName;
                }
                const orderProductStatusData = await this.orderStatusService.findOne({
                    where: { orderStatusId: value.orderStatusId },
                    select: ['name', 'colorCode'],
                });
                tempVal.productSellingPrice = Math.round(value.productPrice)
                if (orderProductStatusData) {
                    tempVal.orderStatusName = orderProductStatusData.name;
                    tempVal.statusColorCode = orderProductStatusData.colorCode;
                }
                if (value.taxType === 2) {
                    tempVal.taxValueInAmount = (+value.basePrice * (+value.taxValue / 100)).toFixed(2);
                } else {
                    tempVal.taxValueInAmount = +value.taxValue;
                }
                if (rating !== undefined) {
                    tempVal.rating = rating.rating;
                    tempVal.review = rating.review;
                } else {
                    tempVal.rating = 0;
                    tempVal.review = '';
                }
                return tempVal;
            });
            const results = Promise.all(productVal);
            return results;
        });
        const orderStatusData = await this.orderStatusService.findOne({
            where: { orderStatusId: orderData.orderStatusId },
            select: ['name', 'colorCode'],
        });
        if (orderStatusData) {
            orderData.orderStatusName = orderStatusData.name;
            orderData.statusColorCode = orderStatusData.colorCode;
        }
        if (orderData.discountAmount) {
            orderData.totalAmount = (Number(orderData.total) + Number(orderData.discountAmount)).toFixed(2)
        }
        orderData.appliedDiscounts = await this.promotionsUsageOrdersService.find({
            where: { orderId: orderid },
            select: ['orderId', 'promotionType', 'promotionSubType', 'promotionIdentifier', 'couponCode', 'discountValue', 'discountedAmount', 'boughtProductsIds', 'freeProductsIds']

        }).then(promoRecords => {
            const data = promoRecords.map((value: any) => {
                return value;
            });
            const results = Promise.all(data);
            return results;

        });
        const cDate = new Date(orderData.createdDate).toLocaleString('en-GB', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'short',
            timeStyle: 'short',
          }); 
        orderData.createdOrderDateTime = cDate;
        const successResponse: any = {
            status: 1,
            message: 'Successfully shown the order Detail',
            data: orderData,
        };
        return response.status(200).send(successResponse);
    }

    //  Order Export PDF API
    /**
     * @api {get} /api/order/order-export-pdf  Order Export PDF API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} orderId Order Id
     * @apiParamExample {json} Input
     * {
     *      "orderId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully show the Order Detail..!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/order/order-export-pdf
     * @apiErrorExample {json} Order Detail error
     * HTTP/1.1 500 Internal Server Error
     */
    // Order Detail Function
    @Get('/order-export-pdf')
    public async orderExportPdf(@QueryParam('orderId') orderid: number, @Req() request: any, @Res() response: any): Promise<any> {
        const orderData = await this.orderService.findOrder({
            where: { orderId: orderid }, select: ['orderId', 'orderStatusId', 'customerId', 'telephone', 'invoiceNo', 'paymentStatus', 'invoicePrefix', 'orderPrefixId', 'shippingFirstname', 'shippingLastname', 'shippingCompany', 'shippingAddress1',
                'shippingAddress2', 'shippingCity', 'email', 'shippingZone', 'shippingPostcode', 'shippingCountry', 'shippingAddressFormat',
                'paymentFirstname', 'paymentLastname', 'paymentCompany', 'paymentAddress1', 'paymentAddress2', 'paymentCity',
                'paymentPostcode', 'paymentCountry', 'paymentZone', 'paymentAddressFormat', 'total', 'customerId', 'createdDate', 'currencyCode', 'currencySymbolLeft', 'currencySymbolRight', 'totalTax', 'totalItemsPrice', 'discountAmount', 'shippingCharges'],
        });
        if (!orderData) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid Order Id',
            };
            return response.status(400).send(errorResponse);
        }
        orderData.productList = await this.orderProductService.find({ where: { orderId: orderid, deliveredDate: Not(IsNull()) }, select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice', 'basePrice', 'taxType', 'taxValue', 'discountAmount', 'discountedAmount', 'couponDiscountAmount', 'skuName', 'refundAmount'] }).then((val) => {
            console.log("valvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalvalval",val)
            const productVal = val.map(async (value: any) => {
                const tempVal: any = value;
                const skuName = value.skuName
                
                const varient = await createQueryBuilder(Sku, 'sku')
                    .select(['pvo.varient_name as varientName'])
                    .leftJoin(ProductVarientOption, 'pvo', 'pvo.sku_id=sku.id')
                    .where('sku.sku_name=:sku', { sku: skuName })
                    .getRawOne()
                if(varient && varient.varientName){
                tempVal.varientName = varient.varientName
                }
                const rating = await this.productRatingService.findOne({ select: ['rating', 'review'], where: { customerId: orderData.customerId, orderProductId: value.orderProductId, productId: value.productId } });

                tempVal.taxType = value.taxType;
                tempVal.taxValue = value.taxValue;
                if (value.taxType === 2) {
                    const price = value.discountAmount === '0.00' || value.discountAmount === null ? +value.basePrice : +value.discountedAmount;
                    tempVal.taxValueInAmount = (price * (+value.taxValue / 100)).toFixed(2);
                } else {
                    tempVal.taxValueInAmount = value.taxValue;
                }
                if (rating !== undefined) {
                    tempVal.rating = rating.rating;
                    tempVal.review = rating.review;
                } else {
                    tempVal.rating = 0;
                    tempVal.review = '';
                }
                tempVal.productMrp = Math.round(+tempVal.basePrice+(tempVal.basePrice*tempVal.taxValue/100))
                tempVal.productTax = Math.round(tempVal.basePrice*tempVal.taxValue/100)
                tempVal.productDiscount = Math.round(+tempVal.discountAmount+(tempVal.discountAmount*tempVal.taxValue/100))
                tempVal.productOfferDiscount = tempVal.productPrice-tempVal.refundAmount
                return tempVal;
            });
            const results = Promise.all(productVal);
            return results;
        });
        const select = '';
        const relation = [];
        const WhereConditions = [];
        const limit = 1;
        console.log("orderData.productListorderData.productListorderData.productList",orderData.productList)
        const productTotalSum:any = orderData.productList.reduce((a,b)=> a + ((b.productMrp*b.quantity)),0)
        const productTotalTax:any = orderData.productList.reduce((a,b)=> a + ((b.productTax*b.quantity)),0)
        const productTotalDiscount:any = orderData.productList.reduce((a,b)=> a + ((b.productDiscount*b.quantity)),0)
        const productTotalSellingPrice:any = orderData.productList.reduce((a,b)=> a + ((b.refundAmount*b.quantity)),0)
        const productOfferDiscount:any = orderData.productList.reduce((a,b)=> a + ((b.productOfferDiscount*b.quantity)),0)
        
orderData.totalItemsPrice=productTotalSum
orderData.totalTax=productTotalTax
orderData.discountAmount=productTotalDiscount+productOfferDiscount
orderData.total=productTotalSellingPrice

console.log("orderData",orderData)
        const settings: any = await this.settingService.list(limit, select, relation, WhereConditions);
        const settingDetails = settings[0];
        const countryData: any = await this.countryService.findOne({ where: { countryId: settingDetails.countryId } });
        const zoneData: any = await this.zoneService.findOne({ where: { zoneId: settingDetails.zoneId } });
        orderData.settingDetails = settingDetails;
        orderData.zoneData = (zoneData !== undefined) ? zoneData : ' ';
        orderData.countryData = (countryData !== undefined) ? countryData : ' ';
        orderData.currencyCode = orderData.currencyCode;
        orderData.symbolLeft = orderData.currencySymbolLeft;
        orderData.symbolRight = orderData.currencySymbolRight;
        const orderStatusData = await this.orderStatusService.findOne({
            where: { orderStatusId: orderData.orderStatusId },
            select: ['name', 'colorCode'],
        });
        if (orderStatusData) {
            orderData.orderStatusName = orderStatusData.name;
            orderData.statusColorCode = orderStatusData.colorCode;
        }
        // let image: any;
        // if (env.imageserver === 's3') {
        //     //image = await this.s3Service.resizeImageBase64(settingDetails.invoiceLogo, settingDetails.invoiceLogoPath, '50', '50');
        //     image = await this.s3Service.resizeImage(settingDetails.invoiceLogo, "storeLogo/", '50', '50');

        // } else {
        //     image = await this.imageService.resizeImageBase64(settingDetails.invoiceLogo, settingDetails.invoiceLogoPath, '50', '50');
        // }
        //orderData.logo = image;
        orderData.appliedDiscounts = await this.promotionsUsageOrdersService.find({
            where: { orderId: orderid },
            select: ['orderId', 'promotionType', 'promotionSubType', 'promotionIdentifier', 'couponCode', 'discountValue', 'discountedAmount', 'boughtProductsIds', 'freeProductsIds']

        }).then(promoRecords => {
            const data = promoRecords.map((value: any) => {
                return value;
            });
            const results = Promise.all(data);
            return results;

        });
        orderData.createdDate = moment(orderData.createdDate).format('DD-MM-YYYY');
        const htmlData = await this.pdfService.readHtmlToString('invoice', orderData);

        const pdfBinary = await this.pdfService.createPDFFile(htmlData, true, '');


        //response.attachment("jyotipdf.pdf")

        return response.status(200).send({
            data: pdfBinary,
            status: 1,
            message: 'pdf exported',
        });

    }

    // sales List API
    /**
     * @api {get} /api/order/saleslist Sales List API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1"
     *      "message": "Successfully get sales count list",
     *      "data":{
     *      }
     * }
     * @apiSampleRequest /api/order/saleslist
     * @apiErrorExample {json} sales error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/saleslist')
    @Authorized(['admin', 'list-sales'])
    public async salesList(@QueryParam('year') year: string, @Res() response: any): Promise<any> {
        const orderList = await this.orderService.salesList();
        const promises = orderList.map(async (result: any) => {
            const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December',
            ];
            const temp: any = result;
            temp.monthYear = monthNames[result.month] + '-' + result.year;
            return temp;
        });
        const finalResult = await Promise.all(promises);
        const successResponse: any = {
            status: 1,
            message: 'Successfully got the sales count list',
            data: finalResult,
        };
        return response.status(200).send(successResponse);

    }
    // sales Graph List API
    /**
     * @api {get} /api/order/sales-graph-list Sales Graph List API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} year year
     * @apiParam (Request body) {String} month month
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1"
     *      "message": "Successfully get sales graph list",
     *      "data":{
     *      }
     * }
     * @apiSampleRequest /api/order/sales-graph-list
     * @apiErrorExample {json} sales error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/sales-graph-list')
    @Authorized()
    public async salesGraphList(@QueryParam('year') year: string, @QueryParam('month') month: string, @Res() response: any): Promise<any> {
        const orderList = await this.orderProductService.salesGraphList(year, month);
        const promises = orderList.map(async (result: any) => {
            const temp: any = result;
            return temp;
        });
        const finalResult = await Promise.all(promises);
        const successResponse: any = {
            status: 1,
            message: 'Successfully got the sales count list',
            data: finalResult,
        };
        return response.status(200).send(successResponse);
    }
    // Dashboard Transaction List API
    /**
     * @api {get} /api/order/transaction-list Dashboard Transaction List API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} year year
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1"
     *      "message": "Successfully get transaction list",
     *      "data":{
     *      }
     * }
     * @apiSampleRequest /api/order/transaction-list
     * @apiErrorExample {json} transaction list error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/transaction-list')
    @Authorized()
    public async transactionList(@QueryParam('year') year: number, @Res() response: any): Promise<any> {
        const transactionlist = await this.orderService.transactionList(year);
        return response.status(200).send({
            status: 1,
            message: 'Successfully got the transaction list',
            data: transactionlist,
        });
    }
    // total order amount API
    /**
     * @api {get} /api/order/total-order-amount total Order Amount API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1"
     *      "message": "Successfully get total order amount",
     *      "data":{
     *      "count" : "",
     *      }
     * }
     * @apiSampleRequest /api/order/total-order-amount
     * @apiErrorExample {json} order error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/total-order-amount')
    @Authorized()
    public async totalOrderAmount(@Res() response: any): Promise<any> {
        let total = 0;
        const order = await this.orderService.findAll();
        let n = 0;
        for (n; n < order.length; n++) {
            total += +order[n].total;
        }
        if (order) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully got the total order amount',
                data: total,
            };

            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'unable to get the total order amount',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // today order amount API
    /**
     * @api {get} /api/order/today-order-amount today Order Amount API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1"
     *      "message": "Successfully get today order amount",
     *      "data":{
     *      }
     * }
     * @apiSampleRequest /api/order/today-order-amount
     * @apiErrorExample {json} order error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/today-order-amount')
    @Authorized()
    public async todayOrderAmount(@Res() response: any): Promise<any> {
        const nowDate = new Date();
        const todaydate = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
        let total = 0;
        const order = await this.orderService.findAlltodayOrder(todaydate);
        let n = 0;
        for (n; n < order.length; n++) {
            total += +order[n].total;
        }
        if (order) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully got the today order amount',
                data: total,
            };

            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'unable to get the today order amount',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Today order count API
    /**
     * @api {get} /api/order/today-order-count Today OrderCount API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get Today order count",
     *      "data":{
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/order/today-order-count
     * @apiErrorExample {json} order error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/today-order-count')
    @Authorized()
    public async orderCount(@Res() response: any): Promise<any> {

        const nowDate = new Date();
        const todaydate = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();

        const orderCount = await this.orderService.findAllTodayOrderCount(todaydate);
        const successResponse: any = {
            status: 1,
            message: 'Successfully got the Today order count',
            data: orderCount,
        };
        return response.status(200).send(successResponse);

    }

    // Change order Status API
    /**
     * @api {post} /api/order/order-change-status   Change Order Status API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} orderId Order Id
     * @apiParam (Request body) {Number} orderStatusId order Status Id
     * @apiParamExample {json} Input
     * {
     *   "orderDetails" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated order change status.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/order/order-change-status
     * @apiErrorExample {json} order error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/order-change-status')
    @Authorized(['admin', 'update-order-status'])
    public async orderChangeStatus(@Body({ validate: true }) orderChangeStatus: UpdateOrderChangeStatus, @Res() response: any): Promise<any> {
        const updateOrder = await this.orderService.findOrder(orderChangeStatus.orderId);
        if (!updateOrder) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid order Id.',
            };
            return response.status(400).send(errorResponse);
        }
        updateOrder.orderStatusId = orderChangeStatus.orderStatusId;
        const order = await this.orderLogService.create(updateOrder);
        const orderLog = await this.orderLogService.findOne(order.orderLogId);
        orderLog.orderId = orderChangeStatus.orderId;
        await this.orderLogService.create(order);
        updateOrder.orderStatusId = orderChangeStatus.orderStatusId;
        const orderSave = await this.orderService.create(updateOrder);
        if (orderSave) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully updated the Order Status',
                data: orderSave,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to update the Order Status.',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Order Details Excel Document download
    /**
     * @api {get} /api/order/order-excel-list Order Excel
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} orderId orderId
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully download the Order Excel List..!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/order/order-excel-list
     * @apiErrorExample {json} Order Excel List error
     * HTTP/1.1 500 Internal Server Error
     */

    @Get('/order-excel-list')
    @Authorized(['admin', 'export-order'])
    public async excelOrderView(@QueryParam('orderId') orderId: string, @Req() request: any, @Res() response: any): Promise<any> {
        const excel = require('exceljs');
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Order Detail Sheet');
        const rows = [];
        const orderid = orderId.split(',');
        for (const id of orderid) {
            const dataId = await this.orderService.find({ where: { orderId: id } });
            if (dataId.length === 0) {
                const errorResponse: any = {
                    status: 0,
                    message: 'Invalid orderId',
                };
                return response.status(400).send(errorResponse);
            }
        }
        // Excel sheet column define
        worksheet.columns = [
            { header: 'Order Id', key: 'orderPrefixId', size: 16, width: 15 },
            { header: 'Customer Name', key: 'shippingFirstname', size: 16, width: 15 },
            { header: 'Email', key: 'email', size: 16, width: 15 },
            { header: 'Mobile Number', key: 'telephone', size: 16, width: 15 },
            { header: 'Total Amount', key: 'total', size: 16, width: 15 },
            { header: 'Created Date', key: 'createdDate', size: 16, width: 15 },
            { header: 'Updated Date', key: 'modifiedDate', size: 16, width: 15 },
        ];
        worksheet.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('B1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('C1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('D1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('E1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('F1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('G1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        for (const id of orderid) {
            const dataId = await this.orderService.findOrder(id);
            
            const right = dataId.currencySymbolRight;
            const left = dataId.currencySymbolLeft;
            
            //   const cDate = new Date(dataId.createdDate).toLocaleString('en-GB', {
            //     timeZone: 'Asia/Kolkata',
            //     dateStyle: 'short',
            //     timeStyle: 'short',
            //   }); ; 
            //   //const cTime = new Date(dataId.createdDate).toLocaleTimeString(); 
            //   const createdOrderDateTime = cDate;

            //   const mDate = new Date(dataId.modifiedDate).toLocaleString('en-GB', {
            //     timeZone: 'Asia/Kolkata',
            //     dateStyle: 'short',
            //     timeStyle: 'short',
            //   });  
            //   const modifiedOrderDateTime = mDate;


            if (left === null && right === null) {
                rows.push([dataId.orderPrefixId, dataId.shippingFirstname + ' ' + dataId.shippingLastname, dataId.email, dataId.telephone, dataId.total, dataId.createdDate, dataId.modifiedDate]);
            } else {
                if (left !== undefined) {
                    rows.push([dataId.orderPrefixId, dataId.shippingFirstname + ' ' + dataId.shippingLastname, dataId.email, dataId.telephone, left + dataId.total, dataId.createdDate, dataId.modifiedDate]);
                } else {
                    rows.push([dataId.orderPrefixId, dataId.shippingFirstname + ' ' + dataId.shippingLastname, dataId.email, dataId.telephone, dataId.total + right, dataId.createdDate, dataId.modifiedDate]);
                }
            }
        }
        // Add all rows data in sheet
        worksheet.addRows(rows);
        const fileName = './OrderExcel_' + Date.now() + '.xlsx';
        await workbook.xlsx.writeFile(fileName);
        return new Promise((resolve, reject) => {
            response.download(fileName, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    fs.unlinkSync(fileName);
                    return response.end();
                }
            });
        });
    }

    // Delete Order API
    /**
     * @api {delete} /api/order/delete-order/:id Delete Single Order API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "id" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully deleted Order.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/order/delete-order/:id
     * @apiErrorExample {json} orderDelete error
     * HTTP/1.1 500 Internal Server Error
     */
    @Delete('/delete-order/:id')
    @Authorized(['admin', 'delete-order'])
    public async deleteOrder(@Param('id') orderid: number, @Res() response: any, @Req() request: any): Promise<any> {
        const orderData = await this.orderService.find({ where: { orderId: orderid } });
        if (orderData.length === 0) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid order Id',
            };
            return response.status(400).send(errorResponse);
        }
        const deleteOrder = await this.orderService.delete(orderid);
        if (deleteOrder) {
            const successResponse: any = {
                status: 1,
                message: 'Order Deleted Successfully',
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to delete the Order',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Delete Multiple Order API
    /**
     * @api {post} /api/order/delete-order Delete Order API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {number} orderId orderId
     * @apiParamExample {json} Input
     * {
     * "orderId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     * "message": "Successfully deleted Order.",
     * "status": "1"
     * }
     * @apiSampleRequest /api/order/delete-order
     * @apiErrorExample {json} orderDelete error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/delete-order')
    @Authorized()
    public async deleteMultipleOrder(@Body({ validate: true }) orderDelete: DeleteOrderRequest, @Res() response: any, @Req() request: any): Promise<any> {
        const orderIdNo = orderDelete.orderId.toString();
        const orderid = orderIdNo.split(',');
        for (const id of orderid) {
            const orderData = await this.orderService.find({ where: { orderId: id } });
            if (orderData.length === 0) {
                const errorResponse: any = {
                    status: 0,
                    message: 'Please choose a order that you want to delete',
                };
                return response.status(400).send(errorResponse);
            }
        }

        for (const id of orderid) {
            const deleteOrderId = parseInt(id, 10);
            await this.orderService.delete(deleteOrderId);
        }
        const successResponse: any = {
            status: 1,
            message: 'Order Deleted Successfully',
        };
        return response.status(200).send(successResponse);
    }

    // order log List API
    /**
     * @api {get} /api/order/orderLoglist Order Log List API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} orderId orderId
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get order list",
     *      "data":{
     *      "orderId" : "",
     *      "orderStatusId" : "",
     *      "customerName" : "",
     *      "totalAmount" : "",
     *      "dateAdded" : "",
     *      "dateModified" : "",
     *      "status" : "",
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/order/orderLoglist
     * @apiErrorExample {json} order error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/orderLoglist')
    @Authorized()
    public async orderLogList(@QueryParam('orderId') orderId: number, @Res() response: any): Promise<any> {
        const select = ['orderId', 'orderPrefixId', 'orderStatusId', 'shippingFirstname', 'total', 'createdDate', 'modifiedDate'];
        const search = [
            {
                name: 'orderId',
                op: 'where',
                value: orderId,
            },
        ];
        const WhereConditions = [];
        const orderList = await this.orderLogService.list(0, 0, select, search, WhereConditions, 0);
        const orderStatuss = await this.orderStatusService.findAll({ select: ['orderStatusId', 'name'], where: { isActive: 1 } });
        const order = orderStatuss.map(async (value: any) => {
            const user = orderList.find(item => item.orderStatusId === value.orderStatusId);
            const temp: any = value;
            if (user === undefined) {
                temp.createdDate = '';
            } else {
                temp.createdDate = user.createdDate;
            }
            return temp;
        });
        const result = await Promise.all(order);
        const successResponse: any = {
            status: 1,
            message: 'Successfully got the complete order Log list',
            data: result,
        };
        return response.status(200).send(successResponse);
    }

    //  update payment status API
    /**
     * @api {post} /api/order/update-payment-status   update payment Status API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} orderId Order Id
     * @apiParam (Request body) {Number} paymentStatusId 1->paid 2->fail 3-> refund
     * @apiParamExample {json} Input
     * {
     *   "orderId" : "",
     *   "paymentStatusId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated payment status.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/order/update-payment-status
     * @apiErrorExample {json} order error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/update-payment-status')
    @Authorized()
    public async updatePaymentStatus(@BodyParam('orderId') orderId: number, @BodyParam('paymentStatusId') paymentStatusId: number, @Res() response: any): Promise<any> {
        const updateOrder = await this.orderService.findOrder(orderId);
        if (!updateOrder) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid order Id',
            };
            return response.status(400).send(errorResponse);
        }
        updateOrder.paymentStatus = paymentStatusId;
        updateOrder.paymentFlag = paymentStatusId;
        const plugin = await this.pluginService.findOne({ where: { id: updateOrder.paymentMethod } });
        updateOrder.paymentType = plugin.pluginName;
        await this.orderService.create(updateOrder);
        if (paymentStatusId === 1) {
            const findPayment = await this.paymentService.findOne({ where: { orderId } });
            if (findPayment) {
                const errorResponse: any = {
                    status: 0,
                    message: 'Payment has been made for this order',
                };
                return response.status(400).send(errorResponse);
            }
            const paymentParams = new Payment();
            paymentParams.orderId = updateOrder.orderId;
            const date = new Date();
            paymentParams.paidDate = moment(date).format('YYYY-MM-DD HH:mm:ss');
            paymentParams.paymentAmount = updateOrder.total;
            const payments = await this.paymentService.create(paymentParams);
            let i;
            const orderProduct = await this.orderProductService.find({ where: { orderId: updateOrder.orderId }, select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice', 'discountAmount', 'discountedAmount', 'couponDiscountAmount'] });
            for (i = 0; i < orderProduct.length; i++) {
                const paymentItems = new PaymentItems();
                paymentItems.paymentId = payments.paymentId;
                paymentItems.orderProductId = orderProduct[i].orderProductId;
                paymentItems.totalAmount = orderProduct[i].total;
                paymentItems.productName = orderProduct[i].name;
                paymentItems.productQuantity = orderProduct[i].quantity;
                paymentItems.productPrice = orderProduct[i].productPrice;
                await this.paymentItemsService.create(paymentItems);
            }
        } else {
            await this.paymentService.delete({ orderId });
        }
        const successResponse: any = {
            status: 1,
            message: 'Successfully updated the Payment Status',
            data: updateOrder,
        };
        return response.status(200).send(successResponse);
    }

    //  update shipping information API
    /**
     * @api {post} /api/order/update-shipping-information   update shipping information API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} orderId Order Id
     * @apiParam (Request body) {String} trackingUrl shipping tracking url
     * @apiParam (Request body) {String} trackingNo shipping tracking no
     * @apiParamExample {json} Input
     * {
     *   "orderId" : "",
     *   "trackingUrl" : "",
     *   "trackingNo" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated shipping information.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/order/update-shipping-information
     * @apiErrorExample {json} order error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/update-shipping-information')
    @Authorized()
    public async updateShippingInformation(@BodyParam('orderId') orderId: number, @BodyParam('trackingUrl') trackingUrl: string, @BodyParam('trackingNo') trackingNo: string, @Res() response: any): Promise<any> {
        const updateOrder = await this.orderService.findOrder(orderId);
        if (!updateOrder) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid order Id',
            };
            return response.status(400).send(errorResponse);
        }
        updateOrder.trackingUrl = trackingUrl;
        updateOrder.trackingNo = trackingNo;
        const orderSave = await this.orderService.create(updateOrder);
        if (orderSave) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully updated the Shipping Information',
                data: orderSave,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to update the Shipping Information',
            };
            return response.status(400).send(errorResponse);
        }
    }

    //  Update Order Product Shipping Information API
    /**
     * @api {post} /api/order/update-order-product-shipping-information   update order product shipping information API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} orderProductId Order Product Id
     * @apiParam (Request body) {String} trackingUrl shipping tracking url
     * @apiParam (Request body) {String} trackingNo shipping tracking no
     * @apiParamExample {json} Input
     * {
     *   "orderProductId" : "",
     *   "trackingUrl" : "",
     *   "trackingNo" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated shipping information.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/order/update-order-product-shipping-information
     * @apiErrorExample {json} order error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/update-order-product-shipping-information')
    @Authorized()
    public async updateOrderProductShippingInformation(@BodyParam('orderProductId') orderProductId: number, @BodyParam('trackingUrl') trackingUrl: string, @BodyParam('trackingNo') trackingNo: string, @Res() response: any): Promise<any> {
        const updateOrderProduct = await this.orderProductService.findOne(orderProductId);
        if (!updateOrderProduct) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid order product Id',
            };
            return response.status(400).send(errorResponse);
        }
        if (updateOrderProduct.cancelRequestStatus === 1) {
            const errorResponse: any = {
                status: 0,
                message: 'You cannot update the shipping information as the cancel request for this order is approved',
            };
            return response.status(400).send(errorResponse);
        }
        updateOrderProduct.trackingUrl = trackingUrl;
        updateOrderProduct.trackingNo = trackingNo;
        const orderProductSave = await this.orderProductService.createData(updateOrderProduct);
        if (orderProductSave) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully updated the Shipping Information',
                data: orderProductSave,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to update the Shipping Information',
            };
            return response.status(400).send(errorResponse);
        }

    }

    // update Order Product Status API
    /**
     * @api {put} /api/order/update-order-product-status/:orderProductId Update Order Product Status API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} orderStatusId OrderStatus orderStatusId
     * @apiParamExample {json} Input
     * {
     *      "orderStatusId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated orderProductStatus.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/order/update-order-product-status/:orderProductId
     * @apiErrorExample {json} OrderStatus error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/update-order-product-status/:orderProductId')
    @Authorized()
    public async updateOrderProductStatus(@Param('orderProductId') orderProductId: number, @BodyParam('orderStatusId') orderStatusId: number, @Res() response: any): Promise<any> {
        const orderProductStatus = await this.orderProductService.findOne({
            where: {
                orderProductId,
            },
        });
        if (!orderProductStatus) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid order Product Id',
            };
            return response.status(400).send(errorResponse);
        }
        if (orderProductStatus.cancelRequestStatus === 1) {
            const errorResponse: any = {
                status: 0,
                message: 'You cannot update the status as the cancel request for this order is approved',
            };
            return response.status(400).send(errorResponse);
        }
        orderProductStatus.orderStatusId = orderStatusId;
        const orderProductStatusUpdate = await this.orderProductService.update(orderProductStatus.orderProductId, orderProductStatus);
        const orderProductLog = new OrderProductLog();
        orderProductLog.model = orderProductStatusUpdate.model;
        orderProductLog.name = orderProductStatusUpdate.name;
        orderProductLog.orderId = orderProductStatusUpdate.orderId;
        orderProductLog.orderProductId = orderProductStatusUpdate.orderProductId;
        orderProductLog.orderStatusId = orderProductStatusUpdate.orderStatusId;
        orderProductLog.productId = orderProductStatusUpdate.productId;
        orderProductLog.productPrice = orderProductStatusUpdate.productPrice;
        orderProductLog.quantity = orderProductStatusUpdate.quantity;
        orderProductLog.total = orderProductStatusUpdate.total;
        orderProductLog.trace = orderProductStatusUpdate.trace;
        orderProductLog.tax = orderProductStatusUpdate.tax;
        orderProductLog.trackingNo = orderProductStatusUpdate.trackingNo;
        orderProductLog.trackingUrl = orderProductStatusUpdate.trackingUrl;
        orderProductLog.isActive = orderProductStatusUpdate.isActive;
        await this.orderProductLogService.create(orderProductLog);
        if (orderProductStatusUpdate !== undefined) {
            const emailContent = await this.emailTemplateService.findOne(21);
            const logo = await this.settingService.findOne();
            const order = await this.orderService.findOrder(orderProductStatus.orderId);
            const orderStatus = await this.orderStatusService.findOne(orderStatusId);
            const message = emailContent.content.replace('{name}', order.shippingFirstname).replace('{title}', orderProductStatusUpdate.name).replace('{status}', orderStatus.name).replace('{order}', order.orderPrefixId);
            const redirectUrl = env.storeRedirectUrl;
            MAILService.customerLoginMail(logo, message, order.email, emailContent.subject, redirectUrl);
            const successResponse: any = {
                status: 1,
                message: 'Successfully updated the order status',
                data: orderProductStatusUpdate,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 1,
                message: 'Unable to update the Order Product Status',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // order product log List API
    /**
     * @api {get} /api/order/order-product-log-list Order Product Log List API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} orderProductId orderProductId
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully got order product log list",
     *      "data":{
     *      "orderProductLogId" : "",
     *      "orderProductId" : "",
     *      "productId" : "",
     *      "orderId" : "",
     *      "name" : "",
     *      "model" : "",
     *      "quantity" : "",
     *      "trace" : "",
     *      "total" : "",
     *      "tax" : "",
     *      "orderStatusId" : "",
     *      "trackingUrl" : "",
     *      "trackingNo" : "",
     *      "isActive" : "",
     *      "createdDate" : "",
     *      "modifiedDate" : "",
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/order/order-product-log-list
     * @apiErrorExample {json} orderProductLog error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/order-product-log-list')
    @Authorized()
    public async orderProductLogList(@QueryParam('orderProductId') orderProductId: number, @Res() response: any): Promise<any> {
        const select = ['orderProductLogId', 'orderProductId', 'productId', 'orderId', 'name', 'model', 'quantity', 'trace', 'total', 'tax', 'orderStatusId', 'trackingUrl', 'trackingNo', 'isActive', 'createdDate', 'modifiedDate'];
        const relation = [];
        const WhereConditions = [
            {
                name: 'orderProductId',
                op: 'where',
                value: orderProductId,
            },
        ];
        const orderProductList = await this.orderProductLogService.list(0, 0, select, relation, WhereConditions, 0);
        const orderStatuss = await this.orderStatusService.findAll({ select: ['orderStatusId', 'name'], where: { isActive: 1 } });
        const orderProduct = orderStatuss.map(async (value: any) => {
            const user = orderProductList.find(item => item.orderStatusId === value.orderStatusId);
            const temp: any = value;
            if (user === undefined) {
                temp.createdDate = '';
            } else {
                temp.createdDate = user.createdDate;
            }
            return temp;
        });
        const result = await Promise.all(orderProduct);
        const successResponse: any = {
            status: 1,
            message: 'Successfully got the complete Order Product Log list',
            data: result,
        };
        return response.status(200).send(successResponse);
    }

    // Order Count API
    /**
     * @api {get} /api/order/order-count Order Count API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1"
     *      "message": "Successfully get order count",
     *      "data":{
     *      "count" : "",
     *      }
     * }
     * @apiSampleRequest /api/order/order-count
     * @apiErrorExample {json} order error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/order-count')
    @Authorized(['admin', 'list-order'])
    public async orderCounts(@Res() response: any): Promise<any> {
        const orders: any = {};
        const order = await this.orderService.findTotalOrderAmount();
        const nowDate = new Date();
        const todaydate = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
        const orderAmount = await this.orderService.findAlltodayOrder(todaydate);
        const orderCount = await this.orderService.findAllTodayOrderCount(todaydate);
        const select = [];
        const search = [{
            name: 'paymentProcess',
            op: 'where',
            value: '1',
        }];
        const WhereConditions = [];
        const orderList = await this.orderService.list(0, 0, select, search, WhereConditions, 0, 1);
        orders.todayOrderCount = orderCount;
        orders.totalOrderAmount = order.total !== null ? order.total : 0;
        orders.todayOrderAmount = orderAmount.total !== null ? orderAmount.total : 0;
        orders.totalOrder = orderList;
        const successResponse: any = {
            status: 1,
            message: 'Successfully got the Order Counts',
            data: orders,
        };
        return response.status(200).send(successResponse);
    }
    // Order Cancel Request List API
    /**
     * @api {get} /api/order/order-cancel-request-list Order Cancel Request List
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {Number} status status
     * @apiParam (Request body) {Number} count count in number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully show the Order List..!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/order/order-cancel-request-list
     * @apiErrorExample {json} Order Cancel Request List error
     * HTTP/1.1 500 Internal Server Error
     */
    // Order Cancel Request List Function
    @Get('/order-cancel-request-list')
    @Authorized(['admin', 'cancel-request-list'])
    public async canceledOrderProductList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('status') status: number, @QueryParam('keyword') keyword: string, @QueryParam('count') count: number | boolean, @Req() request: any, @Res() response: any): Promise<any> {
        const select = [
            'order.createdDate as createdDate',
            'order.orderId as orderId',
            'order.shippingFirstname as customerFirstName',
            'order.shippingCity as shippingCity',
            'order.shippingCountry as shippingCountry',
            'order.shippingZone as shippingZone',
            'order.currencyCode as currencyCode',
            'order.currencySymbolLeft as currencySymbolLeft',
            'order.currencySymbolRight as currencySymbolRight',
            'OrderProduct.orderProductId as orderProductId',
            'OrderProduct.orderStatusId as orderProductStatusId',
            'OrderProduct.productId as productId',
            'OrderProduct.name as name',
            'OrderProduct.total as total',
            'OrderProduct.orderProductPrefixId as orderProductPrefixId',
            'OrderProduct.productPrice as productPrice',
            'OrderProduct.quantity as quantity',
            'OrderProduct.cancelRequest as cancelRequest',
            'OrderProduct.cancelRequestStatus as cancelRequestStatus',
            'OrderProduct.cancelReason as cancelReason',
            'OrderProduct.cancelReasonDescription as cancelReasonDescription',
            'OrderProduct.discountAmount as discountAmount',
            'OrderProduct.discountedAmount as discountedAmount',
            'OrderProduct.couponDiscountAmount as couponDiscountAmount',
        ];

        const relations = [
            {
                tableName: 'OrderProduct.order',
                aliasName: 'order',
            },
            {
                tableName: 'order.orderStatus',
                aliasName: 'orderStatus',
            },
        ];
        const groupBy = [];

        const whereConditions = [];

        whereConditions.push({
            name: 'OrderProduct.cancelRequest',
            op: 'and',
            value: 1,
        }, {
            name: 'order.paymentProcess',
            op: 'and',
            value: 1,
        });

        if (status) {
            whereConditions.push({
                name: 'OrderProduct.cancelRequestStatus',
                op: 'and',
                value: status,
            });
        }

        const searchConditions = [];
        if (keyword && keyword !== '') {
            searchConditions.push({
                name: ['OrderProduct.name', 'OrderProduct.orderProductPrefixId'],
                value: keyword.toLowerCase(),
            });

        }

        const sort = [];
        sort.push({
            name: 'OrderProduct.createdDate',
            order: 'DESC',
        });
        if (count) {
            const orderCount: any = await this.orderProductService.listByQueryBuilder(limit, offset, select, whereConditions, searchConditions, relations, groupBy, sort, true, true);
            const Response: any = {
                status: 1,
                message: 'Successfully got the order count',
                data: orderCount,
            };
            return response.status(200).send(Response);
        }
        const orderList: any = await this.orderProductService.listByQueryBuilder(limit, offset, select, whereConditions, searchConditions, relations, groupBy, sort, false, true);
        const promises = orderList.map(async (results: any) => {
            const temp = results;
            const productImage = await this.productImageService.findOne({
                where: { productId: results.productId, defaultImage: 1 },
                select: ['image', 'containerName'],
            });
            if (productImage !== undefined) {
                temp.image = productImage.image;
                temp.containerName = productImage.containerName;
            } else {
                temp.image = '';
                temp.containerName = '';
            }
            const passingOrderStatus = await this.orderStatusService.findOne({
                where: {
                    orderStatusId: results.orderProductStatusId,
                },
            });
            temp.orderStatusName = passingOrderStatus.name ? passingOrderStatus.name : '';
            temp.orderStatusColorCode = passingOrderStatus.colorCode ? passingOrderStatus.colorCode : '';
            return results;
        });
        const result = await Promise.all(promises);
        const successResponse: any = {
            status: 1,
            message: 'Successfully shown the order product cancel list',
            data: result,
        };
        return response.status(200).send(successResponse);
    }

    // update Order Cancel Request Status API
    /**
     * @api {put} /api/order/update-order-cancel-request/:orderProductId Update Order Cancel Request Status API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} cancelStatusId send 1 -> approved 2 ->rejected
     * @apiParamExample {json} Input
     * {
     *      "cancelStatusId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated order cancel status.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/order/update-order-cancel-request/:orderProductId
     * @apiErrorExample {json} OrderStatus error
     * HTTP/1.1 500 Internal Server Error
     */
    @Put('/update-order-cancel-request/:orderProductId')
    @Authorized(['admin', 'update-cancel-request-status'])
    public async updateOrderCancelStatus(@Param('orderProductId') orderProductId: number, @BodyParam('cancelStatusId') cancelStatusId: number, @Res() response: any): Promise<any> {
        const orderProduct = await this.orderProductService.findOne({
            where: {
                orderProductId,
            },
        });
        if (!orderProduct) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid order Product Id',
            };
            return response.status(400).send(errorResponse);
        }
        orderProduct.cancelRequestStatus = cancelStatusId;
        const orderProductStatusUpdate = await this.orderProductService.update(orderProduct.orderProductId, orderProduct);
        const order = await this.orderService.findOrder({ where: { orderId: orderProduct.orderId } });
        const emailContent = await this.emailTemplateService.findOne(20);
        let status;
        let res;
        if (orderProductStatusUpdate.cancelRequestStatus === 1) {
            status = 'approved';
            res = 'Successfully accepted the cancelled orders';
        } else if (orderProductStatusUpdate.cancelRequestStatus === 2) {
            status = 'rejected';
            res = 'Successfully rejected the cancelled orders';
        } else if (orderProductStatusUpdate.cancelRequestStatus === 0) {
            status = 'pending';
        }
        const message = emailContent.content.replace('{name}', order.shippingFirstname).replace('{productname}', orderProduct.name).replace('{status}', status);
        const redirectUrl = env.storeRedirectUrl;
        const logo = await this.settingService.findOne();
        MAILService.customerLoginMail(logo, message, order.email, emailContent.subject, redirectUrl);
        if (orderProductStatusUpdate !== undefined) {
            return response.status(200).send({
                status: 1,
                message: res,
                data: orderProductStatusUpdate,
            });
        } else {
            const errorResponse: any = {
                status: 1,
                message: 'Unable to update the Order Cancel Status',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // update Bulk Order Cancel Request Status API
    /**
     * @api {get} /api/order/update-bulk-order-cancel-request Update bulk Order Cancel Request Status API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} orderProductId
     * @apiParam (Request body) {Number} cancelStatusId send 1 -> approved 2 ->rejected
     * @apiParamExample {json} Input
     * {
     *      "cancelStatusId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated Bulk order cancel status.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/order/update-bulk-order-cancel-request
     * @apiErrorExample {json} OrderStatus error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/update-bulk-order-cancel-request')
    @Authorized()
    public async updateBulkOrderCancelStatus(@QueryParam('orderProductId') orderProductId: string, @QueryParam('cancelStatusId') cancelStatusId: number, @Res() response: any): Promise<any> {
        const orderProducts = orderProductId.split(',');
        const arr: any = [];
        for (const orderProduct of orderProducts) {
            const orderProd = await this.orderProductService.findOne({
                where: {
                    orderProductId: orderProduct,
                },
            });
            if (!orderProd) {
                arr.push(1);
            }
        }
        if (arr.length > 0) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid order Product Id',
            };
            return response.status(400).send(errorResponse);
        }
        let res;
        for (const orderProduct of orderProducts) {
            const orderProdt = await this.orderProductService.findOne({
                where: {
                    orderProductId: orderProduct,
                },
            });
            orderProdt.cancelRequestStatus = cancelStatusId;
            const orderProductStatusUpdate = await this.orderProductService.update(orderProdt.orderProductId, orderProdt);
            const order = await this.orderService.findOrder({ where: { orderId: orderProdt.orderId } });
            const emailContent = await this.emailTemplateService.findOne(20);
            const logo = await this.settingService.findOne();
            let status;
            if (orderProductStatusUpdate.cancelRequestStatus === 1) {
                status = 'approved';
                res = 'Successfully accepted the cancelled orders';
            } else if (orderProductStatusUpdate.cancelRequestStatus === 2) {
                status = 'rejected';
                res = 'Successfully rejected the cancelled orders';
            } else if (orderProductStatusUpdate.cancelRequestStatus === 0) {
                status = 'pending';
            }
            const message = emailContent.content.replace('{name}', order.shippingFirstname).replace('{productname}', orderProdt.name).replace('{status}', status);
            const redirectUrl = env.storeRedirectUrl;
            MAILService.customerLoginMail(logo, message, order.email, emailContent.subject, redirectUrl);
        }
        const successResponse: any = {
            status: 1,
            message: res,
        };
        return response.status(200).send(successResponse);
    }

    // Export bulk order cancel request
    /**
     * @api {get} /api/order/order-cancel-excel-list Order Cancel Excel list
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} orderProductId orderProductId
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully download the Order Cancel Excel List..!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/order/order-cancel-excel-list
     * @apiErrorExample {json} Order Cancel Excel List error
     * HTTP/1.1 500 Internal Server Error
     */

    @Get('/order-cancel-excel-list')
    @Authorized(['admin', 'cancel-request-export-list'])
    public async exportCancelRequest(@QueryParam('orderProductId') orderProductId: string, @Req() request: any, @Res() response: any): Promise<any> {
        const excel = require('exceljs');
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Order Detail Sheet');
        const rows = [];
        const orderid = orderProductId.split(',');
        for (const id of orderid) {
            const dataId = await this.orderProductService.findOne({ where: { orderProductId: id } });
            if (dataId.length === 0) {
                const errorResponse: any = {
                    status: 0,
                    message: 'Invalid orderProductId',
                };
                return response.status(400).send(errorResponse);
            }
        }
        // Excel sheet column define
        worksheet.columns = [
            { header: 'Order Id', key: 'orderPrefixId', size: 16, width: 15 },
            { header: 'OrderProductPrefixId', key: 'orderProductPrefixId', size: 16, width: 15 },
            { header: 'Customer Name', key: 'shippingFirstname', size: 16, width: 15 },
            { header: 'Email', key: 'email', size: 16, width: 15 },
            { header: 'Product Name', key: 'productName', size: 16, width: 15 },
            { header: 'Product Price', key: 'productPrice', size: 16, width: 15 },
            { header: 'Quantity', key: 'quantity', size: 16, width: 15 },
            { header: 'total', key: 'total', size: 16, width: 15 },
            { header: 'Order Cancel Status', key: 'cancelRequestStatus', size: 16, width: 15 },
            { header: 'Order Cancel Reason', key: 'cancelRequestReason', size: 16, width: 15 },
        ];
        worksheet.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('B1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('C1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('D1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('E1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('F1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('G1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('H1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('I1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('J1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        for (const id of orderid) {
            const data = await this.orderProductService.findOne(id);
            const dataId = await this.orderService.findOrder(data.orderId);
            let status;
            if (data.cancelRequestStatus === 1) {
                status = 'approved';
            } else if (data.cancelRequestStatus === 2) {
                status = 'rejected';
            } else if (data.cancelRequestStatus === 0) {
                status = 'pending';
            }
            const right = dataId.currencySymbolRight;
            const left = dataId.currencySymbolLeft;
            if (left === null && right === null) {
                rows.push([dataId.orderPrefixId, data.orderProductPrefixId, dataId.shippingFirstname + ' ' + dataId.shippingLastname, dataId.email, data.name, data.productPrice, data.quantity, data.total, data.cancelReason, status]);
            } else {
                if (left !== undefined) {
                    rows.push([dataId.orderPrefixId, data.orderProductPrefixId, dataId.shippingFirstname + ' ' + dataId.shippingLastname, dataId.email, data.name, data.productPrice, data.quantity, left + data.total, data.cancelReason, status]);
                } else {
                    rows.push([dataId.orderPrefixId, data.orderProductPrefixId, dataId.shippingFirstname + ' ' + dataId.shippingLastname, dataId.email, data.name, data.productPrice, data.quantity, data.total + right, data.cancelReason, status]);
                }
            }
        }
        // Add all rows data in sheet
        worksheet.addRows(rows);
        const fileName = './OrderCancelExcel_' + Date.now() + '.xlsx';
        await workbook.xlsx.writeFile(fileName);
        return new Promise((resolve, reject) => {
            response.download(fileName, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    fs.unlinkSync(fileName);
                    return response.end();
                }
            });
        });
    }

    // Export bulk order cancel request api
    /**
     * @api {get} /api/order/bulk-order-cancel-excel-list Bulk Order Cancel Excel list
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully download the Bulk Order Cancel Excel List..!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/order/bulk-order-cancel-excel-list
     * @apiErrorExample {json} Order Cancel Excel List error
     * HTTP/1.1 500 Internal Server Error
     */

    @Get('/bulk-order-cancel-excel-list')
    @Authorized(['admin', 'export-order'])
    public async bulkExportCancelRequest(@Req() request: any, @Res() response: any): Promise<any> {
        const excel = require('exceljs');
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Order Detail Sheet');
        const rows = [];
        const orderProduct = await this.orderProductService.find({ where: { cancelRequest: 1 } });
        if (orderProduct.length === 0) {
            const errorResponse: any = {
                status: 0,
                message: 'file is empty',
            };
            return response.status(400).send(errorResponse);
        }
        // Excel sheet column define
        worksheet.columns = [
            { header: 'Order Id', key: 'orderPrefixId', size: 16, width: 15 },
            { header: 'OrderProductPrefixId', key: 'orderProductPrefixId', size: 16, width: 15 },
            { header: 'Customer Name', key: 'shippingFirstname', size: 16, width: 15 },
            { header: 'Email', key: 'email', size: 16, width: 15 },
            { header: 'Product Name', key: 'productName', size: 16, width: 15 },
            { header: 'Product Price', key: 'productPrice', size: 16, width: 15 },//
            { header: 'Quantity', key: 'quantity', size: 16, width: 15 },
            { header: 'total', key: 'total', size: 16, width: 15 },//
            { header: 'Order Cancel Status', key: 'cancelRequestStatus', size: 16, width: 15 },//
            { header: 'Order Cancel Reason', key: 'cancelRequestReason', size: 16, width: 15 },//
        ];
        worksheet.getCell('A1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('B1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('C1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('D1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('E1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('F1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('G1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('H1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('I1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        worksheet.getCell('J1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        for (const id of orderProduct) {
            const data = await this.orderProductService.findOne(id);
            const dataId = await this.orderService.findOrder(data.orderId);

            let status;
            if (data.cancelRequestStatus === 1) {
                status = 'approved';
            } else if (data.cancelRequestStatus === 2) {
                status = 'rejected';
            } else if (data.cancelRequestStatus === 0) {
                status = 'pending';
            }
            const right = dataId.currencySymbolRight;
            const left = dataId.currencySymbolLeft;
            if (left === null && right === null || true) {
                rows.push([dataId.orderPrefixId, data.orderProductPrefixId, dataId.shippingFirstname + ' ' + dataId.shippingLastname, dataId.email, data.name, data.productPrice, data.quantity, data.total, dataId.ucOrderStatus, dataId.orderCancelReson]);
            } else {
                if (left !== undefined) {
                    rows.push([dataId.orderPrefixId, data.orderProductPrefixId, dataId.shippingFirstname + ' ' + dataId.shippingLastname, dataId.email, data.name, data.productPrice, data.quantity, left + data.total, data.cancelReason, status]);
                } else {
                    rows.push([dataId.orderPrefixId, data.orderProductPrefixId, dataId.shippingFirstname + ' ' + dataId.shippingLastname, dataId.email, data.name, data.productPrice, data.quantity, data.total + right, data.cancelReason, status]);
                }
            }
        }
        // Add all rows data in sheet
        worksheet.addRows(rows);
        const fileName = './BulkOrderCancelExcel_' + Date.now() + '.xlsx';
        await workbook.xlsx.writeFile(fileName);
        return new Promise((resolve, reject) => {
            response.download(fileName, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    fs.unlinkSync(fileName);
                    return response.end();
                }
            });
        });
    }

    // Back order List API
    /**
     * @api {get} /api/order/back-order-list Back Order List
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {Number} count count in number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully show the Back Order List..!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/order/back-order-list
     * @apiErrorExample {json} back order List error
     * HTTP/1.1 500 Internal Server Error
     */
    // Order Cancel Request List Function
    @Get('/back-order-list')
    @Authorized(['admin', 'back-order-list'])
    public async backOrderProductList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('count') count: number | boolean, @Req() request: any, @Res() response: any): Promise<any> {
        const select = [
            'Order.createdDate as createdDate',
            'Order.orderId as orderId',
            'Order.shippingFirstname as customerFirstName',
            'Order.shippingCity as shippingCity',
            'Order.shippingCountry as shippingCountry',
            'Order.shippingZone as shippingZone',
            'Order.currencyCode as currencyCode',
            'Order.currencySymbolLeft as currencySymbolLeft',
            'Order.currencySymbolRight as currencySymbolRight',
            'orderProduct.orderProductId as orderProductId',
            'orderProduct.orderStatusId as orderProductStatusId',
            'orderProduct.productId as productId',
            'orderProduct.name as name',
            'orderProduct.total as total',
            'orderProduct.orderProductPrefixId as orderProductPrefixId',
            'orderProduct.productPrice as productPrice',
            'orderProduct.quantity as quantity',
        ];

        const relations = [
            {
                tableName: 'Order.orderProduct',
                aliasName: 'orderProduct',
            }];
        const groupBy = [];

        const whereConditions = [];

        whereConditions.push({
            name: 'Order.backOrders',
            op: 'and',
            value: 1,
        });

        const searchConditions = [];
        if (keyword && keyword !== '') {
            searchConditions.push({
                name: ['orderProduct.name', 'orderProduct.orderProductPrefixId'],
                value: keyword.toLowerCase(),
            });

        }

        const sort = [];
        sort.push({
            name: 'Order.createdDate',
            order: 'DESC',
        });
        if (count) {
            const orderCount: any = await this.orderService.listByQueryBuilder(limit, offset, select, whereConditions, searchConditions, relations, groupBy, sort, true, true);
            const Response: any = {
                status: 1,
                message: 'Successfully got the Count',
                data: orderCount,
            };
            return response.status(200).send(Response);
        }
        const orderList: any = await this.orderService.listByQueryBuilder(limit, offset, select, whereConditions, searchConditions, relations, groupBy, sort, false, true);
        const promises = orderList.map(async (results: any) => {
            const temp = results;
            const productImage = await this.productImageService.findOne({
                where: { productId: results.productId, defaultImage: 1 },
                select: ['image', 'containerName'],
            });
            if (productImage !== undefined) {
                temp.image = productImage.image;
                temp.containerName = productImage.containerName;
            } else {
                temp.image = '';
                temp.containerName = '';
            }
            const passingOrderStatus = await this.orderStatusService.findOne({
                where: {
                    orderStatusId: results.orderProductStatusId,
                },
            });
            temp.orderStatusName = passingOrderStatus.name ? passingOrderStatus.name : '';
            temp.orderStatusColorCode = passingOrderStatus.colorCode ? passingOrderStatus.colorCode : '';
            return results;
        });
        const result = await Promise.all(promises);
        const successResponse: any = {
            status: 1,
            message: 'Successfully shown the Back Order list',
            data: result,
        };
        return response.status(200).send(successResponse);
    }

    // failed order List API
    /**
     * @api {get} /api/order/failed-order-list Failed Order List API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {Number} orderId search by orderId
     * @apiParam (Request body) {String} orderStatusId search by orderStatusId
     * @apiParam (Request body) {String} customerName search by customerName
     * @apiParam (Request body) {Number} totalAmount search by totalAmount
     * @apiParam (Request body) {Number} dateAdded search by dateAdded
     * @apiParam (Request body) {Number} count count should be number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get order list",
     *      "data":{
     *      "orderId" : "",
     *      "orderStatusId" : "",
     *      "customerName" : "",
     *      "totalAmount" : "",
     *      "dateAdded" : "",
     *      "dateModified" : "",
     *      "status" : "",
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/order/failed-order-list
     * @apiErrorExample {json} order error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/failed-order-list')
    @Authorized(['admin', 'failed-order-list'])
    public async failedOrderList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('orderId') orderId: string, @QueryParam('orderStatusId') orderStatusId: string, @QueryParam('customerName') customerName: string,
        @QueryParam('totalAmount') totalAmount: string, @QueryParam('dateAdded') dateAdded: string, @QueryParam('count') count: number | boolean,@QueryParam('email') email: string,@QueryParam('mobileNo') mobileNo: string,@QueryParam('fromDate') fromDate: string,@QueryParam('toDate') toDate: string, @Res() response: any): Promise<any> {
        const select = ['orderId', 'orderStatusId', 'orderPrefixId', 'shippingFirstname', 'total', 'createdDate', 'customerId', 'isActive', 'modifiedDate', 'currencyCode', 'currencySymbolLeft', 'currencySymbolRight', 'paymentStatus', 'paymentType', 'paymentProcess',"email",'telephone'];

        const search = [
            {
                name: 'orderPrefixId',
                op: 'and',
                value: orderId,
            },
            {
                name: 'orderStatusId',
                op: 'like',
                value: orderStatusId,
            },
            {
                name: 'shippingFirstname',
                op: 'likeop',
                value: customerName,
            },
            {
                name: 'total',
                op: 'where',
                value: totalAmount,
            },
            {
                name: 'createdDate',
                op: 'like',
                value: dateAdded,
            },
            {
                name: 'paymentProcess',
                op: 'where',
                value: 0,
            },
            {
                name: 'telephone',
                op: 'and',
                value: mobileNo,
            },
            // {
            //     name: 'email',
            //     op: 'and',
            //     value: email,
            // },
            //  {
            //      name: 'telephone',
            //      op: 'and',
            //     value: mobile,
            //  },

            //  {
            //     name: 'createdDate',
            //     op: 'between',
            //    value1: `${fromDate}`,
            //    value2:`${toDate}`

            // },

        ];

      if(email){
        search.push({
            name: 'email',
            op: 'likeop',
            value: email,
        }
        );
       }
    
      console.log("mobile no>>>******************************************",search);
       if (fromDate && toDate) {
        search.push({
            name: 'createdDate',
            value: (`${fromDate},${toDate}`),
            op:"between"
        });
    }

       
        const WhereConditions = [];
        
        const failedOrderList = await this.orderService.list(limit, offset, select, search, WhereConditions, 0, count);
        if (count) {
            const Response: any = {
                status: 1,
                message: 'Successfully got count',
                data: failedOrderList,
            };
            return response.status(200).send(Response);
        }
        const orderStatus = failedOrderList.map(async (value: any) => {
            const status = await this.orderStatusService.findOne({
                where: { orderStatusId: value.orderStatusId },
                select: ['orderStatusId', 'name', 'colorCode'],
            });
            const temp: any = value;
            temp.orderStatus = status;
            return temp;

        });
        const results = await Promise.all(orderStatus);
        const successResponse: any = {
            status: 1,
            message: 'Successfully got the failed order list',
            data: results,
        };
        return response.status(200).send(successResponse);
    }

    //  move failedOrder into mainOrder API
    /**
     * @api {post} /api/order/update-main-order  update FailedOrder into mainOrder API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} orderId Order Id
     * @apiParam (Request body) {Number} paymentStatus 1->paid 2->unpaid
     * @apiParam (Request body) {Number} paymentMethod
     * @apiParam (Request body) {String} paymentRefId
     * @apiParam (Request body) {String} paymentDetail
     * @apiParamExample {json} Input
     * {
     *   "orderId" : "",
     *   "paymentStatus" : "",
     *   "paymentMethod" : "",
     *   "paymentRefId" : "",
     *   "paymentDetail" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated your order.",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/order/update-main-order
     * @apiErrorExample {json} order error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post('/update-main-order')
    @Authorized(['admin', 'move-failed-order-to-main-order'])
    public async updationForMainOrder(@Body({ validate: true }) paymentParam: AddPaymentRequest, @Res() response: any): Promise<any> {
        const updateOrder = await this.orderService.findOrder(paymentParam.orderId);
        if (!updateOrder) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid order Id',
            };
            return response.status(400).send(errorResponse);
        }
        updateOrder.paymentStatus = paymentParam.paymentStatus;
        updateOrder.paymentFlag = paymentParam.paymentStatus;
        const plugin = await this.pluginService.findOne({ where: { id: paymentParam.paymentMethod } });
        updateOrder.paymentMethod = paymentParam.paymentMethod;
        updateOrder.paymentType = plugin.pluginName;
        updateOrder.paymentDetails = paymentParam.paymentRefId;
        updateOrder.paymentProcess = 1;
        await this.orderService.create(updateOrder);
        if (paymentParam.paymentStatus === 1) {
            const paymentParams = new Payment();
            paymentParams.orderId = updateOrder.orderId;
            const date = new Date();
            paymentParams.paidDate = moment(date).format('YYYY-MM-DD HH:mm:ss');
            paymentParams.paymentAmount = updateOrder.total;
            paymentParams.paymentNumber = paymentParam.paymentRefId;
            paymentParams.paymentInformation = paymentParam.paymentDetail;
            const payments = await this.paymentService.create(paymentParams);
            let i;
            const orderProduct = await this.orderProductService.find({ where: { orderId: updateOrder.orderId }, select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice', 'discountAmount', 'discountedAmount', 'couponDiscountAmount'] });
            for (i = 0; i < orderProduct.length; i++) {
                const paymentItems = new PaymentItems();
                paymentItems.paymentId = payments.paymentId;
                paymentItems.orderProductId = orderProduct[i].orderProductId;
                paymentItems.totalAmount = orderProduct[i].total;
                paymentItems.productName = orderProduct[i].name;
                paymentItems.productQuantity = orderProduct[i].quantity;
                paymentItems.productPrice = orderProduct[i].productPrice;
                await this.paymentItemsService.create(paymentItems);
            }
        }
        const successResponse: any = {
            status: 1,
            message: 'Successfully updated your order',
        };
        return response.status(200).send(successResponse);
    }

    // order count for List API
    /**
     * @api {get} /api/order/order-count-for-list Order Count For Order List API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} orderId search by orderId
     * @apiParam (Request body) {String} orderStatusId search by orderStatusId
     * @apiParam (Request body) {String} customerName search by customerName
     * @apiParam (Request body) {String} totalAmount search by totalAmount
     * @apiParam (Request body) {String} dateAdded search by dateAdded
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get order list",
     *      "data":{
     *      "orderId" : "",
     *      "orderStatusId" : "",
     *      "customerName" : "",
     *      "totalAmount" : "",
     *      "dateAdded" : "",
     *      "dateModified" : "",
     *      "status" : "",
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/order/order-count-for-list
     * @apiErrorExample {json} order error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/order-count-for-list')
    @Authorized()
    public async orderCountForList(@QueryParam('orderId') orderId: string, @QueryParam('orderStatusId') orderStatusId: string, @QueryParam('customerName') customerName: string,
        @QueryParam('totalAmount') totalAmount: string, @QueryParam('dateAdded') dateAdded: string, @Res() response: any): Promise<any> {
        const orderList: any = await this.orderService.orderCount(orderId, orderStatusId, totalAmount, customerName, dateAdded);
        const successResponse: any = {
            status: 1,
            message: 'Successfully shown the order count',
            data: orderList,
        };
        return response.status(200).send(successResponse);
    }

    // Product list API
    /**
     * @api {get} /api/order/product-list Product list API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Limit suggestion Showing Successfully..!",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/order/product-list
     * @apiErrorExample {json} Customer Limits error
     * HTTP/1.1 500 Internal Server Error
     */
    // Product List Function
    @Get('/product-list')
    @Authorized('')
    public async productList(
        @Res() response: any
    ): Promise<any> {
        const select = [
            // ('DISTINCT Product.productId as productId'),
            ('DISTINCT Product.productId as productId'),
            'MAX(productToCategory.productToCategoryId) as productToCategoryId',
            'MAX(productToCategory.categoryId) as categoryId',
            'MAX(Product.name) as name',
            'MAX(category.name) as categoryName'];
        const whereCondition = [];
        const searchConditions = [];
        const relations = [{
            tableName: 'Product.productToCategory',
            op: 'left',
            aliasName: 'productToCategory',
        }, {
            tableName: 'productToCategory.category',
            op: 'left',
            aliasName: 'category',
        }];
        const groupBy = [{
            name: 'Product.productId',
        }];
        const sort = [];
        sort.push({
            name: 'Product.createdDate',
            order: 'DESC',
        });
        const productData: any = await this.productService.listByQueryBuilder(0, 0, select, whereCondition, searchConditions, relations, groupBy, sort, false, true);
        const successResponse: any = {
            status: 1,
            message: 'Limit suggestion Showing Successfully..!',
            data: productData,
        };
        return response.status(200).send(successResponse);
    }

    // Sales Report List API
    /**
     * @api {get} /api/order/sales-report-list Sales Report list API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} startDate search by startDate
     * @apiParam (Request body) {String} endDate search by endDate
     * @apiParam (Request body) {String} productId
     * @apiParam (Request body) {String} count count
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully got sales report list",
     *      "data":{
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/order/sales-report-list
     * @apiErrorExample {json} settlement error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/sales-report-list')
    @Authorized(['admin', 'sales-report-list'])
    public async salesReport(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('categoryId') categoryId: string, @QueryParam('productId') productId: string,
        @QueryParam('startDate') startDate: string, @QueryParam('endDate') endDate: string,
        @QueryParam('count') count: number | boolean, @Req() request: any, @Res() response: any): Promise<any> {
        const select = [
            ('DISTINCT OrderProduct.orderProductId as orderProductId'),
            'productInformationDetail.productId as productId',
            'productInformationDetail.name as productName',
            // 'productInformationDetail.gameId as gameId',
            'customer.firstName as firstName',
            'customer.lastName as lastName',
            'OrderProduct.orderProductPrefixId as orderProductPrefixId',
            'OrderProduct.quantity as quantity',
            'OrderProduct.total as total',
            'OrderProduct.discountedAmount as discountedAmount',
            'OrderProduct.orderStatusId as orderStatusId',
            'OrderProduct.discountAmount as discountAmount',
            'OrderProduct.createdDate as createdDate',
            'OrderProduct.productPrice as productPrice',
            'OrderProduct.basePrice as basePrice',
            'OrderProduct.couponDiscountAmount as couponDiscountAmount',
            'orderStatus.name as orderStatusName',
            'customerGroup.name as customerGroup',
            'manufacturer.name as manufacturerName',
            'order.paymentType as paymentType',
            'order.ip as ipAddress'];
        const relations = [];
        const groupBy = [];
        const whereConditions = [];
        whereConditions.push({
            name: '`order`.`payment_process`',
            op: 'and',
            value: 1,
        }, {
            name: '`order`.`payment_status`',
            op: 'and',
            value: 1,
        }, {
            name: '`OrderProduct`.`cancel_request_status`',
            op: 'and',
            value: 0,
        });
        if (productId) {
            relations.push({
                tableName: 'OrderProduct.productInformationDetail',
                aliasName: 'productInformationDetail',
            }, {
                tableName: 'OrderProduct.order',
                aliasName: 'order',
            }, {
                tableName: 'OrderProduct.orderStatus',
                aliasName: 'orderStatus',
            }, {
                tableName: 'order.customer',
                aliasName: 'customer',
            }, {
                tableName: 'customer.customerGroup',
                op: 'left',
                aliasName: 'customerGroup',
            }, {
                tableName: 'productInformationDetail.manufacturer',
                op: 'left',
                aliasName: 'manufacturer',
            });
            whereConditions.push({
                name: 'OrderProduct.productId',
                op: 'IN',
                value: productId,
            });
        }
        if (startDate && startDate !== '') {
            whereConditions.push({
                name: '`OrderProduct`.`created_date`',
                op: 'raw',
                sign: '>=',
                value: startDate + ' 00:00:00',
            });
        }
        if (endDate && endDate !== '') {

            whereConditions.push({
                name: '`OrderProduct`.`created_date`',
                op: 'raw',
                sign: '<=',
                value: endDate + ' 23:59:59',
            });

        }
        const searchConditions = [];
        const sort = [];
        sort.push({
            name: 'OrderProduct.createdDate',
            order: 'DESC',
        });
        const orderList: any = await this.orderProductService.listByQueryBuilder(limit, offset, select, whereConditions, searchConditions, relations, groupBy, sort, false, true);
        const result: any = [];
        let total: any = 0;
        const groupByKey = key => array =>
            array.reduce((objectsByKeyValue, obj) => {
                const value = obj[key];
                objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
                return objectsByKeyValue;
            }, {});
        const groupByType = groupByKey('productName');
        const groupByPeriodTypeArray = groupByType(orderList);
        const groupByPeriodTypeObject = Object.keys(groupByPeriodTypeArray);
        if (groupByPeriodTypeObject && groupByPeriodTypeObject.length > 0) {
            groupByPeriodTypeObject.forEach((periodType: any) => {
                const temp: any = {};
                temp.productName = periodType;
                temp.buyers = groupByPeriodTypeArray[periodType] && groupByPeriodTypeArray[periodType].length > 0 ? groupByPeriodTypeArray[periodType] : [];
                for (const val of groupByPeriodTypeArray[periodType]) {
                    total += +val.total;
                }
                result.push(temp);
            });
        }
        const orderCount: any = await this.orderProductService.listByQueryBuilder(limit, offset, select, whereConditions, searchConditions, relations, groupBy, sort, true, true);
        const successResponse: any = {
            status: 1,
            message: 'Successfully got the sales report list',
            data: result, total, orderCount,
        };
        return response.status(200).send(successResponse);
    }

    // Sales Report List API
    /**
     * @api {get} /api/order/sales-report-excel-list Sales Report excel list API
     * @apiGroup Order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} startDate search by startDate
     * @apiParam (Request body) {String} endDate search by endDate
     * @apiParam (Request body) {String} productId
     * @apiParam (Request body) {String} count count
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully got sales report list",
     *      "data":{
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/order/sales-report-excel-list
     * @apiErrorExample {json} settlement error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/sales-report-excel-list')
    @Authorized(['admin', 'sales-report-export'])
    public async salesExcelReport(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('productId') productId: string,
        @QueryParam('startDate') startDate: string, @QueryParam('endDate') endDate: string,
        @QueryParam('count') count: number | boolean, @Req() request: any, @Res() response: any): Promise<any> {
        const excel = require('exceljs');
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Total Sales Export sheet', { properties: { defaultColWidth: 15 } });
        const rows = [];
        const select = [
            ('DISTINCT orderProduct.orderProductId as orderProductId'),
            'Product.productId as productId',
            'Product.name as productName',
            'customer.firstName as firstName',
            'customer.lastName as lastName',
            'orderProduct.orderProductPrefixId as orderProductPrefixId',
            // 'orderProduct.gameUid as gameUid',
            'orderProduct.orderStatusId as orderStatusId',
            'orderProduct.quantity as quantity',
            'orderProduct.total as total',
            'orderProduct.basePrice as basePrice',
            'orderProduct.discountAmount as discountAmount',
            'orderProduct.couponDiscountAmount as couponDiscountAmount',
            'orderProduct.createdDate as createdDate',
            'orderProduct.productPrice as productPrice',
            'orderStatus.name as orderStatusName',
            'manufacturer.name as manufacturerName',
            'customerGroup.name as groupName',
            'order.paymentType as paymentType',
        ];
        const relations = [];
        relations.push({
            tableName: 'Product.orderProduct',
            aliasName: 'orderProduct',
        }, {
            tableName: 'orderProduct.order',
            aliasName: 'order',
        }, {
            tableName: 'orderProduct.orderStatus',
            aliasName: 'orderStatus',
        }, {
            tableName: 'order.customer',
            aliasName: 'customer',
        }, {
            tableName: 'customer.customerGroup',
            op: 'left',
            aliasName: 'customerGroup',
        }, {
            tableName: 'Product.manufacturer',
            op: 'left',
            aliasName: 'manufacturer',
        });
        const groupBy = [];
        const whereConditions = [];
        whereConditions.push({
            name: '`order`.`payment_process`',
            op: 'and',
            value: 1,
        }, {
            name: '`order`.`payment_status`',
            op: 'and',
            value: 1,
        }, {
            name: '`orderProduct`.`cancel_request_status`',
            op: 'and',
            value: 0,
        });
        if (productId) {
            whereConditions.push({
                name: 'orderProduct.product_id',
                op: 'IN',
                value: productId,
            });
        }
        if (startDate && startDate !== '') {
            whereConditions.push({
                name: '`orderProduct`.`created_date`',
                op: 'raw',
                sign: '>=',
                value: startDate + ' 00:00:00',
            });
        }
        if (endDate && endDate !== '') {

            whereConditions.push({
                name: '`orderProduct`.`created_date`',
                op: 'raw',
                sign: '<=',
                value: endDate + ' 23:59:59',
            });

        }
        const searchConditions = [];
        const sort = [];
        sort.push({
            name: 'orderProduct.createdDate',
            order: 'DESC',
        });
        const orderList: any = await this.productService.listByQueryBuilder(limit, offset, select, whereConditions, searchConditions, relations, groupBy, sort, false, true);
        // const result: any = [];
        const groupByKey = key => array =>
            array.reduce((objectsByKeyValue, obj) => {
                const value = obj[key];
                objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
                return objectsByKeyValue;
            }, {});
        const groupByType = groupByKey('productName');
        const groupByPeriodTypeArray = groupByType(orderList);
        const groupByPeriodTypeObject = Object.keys(groupByPeriodTypeArray);
        if (groupByPeriodTypeObject && groupByPeriodTypeObject.length > 0) {
            groupByPeriodTypeObject.forEach((periodType: any) => {
                const buyers = groupByPeriodTypeArray[periodType] && groupByPeriodTypeArray[periodType].length > 0 ? groupByPeriodTypeArray[periodType] : [];
                rows.push(['Product name-' + '' + periodType + '']);
                rows.push(['Customer name', 'quantity', 'date of purchase', 'payment type', 'Original Amount', 'Discount Amount', 'Total amount', 'Manufacturer Name', 'Order Id', 'orderStatus', 'Customer Group Name']);
                for (const value of buyers) {
                    rows.push([value.firstName + (value.lastName ? value.lastName : ''), value.quantity, value.createdDate, value.paymentType, +value.basePrice, +value.discountAmount, +value.total, value.manufacturerName, value.orderProductPrefixId, value.orderStatusName, value.groupName]);
                }
            });
        }
        worksheet.addRows(rows);
        const fileName = './salesReport_' + Date.now() + '.xlsx';
        await workbook.xlsx.writeFile(fileName);
        return new Promise((resolve, reject) => {
            response.download(fileName, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    fs.unlinkSync(fileName);
                    return response.end();
                }
            });
        });
    }

    @UseBefore(CheckCustomerMiddleware)
    @Get('/customer/order-detail')
    //@Authorized(['admin', 'view-order'])
    public async customerOrderDetail(@QueryParam('orderId') orderid: number, @Req() request: any, @Res() response: any): Promise<any> {
        const orderData = await this.orderService.findOrder({
            where: { orderId: orderid }, select: ['orderId', 'orderStatusId', 'customerId', 'telephone', 'invoiceNo', 'paymentStatus', 'invoicePrefix', 'orderPrefixId', 'shippingFirstname', 'shippingLastname', 'shippingCompany', 'shippingAddress1',
                'shippingAddress2', 'shippingCity', 'email', 'shippingZone', 'shippingPostcode', 'shippingCountry', 'shippingAddressFormat',
                'paymentFirstname', 'paymentLastname', 'paymentCompany', 'paymentAddress1', 'paymentAddress2', 'paymentCity', 'customerGstNo',
                'paymentPostcode', 'paymentCountry', 'paymentZone', 'paymentAddressFormat', 'total', 'customerId', 'createdDate', 'currencyCode', 'currencySymbolLeft', 'currencySymbolRight', 'createdDate', 'discountAmount', 'paymentMethod', 'shippingCharges', 'creditNoteForOrder','paymentRemark'],
        });
        if (!orderData) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid Order Id',
            };
            return response.status(400).send(errorResponse);
        }
        //orderData.productList = await this.ProductService.find()
        orderData.productList = await this.orderProductService.find({
            where: { orderId: orderid }, select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice', 'trackingUrl', 'trackingNo', 'orderStatusId', 'basePrice', 'taxType', 'taxValue', 'discountAmount', 'discountedAmount', 'couponDiscountAmount', 'orderStatusId', 'varientName',
                'skuName', 'productVarientOptionId', 'orderProductPrefixId', 'modifiedDate', 'deliveredDate','refundAmount','itemCode'],
        }).then((val) => {
            const productVal = val.map(async (value: any) => {
                const rating = await this.productRatingService.findOne({ select: ['rating', 'review'], where: { customerId: orderData.customerId, orderProductId: value.orderProductId, productId: value.productId } });
                const productImage = await this.productImageService.findOne({ select: ['image', 'containerName'], where: { productId: value.productId, defaultImage: 1 } });
                const product = await this.productService.findOne({
                    select: ['productSlug', 'upc', 'description'],
                    where: {
                        productId: value.productId,
                    },
                });
                const todayDate = new Date()
                const validDate = new Date(value.deliveredDate)

                const resultDate = validDate.setDate(validDate.getDate() + 10);
                if (value.orderStatusId == 5 && resultDate >= todayDate.getTime()) {
                    value.returnAvailable = true
                } else {
                    value.returnAvailable = false
                }


                const tempVal: any = value;
                tempVal.taxType = value.taxType;
                tempVal.taxValue = value.taxValue;
                tempVal.productSlug = product && product.productSlug ? product.productSlug : null;
                tempVal.upc = product && product.upc ? product.upc : null;
                tempVal.description = product && product.description ? product.description : null;
                if (productImage) {
                    tempVal.image = productImage.image;
                    tempVal.containerName = productImage.containerName;
                }
                const orderProductStatusData = await this.orderStatusService.findOne({
                    where: { orderStatusId: value.orderStatusId },
                    select: ['name', 'colorCode'],
                });
                if (orderProductStatusData) {
                    tempVal.orderStatusName = orderProductStatusData.name;
                    tempVal.statusColorCode = orderProductStatusData.colorCode;
                }
                if (value.taxType === 2) {
                    tempVal.taxValueInAmount = ((value.discountedAmount == "0.00" ? +value.basePrice : +value.discountedAmount) * (+value.taxValue / 100)).toFixed(0);
                } else {
                    tempVal.taxValueInAmount = +value.taxValue;
                }
                if (rating !== undefined) {
                    tempVal.rating = rating.rating;
                    tempVal.review = rating.review;
                } else {
                    tempVal.rating = 0;
                    tempVal.review = '';
                }
                return tempVal;
            });
            const results = Promise.all(productVal);
            return results;
        });
        const orderStatusData = await this.orderStatusService.findOne({
            where: { orderStatusId: orderData.orderStatusId },
            select: ['name', 'colorCode'],
        });
        if (orderStatusData) {
            orderData.orderStatusName = orderStatusData.name;
            orderData.statusColorCode = orderStatusData.colorCode;
        }

        orderData.appliedDiscounts = await this.promotionsUsageOrdersService.find({
            where: { orderId: orderid },
            select: ['orderId', 'promotionType', 'promotionSubType', 'promotionIdentifier', 'couponCode', 'discountValue', 'discountedAmount', 'boughtProductsIds', 'freeProductsIds']

        }).then(promoRecords => {
            const data = promoRecords.map((value: any) => {
                return value;
            });
            const results = Promise.all(data);
            return results;

        });
        const successResponse: any = {
            status: 1,
            message: 'Successfully shown the order Detail',
            data: orderData,
        };
        return response.status(200).send(successResponse);
    }


    @UseBefore(CheckCustomerMiddleware)
    @Get('/customer/orderlist')
    // @Authorized(['admin', 'list-order'])
    public async customerOrderList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('orderId') orderId: string, @QueryParam('orderStatusId') orderStatusId: string, @QueryParam('customerName') customerName: string,
        @QueryParam('totalAmount') totalAmount: string, @QueryParam('dateAdded') dateAdded: string, @QueryParam('count') count: number | boolean, @QueryParam('customerId') customerId: string | boolean, @Res() response: any): Promise<any> {
        const select = [
            'SUM(OrderProduct.quantity) as NoOfItems',
            'MAX(OrderProduct.orderProductId) as orderProductId',
            'order.createdDate as createdDate',
            'order.orderPrefixId as orderPrefixId',
            'order.orderId as orderId',
            'order.shippingFirstname as shippingFirstname',
            'order.amount as total',
            'order.currencyCode as currencyCode',
            'order.currencySymbolLeft as currencySymbolLeft',
            'order.currencySymbolRight as currencySymbolRight',
            'order.orderStatusId as orderStatusId',
            'order.modifiedDate as modifiedDate',
            'MAX(OrderProduct.orderId) as orderId',
            'order.shippingAddress1 as shippingAddress1',
            'order.shippingAddress2 as shippingAddress2',
            'order.shippingCity as shippingCity',
            'order.shippingPostcode as shippingPostcode',
            'order.shippingZone as shippingZone',
        ];

        const relations = [
            {
                tableName: 'OrderProduct.order',
                aliasName: 'order',
            },
        ];
        const groupBy = [{
            name: 'OrderProduct.orderId',
        }];

        const whereConditions = [];

        whereConditions.push(
            //     {
            //     name: 'order.paymentProcess',
            //     op: 'and',
            //     value: 1,
            // },
            {
                name: 'order.customerId',
                op: 'and',
                value: customerId
            }
        );

        const searchConditions = [];
        if (customerName && customerName !== '') {
            searchConditions.push({
                name: ['order.shippingFirstname'],
                value: customerName.toLowerCase(),
            });

        }

        if (orderId && orderId !== '') {
            searchConditions.push({
                name: ['order.orderPrefixId'],
                value: orderId,
            });

        }

        if (totalAmount && totalAmount !== '') {
            whereConditions.push({
                name: ['order.total'],
                op: 'where',
                value: totalAmount,
            });

        }

        if (orderStatusId && orderStatusId !== '') {
            searchConditions.push({
                name: ['OrderProduct.orderStatusId'],
                value: orderStatusId,
            });

        }
        if (dateAdded) {
            searchConditions.push({
                name: ['OrderProduct.createdDate'],
                value: dateAdded,
            });
        }
        const sort = [];
        sort.push({
            name: 'order.createdDate',
            order: 'DESC',
        });
        if (count) {
            const orderCount: any = await this.orderProductService.listByQueryBuilder(limit, offset, select, whereConditions, searchConditions, relations, groupBy, sort, true, true);
            const Response: any = {
                status: 1,
                message: 'Successfully got the order count',
                data: orderCount,
            };
            return response.status(200).send(Response);
        }
        const orderList: any = await this.orderProductService.listByQueryBuilder(limit, offset, select, whereConditions, searchConditions, relations, groupBy, sort, false, true);
        if(false){
        for (let index in orderList) {
            let orderId = orderList[index].orderId;
            const payableAmount: any = await this.paymentService.findPaymentAmount(orderId);


            if (payableAmount.length > 0) {
                orderList[index].payableAmount = payableAmount[0].payment_amount
            } else {
                orderList[index].payableAmount = 0
            }
        }
    }
        const successResponse: any = {
            status: 1,
            message: 'Successfully shown the order list',
            data: orderList,
        };
        return response.status(200).send(successResponse);
    }


    //


    @UseBefore(CheckCustomerMiddleware)
    @Get('/customer/orderlist-by-action')
    // @Authorized(['admin', 'list-order'])
    public async customerOrderListdata(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('orderId') orderId: string, @QueryParam('orderStatusId') orderStatusId: string, @QueryParam('customerName') customerName: string,
        @QueryParam('totalAmount') totalAmount: string, @QueryParam('dateAdded') dateAdded: string, @QueryParam('count') count: number | boolean, @QueryParam('customerId') customerId: string | boolean, @Res() response: any): Promise<any> {
        const select = [
            'COUNT(order.orderId) as NoOfItems',
            'MAX(OrderProduct.orderProductId) as orderProductId',
            'order.createdDate as createdDate',
            'order.orderPrefixId as orderPrefixId',
            'order.orderId as orderId',
            'order.shippingFirstname as shippingFirstname',
            'order.total as total',
            'order.currencyCode as currencyCode',
            'order.currencySymbolLeft as currencySymbolLeft',
            'order.currencySymbolRight as currencySymbolRight',
            'order.orderStatusId as orderStatusId',
            'order.modifiedDate as modifiedDate',
            'MAX(OrderProduct.orderId) as orderId',
            'order.shippingAddress1 as shippingAddress1',
            'order.shippingAddress2 as shippingAddress2',
            'order.shippingCity as shippingCity',
            'order.shippingPostcode as shippingPostcode',
            'order.shippingZone as shippingZone',
        ];

        const relations = [
            {
                tableName: 'OrderProduct.order',
                aliasName: 'order',
            },
        ];
        const groupBy = [{
            name: 'OrderProduct.orderId',
        }];

        const whereConditions = [];

        whereConditions.push(
            //     {
            //     name: 'order.paymentProcess',
            //     op: 'and',
            //     value: 1,
            // },
            {
                name: 'order.customerId',
                op: 'and',
                value: customerId
            },
            {
                name: 'order.orderStatusId',
                op: 'and',
                value: orderStatusId
            }
        );

        const searchConditions = [];
        if (customerName && customerName !== '') {
            searchConditions.push({
                name: ['order.shippingFirstname'],
                value: customerName.toLowerCase(),
            });

        }

        if (orderId && orderId !== '') {
            searchConditions.push({
                name: ['order.orderPrefixId'],
                value: orderId,
            });

        }

        if (totalAmount && totalAmount !== '') {
            whereConditions.push({
                name: ['order.total'],
                op: 'where',
                value: totalAmount,
            });

        }
        // if (orderStatusId && orderStatusId !== '') {
        //     searchConditions.push({
        //         name: ['OrderProduct.orderStatusId'],
        //         value: orderStatusId,
        //     });

        // }
        if (dateAdded) {
            searchConditions.push({
                name: ['OrderProduct.createdDate'],
                value: dateAdded,
            });
        }
        const sort = [];
        sort.push({
            name: 'order.createdDate',
            order: 'DESC',
        });
        if (count) {
            const orderCount: any = await this.orderProductService.listByQueryBuilder(limit, offset, select, whereConditions, searchConditions, relations, groupBy, sort, true, true);
            const Response: any = {
                status: 1,
                message: 'Successfully got the order count',
                data: orderCount,
            };
            return response.status(200).send(Response);
        }
        const orderList: any = await this.orderProductService.listByQueryBuilder(limit, offset, select, whereConditions, searchConditions, relations, groupBy, sort, false, true);
        const successResponse: any = {
            status: 1,
            message: 'Successfully shown the order list',
            data: orderList,
        };
        return response.status(200).send(successResponse);
    }



    public async getRefundAllRecords(orderId:any) {
       const result = await getManager().query(`SELECT SUM(total_amount) totalRefund FROM tm_order_cancel_requests oc WHERE oc.order_id=${orderId} AND oc.cancel_request_status='Pending'`)
       console.log(result)
        return { totalRefundAmount: result[0].totalRefund};
    }

    @Post('/get-refund-info')
    public async getRefundInfo(@Body() refundOrder: any, @Res() res: any): Promise<any> {
        const orderId = refundOrder.orderId;
        const allRecords = await this.getRefundAllRecords(orderId);

        return res.status(200).send({
            status: 1,
            showMessage: "No",
            message: 'Refund Information Found',
            data: allRecords,
        });
    }

    @Post('/initiate-refund')
    public async initiateRefund(@Body() refundPayload: any, @Res() response: any): Promise<any> {
        const { UnicommeService : dd } = require('../services/admin/UnicomService');
        let c = new dd();
        const saleLength:any = refundPayload.orderCancelRequest.length
        let result:any={}
        let orderCancelList:any[]=[] 
        console.log("refundPayload",refundPayload)
        for(let i=0; i<saleLength; i++){
         const getSaleOrder = await c.getSaleOrder(refundPayload.orderPrefixId)
         if(getSaleOrder.response=='ORDER_NOT_FOUND_ON_UC' || (getSaleOrder.response && getSaleOrder.response.shippingPackages && getSaleOrder.response.shippingPackages.length==0 || getSaleOrder.response.shippingPackages[0].status=="CREATED" || getSaleOrder.response.shippingPackages[0].status=="PACKED" || getSaleOrder.response.shippingPackages[0].status=="PICKED"  || getSaleOrder.response.shippingPackages[0].status=="PICKING" || getSaleOrder.response.shippingPackages[0].status=="RETURNED" || getSaleOrder.response.shippingPackages[0].status=="CANCELLED")){
             orderCancelList.push(getSaleOrder.response)
         }else{
             result.status=500
             result.data=null
             result.message=`Order Can not cancel at this stage status ${getSaleOrder.response.shippingPackages[0].status}`
             return result
         }
        }
 if(saleLength>0 && orderCancelList.length==saleLength){
            const actionTaken = refundPayload.action;
            const newOrderId = refundPayload.orderId;
            const allRecords:any = await this.getRefundAllRecords(newOrderId);
            const cancelOrderRequestId = refundPayload.cancelOrderRequestId;
            let errorOccured = false;
            let responseMsg = '';
            let status = 1;
            console.log("allRecords",allRecords)
            let transactionStatus:boolean=false
            if (allRecords.totalRefundAmount>0) {
                const bankRequests:any=refundPayload.bankRequests
                const bankLength:number = bankRequests.length
            if(refundPayload.cnCouponReverse){
            this._creditNoteRepo.markCnActiveByOrderId(newOrderId)
            }
                for(let i=0; i<bankLength; i++){
                    let refundAmount:number=0
if(bankLength==saleLength){
    console.log("1111111111111111")
    refundAmount = allRecords.totalRefundAmount    
}else{
    console.log("22222222222222")
    refundAmount=bankRequests[i].total
}
// refundAmount = allRecords.totalRefundAmount
                    let paymentName:any=  (bankRequests[i].paymentMethod).toLowerCase();
                    const prefixOrderId = bankRequests[i].orderPrefixId;
                    const newOrderTotal = refundAmount;
                    const orderId = bankRequests[i].orderId;
                    if (paymentName == "paytm") {
                        const pluginInfo = await this.pluginService.findOne({ where: { id: 8 } });
console.log("paytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytmpaytm",orderId, prefixOrderId, newOrderTotal, pluginInfo,paymentName)
                        const paytmRes = await this._paytmService.initiateRefund(orderId, prefixOrderId, newOrderTotal, pluginInfo, refundPayload.orderProductId);
                        if (paytmRes.success) {
                            try{
                                await c.cancelSaleOrderPartial(refundPayload.orderCancelRequest);
                                const orderProductId:any = refundPayload.orderProductId.split(',')
                                console.log("orderProductId11",orderProductId)
                                const length:any=orderProductId.length
                                let orderProducts:any[]=[]
                                orderProductId.forEach((element:any) => {
                                    orderProducts.push({orderProductId:element})
                                });
                                console.log("orderProductsorderProductsorderProducts322",orderProducts)
                                await  this._orderStatusHistoryController.saveStatusHistory(refundPayload.orderId, refundPayload.orderPrefixId,orderProducts,length,30,1,1,1)
                                const orderJson:any = {
                                    orderProductIds:refundPayload.orderProductId, 
                                    orderStatusId:30,
                                    orderId:refundPayload.orderId
                                }
                                console.log("orderJson",orderJson)
                                await this.orderService.updateOrderProductStatus(orderJson)
                                transactionStatus=true
                                responseMsg += "Paytm Refunded successfully: Order Id " + prefixOrderId+ " Message From Payment Gateway"+paytmRes.message+"\n";
                            }catch{
                                console.log("Catch")
                            }
                        } else {
                            errorOccured = true;
                            responseMsg += "Paytm Refunded Error: Order Id " + prefixOrderId+ " Error Message From Payment Gateway"+paytmRes.message+ "\n";
                            status = 500;
                        }
                    }

                    if (paymentName == "ingenico") {
                        console.log("Ingenico",orderId, prefixOrderId, newOrderTotal, paymentName)
                        const pluginInfo = await this.pluginService.findOne({ where: { id: 9 } });
                        const plugInfo = pluginInfo.pluginAdditionalInfo;
                        const parsedInfo = JSON.parse(plugInfo);

                        const ingenicoRes = await this._ingenicoService.initiateRefund(orderId, prefixOrderId, newOrderTotal, parsedInfo);

                        if (ingenicoRes.success) {
                            try{
                                await c.cancelSaleOrderPartial(refundPayload.orderCancelRequest);
                                const orderProductId:any = refundPayload.orderProductId.split(',')
                                const length:any=orderProductId.length
                                let orderProducts:any[]=[]
                                orderProductId.forEach((element:any) => {
                                    orderProducts.push({orderProductId:element})
                                });
                                await  this._orderStatusHistoryController.saveStatusHistory(refundPayload.orderId, refundPayload.orderPrefixId,orderProducts,length,30,1,1,1)
                                transactionStatus=true
                                const orderJson:any = {
                                    orderProductIds:refundPayload.orderProductId, 
                                    orderStatusId:30,
                                    orderId:refundPayload.orderId
                                }
                                console.log("orderJson",orderJson)
                                await this.orderService.updateOrderProductStatus(orderJson)
                            }catch{
                                console.log("Catch")
                            }
                            responseMsg += "Ingenico Refunded successfully: Order Id " + prefixOrderId +" Message From Payment Gateway"+ ingenicoRes.message+"\n";
                        } else {
                            errorOccured = true;
                            responseMsg += "Ingenico Refunded Error: Order Id " + prefixOrderId + " Error Message From Payment Gateway"+ ingenicoRes.message+"\n";
                            status = 500;
                        }
                    }
                }
                console.log("transactionStatustransactionStatustransactionStatus",transactionStatus)
                if(transactionStatus){
                if(actionTaken == "FULL_ORDER_RETURN" ){
                    const orderReturnRepo = getManager().getRepository(OrderReturn);
                    await orderReturnRepo.createQueryBuilder().update().set({ returnStatus: 2 }).where("id=:pid", { pid: cancelOrderRequestId }).execute();
                }else{
                    await getManager().query(`UPDATE tm_order_cancel_requests SET cancel_request_status = 'Approved', modified_date=now() WHERE order_product_id in (${refundPayload.orderProductId})`)
                }
            }
                if(!errorOccured && transactionStatus){
                    /*Send Refund Initiated Email to Customer Starts Here*/
                    const emailTemp = getManager().getRepository(EmailTemplate)
                    const emailContent = await emailTemp.findOne({where: {title: "REFUND_INITIATED"}});
                    
                    const orderDetails = await this.orderService.findOne(Number(newOrderId));
                    
                    const emailBody = emailContent.content.replace('{refundAmount}', allRecords.totalRefundAmount.toString());
                    const sendEmailTo = orderDetails.email;
                    const emailSubject = emailContent.subject;
                    MAILService.notifyCustomer(null, emailBody, sendEmailTo, emailSubject, null);
                    /*Send Refund Initiated Email to Customer Ends Here*/
                }

                return response.status(200).send({
                    status: status,
                    message: responseMsg,
                    data: {}
                })

            }

        
    }else{
        result.status=500
        result.data=null
        result.message=`Order Can not cancel at this stage status`
        return result
    }
    }

    @Get('/order-report')
    @Authorized(['admin', 'list-order'])
    public async orderReport(@QueryParams() quertData: any) {

        const orderTable: string = "`order`"
        const fromDate: string = quertData.fromDate
        const toDate: string = quertData.toDate
        const orderStatusIds: string = quertData.orderStatusIds.length>10?'1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50':quertData.orderStatusIds

        const header: any = { key1: "`Coupon Code`", key2: "`Coupon Amount`", key3: "`Ref. Order ID (CN)`" }
        let report = await getManager().query(`SELECT sub_query.Sub_Order_Id  as odId, sub_query.*, SUM(sub_query.loyalty) AS 'Loyalty Point Redeemed Value' from (SELECT od.order_prefix_id AS 'Order ID', max(op.order_product_prefix_id) AS Sub_Order_Id, od.created_date AS 'Order Date', CONCAT(od.shipping_firstname) AS 'Customer Name', od.email AS 'Email ID', od.telephone AS 'Contact Number-1',  od.phone_number_alter AS 'Contact Number-2', CONCAT(od.shipping_address_1,' ',od.shipping_address_2) AS  'Shipping Address', od.shipping_city AS 'City', od.shipping_zone AS 'State', od.shipping_postcode AS 'Pin Code', ct.name AS 'Category', op.sku_name AS 'SKU', op.facility_name AS 'Facility Name', pt.upc AS 'Article', SUBSTR(op.varient_name, 1, LOCATE(',', op.varient_name) - 1) AS 'Size', SUBSTR(op.varient_name, LOCATE(',', op.varient_name) + 1) AS 'Color', op.quantity AS 'Order Qty', od.total_items_price AS 'Order Amount (MRP)', ROUND(op.base_price+(op.base_price*op.tax_value/100), 0) AS 'Sub-order Amount (MRP)', pt.product_selling_price AS 'Product Selling Price', CASE WHEN(puo.promotion_type='CouponBased') THEN puo.coupon_code ELSE 'NULL' END AS 'Coupon Code', CASE WHEN(puo.promotion_type='CouponBased') THEN puo.discounted_amount ELSE 'NULL' END AS 'Coupon Amount', cn.cn_code AS 'Credit Note No.', cn.cn_amount AS 'Credit Note Amount', cn.channel_name as 'CN Channel Name', (select sod.order_prefix_id from ${orderTable} sod where  sod.order_id=cn.cn_source_order_id) as 'Ref. Order ID (CN)', CASE WHEN(puo.promotion_type='loyaltyPoint') THEN puo.discounted_amount ELSE 0 END AS 'loyalty', od.discount_amount AS 'Promotional Discount Value', od.shipping_charges AS 'Shipping Charges', od.total AS 'Total Payable Amount',  CASE WHEN od.payment_type IS NOT NULL THEN CONCAT('ONLINE',' ',od.payment_type) ELSE 'COD' END AS 'Payment Mode', os.name AS 'Order Status' FROM ${orderTable} AS od INNER JOIN order_product AS op ON od.order_id=op.order_id INNER JOIN product as pt ON pt.product_id=op.product_id INNER JOIN product_to_category AS ptc ON ptc.product_id=op.product_id INNER JOIN category AS ct ON ptc.category_id=ct.category_id INNER JOIN order_status AS os ON os.order_status_id=op.order_status_id LEFT JOIN tt_promotions_usage_orders AS puo ON puo.order_id= od.order_id LEFT JOIN tt_credit_notes as cn ON cn.cn_applied_order_id=od.order_id WHERE (DATE(od.created_date) BETWEEN '${fromDate}' AND '${toDate}') AND op.order_status_id IN (${orderStatusIds}) AND ct.parent_int!=0 GROUP BY pt.product_selling_price, od.payment_type, pt.upc, od.total, cn.cn_code, cn.cn_amount, od.shipping_charges, od.total_items_price, od.total_tax, od.shipping_postcode, od.shipping_zone, od.shipping_city, od.shipping_address_2, od.shipping_address_1, od.phone_number_alter, od.telephone, od.email, od.shipping_lastname, od.shipping_firstname, od.created_date, od.order_prefix_id, op.order_product_prefix_id, ct.name, op.sku_name, op.name, op.varient_name, op.quantity, op.product_price, os.name, puo.promotion_type, puo.coupon_code, puo.discounted_amount, op.base_price, op.tax_value, od.discount_amount, ${header.key1}, ${header.key2}, ${header.key3} ORDER BY od.created_date DESC) as sub_query group by odId;`)
        // AND ct.parent_int!=0 AND ct.name!='socks' AND ct.name!='belt'
        //LEFT JOIN tm_coupon_based_promotion AS cbp ON cbp.coupon_code=puo.coupon_code  left join removed due to query slow
        report.forEach((element:any, i) => {
            report[i]["Order Date"]=moment(element["Order Date"]).format('YYYY-MM-DD HH:mm:ss');    
            delete report[i]['loyalty']
            delete report[i]['odId']
        });
        return report
    }

    @Get('/payment-report')
    @Authorized(['admin', 'list-order'])
    public async paymentReport(@QueryParams() quertData: any) {
        const orderTable: string = "`order`"
        const fromDate: string = quertData.fromDate
        const toDate: string = quertData.toDate
        const paymentStatus: string = quertData.paymentStatus
        const report = await getManager().query(`SELECT od.order_prefix_id 'Order ID', op.order_product_prefix_id 'Sub-order ID',   CONCAT(od.shipping_firstname,' ',shipping_lastname) 'Customer Name', od.email 'Email ID', od.telephone AS 'Contact Number-1', od.phone_number_alter 'Contact Number-2', DATE_FORMAT(od.created_date, '%d-%m-%Y') 'Payment Date',  (od.total_items_price+od.shipping_charges) 'Total Amount',  CASE WHEN od.payment_type IS NOT NULL THEN CONCAT('ONLINE',' ',od.payment_type) ELSE 'COD' END 'Payment Mode', od.payment_details 'Transaction ID', NULL 'UTR No.',   CASE WHEN od.payment_status=0 THEN 'Pending' WHEN od.payment_status=2 THEN 'Failed' ELSE 'Success' END 'Payment Status' FROM ${orderTable} od   INNER JOIN order_product op ON op.order_id=od.order_id WHERE  (DATE(od.created_date) BETWEEN '${fromDate}' AND '${toDate}') AND  od.payment_status=${paymentStatus} ORDER BY od.created_date DESC`)
        return report
    }

    @UseBefore(CheckCustomerMiddleware)
    @Get('/customer/orderlist-by-customer-id')
    public async orderListByCustomerId(@QueryParams() queryData: any) {

    }

    @Get('/order-cancel-requests')
    @Authorized(['admin', 'list-order'])
    public async orderCancelRequestList(@Req() request: any, @QueryParams() queryParams: any, @Res() res: any) {
        const requestStatus = queryParams.request_status;
        
        const orderCancelReqRepo = getManager().getRepository(OrderCancelRequests)
  
            if(queryParams.orderId){
            var orderId=queryParams.orderId;
             var pendingRequests = await orderCancelReqRepo.createQueryBuilder("cr")
            .select(["MAX(cr.id) as Id", "o.order_id as orderId", "MAX(o.order_prefix_id) AS orderPrefixId", "MAX(o.shippingFirstname) as shippingFirstname", "MAX(cr.cancel_request_reason) AS orderCancelReson", "MAX(cr.cancel_request_remark) AS orderCancelRemark", "MAX(cr.created_date) AS createdDate","MAX(o.email) as email",'MAX(o.telephone) as mobile'])
            .innerJoin(Order, "o", "cr.order_id = o.order_id")
            .where("cr.cancel_request_status IN(:status)", { status:  requestStatus})
            .andWhere(`o.order_prefix_id='${orderId}'`)
            .addGroupBy('cr.order_id')
            .orderBy('id','DESC')
            .getRawMany()
             }else if(queryParams.email){
                var email=queryParams.email;
             var pendingRequests = await orderCancelReqRepo.createQueryBuilder("cr")
            .select(["MAX(cr.id) as Id", "o.order_id as orderId", "MAX(o.order_prefix_id) AS orderPrefixId", "MAX(o.shippingFirstname) as shippingFirstname", "MAX(cr.cancel_request_reason) AS orderCancelReson", "MAX(cr.cancel_request_remark) AS orderCancelRemark", "MAX(cr.created_date) AS createdDate","MAX(o.email) as email",'MAX(o.telephone) as mobile'])
            .innerJoin(Order, "o", "cr.order_id = o.order_id")
            .where("cr.cancel_request_status IN(:status)", { status:  requestStatus})
            .andWhere(`o.email like '${email}%'`)
            .addGroupBy('cr.order_id')
            .orderBy('id','DESC')
            .getRawMany()
   
             }else if(queryParams.customerName){
                var customerName=queryParams.customerName;
             var pendingRequests = await orderCancelReqRepo.createQueryBuilder("cr")
            .select(["MAX(cr.id) as Id", "o.order_id as orderId", "MAX(o.order_prefix_id) AS orderPrefixId", "MAX(o.shippingFirstname) as shippingFirstname", "MAX(cr.cancel_request_reason) AS orderCancelReson", "MAX(cr.cancel_request_remark) AS orderCancelRemark", "MAX(cr.created_date) AS createdDate","MAX(o.email) as email",'MAX(o.telephone) as mobile'])
            .innerJoin(Order, "o", "cr.order_id = o.order_id")
            .where("cr.cancel_request_status IN(:status)", { status:  requestStatus})
            .andWhere(`o.shipping_firstname like '${customerName}%'`)
            .addGroupBy('cr.order_id')
            .orderBy('id','DESC')
            .getRawMany()
             }
             else if(queryParams.mobileNo){
                var mobile=queryParams.mobileNo;
             var pendingRequests = await orderCancelReqRepo.createQueryBuilder("cr")
            .select(["MAX(cr.id) as Id", "o.order_id as orderId", "MAX(o.order_prefix_id) AS orderPrefixId", "MAX(o.shippingFirstname) as shippingFirstname", "MAX(cr.cancel_request_reason) AS orderCancelReson", "MAX(cr.cancel_request_remark) AS orderCancelRemark", "MAX(cr.created_date) AS createdDate","MAX(o.email) as email",'MAX(o.telephone) as mobile'])
            .innerJoin(Order, "o", "cr.order_id = o.order_id")
            .where("cr.cancel_request_status IN(:status)", { status:  requestStatus})
            .andWhere(`o.telephone='${mobile}'`)
            .addGroupBy('cr.order_id')
            .orderBy('id','DESC')
            .getRawMany()
             }
             else if(queryParams.fromDate && queryParams.toDate){
                var fromDate=queryParams.fromDate;
                var toDate=queryParams.toDate;
             var pendingRequests = await orderCancelReqRepo.createQueryBuilder("cr")
            .select(["MAX(cr.id) as Id", "o.order_id as orderId", "MAX(o.order_prefix_id) AS orderPrefixId", "MAX(o.shippingFirstname) as shippingFirstname", "MAX(cr.cancel_request_reason) AS orderCancelReson", "MAX(cr.cancel_request_remark) AS orderCancelRemark", "MAX(cr.created_date) AS createdDate","MAX(o.email) as email",'MAX(o.telephone) as mobile'])
            .innerJoin(Order, "o", "cr.order_id = o.order_id")
            .where("cr.cancel_request_status IN(:status)", { status:  requestStatus})
            .andWhere(`Date(cr.created_date) between Date('${fromDate}') and Date('${toDate}')`)
            .addGroupBy('cr.order_id')
            .orderBy('id','DESC')
            .getRawMany()
             }
             else{
                var pendingRequests = await orderCancelReqRepo.createQueryBuilder("cr")
                .select(["MAX(cr.id) as Id", "o.order_id as orderId", "MAX(o.order_prefix_id) AS orderPrefixId", "MAX(o.shippingFirstname) as shippingFirstname", "MAX(cr.cancel_request_reason) AS orderCancelReson", "MAX(cr.cancel_request_remark) AS orderCancelRemark", "MAX(cr.created_date) AS createdDate","MAX(o.email) as email",'MAX(o.telephone) as mobile'])
                .innerJoin(Order, "o", "cr.order_id = o.order_id")
                .where("cr.cancel_request_status IN(:status)", { status:  requestStatus})             
                .addGroupBy('cr.order_id')
                .orderBy('id','DESC')   
                .getRawMany()

             }

        return res.status(200).send({
            status: 1,
            message: "Data Found successfully",
            data: pendingRequests
        })


    }

    @Post('/reject-return-request')
    @Authorized(['admin', 'list-order'])
    public async rejectReturnRequest(@Body() returnPayload: any, @Res() response: any): Promise<any> {
        const returnRequestId = returnPayload.returnRequestId;
        if (returnRequestId) {
            const orderReturnRepo = getManager().getRepository(OrderReturn);
            const orderProductRepo = getManager().getRepository(OrderProduct);
            const recordFound = await orderReturnRepo.findOne({ where: { id: returnRequestId } })
            if (recordFound) {
                await orderReturnRepo.createQueryBuilder().update().set({ returnStatus: 2 }).where("id=:pid", { pid: returnRequestId }).execute();
                if(recordFound.returnType == "FULL_ORDER_RETURN"){
                    await orderProductRepo.createQueryBuilder().update().set({ orderStatusId: 5 }).where("order_id=:pid", { pid: recordFound.orderId }).execute();
                }else{
                    await orderProductRepo.createQueryBuilder().update().set({ orderStatusId: 5 }).where("order_product_id=:pid", { pid: recordFound.orderProductId }).execute();
                }
                return response.status(200).send({
                    status: 1,
                    message: "Request rejected successfully",
                    data: ''
                })

            } else {
                return response.status(200).send({
                    status: 0,
                    message: "Please enter valid return Id",
                    data: ''
                })
            }
        } else {
            return response.status(200).send({
                status: 0,
                message: "Please enter valid return Id",
                data: ''
            })
        }
    }

    @Post('/close-return-request')
    @Authorized(['admin', 'list-order'])
    public async closeReturnRequest(@Body() returnPayload: any, @Res() response: any): Promise<any> {
        try{
        const returnRequestId:any = returnPayload.returnRequestId;
                await getManager().query(`UPDATE tm_order_return SET return_status=2 and modified_date=now() WHERE id in (${returnRequestId})`)
                return response.status(200).send({
                    status: 1,
                    message: "Request closed successfully",
                    data: ''
                })
      
        } catch {
            return response.status(200).send({
                status: 0,
                message: "Please enter valid return Id",
                data: ''
            })
        }
    }

    public async getRefundRecordsForAfterDelivery(request:any) {
        // const latestOrderInfo = await this.orderService.findOne(Number(orderId))
        // let refundInfo = [];
        let totalRefund = 0;
        //     if (latestOrderInfo.oldCnSourceOrderIds) {
        //         const oldOrderIds = latestOrderInfo.oldCnSourceOrderIds.split(",");
        //         for (let p = 0; p < oldOrderIds.length; p++) {
        //             const rec = await getManager().query('SELECT order_id AS orderId, order_prefix_id AS orderPrefixId, total, shipping_firstname AS customerName, payment_type AS paymentType, payment_method AS paymentMethod from `order` where order_id = ' + oldOrderIds[p])
        //             refundInfo.push({
        //                     "orderId": rec[0].orderId,
        //                     "orderPrefixId": rec[0].orderPrefixId,
        //                     "total": rec[0].total,
        //                     "customerName": rec[0].customerName,
        //                     "paymentType": rec[0].paymentMethod == 2 ? "COD" : rec[0].paymentType
        //                 })
        //         }
        //     }
        //     refundInfo.push({
        //         "orderId": latestOrderInfo.orderId,
        //         "orderPrefixId": latestOrderInfo.orderPrefixId,
        //         "total": latestOrderInfo.total,
        //         "customerName": latestOrderInfo.shippingFirstname,
        //         "paymentType": latestOrderInfo.paymentMethod == 2 ? "COD" : latestOrderInfo.paymentType
        //     })
        //     refundInfo.sort(function(a, b){
        //         return (a.orderId > b.orderId) ? -1 : ((a.orderId < b.orderId) ? 1 : 0);
        //     });
        //     const onlineRefundList:any=refundInfo.filter(item=>item.paymentType!='COD')
        let onlineRefundList:any = await getManager().query(`select refund_amount from order_product where order_product_id in (${request.orderProductId})`)
        console.log("onlineRefundList",onlineRefundList)
            totalRefund = onlineRefundList.reduce((a:any, b:any)=> Number(a) + Number(b.refund_amount),0)
            return {totalRefundAmount:totalRefund};
        }
    


    @Post('/get-refund-info-for-afterdelivery')
    public async getRefundInfoAfterDelivery(@Body() refundOrder: any, @Res() res: any): Promise<any> {
        const allRecords:any = await this.getRefundRecordsForAfterDelivery(refundOrder);

        return res.status(200).send({
            status: 1,
            showMessage: "No",
            message: 'Refund Information Found',
            data: allRecords,
        });
    }

    public async updateRefundBlncSummary (orderId:number, refundAmount:number) {
        const refundBalancySummaryRepo = getManager().getRepository(RefundBalanceSummaryModel);
        const orderRefundSumamry = await refundBalancySummaryRepo.findOne({where: {order_id: orderId}}); 
        const balanceAmount = Math.round(orderRefundSumamry.total_order_balance_amount) - refundAmount;
        await refundBalancySummaryRepo.createQueryBuilder().update().set({ total_order_balance_amount: balanceAmount }).where("order_id=:oid", { oid: orderId }).execute();
    }

    @Post('/initiate-refund-of-return-item')
    public async initiateRefundOfReturnItem(@Body() refundPayload: any, @Res() response: any): Promise<any> {
        console.log(refundPayload)
        if (refundPayload.orderId && refundPayload.orderProductId) {

            const orderId = refundPayload.orderId;
            const orderProductId = refundPayload.orderProductId;
            const allRecords:any = await this.getRefundRecordsForAfterDelivery(refundPayload);
            console.log("allRecordsallRecordsallRecords",allRecords)
            const refundAmount = allRecords.totalRefundAmount;
            if (refundAmount > 0) {
                let finalRefundAmount = 0;
                let errorOccured = false;
                const bankRequest:any = refundPayload.bankRequests
                for (let r = 0; r < bankRequest.length; r++) {
                    if(refundAmount>bankRequest[r].total){
                        finalRefundAmount=bankRequest[r].total
                    }else{
                        finalRefundAmount=refundAmount
                    }
                    const paymentName = (bankRequest[r].paymentMethod).toLowerCase();
                    const prefixOrderId = bankRequest[r].orderPrefixId;
                    //const newOrderTotal = allRecords.refundInfo[r].total;

                    let refundOrderId = bankRequest[r].orderId;
  
                    if (paymentName == "paytm") {
                        const pluginInfo = await this.pluginService.findOne({ where: { id: 8 } });
               
                            const paytmRes:any = await this._paytmService.initiateRefund(refundOrderId, prefixOrderId, finalRefundAmount, pluginInfo, `${refundOrderId}_${orderProductId}`);

                            if (paytmRes.success) {
                                await this.updateRefundBlncSummary(refundOrderId, finalRefundAmount);
                            } else {
                                errorOccured = true;
                            }
                    }

                    if (paymentName == "ingenico") {
                        console.log("finalRefundAmount",finalRefundAmount)
                        const pluginInfo = await this.pluginService.findOne({ where: { id: 9 } });
                        const plugInfo = pluginInfo.pluginAdditionalInfo;
                        const parsedInfo = JSON.parse(plugInfo);


                        const ingenicoRes = await this._ingenicoService.initiateRefund(`${refundOrderId}_${orderProductId}`, prefixOrderId, finalRefundAmount, parsedInfo);
                        console.log("ingenicoRes",ingenicoRes)
                        if (ingenicoRes.success) {
                            await this.updateRefundBlncSummary(refundOrderId, finalRefundAmount);
                        } else {
                            errorOccured = true;
                        }
        
                    }

                        
                }

                if(!errorOccured){
                    await getManager().query(`UPDATE tm_order_return SET return_status = '2', modified_date=DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 HOUR), INTERVAL 30 MINUTE) WHERE order_product_id in (${orderProductId})`)
                    const length:any = orderProductId.split(',').length
                    await  this._orderStatusHistoryController.saveStatusHistory(refundPayload.orderId, refundPayload.orderPrefixId,orderProductId,length,30,1,1,1)
                                const orderJson:any = {
                                    orderProductIds:orderProductId, 
                                    orderStatusId:30,
                                    orderId:refundPayload.orderId
                                }
                                console.log("orderJson",orderJson)
                                await this.orderService.updateOrderProductStatus(orderJson)

                    /*Send Refund Initiated Email to Customer Starts Here*/
                    const emailTemp = getManager().getRepository(EmailTemplate)
                    const emailContent = await emailTemp.findOne({where: {title: "REFUND_INITIATED"}});
                    const orderDetails = await this.orderService.findOne(orderId);
                    const emailBody = emailContent.content.replace('{refundAmount}', allRecords.totalRefundAmount.toString());
                    const sendEmailTo = orderDetails.email;
                    const emailSubject = emailContent.subject;
                    MAILService.notifyCustomer(null, emailBody, sendEmailTo, emailSubject, null);
                    /*Send Refund Initiated Email to Customer Ends Here*/

                }
                if(errorOccured){
                    return response.status(200).send({
                        status: 0,
                        message: "Something went wrong on Bank side. Please try later",
                        data: {}
                    })
                }else{
                    return response.status(200).send({
                        status: 1,
                        message: "All refunds initiated successfully",
                        data: {}
                    })
                }
                

            }

        } else {
            return response.status(200).send({
                status: 1,
                message: "Order id mandetory.",
                data: {}
            })
        }

    }

    public async getCnRecordsForAfterDelivery(orderId, orderProductId) {
        const latestOrderInfo = await this.orderService.findOne(Number(orderId))
        const latestOrderProductInfo = await this.orderProductService.findOne(Number(orderProductId))


        const orderTotal = Math.round(latestOrderInfo.total);
        const productRefundableTotal = Math.round(latestOrderProductInfo.total);
       
        let refundInfo = [];
        let totalRefund = 0;
        if (productRefundableTotal <= orderTotal) {
            refundInfo.push({
                "orderId": latestOrderInfo.orderId,
                "orderPrefixId": latestOrderInfo.orderPrefixId,
                "total": latestOrderInfo.total,
                "customerName": latestOrderInfo.shippingFirstname,
                "paymentType": latestOrderInfo.paymentMethod == 2 ? "COD" : latestOrderInfo.paymentType
            })
            return { totalRefundAmount: totalRefund +  Number(productRefundableTotal), refundInfo };
        } else {




            let refundInfo = [];
            let totalRefund = 0;
            if (latestOrderInfo.oldCnSourceOrderIds) {
                const oldOrderIds = latestOrderInfo.oldCnSourceOrderIds.split(",");

                for (let p = 0; p < oldOrderIds.length; p++) {
                    const rec = await getManager().query('SELECT order_id AS orderId, order_prefix_id AS orderPrefixId, total, shipping_firstname AS customerName, payment_type AS paymentType, payment_method AS paymentMethod from `order` where order_id = ' + oldOrderIds[p])
                    refundInfo.push(
                        {
                            "orderId": rec[0].orderId,
                            "orderPrefixId": rec[0].orderPrefixId,
                            "total": rec[0].total,
                            "customerName": rec[0].customerName,
                            "paymentType": rec[0].paymentMethod == 2 ? "COD" : rec[0].paymentType
                        }

                    )
                   //  totalRefund = totalRefund + (rec[0].paymentMethod == 2?0:Number(rec[0].total));
                }
            }
            refundInfo.push({
                "orderId": latestOrderInfo.orderId,
                "orderPrefixId": latestOrderInfo.orderPrefixId,
                "total": latestOrderInfo.total,
                "customerName": latestOrderInfo.shippingFirstname,
                "paymentType": latestOrderInfo.paymentMethod == 2 ? "COD" : latestOrderInfo.paymentType
            })
            refundInfo.sort(function(a, b) {
                return (a.orderId > b.orderId) ? -1 : ((a.orderId < b.orderId) ? 1 : 0);
            });
            return { totalRefundAmount: totalRefund + (latestOrderInfo.paymentMethod == 2 ? Number(latestOrderInfo.total) : Number(productRefundableTotal)), refundInfo };
        }
    }
    @Post('/get-cn-info-for-afterdelivery')
    @Authorized(['admin', 'list-order'])
    public async getCnInfoAfterDelivery(@Body() refundOrder: any, @Res() res: any): Promise<any> {
        const orderId = refundOrder.orderId;
        const orderProductId = refundOrder.orderProductId;
        const allRecords = await this.getCnRecordsForAfterDelivery(orderId, orderProductId);

        return res.status(200).send({
            status: 1,
            showMessage: "No",
            message: 'Credit Note Information Found',
            data: allRecords,
        });
    }

    @Post('/send-email-for-cod-refund')
    public async sendEmailForCodRefund(@Body() emailDetails: any, @Res() res: any): Promise<any> {
        const emailContent = await this.emailTemplateService.findOne({where: {title: "EMAIL_FOR_COD_REFUND"}});
        const message = emailContent.content.replace('{name}', emailDetails.name).replace('{orderId}', emailDetails.orderPrefixId);
        const redirectUrl = env.storeRedirectUrl;
        const orderData={
            orderId: emailDetails.orderProductPrefixId,
            orderStatusId: 9
        }
        MAILService.customerLoginMail(orderData, message, emailDetails.email, emailContent.subject, redirectUrl);
        console.log("emailDetails.orderFullCOD",emailDetails.returnRequestId)
        if(emailDetails.orderFullCOD=="YES"){
            const orderReturnRepo = getManager().getRepository(OrderReturn);
            await orderReturnRepo.createQueryBuilder().update().set({ returnStatus: 3 }).where("id=:pid", { pid: emailDetails.returnRequestId}).execute();
        }
        if(emailContent){
        return res.status(200).send({
            status: 200,
            showMessage: "No",
            message: 'Email Sent Successfully',
        });
    }else{
        return res.status(200).send({
            status: 500,
            showMessage: "No",
            message: 'Something went wrong',
        });
    }
    }

    @Post('/check-email-send-by-orderId')
    public async checkEmailSendById(@Body() queryData:any){
        const emailService = getManager().getRepository(EmailModels);
        const getSentEmail  = await emailService.findOne({where: {
            subject:queryData.subject, orderId:queryData.orderProductPrefixId, status:'Sent'
          }})
    let result:any
          if(getSentEmail){
            result={
                status: 200,
                showMessage:"NO",
                message: "record found"
            }
          }else{
            result={
                status: 500,
                showMessage:"NO",
                message: "record not found"
            }
          }
          return result
    }

    @Post('/mark-as-refunded')
    public async markAsRefunded(@Body() queryData:any){
        const orderReturnRepo = getManager().getRepository(OrderReturn);
        await orderReturnRepo.createQueryBuilder().update().set({ returnStatus: 3 }).where("id=:pid", { pid: queryData.returnId }).execute();
        
        const orderProductRepo = getManager().getRepository(OrderProduct);
        await orderProductRepo.createQueryBuilder().update().set({ orderStatusId: 14 }).where("order_product_prefix_id=:pid", { pid: queryData.orderProductPrefixId }).execute();
        
        const emailTemp = getManager().getRepository(EmailTemplate)
        const emailContent = await emailTemp.findOne({where: {title: "REFUND_INITIATED"}});
        const emailBody = emailContent.content.replace('{refundAmount}', queryData.refundAmount.toString());
        const sendEmailTo = queryData.email;
        const emailSubject = emailContent.subject;
        MAILService.notifyCustomer(null, emailBody, sendEmailTo, emailSubject, null);

          return {
            status: 200,
            message: "record updated"
        }
    }
    
    @Authorized(['admin', 'list-order'])
    @Post('/update-order-delivery-status')
    public async updateOrderDeliveryStatus(@Body() queryData:any){
        return {
            status: 200,
            message: "This Functionality temporarily disabled",
            }
            
        const orderProductRepo = getManager().getRepository(OrderProduct);
        const orderRepo = getManager().getRepository(Order);

        if(queryData.orderId && queryData.orderProductId){
            if(queryData.orderStatusId==5){
            await orderProductRepo.createQueryBuilder().update().set({ orderStatusId: queryData.orderStatusId,modifiedDate:moment().format('YYYY-MM-DD HH:mm:ss'),deliveredDate:moment().format('YYYY-MM-DD HH:mm:ss')}).where("order_product_id=:pid", { pid: queryData.orderProductId }).execute();
            }else{
                await orderProductRepo.createQueryBuilder().update().set({ orderStatusId: queryData.orderStatusId,modifiedDate:moment().format('YYYY-MM-DD HH:mm:ss')}).where("order_product_id=:pid", { pid: queryData.orderProductId }).execute();
  
            }
        }else{
            await orderRepo.createQueryBuilder().update().set({ orderStatusId: queryData.orderStatusId,modifiedDate:moment().format('YYYY-MM-DD HH:mm:ss') }).where("order_id=:oid", { oid: queryData.orderId }).execute();
            if(queryData.orderStatusId==5){
            await orderProductRepo.createQueryBuilder().update().set({ orderStatusId: queryData.orderStatusId,modifiedDate:moment().format('YYYY-MM-DD HH:mm:ss'),deliveredDate:moment().format('YYYY-MM-DD HH:mm:ss')}).where("order_id=:oid", { oid: queryData.orderId }).execute();
            }else{
                await orderProductRepo.createQueryBuilder().update().set({ orderStatusId: queryData.orderStatusId,modifiedDate:moment().format('YYYY-MM-DD HH:mm:ss')}).where("order_id=:oid", { oid: queryData.orderId }).execute();

            }
        }
        console.log("query",queryData);
        return {
            status: 200,
            message: "Order Delivery status updated successfully",
        } 
    }

//download order list into excel
@Get('/order-list-download')
public async orderListDownload(@Req() req: any,@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('orderStatus') orderStatus: string,@QueryParam('date') date: string, @Res() response: any): Promise<any> {
    if(req.headers.authorization=="bearer 3ff0ffe8-1431-433a-ab13-104090ab131a" || true){
        if(limit>100){
            return {
                status: 500,
                message: "The maximum data limit should not exceed 100",
                data: false,
            } 
        }
       const excel = require('exceljs');
       const workbook = new excel.Workbook();
       const worksheet = workbook.addWorksheet('Order Detail Sheet');
       const rows = [];
       const orderTable: string = "`order`"
       let condition='';
       let orderStatusData:string=orderStatus?orderStatus:'1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20';
       if(date){
           condition = date?`WHERE op.order_status_id IN (${orderStatusData}) and date(od.created_date) =date('${date}')`:'';
   
       }
       else if(orderStatus){
           condition = orderStatus?`WHERE op.order_status_id IN (${orderStatusData})`:'';
       }
       let limitCond=limit && offset?`limit ${limit} OFFSET ${offset}`:limit?`limit ${limit}`:''
       
              let orderList = await getManager().query(`SELECT sub_query.Sub_Order_Id  as odId, sub_query.*
              from (SELECT od.order_prefix_id AS 'Order ID',od.order_status_id as orderStatusId,od.shipping_city as shippingCity,od.shipping_country as shippingCountry,od.currency_code as currency,od.shipping_zone as shippingZone,od.modified_date as updatedDate, max(op.order_product_prefix_id) AS Sub_Order_Id,op.delivered_date as deliveredDate, 
              od.created_date AS 'Order Date',ct.name AS 'Category', op.sku_name AS 'SKU',op.quantity AS quantity, pt.upc AS 'Article',pt.name as productName, 
              SUBSTR(op.varient_name,
                LENGTH(op.varient_name) - LOCATE('-', REVERSE(op.varient_name)) + 2) AS 'Size', SUBSTR(op.varient_name, LOCATE(',', op.varient_name) + 1) AS 'Color', 
               od.total_items_price AS 'Order Amount (MRP)', ROUND(op.base_price+(op.base_price*op.tax_value/100), 0) AS 'Sub-order Amount (MRP)', 
               pt.product_selling_price AS 'Product Selling Price',
               od.discount_amount AS 'Promotional Discount Value', od.shipping_charges AS 'Shipping Charges', od.total AS 'Total Payable Amount'
                 FROM ${orderTable} AS od INNER JOIN order_product AS op ON od.order_id=op.order_id INNER JOIN product as pt ON pt.product_id=op.product_id INNER JOIN product_to_category AS ptc ON ptc.product_id=op.product_id INNER JOIN category AS ct ON ptc.category_id=ct.category_id
                 ${condition} GROUP BY pt.product_selling_price, od.payment_type, pt.upc, od.total,
                    od.shipping_charges, od.total_items_price, od.total_tax, od.shipping_postcode, od.shipping_zone, od.shipping_city, od.shipping_address_2, od.shipping_address_1, od.phone_number_alter, od.telephone, od.email, od.shipping_lastname, od.shipping_firstname,
                    od.created_date, od.order_prefix_id, op.order_product_prefix_id,op.sku_name, op.name, op.varient_name, op.product_price, op.base_price, op.tax_value, od.discount_amount ORDER BY od.created_date DESC)
                     as sub_query group by odId ${limitCond}`)

              if(orderList.length==0){
               return {
                   status: 500,
                   message: "data not found",
                   data: false,
               } 
   
              }
           worksheet.columns = [
           { header: 'Order Id', key: 'Order Id', size: 16, width: 18 },
           { header: 'COD', key: 'COD', size: 16, width: 5 },
           { header: 'Category', key: 'Category', size: 16, width: 12 },
           { header: 'Item SKU Code', key: 'Item SKU Code', size: 16, width: 15 },
           { header: 'Item Name', key: 'Item Name', size: 16, width: 50 },
           { header: 'Item Size', key: 'Item Size', size: 16, width: 8 },
           { header: 'Item Type Brand', key: 'link', size: 16, width: 15 },
           { header: 'Channel Name', key: 'Channel Name', size: 16, width: 13 },
           { header: 'MRP', key: 'MRP', size: 16, width: 8 },
           { header: 'Total Price', key: 'Total Price', size: 16, width: 8 },
           { header: 'Selling Price', key: 'Selling Price', size: 16, width: 8 },
           { header: 'Discount', key: 'Discount', size: 16, width: 8 },
           { header: 'Voucher Code', key: 'Voucher Code', size: 16, width: 12 },
           { header: 'Order Date', key: 'Order Date', size: 16, width: 20 },
           { header: 'Sale Order Status', key: 'Sale Order Status', size: 16, width: 15 },
           { header: 'Created', key: 'Created', size: 16, width: 20 },
           { header: 'Updated', key: 'Updated', size: 16, width: 20 },
           { header: 'Fulfillment TAT', key: 'Fulfillment TAT', size: 16, width: 20 },
           { header: 'Product Id', key: 'Product Id', size: 16, width: 20 },
           { header: 'Shipping City', key: 'Shipping City', size: 16, width: 20 },
           { header: 'Shipping State', key: 'Shipping State', size: 16, width: 20 },
           { header: 'Shipping Country', key: 'Shipping Country', size: 16, width: 20 },
           { header: 'Currency', key: 'Currency', size: 16, width: 20 },
           { header: 'Quantity', key: 'Quantity', size: 16, width: 20 },

   
   
   

       ];
   
                          worksheet.getCell('A1').border = { top: { style: 'thin'}, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                          worksheet.getCell('B1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                          worksheet.getCell('C1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                          worksheet.getCell('D1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
   
                          worksheet.getCell('E1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                          worksheet.getCell('F1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                          worksheet.getCell('G1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                          worksheet.getCell('H1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
   
                          worksheet.getCell('I1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                          worksheet.getCell('J1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                          worksheet.getCell('K1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                          worksheet.getCell('L1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
   
                          worksheet.getCell('M1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                          worksheet.getCell('N1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                          worksheet.getCell('O1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                          worksheet.getCell('P1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                          worksheet.getCell('Q1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                          worksheet.getCell('R1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                          worksheet.getCell('S1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                          worksheet.getCell('T1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                          worksheet.getCell('U1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                          worksheet.getCell('V1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                          worksheet.getCell('W1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                          worksheet.getCell('X1').border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

   
   
         let orderStatusResult;
        // let color;
        for (const data of orderList) {
            orderStatusResult=data.orderStatusId==1?"Order Placed":data.orderStatusId==3?'Packing in Progress':data.orderStatusId==4?'Order Shipped':data.orderStatusId==5?'Order Delivered':data.orderStatusId==6?'Order Cancel Applied':data.orderStatusId==7?'Order Replacement Apply':data.orderStatusId==8?'Order Replaced':data.orderStatusId==9?'Order Cancelled':data.orderStatusId==10?'Cancel Request Rejected':data.orderStatusId==11?'Order Failed':data.orderStatusId==12?'Order Out for Delivery':data.orderStatusId==13?'Order Not Placed':data.orderStatusId==14?'Item Refunded':data.orderStatusId==15?'Item refund requested':data.orderStatusId==16?'Order Returned':data.orderStatusId==17?'Coupon Issued':'Bank Refund'
                        rows.push([data['Order ID'], data['Payment Mode']=="COD"?"YES":"NO", data.Category, data.SKU,data.productName,data.Size,"Redchief","Web",data['Order Amount (MRP)'],data['Total Payable Amount'],data['Product Selling Price'],data['Promotional Discount Value'],'',data['Order Date'],orderStatusResult,data['Order Date'],data.updatedDate,data.deliveredDate,data.Article,data.shippingCity,data.shippingZone,data.shippingCountry,data.currency,data.quantity]);
                    }
                  // Add all rows data in sheet
                  worksheet.addRows(rows);
                  const fileName = './OrderExcel' + Date.now() + '.csv';
                  await workbook.xlsx.writeFile(fileName);
                  return new Promise((resolve, reject) => {
                      response.download(fileName, (err, data) => {
                          if (err) {
                              reject(err);
                          } else {
                              fs.unlinkSync(fileName);
                              return response.end();
                          }
                      });
                  });
               }
   }
 
   @Get('/get-all-bank-transaction-by-order-id/:orderId')
   @Authorized()
   public async getAllBankTransactionByOrderId(@Param('orderId') orderId:any){
    let result:any={}
    try{
    const orderTable: string = "`order`"
    const getOrder:any = await getManager().query(`select old_cn_source_order_ids allOrderId from ${orderTable} where order_id=${orderId}`)
    if(getOrder && getOrder.length>0){
        const orderIds = `${getOrder[0].allOrderId},${orderId}`
        const allOrderData :any = await getManager().query(`select order_id orderId, order_prefix_id orderPrefixId, total, case when payment_method=2 then 'COD' when payment_method=8 then 'Paytm' else 'Ingenico' end  paymentMethod from ${orderTable} where order_id in (${orderIds})`)
result.data=allOrderData
result.status=200
result.message='Get Data Successfullt'
    }else{
        result.data=null
result.status=300
result.message='No Data found'
    }
}catch{
    result.data=null
    result.status=500
    result.message='Server Error'
}
    return result
   }
        

@Get('/get-source-order/:orderId')
public async getSourceOrders(@Param('orderId') orderId:number){
    let result:any={
        status:300,
        data:null
    }
    try{
        const orderTable: string = "`order`"
        let data:any[]
    data = await getManager().query(`SELECT concat(old_cn_source_order_ids,',',${orderId}) oldOrderId FROM ${orderTable} WHERE order_id=${orderId} AND old_cn_source_order_ids IS NOT NULL`)

    let orderIds:any=""
    console.log("data",data)
     

    if(data.length>0){
        orderIds=data[0].oldOrderId
    }else{
        orderIds=orderId
    }
        // const query = await getManager().query(`SELECT o.order_prefix_id orderPrefixId, pu.coupon_code couponCode, pu.discounted_amount amount FROM ${orderTable} o INNER JOIN tt_promotions_usage_orders pu ON pu.order_id=o.order_id WHERE o.order_id IN (${orderIds})`)

        const query = await getManager().query(`SELECT (SELECT CASE WHEN EXISTS (SELECT 1 FROM ${orderTable} WHERE order_id = cn.cn_source_order_id) THEN COALESCE((SELECT order_prefix_id FROM ${orderTable} WHERE order_id = cn.cn_source_order_id), cn.cn_source_order_id)ELSE cn.cn_source_order_id END AS result) AS cnSorceOrderId, o.order_prefix_id cnAppliedOrderId, cn.cn_amount amount, cn.cn_code couponCode  FROM tt_promotions_usage_orders puo INNER JOIN tt_credit_notes cn ON cn.cn_code=puo.coupon_code INNER JOIN ${orderTable} o ON o.order_id=puo.order_id WHERE puo.order_id IN (${orderIds}) AND puo.promotion_type='CreditNote'`)
        if(query && query.length>0){
            result.status=200
            result.data=query
        }
    
    }catch(err){
        console.log("Error in getSourceOrders",err);
        result.data=null
        result.status=500
        result.message='Server Error'
    }
    return result

}

@Get('/get-product-sku-status')
public async getProductSkuStatus(@QueryParams() data:any){
    try{
    const result = await getManager().query(`SELECT s.is_active skuStatus, s.quantity, s.sku_name sku, p.product_id productId, p.upc, p.is_active productStatus FROM sku s INNER JOIN product_varient_option pvo ON pvo.sku_id=s.id INNER JOIN product p ON p.product_id=pvo.product_id WHERE s.sku_name IN (${data.skuList})`)
    return {status:200,data:result}
    }catch{
        return {status:300}
    }

    }

    @Post('/orders-by-customerid')
    public async customerOrdersList(@Body() request: any): Promise<any> {
        const orders = getManager().getRepository(Order);
        let resposnse: any = {}
        try {
        let result = await orders
            .createQueryBuilder('orders')
            .where('orders.customerId = :customerId', { customerId: request.customerId })
            .andWhere("orders.orderStatus = :orderStatus", { orderStatus: request.orderStatusId })
            .orderBy("orders.createdDate", "DESC")
            .getOne();

            console.log("daatta", request.customerId)
            if (result) {
                resposnse = { status: 200, message: 'success', data: result }
            } else {
                resposnse = { status: 300, message: 'No data found', data: null }
            }
        } catch {
            resposnse = { status: 500, message: 'Error', data: null }
        }
        return resposnse
    }
}
