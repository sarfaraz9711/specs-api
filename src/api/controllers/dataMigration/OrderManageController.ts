import 'reflect-metadata';
import { Get, JsonController, Post, Res, UploadedFile } from "routing-controllers";

import { CommonService } from "../../common/commonService";
import { Order } from '../../models/Order';
import { OrderProduct } from '../../models/OrderProduct';
import { OrderTotal } from '../../models/OrderTotal';
import { CustomerService } from '../../services/CustomerService';
import { ProductImageService } from '../../services/ProductImageService';

//import { PluginService } from '../../services/PluginService';

import { OrderLogService } from '../../services/OrderLogService';
import { OrderProductLogService } from '../../services/OrderProductLogService';
import { ProductVarientOptionImageService } from '../../services/ProductVarientOptionImageService';
import { OrderService } from '../../services/OrderService';
import { OrderProductService } from '../../services/OrderProductService';
import { OrderTotalService } from '../../services/OrderTotalService';
import { getManager } from 'typeorm';
import { MigrationService } from "../../common/MigrationService";
import { ProductService } from "../../services/ProductService";
import { MigOldPaymentDetailService } from "../../services/dbMigration/MigOldPaymentDetailService";
import { PaymentMigrationModel } from "../../models/dbMigration/PaymentMigrationModel";
import { MigAdditionalDetailService } from "../../services/dbMigration/MigAdditionalDetailMappingService";
import { AdditionalDataModel } from '../../models/dbMigration/AdditionalDataModel';
import { MigProductLogService } from "../../services/dbMigration/MigProductLogServices";
import { ProductLogModel } from "../../models/dbMigration/ProductLogModel";
import { MigPaymentOrder } from '../../models/dbMigration/MigPaymentOrder';
import { MigPaymentTransaction } from '../../models/dbMigration/MigPaymentTransaction';
import { OrderTrackingService } from '../../services/OrderTrackingService';

import moment from 'moment';
import { PromotionsUsageOrdersService } from '../../services/promotions/PromotionUsageOrdersService';
import { Sku } from '../../models/SkuModel';
import { ProductVarientOption } from '../../models/ProductVarientOption';




@JsonController('/data-migration/order')
export class OrderManageController {
    constructor(

        private customerService: CustomerService,
        private productImageService: ProductImageService,
        
        private orderLogService: OrderLogService,
        
        //private pluginService: PluginService,
        
        private orderProductLogService: OrderProductLogService,
        private productVarientOptionImageService: ProductVarientOptionImageService,
        private orderService: OrderService,
        private orderProductService: OrderProductService,
        private orderTotalService: OrderTotalService,
        private _m: CommonService,
        private productService: ProductService,
        private _migration: MigrationService,
        private migAdditionalDetailService: MigAdditionalDetailService,
        private migOldPaymentDetailService: MigOldPaymentDetailService,
        private migProductLogService: MigProductLogService,
        private _orderTracking: OrderTrackingService,
        private _couponUsase : PromotionsUsageOrdersService

    ) { }



    // Import order
    /**
     * @api {post} /api/data-migration/order/secure/import-customer-order Import Order
     * @apiGroup Data Migration
     * @apiParam (Request body) {File} file File
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully saved XLS data",
     *      "status": "200"
     *      "data" : "{
     *           "Inserted" : "23 rows of 57",
     *           "failed" : "24 rows of 57",
     *           "failed_record_path" : "https:/filename.xls"
     *        }"
     * }
     * @apiSampleRequest /api/data-migration/order/secure/import-customer-order
     * @apiErrorExample {json} GenerateError error
     * HTTP/1.1 500 Internal Server Error
     */

    @Post("/secure/import-customer-order")
    public async orderCreate(@UploadedFile('file') files: any, @Res() res: any): Promise<any> {
        const csv = require("csvtojson");
        let b = files.originalname;

        if (files.mimetype == "text/csv" && b.substring(b.lastIndexOf("."), b.length) == ".csv") {
            let _j = await csv().fromString((files.buffer).toString());
            if (_j.length > 0) {
                let checkoutParam;
                checkoutParam = await this._getPureOrderData(_j);

                if (checkoutParam.length > 0) {
                    let resp = await this._doCreateOrder(checkoutParam);
                    return res.status(200).send(await this._m.getMessage('200', resp));
                } else {
                    return res.status(200).send(await this._m.getMessage('300'));
                }
            }
        } else {
            return res.status(500).send(await this._m.getMessage('200'));
        }
    }

    public async _doCreateOrder(_j: any): Promise<any> {

        //let cloneShallowCopy = JSON.parse(JSON.stringify(_j));

        let completedInsertion = [];

        for (let inc = 0; inc < _j.length; inc++) {
            let checkoutParam = _j[inc];


            let payId = 0;
            if (checkoutParam.paymentMethod == 'paytm') {
                payId = 8;
            } else {
                payId = 2;
            }








            // const plugin = await this.pluginService.findOne({ where: { id: payId } });

            const newOrder: any = new Order();
            const newOrderTotal = new OrderTotal();
            let orderProduct = [];
            let i;
            // let n;
            // let totalProductAmount;
            let totalAmount = 0;
            // const productDetailData = [];
            newOrder.customerId = 0;






            if (checkoutParam["phoneNumber"]) {
                const customerEmail = await this.customerService.findOne({
                    where: {
                        mobileNumber: checkoutParam["phoneNumber"],
                        deleteFlag: 0,
                    },
                });
                if(customerEmail){
                    newOrder.customerId = customerEmail.id;
                }else{
                    newOrder.customerId = 0
                }

            }

            newOrder.email = checkoutParam.emailId;
            newOrder.telephone = checkoutParam.phoneNumber;
            newOrder.shippingFirstname = checkoutParam.shippingFirstName;
            newOrder.shippingLastname = checkoutParam.shippingLastName;
            newOrder.shippingAddress1 = checkoutParam.shippingAddress_1;
            newOrder.shippingAddress2 = checkoutParam.shippingAddress_2;
            newOrder.shippingCompany = checkoutParam.shippingCompany;
            newOrder.shippingCity = checkoutParam.shippingCity;
            newOrder.shippingZone = checkoutParam.shippingZone;
            newOrder.shippingCountryId = checkoutParam.shippingCountryId;
            // const country = await this.countryService.findOne({
            //     where: {
            //         countryId: checkoutParam.shippingCountryId,
            //     },
            // });
            // if (country) {
            //     newOrder.shippingCountry = country.name;
            // }
            newOrder.shippingCountry="India"
            newOrder.shippingPostcode = checkoutParam.shippingPostCode;
            newOrder.shippingAddressFormat = checkoutParam.shippingAddressFormat;
            newOrder.paymentFirstname = checkoutParam.paymentFirstName;
            newOrder.paymentLastname = checkoutParam.paymentLastName;
            newOrder.paymentAddress1 = checkoutParam.paymentAddress_1;
            newOrder.paymentAddress2 = checkoutParam.paymentAddress_2;
            newOrder.paymentCompany = checkoutParam.paymentCompany;
            // const paymentCountry = await this.countryService.findOne({
            //     where: {
            //         countryId: checkoutParam.paymentCountryId,
            //     },
            // });
            // if (paymentCountry) {
            //     newOrder.paymentCountry = paymentCountry.name;
            // }
            // let shopCode = checkoutParam.shopCode;
            // if (shopCode) {
            //     const storeData = await this.mapService.findOne({ where: { shopNo: shopCode } });
            //     newOrder.storeId = storeData.id;
            // }

            newOrder.paymentCity = checkoutParam.paymentCity;
            newOrder.paymentZone = checkoutParam.paymentZone;
            newOrder.paymentCountry = "India";
            newOrder.paymentPostcode = checkoutParam.paymentPostCode;
            newOrder.paymentMethod = payId;//checkoutParam.paymentMethod;
            newOrder.customerGstNo = checkoutParam.gstNo;
            newOrder.isActive = 1;
            // const setting = await this.settingService.findOne();
            newOrder.orderStatusId = 1;
            newOrder.invoicePrefix = 'OR';
            // const currencyVal = await this.currencyService.findOne(setting.storeCurrencyId);
            newOrder.currencyCode = 'INR';
            newOrder.currencyValue =null;
            newOrder.currencySymbolLeft ='₹';
            newOrder.currencySymbolRight = '₹';
            let totalTax:number=0
            let totalItemsPrice:number=0
            
            checkoutParam.productDetails.forEach((element:any) => {
                // totalTax += (+element.basePrice*+element.quantity)-(((+element.basePrice*+element.quantity)*100)/(+element.taxValue+100))
                totalItemsPrice +=+element.basePrice
            });
            // totalItemsPrice = (+checkoutParam.productDetails[0].basePrice) 
            newOrder.totalTax = totalTax
            newOrder.totalItemsPrice = totalItemsPrice
            //newOrder.paymentAddressFormat = checkoutParam.shippingAddressFormat;

            const orderData = await this.orderService.create(newOrder);

            await this.orderLogService.create(orderData);


            orderData.currencyRight = '₹';
            orderData.currencyLeft = '₹';
            orderProduct = checkoutParam.productDetails;
            let j = 1;
            for (i = 0; i < orderProduct.length; i++) {
                ///// finding price from backend ends /////
                //const dynamicPrices = dynamicData[orderProduct[i].skuName];
                let _productData:any;
                if(orderProduct[i].productId>0){
                _productData = await this.productService.findOne({ where: { productId: orderProduct[i].productId } });
                }
                if(true){
                orderProduct[i]['productId'] = orderProduct[i].productId==0?orderProduct[i].productId:_productData.productId;
                orderProduct[i]["name"] = orderProduct[i].productId==0?orderProduct[i].skuName:_productData.name;
                orderProduct[i]["model"] = orderProduct[i].productId==0?orderProduct[i].skuName:_productData.name;



                const productDetails = new OrderProduct();
                productDetails.productId = orderProduct[i].productId;
                const nwDate = new Date();
                const odrDate = nwDate.getFullYear() + ('0' + (nwDate.getMonth() + 1)).slice(-2) + ('0' + nwDate.getDate()).slice(-2);
                productDetails.orderProductPrefixId = orderData.invoicePrefix.concat('-' + odrDate + orderData.orderId) + j;
                productDetails.name = orderProduct[i]["name"];
                productDetails.orderId = orderData.orderId;
                productDetails.quantity = orderProduct[i].quantity;
                productDetails.productPrice = orderProduct[i]["price"];
                productDetails.basePrice = orderProduct[i]["basePrice"]
                // productDetails.basePrice = (+(orderProduct[i]["basePrice"])*100)/((+orderProduct[i]["taxValue"])+100);
                // productDetails.discountAmount = parseFloat(dynamicPrices.skuPrice) - parseFloat(dynamicPrices.tirePrice);
                productDetails.discountAmount = 0;
                // productDetails.discountedAmount = productDetails.discountAmount !== 0.00 ? dynamicPrices.tirePrice : '0.00';
                productDetails.discountedAmount = 0;
                //productDetails.taxType = orderProduct[i]["taxType"];
                //productDetails.taxValue = orderProduct[i]["taxValue"];
                productDetails.total = +orderProduct[i].quantity * parseInt(orderProduct[i]["basePrice"]);
                productDetails.model = orderProduct[i]["model"];
                productDetails.varientName = orderProduct[i].varientName ? orderProduct[i].varientName : '';
                productDetails.productVarientOptionId = orderProduct[i].productVarientOptionId ? orderProduct[i].productVarientOptionId : 0;
                productDetails.skuName = orderProduct[i].skuName ? orderProduct[i].skuName : '';
                productDetails.orderStatusId = 1;
                const productInformation = await this.orderProductService.createData(productDetails);

                await this.orderProductLogService.create(productInformation);

                }
                // totalProductAmount = await this.orderProductService.findData(orderProduct[i].productId, orderData.orderId, productInformation.orderProductId);
                // for (n = 0; n < totalProductAmount.length; n++) {
                //     totalAmount += +totalProductAmount[n].total;
                // }
                //productDetailData.push(productImageData);
                j++;
            }



            let grandDiscountAmount = 0;


            grandDiscountAmount = checkoutParam.couponDiscountAmount;
            // newOrder.amount = totalAmount;
            newOrder.amount = newOrder.totalItemsPrice;
            totalAmount=newOrder.totalItemsPrice;
            if (checkoutParam.couponCode && checkoutParam.couponData) {
            //if (checkoutParam.couponCode ) {
                newOrder.total = totalAmount - (+grandDiscountAmount);
                newOrder.couponCode = checkoutParam.couponCode;
                newOrder.discountAmount = +grandDiscountAmount;
                newOrder.amount = totalAmount;
            } else {
                newOrder.total = totalAmount;
            }
            // newOrder.invoiceNo = 'INV00'.concat(orderData.orderId);
            newOrder.invoiceNo = checkoutParam.additionalOrderInfo.oldInvoiceNo;
            //const nowDate = new Date();
            //const orderDate = nowDate.getFullYear() + ('0' + (nowDate.getMonth() + 1)).slice(-2) + ('0' + nowDate.getDate()).slice(-2);
            // newOrder.orderPrefixId = setting.invoicePrefix.concat('-' + orderDate + orderData.orderId);
            newOrder.orderPrefixId = checkoutParam.additionalOrderInfo.oldOrderId;
            
            newOrder.createdDate = moment(new Date(checkoutParam.additionalOrderInfo.orderDate)).format("YYYY-MM-DD HH:mm:ss");
            if(newOrder.createdDate=='Invalid date'){
                newOrder.createdDate=moment(new Date(checkoutParam.additionalOrderInfo.orderDate)).format('YYYY-MM-DD')
            }
            newOrder.couponCode = checkoutParam.couponCode;

            if(checkoutParam.couponDiscountAmount){
                newOrder.discountAmount = checkoutParam.couponDiscountAmount;
            }
            

            await this.orderService.update(orderData.orderId, newOrder);


            let orderTrackingExt = {
                orderId: orderData.orderId,
                transactionalDate: moment(new Date(checkoutParam.additionalOrderInfo.orderDate)).format("YYYY-MM-DD HH:mm:ss"),
                actionType: 'Order Placed',
            }
            await this._orderTracking.saveOrderTracking(orderTrackingExt);






            newOrderTotal.orderId = orderData.orderId;

            if (checkoutParam.couponCode && checkoutParam.couponData) {
                newOrderTotal.value = totalAmount - (+grandDiscountAmount);
            } else {
                newOrderTotal.value = totalAmount;
            }
            await this.orderTotalService.createOrderTotalData(newOrderTotal);

            if(checkoutParam.couponCode){
                let _jsonCoupon = {
                    orderId : orderData.orderId,
                    promotionType : 'CouponBased',
                    promotionSubType : 'Amount',
                    couponCode : checkoutParam.couponCode,
                    discountedAmount :checkoutParam.couponDiscountAmount
                }
                await this._couponUsase.create(_jsonCoupon);
            }




            if (payId == 2) {

                const order = await this.orderService.findOrder(orderData.orderId);
                order.paymentType = 'CashOnDelivery';
                order.productDetail = await this.orderProductService.find({ where: { orderId: orderData.orderId } }).then((val) => {
                    const productImage = val.map(async (value: any) => {
                        let image;
                        if (value.productVarientOptionId) {
                            const imageData = await this.productVarientOptionImageService.findOne({ where: { productVarientOptionId: value.productVarientOptionId } });
                            if (imageData) {
                                image = imageData;
                            } else {
                                image = await this.productImageService.findOne({ where: { productId: value.productId, defaultImage: 1 } });
                            }
                        } else {
                            image = await this.productImageService.findOne({ where: { productId: value.productId } });
                        }
                        const temp: any = value;
                        temp.image = image;
                        return temp;
                    });
                    const results = Promise.all(productImage);
                    return results;
                });






                const dm = new AdditionalDataModel();

                // const shop = checkoutParam['additionalOrderInfo'].shopCode;
                // if (shop) {
                //     const storeData = await this.mapService.findOne({ where: { shopNo: shopCode } });
                //     dm.storeId = storeData.id;
                // } else {
                //     continue;
                // }

                dm.oldOrderId = checkoutParam['additionalOrderInfo'].oldOrderId;
                dm.orderId = orderData.orderId;
                dm.oldOrderById = checkoutParam['additionalOrderInfo'].oldOrderById;
                dm.oldInvoiceNo = checkoutParam['additionalOrderInfo'].oldInvoiceNo;
                dm.orderDate = checkoutParam['additionalOrderInfo'].orderDate;

                await getManager().getRepository(AdditionalDataModel).save(dm);




                completedInsertion.push(orderData);
            } else {


                orderData.paymentProcess = 1;
                await this.orderService.update(orderData.orderId, orderData);


                if (payId==8) {

                    newOrder.paymentDetails = orderData.orderPrefixId;
                    newOrder.paymentType = 'mig_payment';//plugin.pluginName;
                    await this.orderService.update(orderData.orderId, newOrder);

                }


                const dm = new AdditionalDataModel();

                dm.oldOrderId = checkoutParam['additionalOrderInfo'].oldOrderId;
                dm.orderId = orderData.orderId;
                dm.oldOrderById = checkoutParam['additionalOrderInfo'].oldOrderById;
                dm.oldInvoiceNo = checkoutParam['additionalOrderInfo'].oldInvoiceNo;
                dm.orderDate = checkoutParam['additionalOrderInfo'].orderDate;

                await getManager().getRepository(AdditionalDataModel).save(dm);


                completedInsertion.push(orderData);

            }



        }

        return Promise.resolve(completedInsertion);
    }
    public decrypt(text: any): any {
        const crypto = require('crypto');
        const ENCRYPTION_KEY = '@##90kdu(**^$!!hj((&$2jhn^5$%9@q';
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }


    public async _getPureOrderData(totalBuffer: any): Promise<any> {


        let originalArray = JSON.parse(JSON.stringify(totalBuffer));
        let counter = 1;
        let iteratedData = [];


        let jsonToCreate = [];

        for (let i = 0; i < totalBuffer.length; i++, counter++) {

            if (!iteratedData.includes(totalBuffer[i]["Order No"])) {
                let _jsonObj = {};

                iteratedData.push(totalBuffer[i]["Order No"]);

                let _filterArray = originalArray.filter((x: any) => {
                    return x["Order No"] == totalBuffer[i]["Order No"];
                });

                _jsonObj = {
                    //"password": "",
                    "couponDiscountAmount": totalBuffer[i]["Coupon Discount Amount"],
                    "couponData": totalBuffer[i]["Coupon Data"],
                    "couponCode": totalBuffer[i]["Coupon Code"],
                    "paymentZone": totalBuffer[i]["Payment Zone"],
                    "paymentPostCode": totalBuffer[i]["Payment Post Code"],
                    "paymentLastName": totalBuffer[i]["Payment Last Name"],
                    "paymentFirstName": totalBuffer[i]["Payment First Name"],
                    "paymentCountryId": totalBuffer[i]["Payment Country Id"],
                    "paymentCompany": totalBuffer[i]["Payment Company"],
                    "paymentCity": totalBuffer[i]["Payment City"],
                    "paymentAddress_2": totalBuffer[i]["Payment Address_2"],
                    "paymentAddress_1": totalBuffer[i]["Payment Address_1"],
                    "paymentMethod": totalBuffer[i]["Payment Method"],
                    "shippingCountryId": totalBuffer[i]["Shipping Country Id"],
                    "emailId": totalBuffer[i]["Email Id"],
                    "shippingAddress_2": totalBuffer[i]["Shipping Address_2"],
                    "shippingAddress_1": totalBuffer[i]["Shipping Address_1"],
                    "shippingAddressFormat": totalBuffer[i]["Shipping Address Format"],
                    "phoneNumber": totalBuffer[i]["Phone Number"],
                    "gstNo": totalBuffer[i]["GSTNO"],
                    "shippingZone": totalBuffer[i]["Shipping Zone"],
                    "shippingFirstName": totalBuffer[i]["Shipping First Name"],
                    "shippingCompany": totalBuffer[i]["Shipping Company"],
                    "shippingPostCode": totalBuffer[i]["Shipping Post Code"],
                    "shippingCity": totalBuffer[i]["Shipping City"],
                    "shippingLastName": totalBuffer[i]["Shipping Last Name"],
                    "shopCode": totalBuffer[i]["Store Code"],
                    "productDetails": [
                    ],
                    "additionalOrderInfo": {
                        oldOrderId: totalBuffer[i]["Order No"],
                        oldOrderById: totalBuffer[i]["Customer Email Id"],
                        oldInvoiceNo: totalBuffer[i]["Invoice No"],
                        orderDate: totalBuffer[i]["Order Date"],
                        shopCode: totalBuffer[i]["Store Code"]
                    }
                };


// const getProductId = await this.productService.findOne({where: {upc: totalBuffer[i]["UPC"]}})

                _filterArray.forEach(async (ele: any) => {
const getProductId = await getManager().createQueryBuilder(Sku, 'sku')
.select('pvo.product_id')
.innerJoin(ProductVarientOption, 'pvo', 'sku.id=pvo.sku_id')
.where('sku.sku_name=:skuName',{skuName: ele['Sku Name']})
.getRawOne()



const productId:any = getProductId?getProductId.product_id:0


                    _jsonObj["productDetails"].push({
                        "productId": productId,
                        "quantity": ele['Quantity'],
                        "price": ele['Price'],
                        "basePrice": ele['Base Price'],
                        "model": productId==0?null:ele['Model'],
                        "name": productId==0?'Redchief...':ele['Model Name'],
                        "productVarientOptionId": productId==0?null:ele['Product VarientOption Id'],
                        "taxType": ele['Tax Type'],
                        "taxValue": ele['Tax Value'],
                        "varientName": ele['Varient Name'],
                        "skuName": ele['Sku Name'],
                        "vendorId": ele['Store Code']
                    });
                });
                jsonToCreate.push(_jsonObj);
            }


        }
        return Promise.resolve(jsonToCreate);
    }

    // Validate-customer-order-------
    /**
     * @api {post} /api/data-migration/order/secure/validate-customer-order Validate Customer Order
     * @apiGroup Data Migration
     * @apiParam (Request body) {File} file File
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Validated",
     *      "status": "200"
     *      "data" : "{
     *           "filePath" : "amazon file",
     *        }"
     * }
     * @apiSampleRequest /api/data-migration/order/secure/validate-customer-order
     * @apiErrorExample {json} GenerateError error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post("/secure/validate-customer-order")
    public async validateCustomerOrder(@UploadedFile('file') files: any, @Res() res: any): Promise<any> {
        const csv = require("csvtojson");
        let b = files.originalname;
        if (files.mimetype == "text/csv" && b.substring(b.lastIndexOf("."), b.length) == ".csv") {
            let _j = await csv().fromString((files.buffer).toString());
            if (_j.length > 0) {
                let _executionOver = await this._doValidateOrder(_j);
                let filePath = "";
                if (_executionOver.compileRecord.length > 0) {
                    filePath = await this._migration._doCreateCSVOnS3(_executionOver.compileRecord, files.originalname, 'Validate');
                } else {
                    filePath = "NA";
                }
                if (filePath) {
                    let _json = {
                        "message": (_executionOver.failedRecord.length > 0) ? "After correction this csv please validate again." : '',
                        "downloadCompiledRecords": filePath
                    };
                    return res.status(200).send(await this._m.getMessage('200', _json));
                }
            }
        } else {
            return res.status(500).send(await this._m.getMessage('200'));
        }
    }


    public async _doValidateOrder(_j: any): Promise<any> {
        let failedJson = [];
        //let successJson = [];
        let counter = 0;
        let cloneArray = JSON.parse(JSON.stringify(_j));

        let newJson = [];
        for (let inc = 0; inc < _j.length; inc++) {

            counter += 1;
            let errorM = '';
            // let userData = await this.customerService.findOne({ where: { email: _j[inc]['Customer Email Id'] } });

            // let ProductData = await this.productService.findOne({ where: { sku: _j[inc]['Product SKU'] } });
            

            let userData = true

            let ProductData = true


            if (_j[inc]['Order No'] == "") {
                errorM = errorM + "\r\n" + 'Order No should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Order No should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);

                //continue;
            } 
            
            
            if (_j[inc]['Customer Email Id'] == "") {
                errorM = errorM + "\r\n" + 'Customer Email Id should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Email Id should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);

                //continue;
            } 
            
            if (!userData) {
                errorM = errorM + "\r\n" + 'Customer Email Id Id is not available';
                // Object.assign(cloneArray[inc], { 'Error Message': 'Email Id is not available' });
                failedJson.push(cloneArray[inc]);
                // newJson.push(cloneArray[inc]);
                //continue;
            } 
            
            if (_j[inc]['Email Id'] == "") {
                // let userData = await this.customerService.findOne({ where: { oldUserId: _j[inc]['Email Id'] } });

                // if (!userData) {
                    errorM = errorM + "\r\n" + 'Email Id should not be empty';
                    // Object.assign(cloneArray[inc], { 'Error Message': 'Email Id is not available' });
                    failedJson.push(cloneArray[inc]);
                    // newJson.push(cloneArray[inc]);
                    //continue;
                // }

            }
            
             if (_j[inc]['Product SKU'] == "") {
                errorM = errorM + "\r\n" + 'Product SKU should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
            } 
            
            if (!ProductData) {

                
                // if (!ProductData) {
                    errorM = errorM + "\r\n" + 'Product is not available';
                    //Object.assign(cloneArray[inc], { 'Error Message': 'Product is not available' });
                    failedJson.push(cloneArray[inc]);
                    //newJson.push(cloneArray[inc]);
                    //continue;
                // }
            }
            
            
             if (_j[inc]['Payment Method'] == ''){
            // "COD" || _j[inc]['Payment Method'] == "PAYTM") {

                errorM = errorM + "\r\n" + 'Payment Method should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
            } 
            
            
            
            
            if (_j[inc]['Payment Post Code'] == "") {
                errorM = errorM + "\r\n" + 'Payment Post Code should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
            } 
            
            if (_j[inc]['Payment Last Name'] == "") {
                errorM = errorM + "\r\n" + 'Payment Last Name should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
            } 
            
            if (_j[inc]['Payment First Name'] == "") {
                errorM = errorM + "\r\n" + 'Payment First Name should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
            } 
            
            if (_j[inc]['Payment Country Id'] == "") {
                errorM = errorM + "\r\n" + 'Payment Country Id should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
            } 
            
            if (_j[inc]['Payment Company'] == "") {
                errorM = errorM + "\r\n" + 'Payment Company should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
            } 
            
            if (_j[inc]['Payment City'] == "") {
                errorM = errorM + "\r\n" + 'Payment City should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
            } 
            
            if (_j[inc]['Payment Address_2'] == "") {
                errorM = errorM + "\r\n" + 'Payment Address_2 should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
            } 
            
            if (_j[inc]['Payment Address_1'] == "") {
                errorM = errorM + "\r\n" + 'Payment Address_1 should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
            } 
            
            if (_j[inc]['Payment Method'] == "") {
                errorM = errorM + "\r\n" + 'Payment Method should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
            } 
            
            if (_j[inc]['Shipping Country Id'] == "") {
                errorM = errorM + "\r\n" + 'Shipping Country Id should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
            } 
            
            if (_j[inc]['Email Id'] == "") {
                errorM = errorM + "\r\n" + 'Email Id should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
            } 
            
            if (_j[inc]['Shipping Address_2'] == "") {
                errorM = errorM + "\r\n" + 'Shipping Address_2 should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
            } 
            
            if (_j[inc]['Shipping Address_1'] == "") {
                errorM = errorM + "\r\n" + 'Shipping Address_1 should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
            } 
            /*
            else if (_j[inc]['Shipping Address Format'] == "") {
                errorM = errorM + "\r\n" + 'Shipping Address Format should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
            } */
            
            
             if (_j[inc]['Phone Number'] == "") {
                errorM = errorM + "\r\n" + 'Phone Number should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
            } 
            
            if (_j[inc]['GSTNO'] == "") {
                errorM = errorM + "\r\n" + 'GSTNO should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
            } 
            
            if (_j[inc]['Shipping Zone'] == "") {
                errorM = errorM + "\r\n" + 'Shipping Zone should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
            } 
            
            if (_j[inc]['Shipping First Name'] == "") {
                errorM = errorM + "\r\n" + 'Shipping First Name should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
            } 
            
            if (_j[inc]['Shipping Company'] == "") {
                errorM = errorM + "\r\n" + 'Shipping Company should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
            } 
            
            if (_j[inc]['Shipping Post Code'] == "") {
                errorM = errorM + "\r\n" + 'Shipping Post Code should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
            } 
            
            if (_j[inc]['Shipping City'] == "") {
                errorM = errorM + "\r\n" + 'Shipping City should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
            } 
            
            if (_j[inc]['Shipping Last Name'] == "") {
                errorM = errorM + "\r\n" + 'Shipping Last Name should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
            } 
            
            if (_j[inc]['Shipping Last Name'] == "") {
                errorM = errorM + "\r\n" + 'Shipping Last Name should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
            } 
            
            if (_j[inc]['Invoice No'] == "") {
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                errorM = errorM + "\r\n" + 'Invoice No should not be empty';
                failedJson.push(cloneArray[inc]);

                //newJson.push(cloneArray[inc]);
                //continue;
            } 
            
            if (_j[inc]['Order Date'] == "") {
                errorM = errorM + "\r\n" + 'Order Date should not be empty';
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product SKU should not be empty' });
                failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
            }

            Object.assign(cloneArray[inc], { 'Error Message': errorM });
            newJson.push(cloneArray[inc]);


            // if (_j[inc]['Invoice No'] === "") {
            //     Object.assign(cloneArray[inc], { 'Error Message': 'Invoice No should not be empty' });
            //     failedJson.push(cloneArray[inc]);

            //     continue;
            // }






        }

        if (counter == ((_j.length))) {
            let _newJ = {
                "totalRecord": _j.length,
                "compileRecord": newJson,
                "failedRecord": failedJson
            };
            return Promise.resolve(_newJ);
        }
    }


    // Validate Customer Payment-------
    /**
     * @api {post} /api/data-migration/order/secure/validate-payment Validate Customer Payment
     * @apiGroup Data Migration
     * @apiParam (Request body) {File} file File
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Validated",
     *      "status": "200"
     *      "data" : "{
     *           "filePath" : "amazon file",
     *        }"
     * }
     * @apiSampleRequest /api/data-migration/order/secure/validate-payment
     * @apiErrorExample {json} GenerateError error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post("/secure/validate-payment")
    public async validatePaymentData(@UploadedFile('file') files: any, @Res() res: any): Promise<any> {
        const csv = require("csvtojson");
        let b = files.originalname;
        if (files.mimetype == "text/csv" && b.substring(b.lastIndexOf("."), b.length) == ".csv") {
            let _j = await csv().fromString((files.buffer).toString());

            if (_j.length > 0) {
                let _executionOver = await this._doPaymentValidate(_j);
                let filePath = "";
                if (_executionOver.compileRecord.length > 0) {
                    filePath = await this._migration._doCreateCSVOnS3(_executionOver.compileRecord, files.originalname, 'Validate_Payment_');
                } else {
                    filePath = "NA";
                }


                if (filePath) {
                    let _json = {
                        "message": (_executionOver.failedRecord.length > 0) ? "After correction of this csv please validate again." : '',
                        "downloadCompiledRecords": filePath
                    };
                    return res.status(200).send(await this._m.getMessage('200', _json));
                }

            }
        } else {
            return res.status(500).send(await this._m.getMessage('200'));
        }
    }

    public async _doPaymentValidate(_j: any): Promise<any> {
        let failedJson = [];
        //let successJson = [];
        let counter = 0;
        let cloneArray = JSON.parse(JSON.stringify(_j));
        let newJson = [];
        for (let inc = 0; inc < _j.length; inc++) {
            counter += 1;

            let _errorM = "";



            // if (_j[inc]['old Payment Id'] === "") {
            //     Object.assign(cloneArray[inc], { 'message': 'old Payment Id should not be empty' });
            //     failedJson.push(cloneArray[inc]);

            //     continue;
            // }
            if (_j[inc]['Order No'] === "") {
                //Object.assign(cloneArray[inc], { 'message': 'old Payment Id should not be empty' });
                failedJson.push(cloneArray[inc]);

                //continue;

                _errorM = _errorM + "Order No should not be empty.\r\n";
            } else if (_j[inc]['Paid Date'] === "") {
                //Object.assign(cloneArray[inc], { 'message': 'Paid Date should not be empty' });
                failedJson.push(cloneArray[inc]);

                //continue;
                _errorM = _errorM + "Paid Date should not be empty.\r\n";
            } else if (_j[inc]['Payment Number'] === "") {
                //Object.assign(cloneArray[inc], { 'message': 'Payment Number should not be empty' });
                failedJson.push(cloneArray[inc]);

                //continue;
                _errorM = _errorM + "Payment Number should not be empty.\r\n";
            } else if (_j[inc]['Payment Information'] === "") {
                // Object.assign(cloneArray[inc], { 'message': 'Payment Information should not be empty' });
                failedJson.push(cloneArray[inc]);

                // continue;
                _errorM = _errorM + "Payment Information should not be empty.\r\n";
            } else if (_j[inc]['Payment Amount'] === "") {
                // Object.assign(cloneArray[inc], { 'message': 'Payment Amount should not be empty' });
                failedJson.push(cloneArray[inc]);
                _errorM = _errorM + "Payment Amount should not be empty.\r\n";
                // continue;
            } else if (_j[inc]['Payment Status'] === "") {
                // Object.assign(cloneArray[inc], { 'message': 'Payment Status should not be empty' });
                failedJson.push(cloneArray[inc]);
                _errorM = _errorM + "Payment Status should not be empty.\r\n";
                // continue;
            }


            Object.assign(cloneArray[inc], { 'Error Message': _errorM });
            newJson.push(cloneArray[inc]);



        }
        if (counter == ((_j.length))) {
            let _newJ = {
                "totalRecord": _j.length,
                "failedRecord": failedJson,
                "compileRecord": newJson
            };
            return Promise.resolve(_newJ);
        }




    }



    // Import Customer Payment-------
    /**
     * @api {post} /api/data-migration/order/secure/import-payment Import Customer Payment
     * @apiGroup Data Migration
     * @apiParam (Request body) {File} file File
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Imported",
     *      "status": "200"
     *      "data" : "[
     *             {}
     *           
     *        ]"
     * }
     * @apiSampleRequest /api/data-migration/order/secure/import-payment
     * @apiErrorExample {json} GenerateError error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post("/secure/import-payment")
    public async importPaymentData(@UploadedFile('file') files: any, @Res() res: any): Promise<any> {
        const csv = require("csvtojson");
        let b = files.originalname;
        if (files.mimetype == "text/csv" && b.substring(b.lastIndexOf("."), b.length) == ".csv") {
            let _j = await csv().fromString((files.buffer).toString());

            if (_j.length > 0) {
                let _executionOver = await this._doInsertPayment(_j);
                //let filePath = "";
                if (_executionOver.length > 0) {
                    //filePath = await this._migration._doCreateCSVOnS3(_executionOver.failedRecord, files.originalname, 'Validate');
                } else {
                    //filePath = "NA";
                }


                // if (filePath) {
                let _json = {
                    "successRows": _executionOver.length,
                    //"failed": _executionOver.failedRecord.length,
                    "InsertedItem": _executionOver
                };
                return res.status(200).send(await this._m.getMessage('200', _json));
                //}

            }
        } else {
            return res.status(500).send(await this._m.getMessage('200'));
        }
    }
    public async _doInsertPayment(_j: any = []): Promise<any> {

        let successJson = [];

        //let order = getManager().getRepository(Order);

        for (let inc = 0; inc < _j.length; inc++) {
            let AdditionalData = await this.migAdditionalDetailService.findOne({ where: { oldOrderId: _j[inc]['Order No'] } });
            if (AdditionalData) {
                let _date = "";
                let raw1 = (_j[inc]['Paid Date']).split("/");
                
                let raw2 = raw1[2].split(" ");
                _date = (raw2[0] + "-" + raw1[0] + "-" + raw1[1] + " " + (raw2[1] ? raw2[1] : '00:00:00'));
                var paymentMigrationModel = new PaymentMigrationModel();
                //paymentMigrationModel.oldPaymentId = 0;
                paymentMigrationModel.orderId = _j[inc]['Order No'];
                paymentMigrationModel.paidDate = _date;
                paymentMigrationModel.paymentInformation = _j[inc]['Payment Information'];
                paymentMigrationModel.paymentAmount = parseInt(_j[inc]['Payment Amount']);
                paymentMigrationModel.paymentComminsionAmount = 0;
                paymentMigrationModel.payementNumber = _j[inc]['Payment Number'];
                paymentMigrationModel.paymentStatus = _j[inc]['Payment Status'];


                var oldPaymentSave = await this.migOldPaymentDetailService.create(paymentMigrationModel);

            }

            if (oldPaymentSave) {

                successJson.push(_j[inc]);
            } else {
                successJson = [];
            }
        }

        return Promise.resolve(successJson);
    }






    // Map Payment
    /**
     * @api {get} /api/data-migration/order/secure/map-payment-data Map Payment
     * @apiGroup Data Migration
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Data Mapped",
     *      "status": "200"
     *      "data" : [
     *          {}
     * ]
     * }
     * @apiSampleRequest /api/data-migration/order/secure/map-payment-data
     * @apiErrorExample {json} GenerateError error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get("/secure/map-payment-data")
    public async paymentMapWithOrder(@Res() res: any): Promise<any> {

        const orderRepository = getManager().getRepository(Order);
        const migPaymentRepository = getManager().getRepository(PaymentMigrationModel);

        const migPaymentModel = getManager().getRepository(MigPaymentOrder);
        const migPaymentOrderTransactionRepository = getManager().getRepository(MigPaymentTransaction);


        const paymetUpdateList = await this._migration.mapPayamentData();
        let _dataVerify = JSON.parse(JSON.stringify(paymetUpdateList));



        let countRun = 0;
        let holdingData = [];

        if (_dataVerify.length > 0) {
            for (let i = 0; i < _dataVerify.length; i++) {
                countRun += 1;

                const orderData = await orderRepository.findOne(_dataVerify[i]['ad_order_id']);
                //continue ;

                if (_dataVerify[i]["payment_status"] == "SUCCESS") {
                    orderData.paymentFlag = 1;
                    orderData.paymentStatus = 1;
                    orderData.paymentProcess = 1;
                    orderData.paymentType = 'mig_paytm';
                    orderData.paymentDetails = _dataVerify[i]["payment_number"];


                    const migPayment = new MigPaymentOrder();
                    migPayment.orderId = orderData.orderId;
                    //migPayment.paymentGateway = 'ddd';//use default as mig_paytm
                    migPayment.paytmRefId = _dataVerify[i]["payment_number"];
                    migPayment.total = _dataVerify[i]["payment_amount"];
                    migPayment.status = ((_dataVerify[i]["payment_status"] == 'SUCCESS') ? 1 : 0);
                    let insertedRow = await migPaymentModel.save(migPayment);

                    const transactionsParams = new MigPaymentTransaction();
                    transactionsParams.paymentType = _dataVerify[i]["payment_mode"];
                    transactionsParams.payOrderId = insertedRow.id;
                    transactionsParams.paymentData = JSON.stringify(_dataVerify[i]["payment_information"]);
                    transactionsParams.paymentStatus = 1;
                    await migPaymentOrderTransactionRepository.save(transactionsParams);

                    await orderRepository.save(orderData);
                    _dataVerify[i].is_payment = 1;
                    await migPaymentRepository.save(_dataVerify[i]);

                    const pMigOld = new PaymentMigrationModel();
                    pMigOld.id = _dataVerify[i]["id"];
                    pMigOld.orderId = _dataVerify[i]["order_id"];
                    pMigOld.paidDate = _dataVerify[i]["paid_date"];
                    pMigOld.payementNumber = _dataVerify[i]["payment_number"];
                    pMigOld.paymentInformation = _dataVerify[i]["payment_information"];
                    pMigOld.paymentAmount = _dataVerify[i]["payment_amount"];
                    pMigOld.isPayment = _dataVerify[i]["is_payment"];
                    pMigOld.paymentStatus = _dataVerify[i]["payment_status"];
                    pMigOld.paymentComminsionAmount = 0;
                    await migPaymentRepository.save(pMigOld);

                } else {
                    orderData.paymentFlag = 2;
                    orderData.paymentStatus = 2;
                    _dataVerify[i].is_payment = 1;


                    const pMigOld = new PaymentMigrationModel();
                    pMigOld.id = _dataVerify[i]["id"];
                    pMigOld.orderId = _dataVerify[i]["order_id"];
                    pMigOld.paidDate = _dataVerify[i]["paid_date"];
                    pMigOld.payementNumber = _dataVerify[i]["payment_number"];
                    pMigOld.paymentInformation = _dataVerify[i]["payment_information"];
                    pMigOld.paymentAmount = _dataVerify[i]["payment_amount"];
                    pMigOld.isPayment = _dataVerify[i]["is_payment"];
                    pMigOld.paymentStatus = _dataVerify[i]["payment_status"];
                    pMigOld.paymentComminsionAmount = 0;
                    await migPaymentRepository.save(pMigOld);


                    await migPaymentRepository.save(_dataVerify[i]);
                    await orderRepository.save(orderData);
                }


                //await orderRepository.save(orderData);

                holdingData.push(orderData);


                if (_dataVerify.length == countRun) {
                    return res.status(200).send(await this._m.getMessage(200, holdingData));
                }
            }
        } else {
            return res.status(200).send(this._m.getMessage(300));
        }
    }


    // Validate Order Tracking
    /**
     * @api {get} /api/data-migration/order/secure/validate-order-tracking Validate Order Tracking
     * @apiGroup Data Migration
     * @apiParam (Request body) {File} file File
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Validated",
     *      "filePath": "amazon"
     * }
     * @apiSampleRequest /api/data-migration/order/secure/validate-order-tracking
     * @apiErrorExample {json} GenerateError error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post("/secure/validate-order-tracking")
    public async _validateTrackingOrder(@UploadedFile('file') files: any, @Res() res: any): Promise<any> {

        const csv = require("csvtojson");
        let b = files.originalname;
        if (files.mimetype == "text/csv" && b.substring(b.lastIndexOf("."), b.length) == ".csv") {
            let _j = await csv().fromString((files.buffer).toString());

            if (_j.length > 0) {
                let _executionOver = await this._validateOrderTracking(_j);
                let filePath = "";
                if (_executionOver.compileRecord.length > 0) {
                    filePath = await this._migration._doCreateCSVOnS3(_executionOver.compileRecord, files.originalname, 'Validate_Tracking_');
                } else {
                    filePath = "NA";
                }


                if (filePath) {
                    let _json = {
                        "message": (_executionOver.failedRecord.length > 0) ? "After correction of this csv please validate again." : '',
                        "downloadCompiledRecords": filePath
                    };
                    return res.status(200).send(await this._m.getMessage('200', _json));
                }

            }
        } else {
            return res.status(500).send(await this._m.getMessage('200'));
        }
    }

    public async _validateOrderTracking(_j: any): Promise<any> {
        let failedJson = [];
        //let successJson = [];
        let counter = 0;
        let cloneArray = JSON.parse(JSON.stringify(_j));
        let newJson = [];

        let orderStatusTracking = [
            'order placed',
            'order shipped',
            'packing in progress',
            'order delivered',
            'order cancelled',
            'order replacement apply',
            'order replaced',
            'order dispatched',
            // 'placed',
            // 'shipped',
            // 'packed',
            // 'delivered',
            // 'cancelled',
            // 'replacement',
            // 'replaced',
            // 'dispatched',
        ];

        for (let inc = 0; inc < _j.length; inc++) {
            counter += 1;

            let _errorM = "";

            let OrdertrackingData = await this.migAdditionalDetailService.findOne({ where: { oldOrderId: _j[inc]['ORDER NO'] } });

            // if (_j[inc]['old Payment Id'] === "") {
            //     Object.assign(cloneArray[inc], { 'message': 'old Payment Id should not be empty' });
            //     failedJson.push(cloneArray[inc]);

            //     continue;
            // }
            if (_j[inc]['ORDER NO'] === "") {
                //Object.assign(cloneArray[inc], { 'message': 'old Payment Id should not be empty' });
                //failedJson.push(cloneArray[inc]);

                //continue;

                _errorM = _errorM + "Order No should not be empty.\r\n";
            } 
            
            if (_j[inc]['ACTION DATE'] === "") {
                //Object.assign(cloneArray[inc], { 'message': 'Paid Date should not be empty' });
                //failedJson.push(cloneArray[inc]);

                //continue;
                _errorM = _errorM + "ACTION DATE should not be empty.\r\n";
            } 
            
            if (_j[inc]['ACTION TYPE'] === "") {
                //Object.assign(cloneArray[inc], { 'message': 'Payment Number should not be empty' });
                // failedJson.push(cloneArray[inc]);

                //continue;
                _errorM = _errorM + "ACTION TYPE should not be empty.\r\n";
            } 

            if (_j[inc]['ACTION TYPE'] != "") {
                //Object.assign(cloneArray[inc], { 'message': 'Payment Number should not be empty' });
                // failedJson.push(cloneArray[inc]);

                //continue;
               // _errorM = _errorM + "ACTION TYPE should not be empty.\r\n";
                
                if (!orderStatusTracking.includes(_j[inc]['ACTION TYPE'].toLowerCase())) {
                    _errorM = _errorM + "Action type is not correct, Please choose in the list ("+orderStatusTracking.join(',')+").\r\n";
                    //Object.assign(cloneArray[inc], { 'Error Message': 'Product is not available' });
                    // failedJson.push(cloneArray[inc]);
                    //newJson.push(cloneArray[inc]);
                    //continue;
                    
                }

                
            } 
            
            if (!OrdertrackingData) {
                _errorM = _errorM + "Order not available.\r\n";
                //Object.assign(cloneArray[inc], { 'Error Message': 'Product is not available' });
                // failedJson.push(cloneArray[inc]);
                //newJson.push(cloneArray[inc]);
                //continue;
                
            }

            

            Object.assign(cloneArray[inc], { 'Error Message': _errorM });
            newJson.push(cloneArray[inc]);
            
            if(_errorM){
                failedJson.push(cloneArray[inc]);
            }
        }
        if (counter == ((_j.length))) {
            let _newJ = {
                "totalRecord": _j.length,
                "failedRecord": failedJson,
                "compileRecord": newJson
            };
            return Promise.resolve(_newJ);
        }

    }


    // Insert Order Tracking
    /**
     * @api {get} /api/data-migration/order/secure/insert-order-tracking Insert Order Tracking
     * @apiGroup Data Migration
     * @apiParam (Request body) {File} file File
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Inserted",
     *      "data": "[{}]"
     * }
     * @apiSampleRequest /api/data-migration/order/secure/insert-order-tracking
     * @apiErrorExample {json} GenerateError error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post("/secure/insert-order-tracking")
    public async importOrderTrackingData(@UploadedFile('file') files: any, @Res() res: any): Promise<any> {
        const csv = require("csvtojson");
        let b = files.originalname;
        if (files.mimetype == "text/csv" && b.substring(b.lastIndexOf("."), b.length) == ".csv") {
            let _j = await csv().fromString((files.buffer).toString());

            if (_j.length > 0) {
                let _executionOver = await this._doInsertOrderTracking(_j);
                if (_executionOver.length > 0) {
                    //filePath = await this._migration._doCreateCSVOnS3(_executionOver.failedRecord, files.originalname, 'Validate');
                } else {
                    //filePath = "NA";
                }


                // if (filePath) {
                let _json = {
                    "successRows": _executionOver.length,
                    //"failed": _executionOver.failedRecord.length,
                    "InsertedItem": _executionOver
                };
                return res.status(200).send(await this._m.getMessage('200', _json));

            }
        } else {
            return res.status(500).send(await this._m.getMessage('200'));
        }

    }

    public async _doInsertOrderTracking(_j: any = []): Promise<any> {

        let successJson = [];


        for (let inc = 0; inc < _j.length; inc++) {
            var ProductLogdata = new ProductLogModel();

            //let _date = "";
            // let raw1 = (_j[inc]['ACTION DATE']).split("/");
            // let raw2 = raw1[2].split(" ");
            // _date = (raw2[0] + "-" + raw1[0] + "-" + raw1[1] + " " + (raw2[1] ? raw2[1] : '00:00:00'));




            ProductLogdata.orderNo = _j[inc]['ORDER NO'];
            ProductLogdata.actionDate = moment(new Date(_j[inc]['ACTION DATE'])).format("YYYY-MM-DD HH:mm:ss");
            ProductLogdata.actionType = _j[inc]['ACTION TYPE'];
            ProductLogdata.trackingNo = _j[inc]['TRACKING NUMBER'];
            ProductLogdata.trackingUrl = _j[inc]['TRACKING URL'];


            var oldPaymentSave = await this.migProductLogService.create(ProductLogdata);

            
            if (oldPaymentSave) {

                successJson.push(_j[inc]);
            } else {
                successJson = [];
            }
        }

        return Promise.resolve(successJson);


    }


    // Map Order Tracking
    /**
     * @api {get} /api/data-migration/order/secure/map-order-tracking Map Order Tracking
     * @apiGroup Data Migration
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Mapped",
     *      "data": [],
     *      "status" : "200"
     * }
     * @apiSampleRequest /api/data-migration/order/secure/map-order-tracking
     * @apiErrorExample {json} GenerateError error
     * HTTP/1.1 500 Internal Server Error
     */
    @Post("/secure/map-order-tracking")
    public async orderTracking(@Res() res: any): Promise<any> {

        const _allData = await this._orderTracking.getOldTrackingData();


        let _j = JSON.parse(JSON.stringify(_allData));
        let originalArray = JSON.parse(JSON.stringify(_allData));


        let addedTracker = [];


        let orderStatusToUpdate = [
            'order delivered',
            'order cancelled',
            'order replaced',
            'order dispatched',
            
        ];

        if (_j.length > 0) {
            for (let c = 0; c < _j.length; c++) {
                if (!addedTracker.includes(_j[c]["orderId"])) {
                    addedTracker.push(_j[c]["orderId"]);

                    let filterDataOrderID = originalArray.filter((x: any) => x.orderId == _j[c]["orderId"]);


                    filterDataOrderID.sort((a: any, b: any) => moment(new Date(a.transactionalDate)).unix() - moment(new Date(b.transactionalDate)).unix());

                    await this._orderTracking.updateOldProductLog(filterDataOrderID[0]['oldOrderId']);
                    

                    for(let fl of filterDataOrderID){
                        if(orderStatusToUpdate.includes((fl.actionType).toLowerCase())){
                            let statusData = {}
                            statusData = await this._orderTracking.getOrderStatusIdAndName(fl.actionType);
                            if(statusData){
                                //let _newRawArray = [];
                                filterDataOrderID = filterDataOrderID.map(x=>{
                                    return { 
                                        ...x, 
                                        actionType : statusData['name'], 
                                        actionTypeId : statusData['orderStatusId'] }
                                });


                                await this._orderTracking.updateMainOrderStatus(fl.orderId,statusData['orderStatusId']);
                            }
                        }
                    }
                    
                    
                    


                    await this._orderTracking.saveOrderTracking(filterDataOrderID);
                }

            }

            return res.status(200).send(await this._m.getMessage(200, _j));
        } else {
            return res.status(200).send(await this._m.getMessage(300));
        }


    }

    @Post("/secure/update-mig-order-status")
    public async updateMigOrderStatus(@UploadedFile('file') files: any, @Res() res: any): Promise<any> {

        const csv = require("csvtojson");
        let b = files.originalname;
        if (files.mimetype == "text/csv" && b.substring(b.lastIndexOf("."), b.length) == ".csv") {
            let csvData:any = await csv().fromString((files.buffer).toString());

            const getLength:number = csvData.length
            let count:number=0
            for(let i=0; i<getLength; i++){
                const orderTable:string="`order`"
                getManager().query(`UPDATE ${orderTable} o LEFT JOIN order_product op ON o.order_id=op.order_id SET o.order_status_id=${csvData[i].order_status_id}, op.order_status_id=${csvData[i].order_status_id} WHERE o.order_prefix_id='${csvData[i].order_no}' and o.order_status_id=1`)
                count++
            }
            return `Successfully update the status of ${count} records`
            
        }
    }
}