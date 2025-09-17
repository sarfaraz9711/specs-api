/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import { Post, JsonController, Req, Res, Get, QueryParam, Body, UseBefore, QueryParams, Param, Authorized } from 'routing-controllers';
import { classToPlain } from 'class-transformer';
// import { CustomerCheckoutRequest } from './requests/CustomerCheckoutRequest';
import { OrderCancelRequest } from './requests/OrderCancelRequest';
import { OrderService } from '../../services/OrderService';
import { OrderProductService } from '../../services/OrderProductService';
import { OrderTotalService } from '../../services/OrderTotalService';
import { Order } from '../../models/Order';
import { OrderProduct } from '../../models/OrderProduct';
import { OrderTotal } from '../../models/OrderTotal';
import { CustomerService } from '../../services/CustomerService';
import { MAILService } from '../../../auth/mail.services';
import { ProductService } from '../../services/ProductService';
import { ProductImageService } from '../../services/ProductImageService';
import { SettingService } from '../../services/SettingService';
import { EmailTemplateService } from '../../services/EmailTemplateService';
import { ProductRatingService } from '../../services/RatingService';
import { ProductRating } from '../../models/ProductRating';
import { CountryService } from '../../services/CountryService';
import { UserService } from '../../services/UserService';
import { Customer } from '../../models/Customer';
import { PluginService } from '../../services/PluginService';
import { CurrencyService } from '../../services/CurrencyService';
import { env } from '../../../env';
import { OrderLogService } from '../../services/OrderLogService';
import { PdfService } from '../../services/PdfService';
import { ZoneService } from '../../services/zoneService';
import { S3Service } from '../../services/S3Service';
import { ImageService } from '../../services/ImageService';
import { OrderStatusService } from '../../services/OrderStatusService';
import { DeliveryLocationService } from '../../services/DeliveryLocationService';
import { OrderProductLogService } from '../../services/OrderProductLogService';
import { CustomerCartService } from '../../services/CustomerCartService';
import { CouponUsage } from '../../models/CouponUsage';
import { CouponUsageProduct } from '../../models/CouponUsageProduct';
import { CouponUsageService } from '../../services/CouponUsageService';
import { CouponUsageProductService } from '../../services/CouponUsageProductService';
import { VendorCouponService } from '../../services/VendorCouponService';
import { OrderCancelReasonService } from '../../services/OrderCancelReasonService';
import { StockLogService } from '../../services/StockLogService';
import { StockLog } from '../../models/StockLog';
import { ProductStockAlertService } from '../../services/ProductStockAlertService';
import { ProductStockAlert } from '../../models/ProductStockAlert';
import { ProductTirePriceService } from '../../services/ProductTirePriceService';
import { ProductSpecialService } from '../../services/ProductSpecialService';
import { ProductDiscountService } from '../../services/ProductDiscountService';
import { SkuService } from '../../services/SkuService';
import { ProductVarientOptionImageService } from '../../services/ProductVarientOptionImageService';
import { TaxService } from '../../services/TaxService';
import { CustomerBackorderRequest } from './requests/CustomerBackorderRequest';
import { CheckCustomerMiddleware, CheckTokenMiddleware } from '../../middlewares/checkTokenMiddleware';
import { PinelabsService } from '../../services/payment/PinelabsService';
import { PaytmService } from '../../services/payment/PaytmService';
import { IngenicoService } from '../../services/payment/IngenicoService';
//import { UnicommerceService } from '../../services/admin/UnicommerceService';
import {FreeProductPromotionService} from '../../services/promotions/freeProducts/freeProductsPromotionService';
import { PromotionsUsageOrdersService} from '../../services/promotions/PromotionUsageOrdersService';
import {CartValueBasedPromosService} from '../../services/promotions/CartValueBasedPromotion/CartValueBasedPromotionService';
import {CouponBasedPromosService} from '../../services/promotions/CouponBasedPromos/CouponBasedPromoService';
import { CommonService } from '../../common/commonService';
import { OrderReturnService } from '../../services/OrderReturnService';
import { LoyaltyPointController } from '../LoyaltyPointController';
import { getManager } from 'typeorm';
import { OrderReturn } from '../../models/OrderReturn';
import { CreditNoteService } from '../../services/admin/CreditNoteService';
import { ProductReviewImages } from '../../models/ProductReviewImages';

import { HundredOffOnPreprodOrdersService} from '../../services/promotions/HundredOffOnPrePaidOrderService';
import {EmployeeDiscountClaim} from "../../models/EmployeeDiscountClaim"
import { IngenicoOrderData } from '../../models/Ingenico/IngenicoOrderData';
import moment from 'moment';
import { PaytmOrder } from '../../models/Paytm/PaytmOrder';
import { OrderStatusHistoryController } from '../OrderStatusHistoryController'; 
@JsonController('/orders')
export class CustomerOrderController {
    constructor(private _loyaltyPoint: LoyaltyPointController, private _orderReturn: OrderReturnService, private _commonService: CommonService, private orderService: OrderService, private orderProductService: OrderProductService, private orderTotalService: OrderTotalService,
                private customerService: CustomerService, private productService: ProductService, private productImageService: ProductImageService, private settingService: SettingService,
                private emailTemplateService: EmailTemplateService, private productRatingService: ProductRatingService, private orderLogService: OrderLogService,
                private countryService: CountryService, private pluginService: PluginService, private currencyService: CurrencyService, private userService: UserService,
                private pdfService: PdfService,
                private zoneService: ZoneService,
                private s3Service: S3Service,
                private orderStatusService: OrderStatusService,
                private deliveryLocationService: DeliveryLocationService,
                private orderProductLogService: OrderProductLogService,
                private customerCartService: CustomerCartService,
                private couponUsageService: CouponUsageService,
                private couponUsageProductService: CouponUsageProductService,
                private vendorCouponService: VendorCouponService,
                private orderCancelReasonService: OrderCancelReasonService,
                private stockLogService: StockLogService,
                private productStockAlertService: ProductStockAlertService,
                private productTirePriceService: ProductTirePriceService,
                private productSpecialService: ProductSpecialService,
                private productDiscountService: ProductDiscountService,
                private productVarientOptionImageService: ProductVarientOptionImageService,
                private taxService: TaxService,
                private imageService: ImageService, 
                private skuService: SkuService,
                private _pnLabs : PinelabsService,
                private _paytm : PaytmService,
                private ingenicoService: IngenicoService,
                //private _unicommerce: UnicommerceService
                private _freeProductPromotionService: FreeProductPromotionService,
                private _promotionsUsageOrdersService: PromotionsUsageOrdersService,
                private _cartValueBasedPromosService: CartValueBasedPromosService,
                private _couponBasedPromosService: CouponBasedPromosService,
                private _hundredOffOnPreprodOrdersService: HundredOffOnPreprodOrdersService,
                private _creditNoteService: CreditNoteService,
                private _orderStatusHistoryController: OrderStatusHistoryController
                ) {
    }

    // public getActivePromos(){
    //     let activePromotions = [{
    //         cartTotalAmount: 5000,
    //         discountValue: 20,
    //         discountType: "percentage",
    //         active: true
    //     }];
    //     return activePromotions;
    //    // return [];
    // }

    // customer checkout
    /**
     * @api {post} /api/orders/customer-checkout Checkout
     * @apiGroup Store order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} productDetail Product Details
     * @apiParam (Request body) {Number} paymentMethod paymentMethod
     * @apiParam (Request body) {String} shippingFirstName Shipping First name
     * @apiParam (Request body) {String} shippingLastName Shipping Last Name
     * @apiParam (Request body) {String} shippingCompany Shipping Company
     * @apiParam (Request body) {String} shippingAddress_1 Shipping Address 1
     * @apiParam (Request body) {String} shippingAddress_2 Shipping Address 2
     * @apiParam (Request body) {String} shippingCity Shipping City
     * @apiParam (Request body) {Number} shippingPostCode Shipping PostCode
     * @apiParam (Request body) {String} shippingCountryId ShippingCountryId
     * @apiParam (Request body) {String} shippingZone Shipping Zone
     * @apiParam (Request body) {String} shippingAddressFormat Shipping Address Format
     * @apiParam (Request body) {String} paymentFirstName Payment First name
     * @apiParam (Request body) {String} PaymentLastName Payment Last Name
     * @apiParam (Request body) {String} PaymentCompany Payment Company
     * @apiParam (Request body) {String} paymentAddress_1 Payment Address 1
     * @apiParam (Request body) {String} paymentAddress_2 Payment Address 2
     * @apiParam (Request body) {String} paymentCity Payment City
     * @apiParam (Request body) {Number} paymentPostCode Payment PostCode
     * @apiParam (Request body) {String} paymentCountryId PaymentCountryId
     * @apiParam (Request body) {String} paymentZone Payment Zone
     * @apiParam (Request body) {Number} phoneNumber Customer Phone Number
     * @apiParam (Request body) {String} emailId Customer Email Id
     * @apiParam (Request body) {String} password Customer password
     * @apiParam (Request body) {String} couponCode couponCode
     * @apiParam (Request body) {Number} couponDiscountAmount couponDiscountAmount
     * @apiParam (Request body) {String} couponData
     * @apiParam (Request body) {String} gstNo gstNo
     * @apiParamExample {json} Input
     * {
     *      "productDetails" :[
     *      {
     *      "productId" : "",
     *      "quantity" : "",
     *      "price" : "",
     *      "model" : "",
     *      "name" : "",
     *      "varientName" : "",
     *      "productVarientOptionId" : "",
     *      "skuName" : "",
     *      }],
     *      "shippingFirstName" : "",
     *      "shippingLastName" : "",
     *      "shippingCompany" : "",
     *      "shippingAddress_1" : "",
     *      "shippingAddress_2" : "",
     *      "shippingCity" : "",
     *      "shippingPostCode" : "",
     *      "shippingCountryId" : "",
     *      "shippingZone" : "",
     *      "paymentFirstName" : "",
     *      "paymentLastName" : "",
     *      "paymentCompany" : "",
     *      "paymentAddress_1" : "",
     *      "paymentAddress_2" : "",
     *      "paymentCity" : "",
     *      "paymentPostCode" : "",
     *      "paymentCountryId" : "",
     *      "paymentZone" : "",
     *      "shippingAddressFormat" : "",
     *      "phoneNumber" : "",
     *      "emailId" : "",
     *      "password" : "",
     *      "paymentMethod" : "",
     *      "vendorId" : "",
     *      "couponCode" : "",
     *      "couponDiscountAmount" : "",
     *      "couponData" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Check Out the product successfully And Send order detail in your mail ..!!",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/orders/customer-checkout
     * @apiErrorExample {json} Checkout error
     * HTTP/1.1 500 Internal Server Error
     */
    // Customer Checkout Function
    @UseBefore(CheckTokenMiddleware)
    @Post('/customer-checkout')
    public async customerCheckout(@Body({ validate: true }) checkoutBody: any, @Res() response: any, @Req() request: any): Promise<any> {

        const decrptData = this._commonService.decrptData(checkoutBody.body)
        let checkoutParam:any=JSON.parse(decrptData)

        const totalCheckoutAmount:any = (checkoutParam.totalItemsPrice+checkoutParam.shippingCharges)
        const totalCheckoutDicosunt:any = (checkoutParam.additionalDetails.appliedDiscountPerProd + checkoutParam.additionalDetails.appliedName + checkoutParam.additionalDetails.coupanPrice + checkoutParam.additionalDetails.coupanPriceCN + checkoutParam.additionalDetails.promotionProductPrice + checkoutParam.additionalDetails.getRedeemLoyaltyPoint + checkoutParam.additionalDetails.cartValueDiscountedAmountPercentage + checkoutParam.productsTotalDiscount+checkoutParam.prepaidOrder)
        const totalCheckoutPromotion:any = (checkoutParam.additionalDetails.appliedDiscountPerProd + checkoutParam.additionalDetails.appliedName + checkoutParam.additionalDetails.coupanPrice +  checkoutParam.additionalDetails.promotionProductPrice + checkoutParam.additionalDetails.getRedeemLoyaltyPoint + checkoutParam.additionalDetails.cartValueDiscountedAmountPercentage + checkoutParam.prepaidOrder)
        console.log("totalCheckoutPromotion",totalCheckoutPromotion)
        const totalCheckoutPayAmount = totalCheckoutAmount-totalCheckoutDicosunt
        const amountDiff = totalCheckoutPayAmount - checkoutParam.totalCartValue
        if((totalCheckoutPayAmount != checkoutParam.totalCartValue && (amountDiff > 1 || amountDiff < -2)) || checkoutParam.totalCartValue<0){
            const newOrderTotalCheckout = new OrderTotal();
            newOrderTotalCheckout.orderReqPayload = JSON.stringify(checkoutParam);
            newOrderTotalCheckout.createdBy = 500;
            await this.orderTotalService.createOrderTotalData(newOrderTotalCheckout);
            return response.status(400).send({status: 0, message: 'Order value miss match'});
        }

        if (checkoutParam.couponCode) {
            const vendorCoupon = await this.vendorCouponService.findOne({ where: { couponCode: checkoutParam.couponCode } });
            if (!vendorCoupon) {
                const errResponse: any = {
                    status: 0,
                    message: 'Invalid coupon code',
                };
                return response.status(400).send(errResponse);
            }
        }

        if((checkoutParam.productDetails).length==0){
            const errResponse: any = {
                status: 0,
                message: 'Order item is required',
            };
            return response.status(500).send(errResponse);
        }
//         let skuNameList:any[]=[]
//         checkoutParam.productDetails.forEach((element:any) => {
//             skuNameList.push(element.skuName)
//         });

// const { UnicommeService : ss } = require('../../services/admin/UnicomService');
// let uniSer = new ss();
// const uniResult = await uniSer.checkAvailableInventory(skuNameList);

//  if(uniResult && uniResult.length>0){
//     for(let i=0; i<uniResult.length; i++) {
//     if(uniResult[i].quantity==0){
//         const errResponse: any = {
//             status: 0,
//             message: 'Inventory is not available for sku '+uniResult[i].sku,
//         };
//         return response.status(400).send(errResponse);
//     }
//     break
// }
// }

       // checkoutParam.cnCode = "CNAXY4V";
        const userId = request.id;
        let validCnFound: any = {}
        if (checkoutParam.cnCode) {
            const getUser:any = await this.customerService.findOne(userId)
            validCnFound = await this._creditNoteService.applyCreditNote(checkoutParam.cnCode, getUser);
            console.log("validCnFound",validCnFound)

            if (validCnFound && validCnFound.length > 0 && validCnFound[0].cn_amount==checkoutParam.additionalDetails.coupanPriceCN) {
                await this._creditNoteService.markCnInactive(checkoutParam.cnCode);
            } else {
                const errResponse: any = {
                    status: 0,
                    message: 'Invalid CN code',
                };
                return response.status(400).send(errResponse);
            }
        }

        const error: any = [];
        const dynamicData: any = {};
        const orderProducts: any = checkoutParam.productDetails;
        let totalCartValue = checkoutParam.totalCartValue;


        
        for (const val of orderProducts) {
            const productAvailability = await this.productService.findOne({ where: { productId: val.productId } });
            if (productAvailability.pincodeBasedDelivery === 1) {
                const deliveryLocation = await this.deliveryLocationService.findOne({ where: { zipCode: checkoutParam.shippingPostCode, vendorId: 0 } });
                if (!deliveryLocation) {
                    error.push(1);
                }
            }
            if (error.length > 0) {
                const errResponse: any = {
                    status: 0,
                    message: 'Product not available for your pincode',
                    data: error,
                };
                return response.status(400).send(errResponse);
            }
            /// for find product price with tax , option price, special, discount and tire price /////
            let price: any;
            let taxType: any;
            let taxValue: any;
            let tirePrice: any;
            let priceWithTax: any;
            const productTire = await this.productService.findOne({ where: { productId: val.productId } });
            taxType = productTire.taxType;
            if (taxType === 2 && taxType) {
                const tax = await this.taxService.findOne({ where: { taxId: productTire.taxValue } });
                taxValue = (tax !== undefined) ? tax.taxPercentage : 0;
            } else if (taxType === 1 && taxType) {
                taxValue = productTire.taxValue;
            }
            const sku = await this.skuService.findOne({ where: { skuName: val.skuName } });
            if (sku && val.skuName!='') {
                if (productTire.hasTirePrice === 1) {
                    const findWithQty = await this.productTirePriceService.findTirePrice(val.productId, sku.id, val.quantity);
                    if (findWithQty) {
                        tirePrice = findWithQty.price;
                    } else {
                        const dateNow = new Date();
                        const todaydate = dateNow.getFullYear() + '-' + (dateNow.getMonth() + 1) + '-' + dateNow.getDate();
                        const productSpecial = await this.productSpecialService.findSpecialPriceWithSku(val.productId, sku.id, todaydate);
                        const productDiscount = await this.productDiscountService.findDiscountPricewithSku(val.productId, sku.id, todaydate);
                        if (productSpecial !== undefined) {
                            tirePrice = productSpecial.price;
                        } else if (productDiscount !== undefined) {
                            tirePrice = productDiscount.price;
                        } else {
                            tirePrice = sku.price;
                        }
                    }
                    if (taxType && taxType === 2) {
                        const percentVal = +tirePrice * (+taxValue / 100);
                        priceWithTax = +tirePrice + +percentVal;
                    } else if (taxType && taxType === 1) {
                        priceWithTax = +tirePrice + +val.taxValue;
                    } else {
                        priceWithTax = +tirePrice;
                    }
                    price = priceWithTax;
                } else {
                    const dateNow = new Date();
                    const todaydate = dateNow.getFullYear() + '-' + (dateNow.getMonth() + 1) + '-' + dateNow.getDate();
                    const productSpecial = await this.productSpecialService.findSpecialPriceWithSku(val.productId, sku.id, todaydate);
                    const productDiscount = await this.productDiscountService.findDiscountPricewithSku(val.productId, sku.id, todaydate);
                    if (productSpecial !== undefined) {
                        tirePrice = productSpecial.price;
                    } else if (productDiscount !== undefined) {
                        tirePrice = productDiscount.price;
                    } else {
                        tirePrice = sku.price;
                    }
                    if (taxType && taxType === 2) {
                        const perVal = +tirePrice * (+taxValue / 100);
                        priceWithTax = +tirePrice + +perVal;
                    } else if (taxType && taxType === 1) {
                        priceWithTax = +tirePrice + +taxValue;
                    } else {
                        priceWithTax = +tirePrice;
                    }
                    price = priceWithTax;
                }
            } else {
                const errResponse: any = {
                    status: 0,
                    message: 'Product SKU not available',
                    data: null,
                };
                return response.status(400).send(errResponse);
                tirePrice = productTire.price;
                if (taxType && taxType === 2) {
                    const percentAmt = +tirePrice * (+taxValue / 100);
                    priceWithTax = +tirePrice + +percentAmt;
                } else if (taxType && taxType === 1) {
                    priceWithTax = +tirePrice + +taxValue;
                } else {
                    priceWithTax = +tirePrice;
                }
                price = priceWithTax;
            }
            ///// finding price from backend ends /////
            const obj: any = {};
            obj.skuPrice = sku ? sku.price : productTire.price;
            obj.price = price;
            obj.taxType = taxType;
            obj.taxValue = taxValue;
            obj.tirePrice = tirePrice;
            obj.productTire = productTire;
            obj.quantity = val.quantity;
            dynamicData[val.skuName] = obj;
        }





        for (const val of orderProducts) {
            const product = await this.productService.findOne(val.productId);
            const sku = await this.skuService.findOne({ where: { skuName: val.skuName } });
            if (product.hasStock === 1) {
                if (!(sku.minQuantityAllowedCart <= +val.quantity)) {
                    const minCart: any = {
                        status: 0,
                        message: 'Quantity should be greater than min Quantity.',
                    };
                    return response.status(400).send(minCart);
                } else if (!(sku.maxQuantityAllowedCart >= +val.quantity)) {
                    const maxCart: any = {
                        status: 0,
                        message: 'Quantity should be lesser than max Quantity.',
                    };
                    return response.status(400).send(maxCart);
                }
                if ((+sku.quantity <= 0)) {
                    const cart: any = {
                        status: 0,
                        message: 'item is Out of stock',
                    };
                    return response.status(400).send(cart);
                }
                if (!(+sku.quantity >= +val.quantity)) {
                    const cart: any = {
                        status: 0,
                        message: 'Available stock for' + product.name + ' - ' + val.skuName + 'is' + sku.quantity,
                    };
                    return response.status(400).send(cart);
                }
            }
        }
        const plugin = await this.pluginService.findOne({ where: { id: checkoutParam.paymentMethod } });
        if (plugin === undefined) {
            const errorResponse: any = {
                status: 0,
                message: 'Payment method is invalid',
            };
            return response.status(400).send(errorResponse);
        }
        const newOrder: any = new Order();
        const newOrderTotal = new OrderTotal();
        newOrderTotal.orderReqPayload = JSON.stringify(checkoutParam);
        let orderProduct = [];
        let i;
        let n;
        let totalProductAmount;
        let totalAmount = 0;
        const productDetailData = [];
        let saleOrderItems = [];
        if (request.id || true) {
            let customerId;
            customerId = request.id;
            newOrder.customerId = customerId;
        } else {
            const customerEmail = await this.customerService.findOne({
                where: [{email: checkoutParam.emailId,deleteFlag: 0},{mobileNumber:checkoutParam.phoneNumber}],
            });
            if (customerEmail === undefined) {
                    const newUser = new Customer();
                    newUser.firstName = checkoutParam.shippingFirstName;
                    if(false){
                    const pattern = /^(?=.*?[A-Z])(?=.*?[a-z])((?=.*?[0-9])|(?=.*?[#?!@$%^&*-])).{8,}$/;
                    if (!checkoutParam.password.match(pattern)) {
                        const passwordValidatingMessage = [];
                        passwordValidatingMessage.push('Password must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters');
                        const errResponse: any = {
                            status: 0,
                            message: "You have an error in your request's body. Check 'errors' field for more details!",
                            data: { message: passwordValidatingMessage },
                        };
                        return response.status(422).send(errResponse);
                    }
                    const partsOfThreeLetters = checkoutParam.emailId.match(/.{3}/g).concat(
                        checkoutParam.emailId.substr(1).match(/.{3}/g),
                        checkoutParam.emailId.substr(2).match(/.{3}/g));
                    const matchEmail = new RegExp(partsOfThreeLetters.join('|'), 'i').test(checkoutParam.password);
                    if (matchEmail === true) {
                        const validationMessage = [];
                        validationMessage.push('Password must not contain any duplicate part of the email address');
                        const passwordDuplicateErrorResponse: any = {
                            status: 0,
                            message: "You have an error in your request's body. Check 'errors' field for more details!",
                            data: { message: validationMessage },
                        };
                        return response.status(422).send(passwordDuplicateErrorResponse);
                    }
                }
                    newUser.password = await Customer.hashPassword("MigUserRedchief@2023");
                    newUser.email = checkoutParam.emailId;
                    newUser.username = checkoutParam.emailId;
                    newUser.mobileNumber = checkoutParam.phoneNumber;
                    newUser.migUserActive = 0;
                    newUser.isActive = 1;
                    newUser.customerType=9
                    newUser.ip = (request.headers['x-forwarded-for'] ||
                        request.connection.remoteAddress ||
                        request.socket.remoteAddress ||
                        request.connection.socket.remoteAddress).split(',')[0];
                    const resultDatas = await this.customerService.create(newUser);
                    // const emailContents = await this.emailTemplateService.findOne(1);
                    // const message = emailContents.content.replace('{name}', resultDatas.firstName);
                    // const redirectUrl = env.storeRedirectUrl;                    
                    // MAILService.registerMail(logo, message, resultDatas.email, emailContents.subject, redirectUrl);
                    newOrder.customerId = resultDatas.id;
                
            } else {
                const errorResponse: any = {
                    status: 0,
                    message: 'Please login for checkout, emailId or mobile already exist',
                };
                return response.status(400).send(errorResponse);
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
        const country = await this.countryService.findOne({
            where: {
                countryId: checkoutParam.shippingCountryId,
            },
        });
        if (country) {
            newOrder.shippingCountry = country.name;
        }
        newOrder.shippingPostcode = checkoutParam.shippingPostCode;
        newOrder.shippingAddressFormat = checkoutParam.shippingAddressFormat;
        newOrder.paymentFirstname = checkoutParam.paymentFirstName;
        newOrder.paymentLastname = checkoutParam.paymentLastName;
        newOrder.paymentAddress1 = checkoutParam.paymentAddress_1;
        newOrder.paymentAddress2 = checkoutParam.paymentAddress_2;
        newOrder.paymentCompany = checkoutParam.paymentCompany;
        const paymentCountry = await this.countryService.findOne({
            where: {
                countryId: checkoutParam.paymentCountryId,
            },
        });
        if (paymentCountry) {
            newOrder.paymentCountry = paymentCountry.name;
        }
        newOrder.paymentCity = checkoutParam.paymentCity;
        newOrder.paymentZone = checkoutParam.paymentZone;
        newOrder.paymentPostcode = checkoutParam.paymentPostCode;
        newOrder.paymentMethod = checkoutParam.paymentMethod;
        newOrder.customerGstNo = checkoutParam.gstNo;
        newOrder.isActive = 1;
        const setting = await this.settingService.findOne();
        newOrder.orderStatusId = setting ? setting.orderStatus : 0;
        newOrder.invoicePrefix = setting ? setting.invoicePrefix : '';
        const currencyVal = await this.currencyService.findOne(setting.storeCurrencyId);
        newOrder.currencyCode = currencyVal ? currencyVal.code : '';
        newOrder.currencyValue = currencyVal ? currencyVal.value : '';
        newOrder.currencySymbolLeft = currencyVal ? currencyVal.symbolLeft : '';
        newOrder.currencySymbolRight = currencyVal ? currencyVal.symbolRight : '';
        newOrder.currencyValue = currencyVal ? currencyVal.value : '';
        newOrder.paymentAddressFormat = checkoutParam.shippingAddressFormat;
        newOrder.paymentStateCode = checkoutParam.paymentStateCode;
        newOrder.shippingStateCode = checkoutParam.shippingStateCode;
        newOrder.totalTax = checkoutParam.totalTax;
        newOrder.totalItemsPrice = checkoutParam.totalItemsPrice;
        newOrder.shippingCharges = checkoutParam.shippingCharges;
        newOrder.phoneNumberAlter = checkoutParam.phoneNumberAlter;
        newOrder.appliedCnAmount = (validCnFound && validCnFound.length > 0)?validCnFound[0].cn_amount:0;
        newOrder.ucOrderStatus = 'Pending';
        //newOrder.creditNoteForOrder = checkoutParam.creditNoteForOrder;
        const orderData = await this.orderService.create(newOrder);
        await this.orderLogService.create(orderData);
        if (validCnFound && validCnFound.length > 0) {
            await this._creditNoteService.updateOrderIdInCN(orderData.orderId, checkoutParam.cnCode); 
        }
        const currencySymbol = await this.currencyService.findOne(setting.storeCurrencyId);
        orderData.currencyRight = currencySymbol ? currencySymbol.symbolRight : '';
        orderData.currencyLeft = currencySymbol ? currencySymbol.symbolLeft : '';
        orderProduct = checkoutParam.productDetails;
        const nwDate = new Date();
        const odrDate = nwDate.getFullYear() + ('0' + (nwDate.getMonth() + 1)).slice(-2) + ('0' + nwDate.getDate()).slice(-2);
        let j = 1;
        
        const productTotalSum:any = orderProduct.reduce((a,b)=> a + ((+b.price*b.quantity)+(((+b.price*b.quantity)*b.taxValue)/100)),0)
        console.log("productTotalSumproductTotalSumproductTotalSum",productTotalSum)
        console.log("totalCheckoutPromotiontotalCheckoutPromotion",totalCheckoutPromotion)
        console.log("checkoutParam.shippingCharges",checkoutParam.shippingCharges)
        const refundPercentage:any = ((totalCheckoutPromotion/(productTotalSum+checkoutParam.shippingCharges))*100)
        console.log("refundPercentagerefundPercentage",refundPercentage)
        const orderProductLength:number=(orderProduct.length-1)
        const orderPLength:number=orderProduct.length
        const shippingChargesDevide:number= checkoutParam.shippingCharges/orderPLength
        console.log("shippingChargesDevide",shippingChargesDevide)
        let refundDiscountSum:number=0
        let totalRefundAmount:number=0
        for (i = 0; i < orderProduct.length; i++) {
            ///// finding price from backend ends /////
            const dynamicPrices = dynamicData[orderProduct[i].skuName];
            const productDetails = new OrderProduct();
            productDetails.productId = orderProduct[i].productId;
            productDetails.orderProductPrefixId = orderData.invoicePrefix.concat('-' + odrDate + orderData.orderId) + j;
            productDetails.name = dynamicPrices.productTire.name;
            productDetails.orderId = orderData.orderId;
            productDetails.quantity = orderProduct[i].quantity;
            productDetails.productPrice = dynamicPrices.price;
            productDetails.basePrice = dynamicPrices.skuPrice;
            productDetails.discountAmount = parseFloat(dynamicPrices.skuPrice) - parseFloat(dynamicPrices.tirePrice);
            productDetails.discountedAmount = productDetails.discountAmount !== 0.00 ? dynamicPrices.tirePrice : '0.00';
            productDetails.taxType = dynamicPrices.taxType;
            productDetails.taxValue = dynamicPrices.taxValue;
            productDetails.total = Math.round(+orderProduct[i].quantity * dynamicPrices.price);
            productDetails.model = dynamicPrices.productTire.name;
            productDetails.varientName = orderProduct[i].varientName ? orderProduct[i].varientName : '';
            productDetails.productVarientOptionId = orderProduct[i].productVarientOptionId ? orderProduct[i].productVarientOptionId : 0;
            productDetails.skuName = orderProduct[i].skuName ? orderProduct[i].skuName : '';
            productDetails.orderStatusId = setting ? setting.orderStatus : 0;
                const itemCodeList:any[]=[]
                for(let j=0; j<orderProduct[i].quantity; j++){
                    itemCodeList.push(orderProduct[i].skuName+"-"+j)
                }
            
                productDetails.itemCode = itemCodeList.toString()
            
            const productSellingPrice:any = (Math.round((+orderProduct[i].price*orderProduct[i].quantity)+((orderProduct[i].price*orderProduct[i].quantity)*orderProduct[i].taxValue)/100)+shippingChargesDevide)
            console.log("productSellingPriceproductSellingPrice",productSellingPrice)
            console.log("refundPercentage",refundPercentage)
            console.log("Math.round((productSellingPrice*refundPercentage)/100)",Math.round((productSellingPrice*refundPercentage)/100))            
            console.log("((productSellingPrice*refundPercentage)/100)",(productSellingPrice*refundPercentage)/100)
            if(orderProductLength==i){
                productDetails.refundAmount =  productSellingPrice - (totalCheckoutPromotion-refundDiscountSum)
            }else{
                productDetails.refundAmount =  productSellingPrice - Math.round((productSellingPrice*refundPercentage)/100)
                refundDiscountSum+=Math.round((productSellingPrice*refundPercentage)/100)
            }
            totalRefundAmount+=productDetails.refundAmount
            const productInformation = await this.orderProductService.createData(productDetails);
            await this.orderProductLogService.create(productInformation);
            // const cart = await this.customerCartService.findOne({ where: { productId: orderProduct[i].productId, customerId: orderData.customerId } });
            // if (cart !== undefined) {
            //     await this.customerCartService.delete(cart.id);
            // }
            const productImageData = await this.productService.findOne(productInformation.productId);
            // for stock management
            if (productImageData.hasStock === 1) {
                const product = await this.skuService.findOne({ where: { skuName: productInformation.skuName } });
                product.quantity = +product.quantity - +productInformation.quantity;
                const prod = await this.skuService.create(product);
                if (productImageData.isSimplified === 0) {
                    productImageData.quantity = +productImageData.quantity - +productInformation.quantity;
                    await this.productService.create(productImageData);
                    const findSku = await this.skuService.findOne({ where: { id: productImageData.skuId } });
                    findSku.quantity = +findSku.quantity - +productInformation.quantity;
                    await this.skuService.create(findSku);
                }
                if (+prod.quantity <= +prod.notifyMinQuantity) {
                    const productStockAlert = new ProductStockAlert();
                    productStockAlert.productId = productInformation.productId;
                    productStockAlert.skuName = productInformation.skuName;
                    productStockAlert.mailFlag = 1;
                    await this.productStockAlertService.create(productStockAlert);
                }
                const stockLog = new StockLog();
                stockLog.productId = productInformation.productId;
                stockLog.orderId = orderData.orderId;
                stockLog.skuName = productInformation.skuName;
                stockLog.quantity = productInformation.quantity;
                await this.stockLogService.create(stockLog);
            }
            let productImageDetail;
            if (productDetails.productVarientOptionId) {
                const image = await this.productVarientOptionImageService.findOne({ where: { productVarientOptionId: productDetails.productVarientOptionId } });
                if (image) {
                    productImageDetail = image;
                } else {
                    productImageDetail = await this.productImageService.findOne({ where: { productId: productInformation.productId, defaultImage: 1 } });
                }
            } else {
                productImageDetail = await this.productImageService.findOne({ where: { productId: productInformation.productId, defaultImage: 1 } });
            }
            productImageData.productInformationData = productInformation;
            productImageData.productImage = productImageDetail;
            totalProductAmount = await this.orderProductService.findData(orderProduct[i].productId, orderData.orderId, productInformation.orderProductId);

            for (n = 0; n < totalProductAmount.length; n++) {
                totalAmount += +totalProductAmount[n].total;
            }

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
            j++;
        }


        let grandDiscountAmount = 0;
        if (checkoutParam.couponCode && checkoutParam.couponData) {
            const couponUsage = new CouponUsage();
            const vendorCoupon = await this.vendorCouponService.findOne({ where: { couponCode: checkoutParam.couponCode } });
            couponUsage.couponId = vendorCoupon.vendorCouponId;
            couponUsage.customerId = orderData.customerId;
            couponUsage.orderId = orderData.orderId;
            couponUsage.discountAmount = +checkoutParam.couponDiscountAmount;
            const couponUsageData = await this.couponUsageService.create(couponUsage);
            const decryptedCouponCode = this.decrypt(checkoutParam.couponData);
            const ParseData = JSON.parse(decryptedCouponCode);
            for (const product of ParseData) {
                const couponUsageProduct = new CouponUsageProduct();
                couponUsageProduct.couponUsageId = couponUsageData.couponUsageId;
                couponUsageProduct.customerId = orderData.customerId;
                couponUsageProduct.orderId = orderData.orderId;
                const orderProductData = await this.orderProductService.findOne({ where: { orderId: orderData.orderId, productId: product.productId } });
                const dynamicPrices = dynamicData[product.skuName];
                const total = product.quantity * dynamicPrices.price;
                let discountAmount = 0;
                if (vendorCoupon.couponType === 1) {
                    discountAmount = total * (vendorCoupon.discount / 100);
                } else {
                    discountAmount = vendorCoupon.discount;
                }
                grandDiscountAmount += +discountAmount;
                orderProductData.couponDiscountAmount = +discountAmount;
                orderProductData.total = +orderProductData.total - (+discountAmount);
                await this.orderProductService.createData(orderProductData);
                couponUsageProduct.orderProductId = orderProductData.orderProductId;
                couponUsageProduct.quantity = product.quantity;
                couponUsageProduct.amount = dynamicPrices.price;
                couponUsageProduct.discountAmount = discountAmount;
                await this.couponUsageProductService.create(couponUsageProduct);
            }
            couponUsage.discountAmount = +grandDiscountAmount;
            await this.couponUsageService.create(couponUsage);
        }
        
        newOrder.amount = totalCartValue;
        newOrder.total = totalCartValue;
        if (checkoutParam.couponCode && checkoutParam.couponData) {
            //newOrder.total = totalAmount - (+grandDiscountAmount);
            newOrder.couponCode = checkoutParam.couponCode;
            newOrder.discountAmount = +grandDiscountAmount;
            newOrder.amount = totalAmount;
        }
        /***********Promotion handling Starts***************/
        const availedProductPromoInfo = checkoutParam.availedProductPromoInfo;
        const availedCartBasedPromoInfo = checkoutParam.availedCartBasedPromoInfo;
        const availedCouponBasedPromoInfo = checkoutParam.availedCouponBasedPromoInfo;
        const getLoyaltyPointInfo = checkoutParam.getLoyaltyPointInfo;
        let cartValueTotalDiscount = 0;
        let productBasedTotalDiscount = 0;
        let couponBasedTotalDiscount = 0;
        if (availedProductPromoInfo && availedProductPromoInfo.promotionType == "ProductBased") {
            for (let ip = 0; ip < availedProductPromoInfo.promoAvailedInfo.length; ip++) {
                productBasedTotalDiscount += availedProductPromoInfo.promoAvailedInfo[ip].discountAmount;
            }
        }
        if (getLoyaltyPointInfo && getLoyaltyPointInfo.promotionType == "loyaltyPoint") {
                productBasedTotalDiscount += getLoyaltyPointInfo.promoAvailedInfo.discountAmount;
        }
        
        if (availedCartBasedPromoInfo && availedCartBasedPromoInfo.promotionType == "CartValueBased" && availedCartBasedPromoInfo.promoAvailedInfo.length>0) {
            const allActivePromos = await this._cartValueBasedPromosService.getActiveOffers();
             
            const activeOffersPromoIds = [];
            const freeProductsIds = [];
            const activeOffersPromoLength = allActivePromos && allActivePromos.length;
            if (allActivePromos && activeOffersPromoLength > 0) {
                for (let r = 0; r < activeOffersPromoLength; r++) {

                    activeOffersPromoIds.push(allActivePromos[r].Id);
                    if (allActivePromos[r].discountType == "Free Products") {
                        freeProductsIds.push(allActivePromos[r].productId);
                    }
                }
            }
            // let allActivePromos = JSON.parse(allActivePromosString);
            const promoAvailedInfoLength = availedCartBasedPromoInfo && availedCartBasedPromoInfo.promoAvailedInfo.length;
            if (promoAvailedInfoLength > 0) {


                for (let ir = 0; ir < promoAvailedInfoLength; ir++) {
                   // if (activeOffersPromoLength > 0) {
                       // for (let r = 0; r < activeOffersPromoLength; r++) {
                            
                            // Check if PromoId provided by front end is in Active promo ids
                            if (activeOffersPromoIds.includes(availedCartBasedPromoInfo.promoAvailedInfo[ir].promoId)) {


                                if (availedCartBasedPromoInfo.promoAvailedInfo[ir].discountType == "Free Products") {
                                    if (freeProductsIds.includes(availedCartBasedPromoInfo.promoAvailedInfo[ir].freeProductIds)) {

                                        cartValueTotalDiscount += availedCartBasedPromoInfo.promoAvailedInfo[ir].discountAmount;
                                    } else {
                                        //Throw Error Product id not found in Active Promo offers
                                    }
                                } else {
                                    cartValueTotalDiscount += availedCartBasedPromoInfo.promoAvailedInfo[ir].discountAmount;
                                }


                            } else {
                                // Throw Error: PromoId provided by Front end is not in Active Promo Ids
                            }
                       // }
                   // }

                }
            }

        }


        //newOrder.total = newOrder.amount - (cartValueTotalDiscount + productBasedTotalDiscount + couponBasedTotalDiscount);

        /***********Promotion handling Ends***************/


        
        newOrder.invoiceNo = 'INV00'.concat(orderData.orderId);
       // const nowDate = new Date();
        // const dt = new Date();
        // let intlDateObj = new Intl.DateTimeFormat('en-US', {
        //     timeZone: "Asia/Kolkata",
        //     year: 'numeric',
        //     month: '2-digit',
        //     day: '2-digit',
        //     hour: '2-digit',
        //     minute: '2-digit',
        //     second: '2-digit',
        //     hour12: false
        // });

        // const replacedDateString = intlDateObj.format(dt).replace(/\//g, '-');
        // const nowDate = new Date(replacedDateString);
        // const orderDate = nowDate.getFullYear() + ('0' + (nowDate.getMonth() + 1)).slice(-2) + ('0' + nowDate.getDate()).slice(-2);
        // console.log(orderDate)
        newOrder.orderPrefixId = setting.invoicePrefix.concat('-' + odrDate + orderData.orderId);
        await this.orderService.update(orderData.orderId, newOrder);


        newOrderTotal.orderId = orderData.orderId;
        if (checkoutParam.couponCode && checkoutParam.couponData) {
            newOrderTotal.value = totalAmount - (+grandDiscountAmount);
        }
        
        newOrderTotal.value = newOrder.total;
        newOrderTotal.createdBy = 200;
        /***********Promotion handling Starts***************/
        
       // if(availedProductPromoInfo && availedProductPromoInfo.promotionType == "ProductBasedDemo"){
            
           // newOrder.discountAmount = checkoutParam.couponDiscountAmount; 
         //   newOrderTotal.value = newOrder.amount - checkoutParam.couponDiscountAmount;
        //}
        // if(availedCartBasedPromoInfo && availedCartBasedPromoInfo.promotionType == "CartValueBased"){
            
        // }
        // if(availedCouponBasedPromoInfo && availedCouponBasedPromoInfo.promotionType == "CouponBased"){
            
        // }
        /***********Promotion handling Ends***************/
        let couponValueIsNotValid:boolean=false
        if(availedCouponBasedPromoInfo && (availedCouponBasedPromoInfo.promotionType == "CouponBased")){
            for (let ig = 0; ig < availedCouponBasedPromoInfo.promoAvailedInfo.length; ig++) {
                const getValidCoupon:any = await getManager().query(`SELECT discount FROM tm_coupon_based_promotion WHERE coupon_id = ${availedCouponBasedPromoInfo.promoAvailedInfo[ig].promoId}`)
                if((getValidCoupon.length>0) && (getValidCoupon[0].discount>=availedCouponBasedPromoInfo.promoAvailedInfo[ig].discountAmount) && (getValidCoupon[0].discount>=checkoutParam.additionalDetails.coupanPrice)){
                couponBasedTotalDiscount += availedCouponBasedPromoInfo.promoAvailedInfo[ig].discountAmount;
                }else{
                couponValueIsNotValid=true
                }
            }
        }

        if(couponValueIsNotValid || ((totalCartValue+checkoutParam.additionalDetails.coupanPriceCN))!=totalRefundAmount){
            const newOrderTotalCheckout = new OrderTotal();
            newOrderTotalCheckout.orderReqPayload = JSON.stringify(checkoutParam);
            newOrderTotalCheckout.createdBy = 500;
            const statusJson ={
                orderId:orderData.orderId,
                updateOrderStatusId:11
            }
            await this.orderService.updateOrderStatus(statusJson)
            await this.orderTotalService.createOrderTotalData(newOrderTotalCheckout);
            return response.status(400).send({status: 0, message: 'Order value miss match'});
        }

        
        newOrder.discountAmount = cartValueTotalDiscount + productBasedTotalDiscount + couponBasedTotalDiscount+checkoutParam.productsTotalDiscount+checkoutParam.prepaidOrder;
        console.log("newOrder.discountAmount",newOrder.discountAmount)
        console.log("cartValueTotalDiscount",cartValueTotalDiscount, productBasedTotalDiscount, couponBasedTotalDiscount, checkoutParam.productsTotalDiscount,checkoutParam.prepaidOrder)
        
        await this.orderTotalService.createOrderTotalData(newOrderTotal);


        if(availedProductPromoInfo && availedProductPromoInfo.promotionType == "ProductBased"){
            const arrayLength = availedProductPromoInfo && availedProductPromoInfo.promoAvailedInfo.length;
            
            if(availedProductPromoInfo && arrayLength > 0){
                for(let jk=0; jk<arrayLength; jk++){
                    let promoUsageData:any = {};
                    promoUsageData.orderId = newOrderTotal.orderId;
                    
                    let promoId = availedProductPromoInfo.promoAvailedInfo[jk].promoId;
                    let promoDiscountAmount = availedProductPromoInfo.promoAvailedInfo[jk].discountAmount;
                    const promoMastRec =  await this._freeProductPromotionService.getPromotionById(promoId);
                    promoUsageData.promotionType = "ProductBased";
                    promoUsageData.promotionSubType = "FreeProduct";
                    promoUsageData.promotionIdentifier = promoMastRec[0].free_promotion_type;
                    promoUsageData.discountedAmount = promoDiscountAmount;
                    promoUsageData.boughtProductsIds = promoMastRec[0].buy_product_id;
                    promoUsageData.freeProductsIds = promoMastRec[0].get_product_id;
                    promoUsageData.startDate = promoMastRec[0].start_date;
                    promoUsageData.endDate = promoMastRec[0].end_date;
                    await this._promotionsUsageOrdersService.create(promoUsageData);
                }
            }
            
         }
         if(getLoyaltyPointInfo && getLoyaltyPointInfo.promotionType == "loyaltyPoint" && getLoyaltyPointInfo.promoAvailedInfo.discountAmount>0){
                    let promoUsageData:any = {};
                    promoUsageData.orderId = newOrderTotal.orderId;
                    promoUsageData.promotionType = getLoyaltyPointInfo.promotionType;
                    promoUsageData.discountedAmount = getLoyaltyPointInfo.promoAvailedInfo.discountAmount;
                    promoUsageData.promotionIdentifier=getLoyaltyPointInfo.promoAvailedInfo.referenceNo; 
                    promoUsageData.couponCode=getLoyaltyPointInfo.promoAvailedInfo.customer_points;
                    await this._promotionsUsageOrdersService.create(promoUsageData);
                    const updateVaue = {
                        "key":getLoyaltyPointInfo.promoAvailedInfo.referenceNo,
                        "orderId":newOrderTotal.orderId,
                        "status":"REDEEM"
                    }
                    await this._loyaltyPoint.updateStatus(null, null,updateVaue)
                }
       
         if(availedCartBasedPromoInfo && availedCartBasedPromoInfo.promotionType == "CartValueBased"){
            const arrayLength = availedCartBasedPromoInfo && availedCartBasedPromoInfo.promoAvailedInfo.length;
            
            if(availedCartBasedPromoInfo && arrayLength > 0){
                for(let rs=0; rs<arrayLength; rs++){
                    let promoUsageData:any = {};
                    promoUsageData.orderId = newOrderTotal.orderId;
                    
                    let promoId = availedCartBasedPromoInfo.promoAvailedInfo[rs].promoId;
                    let promoDiscountAmount = availedCartBasedPromoInfo.promoAvailedInfo[rs].discountAmount;
                    const promoMastRec =  await this._cartValueBasedPromosService.getPromotionById(promoId);
                    
                    promoUsageData.promotionType = availedCartBasedPromoInfo.promotionType;
                    promoUsageData.promotionSubType = availedCartBasedPromoInfo.promoAvailedInfo[rs].discountType;
                    promoUsageData.promotionIdentifier = promoMastRec[0].free_promotion_type;
                    promoUsageData.discountValue = promoMastRec[0].discountValue;
                    promoUsageData.discountedAmount = promoDiscountAmount.toFixed(2);
                    promoUsageData.boughtProductsIds = promoMastRec[0].buy_product_id;
                    promoUsageData.freeProductsIds = promoMastRec[0].get_product_id;
                    promoUsageData.startDate = promoMastRec[0].start_date;
                    promoUsageData.endDate = promoMastRec[0].end_date;
                    // promoUsageData.startTime = promoMastRec[0].free_promotion_type;
                    // promoUsageData.endTime = promoMastRec[0].free_promotion_type;
                    promoUsageData.startTime = "12AM";
                    promoUsageData.endTime = "11PM";
                    await this._promotionsUsageOrdersService.create(promoUsageData);
                }
            }
         }
         if(availedCouponBasedPromoInfo && (availedCouponBasedPromoInfo.promotionType == "CouponBased" || availedCouponBasedPromoInfo.promotionType == "employeeCoupon")){
            const arrayLength = availedCouponBasedPromoInfo && availedCouponBasedPromoInfo.promoAvailedInfo.length;
            
            if(availedCouponBasedPromoInfo && arrayLength > 0){
                for(let tm=0; tm<arrayLength; tm++){
                    let promoUsageData:any = {};
                    promoUsageData.orderId = newOrderTotal.orderId;
                    
                    let promoId = availedCouponBasedPromoInfo.promoAvailedInfo[tm].promoId;
                    let promoDiscountAmount = availedCouponBasedPromoInfo.promoAvailedInfo[tm].discountAmount;
                    const promoMastRec =  await this._couponBasedPromosService.getPromotionById(promoId);
                    promoUsageData.promotionType = availedCouponBasedPromoInfo.promotionType;
                    if(availedCouponBasedPromoInfo.promotionType == "employeeCoupon"){
                        const customer = await this.customerService.findOne(newOrder.customerId)
                        const employeeJson:any = {
                            employeeMobileNo:customer.mobileNumber,
                            customerId:newOrder.customerId,
                            orderPrefixId:newOrder.orderPrefixId,
                            orderAmount:newOrder.total,
                            discountAmount:promoDiscountAmount,
                            couponName:promoMastRec[0].couponCode
                            }                            
                        await getManager().getRepository(EmployeeDiscountClaim).save(employeeJson)
                    }else{
                        promoUsageData.promotionSubType = promoMastRec[0].couponType == "1" ? "Percentage": "Flat";
                        promoUsageData.promotionIdentifier = checkoutParam.emailId;
                    }
                    
                    promoUsageData.couponCode = promoMastRec[0].couponCode;
                    promoUsageData.discountedAmount = promoDiscountAmount;
                    promoUsageData.discountValue = promoMastRec[0].couponValue;
                    promoUsageData.startDate = promoMastRec[0].startDate;
                    promoUsageData.endDate = promoMastRec[0].endDate;
                    
                    await this._promotionsUsageOrdersService.create(promoUsageData);
                }
            }
         }

         if(checkoutParam.prepaidOrder>0){
            //const productDetails = new OrderProduct();
           let prepaidOffData:any = {};
             prepaidOffData.orderId = orderData.orderId;
             prepaidOffData.promotionType = "100OffOnPrepaidOrder";
             prepaidOffData.discountedAmount = checkoutParam.prepaidOrder;
             await this._promotionsUsageOrdersService.create(prepaidOffData);
             let prepaidOrderData:any={};
             prepaidOrderData.orderId=orderData.orderId;
             prepaidOrderData.discountedAmount=checkoutParam.prepaidOrder;
             await this._hundredOffOnPreprodOrdersService.create(prepaidOrderData);

         }
         if (validCnFound && validCnFound.length > 0) {
            
            let promoUsageData:any = {};
            promoUsageData.promotionType = "CreditNote";
            promoUsageData.couponCode = validCnFound[0].cn_code;
            promoUsageData.discountedAmount = Number(validCnFound[0].cn_amount);
            promoUsageData.orderId = newOrderTotal.orderId;
            await this._promotionsUsageOrdersService.create(promoUsageData);
        }

        if (plugin.pluginName === 'CashOnDelivery') {
            //const emailContent = await this.emailTemplateService.findOne(5);
//            const adminEmailContent = await this.emailTemplateService.findOne(6);
            //const today = moment(new Date()).format('DD-MM-YYYY, HH:mm');
            //const customerFirstName = orderData.shippingFirstname;
            //const customerLastName = orderData.shippingLastname;
           // const customerName = customerFirstName;
            // const adminMessage = adminEmailContent.content.replace('{adminname}', 'Admin').replace('{name}', customerName).replace('{orderId}', orderData.orderId);
            //const customerMessage = emailContent.content.replace('{name}', customerName);
            const adminId: any = [];
            const adminUser = await this.userService.findAll({ select: ['username'], where: { userGroupId: 1, deleteFlag: 0 } });
            for (const user of adminUser) {
                const val = user.username;
                adminId.push(val);
            }
            // const adminRedirectUrl = env.adminRedirectUrl;
            /*********************************/
            const { UnicommeService : dd } = require('../../services/admin/UnicomService');
            let c = new dd();
            await c.sendOrderToUC(orderData, saleOrderItems);
            const order = await this.orderService.findOrder(orderData.orderId);
            order.paymentType = plugin ? plugin.pluginName : '';
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
            const successResponse: any = {
                status: 1,
                message: 'You successfully checked out the product and order details send to your mail',
                data: order,
            };
            return response.status(200).send(successResponse);
        } else {

            const pluginInfo = JSON.parse(plugin.pluginAdditionalInfo);
            orderData.paymentProcess = 0;
            await this.orderService.update(orderData.orderId, orderData);

            //Unicommerce data-----------------------


            let route = "";
            let message = "Redirect to this url";
            let _t : any = {};
            let _status = 3;
            if(plugin.pluginName === 'PineLabsPluralSingleCart'){
                _status = 200;
                _t = await this._pnLabs.createPayment(checkoutParam,orderData.orderPrefixId);
                newOrder.paymentDetails = _t.plural_order_id;
                newOrder.paymentType = plugin.pluginName;
                await this.orderService.update(orderData.orderId, newOrder);
            }else if(plugin.pluginName === 'paytm'){
                _status = 200;
                _t = await this._paytm.createToken(checkoutParam, orderData.orderPrefixId, newOrder.total, plugin);

                if(_t.status){
                    //newOrder.paymentDetails = _t.txnToken;
                    newOrder.paymentDetails = orderData.orderPrefixId;
                    newOrder.paymentType = plugin.pluginName;
                    await this.orderService.update(orderData.orderId, newOrder);
                }
                
            }else if(plugin.pluginName === 'ingenico'){
                    _status = 200;
                    _t = await this.ingenicoService.createToken(checkoutParam, orderData, plugin);
                    if(_t){
                        //newOrder.paymentDetails = _t.txnToken;
                        newOrder.paymentDetails = orderData.orderPrefixId;
                        newOrder.paymentType = plugin.pluginName;
                        await this.orderService.update(orderData.orderId, newOrder);
                    }

                    route = orderData;
            }else{
                route = env.baseUrl + pluginInfo.processRoute + '/' + orderData.orderPrefixId;
                if (plugin.pluginName === 'razorpay' && checkoutParam.isMobile) {
                    route = env.baseUrl + pluginInfo.processAPIRoute + '/' + orderData.orderPrefixId;
                    return response.status(200).send({
                        status: 4,
                        message: message,
                        data: route,
                    });
                }
            }            
            const successResponse: any = {
                status: _status,
                message: message,
                data: route,
                orderId:orderData.orderId,
                tokenisedData : _t
            };
 
            return response.status(200).send(successResponse);

        }
    }


    @Post('/create-order-by-admin')
    public async createOrderByAdmin(@Body({ validate: true }) checkoutParam: any, @Res() response: any, @Req() request: any): Promise<any> {
        const oldOrderData = await this.orderService.findOne(checkoutParam.orderId);
        const oldOrderProductData = await this.orderProductService.findOne(checkoutParam.orderProductPreFixId);
        const nowDate = new Date();
        const orderDate = nowDate.getFullYear() + ('0' + (nowDate.getMonth() + 1)).slice(-2) + ('0' + nowDate.getDate()).slice(-2);
        const setting = await this.settingService.findOne();
        let modifyOrderData = oldOrderData;
        let oldOrderUpdate = oldOrderData
        oldOrderUpdate.orderStatusId=8
        let modifyOrderProductData = oldOrderProductData;
        modifyOrderProductData.orderStatusId=8
        await this.orderProductService.update(modifyOrderProductData.orderProductId, modifyOrderProductData);
        await this.orderService.update(oldOrderUpdate.orderId, oldOrderUpdate)
        delete modifyOrderData.orderId;
        delete modifyOrderData.ucOrderStatus;
        delete modifyOrderData.modifiedDate
        delete modifyOrderData.sentOnUc
        delete modifyOrderData.orderStatusId
        delete modifyOrderProductData.orderId;
        delete modifyOrderProductData.orderProductId;
        delete modifyOrderProductData.orderProductPrefixId;
        delete modifyOrderProductData.orderStatusName
        const orderData = await this.orderService.create(modifyOrderData);
        await this.orderLogService.create(orderData);
        modifyOrderData.invoiceNo = 'INV00'.concat(orderData.orderId);
        modifyOrderData.orderPrefixId = setting.invoicePrefix.concat('-' + orderDate + orderData.orderId);
        modifyOrderData.paymentMethod=99;
        modifyOrderData.orderStatusId=1
        modifyOrderData.total=modifyOrderProductData.total
        modifyOrderData.discountAmount=modifyOrderProductData.discountAmount
        modifyOrderData.amount=modifyOrderProductData.total
        const getOldOrderProductData = await this.orderProductService.find({"skuName":checkoutParam.oldSkuName})
        let modifyProductDetails = getOldOrderProductData[0];
        modifyProductDetails.createdDate=null;
        modifyProductDetails.orderProductId=null;
        modifyProductDetails.parentOrderId=checkoutParam.orderId;
        modifyProductDetails.orderId=orderData.orderId
        modifyProductDetails.orderProductPrefixId=orderData.orderPrefixId
        modifyProductDetails.quantity=1
        modifyProductDetails.orderStatusId=1
        modifyProductDetails.skuName=checkoutParam.newSkuName
        const productInformation = await this.orderProductService.createData(modifyProductDetails)

await this.orderProductLogService.create(productInformation);
await this.orderService.update(orderData.orderId, modifyOrderData);

let saleOrderItems = [];
saleOrderItems.push({
    "itemSku": env.uniComm.testMode == "ON" ? "10532336" : modifyProductDetails.skuName,
    "code": env.uniComm.testMode == "ON" ? "10532336" : modifyProductDetails.skuName,
    "shippingMethodCode": "STD",
    "totalPrice": 0,
    "sellingPrice": Math.round(modifyOrderData.amount)
});


const { UnicommeService : dd } = require('../../services/admin/UnicomService');
let c = new dd();
await c.sendOrderToUC(orderData, saleOrderItems);

const checkExisting = await this._orderReturn.find({"orderId":checkoutParam.orderId})
let modifyReturnOrder = checkExisting[0]
modifyReturnOrder.returnStatus=2
await this._orderReturn.update(modifyReturnOrder);
const emailContents = await this.emailTemplateService.findOne({where: {title: 'ORDER_REPLACED'}});
const message = emailContents.content.replace('{orderId}', oldOrderData.orderPrefixId);
MAILService.registerMail(null, message, oldOrderData.email, emailContents.subject, null);
const successResponse: any = {
    status: 200,
    message: 'Successfully created new order',
    data: modifyOrderData,
};
        return response.status(200).send(successResponse);
    }

    // customer checkout
    /**
     * @api {post} /api/orders/back-order-checkout Checkout
     * @apiGroup Store order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} productDetail Product Details
     * @apiParam (Request body) {Number} paymentMethod paymentMethod
     * @apiParam (Request body) {String} shippingFirstName Shipping First name
     * @apiParam (Request body) {String} shippingLastName Shipping Last Name
     * @apiParam (Request body) {String} shippingCompany Shipping Company
     * @apiParam (Request body) {String} shippingAddress_1 Shipping Address 1
     * @apiParam (Request body) {String} shippingAddress_2 Shipping Address 2
     * @apiParam (Request body) {String} shippingCity Shipping City
     * @apiParam (Request body) {Number} shippingPostCode Shipping PostCode
     * @apiParam (Request body) {String} shippingCountryId ShippingCountryId
     * @apiParam (Request body) {String} shippingZone Shipping Zone
     * @apiParam (Request body) {String} shippingAddressFormat Shipping Address Format
     * @apiParam (Request body) {String} paymentFirstName Payment First name
     * @apiParam (Request body) {String} PaymentLastName Payment Last Name
     * @apiParam (Request body) {String} PaymentCompany Payment Company
     * @apiParam (Request body) {String} paymentAddress_1 Payment Address 1
     * @apiParam (Request body) {String} paymentAddress_2 Payment Address 2
     * @apiParam (Request body) {String} paymentCity Payment City
     * @apiParam (Request body) {Number} paymentPostCode Payment PostCode
     * @apiParam (Request body) {String} paymentCountryId PaymentCountryId
     * @apiParam (Request body) {String} paymentZone Payment Zone
     * @apiParam (Request body) {Number} phoneNumber Customer Phone Number
     * @apiParam (Request body) {String} emailId Customer Email Id
     * @apiParam (Request body) {String} password Customer password
     * @apiParam (Request body) {String} couponCode couponCode
     * @apiParam (Request body) {Number} couponDiscountAmount couponDiscountAmount
     * @apiParam (Request body) {String} couponData
     * @apiParamExample {json} Input
     * {
     *      "productDetail" :[
     *      {
     *      "productId" : "",
     *      "quantity" : "",
     *      "price" : "",
     *      "model" : "",
     *      "name" : "",
     *      "varientName" : "",
     *      "productVarientOptionId" : "",
     *      "skuName" : "",
     *      }],
     *      "shippingFirstName" : "",
     *      "shippingLastName" : "",
     *      "shippingCompany" : "",
     *      "shippingAddress_1" : "",
     *      "shippingAddress_2" : "",
     *      "shippingCity" : "",
     *      "shippingPostCode" : "",
     *      "shippingCountryId" : "",
     *      "shippingZone" : "",
     *      "shippingAddressFormat" : "",
     *      "paymentFirstName" : "",
     *      "paymentLastName" : "",
     *      "paymentCompany" : "",
     *      "paymentAddress_1" : "",
     *      "paymentAddress_2" : "",
     *      "paymentCity" : "",
     *      "paymentPostCode" : "",
     *      "paymentCountryId" : "",
     *      "paymentZone" : "",
     *      "phoneNumber" : "",
     *      "emailId" : "",
     *      "password" : "",
     *      "paymentMethod" : "",
     *      "vendorId" : "",
     *      "couponCode" : "",
     *      "couponDiscountAmount" : "",
     *      "couponData" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Check Out the product successfully And Send order detail in your mail ..!!",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/orders/back-order-checkout
     * @apiErrorExample {json} Checkout error
     * HTTP/1.1 500 Internal Server Error
     */
    // Customer Checkout Function
    @UseBefore(CheckTokenMiddleware)
    @Post('/back-order-checkout')
    public async backOrderCustomerCheckout(@Body({ validate: true }) checkoutParam: CustomerBackorderRequest, @Res() response: any, @Req() request: any): Promise<any> {
        const logo = await this.settingService.findOne();
        const error: any = [];
        const orderProducts: any = checkoutParam.productDetails;
        for (const val of orderProducts) {
            const productAvailability = await this.productService.findOne({ where: { productId: val.productId } });
            if (productAvailability.pincodeBasedDelivery === 1) {
                const deliveryLocation = await this.deliveryLocationService.findOne({ where: { zipCode: checkoutParam.shippingPostCode, vendorId: 0 } });
                if (!deliveryLocation) {
                    error.push(1);
                }
            }
        }
        if (error.length > 0) {
            const errResponse: any = {
                status: 0,
                message: 'Product not available for your pincode',
                data: error,
            };
            return response.status(400).send(errResponse);
        }
        for (const val of orderProducts) {
            const product = await this.productService.findOne(val.productId);
            const sku = await this.skuService.findOne({ where: { skuName: val.skuName } });
            if (product.hasStock === 1) {
                if (!(sku.minQuantityAllowedCart <= +val.quantity)) {
                    const minCart: any = {
                        status: 0,
                        message: 'Quantity should greater than min Quantity.',
                    };
                    return response.status(400).send(minCart);
                } else if (!(sku.maxQuantityAllowedCart >= +val.quantity)) {
                    const maxCart: any = {
                        status: 0,
                        message: 'Quantity should lesser than max Quantity.',
                    };
                    return response.status(400).send(maxCart);
                }
            }
        }
        const plugin = await this.pluginService.findOne({ where: { id: checkoutParam.paymentMethod } });
        if (plugin === undefined) {
            const errorResponse: any = {
                status: 0,
                message: 'Payment method is invalid',
            };
            return response.status(400).send(errorResponse);
        }
        const newOrder: any = new Order();
        const newOrderTotal = new OrderTotal();
        let orderProduct = [];
        let i;
        let n;
        let totalProductAmount;
        let totalAmount = 0;
        const productDetailData = [];
        if (request.id) {
            let customerId;
            customerId = request.id;
            newOrder.customerId = customerId;
        } else {
            const customerEmail = await this.customerService.findOne({
                where: {
                    email: checkoutParam.emailId,
                    deleteFlag: 0,
                },
            });
            if (customerEmail === undefined) {
                if (checkoutParam.password) {
                    const newUser = new Customer();
                    newUser.firstName = checkoutParam.shippingFirstName;
                    newUser.password = await Customer.hashPassword(checkoutParam.password);
                    newUser.email = checkoutParam.emailId;
                    newUser.username = checkoutParam.emailId;
                    newUser.mobileNumber = checkoutParam.phoneNumber;
                    newUser.isActive = 1;
                    newUser.ip = (request.headers['x-forwarded-for'] ||
                        request.connection.remoteAddress ||
                        request.socket.remoteAddress ||
                        request.connection.socket.remoteAddress).split(',')[0];
                    const resultDatas = await this.customerService.create(newUser);
                    const emailContents = await this.emailTemplateService.findOne(1);
                    const message = emailContents.content.replace('{name}', resultDatas.firstName);
                    const redirectUrl = env.storeRedirectUrl;
                    MAILService.registerMail(logo, message, resultDatas.email, emailContents.subject, redirectUrl);
                    newOrder.customerId = resultDatas.id;
                } else {
                    newOrder.customerId = 0;
                }
            } else {
                const errorResponse: any = {
                    status: 0,
                    message: 'Please login for checkout, emailId already exist',
                };
                return response.status(400).send(errorResponse);
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
        const country = await this.countryService.findOne({
            where: {
                countryId: checkoutParam.shippingCountryId,
            },
        });
        if (country) {
            newOrder.shippingCountry = country.name;
        }
        newOrder.shippingPostcode = checkoutParam.shippingPostCode;
        newOrder.shippingAddressFormat = checkoutParam.shippingAddressFormat;
        newOrder.paymentMethod = checkoutParam.paymentMethod;
        newOrder.isActive = 1;
        newOrder.backOrders = 1;
        const setting = await this.settingService.findOne();
        newOrder.orderStatusId = setting.orderStatus;
        newOrder.invoicePrefix = setting.invoicePrefix;
        const currencyVal = await this.currencyService.findOne(setting.storeCurrencyId);
        if (currencyVal) {
            newOrder.currencyCode = currencyVal.code;
            newOrder.currencyValue = currencyVal.value;
            newOrder.currencySymbolLeft = currencyVal.symbolLeft;
            newOrder.currencySymbolRight = currencyVal.symbolRight;
            newOrder.currencyValue = currencyVal.value;
        }
        newOrder.paymentAddressFormat = checkoutParam.shippingAddressFormat;
        const orderData = await this.orderService.create(newOrder);
        await this.orderLogService.create(orderData);
        const currencySymbol = await this.currencyService.findOne(setting.storeCurrencyId);
        if (currencySymbol) {
            orderData.currencyRight = currencySymbol.symbolRight;
            orderData.currencyLeft = currencySymbol.symbolLeft;
        }
        const nwDate = new Date();
        const orderDate = nwDate.getFullYear() + ('0' + (nwDate.getMonth() + 1)).slice(-2) + ('0' + nwDate.getDate()).slice(-2);
        orderProduct = checkoutParam.productDetails;
        let j = 1;
        for (i = 0; i < orderProduct.length; i++) {
            /// for find product price with tax , option price, special, discount and tire price /////
            let price: any;
            let taxType: any;
            let taxValue: any;
            let tirePrice: any;
            let priceWithTax: any;
            const productTire = await this.productService.findOne({ where: { productId: orderProduct[i].productId } });
            taxType = productTire.taxType;
            if (taxType === 2 && taxType) {
                const tax = await this.taxService.findOne({ where: { taxId: productTire.taxValue } });
                taxValue = (tax !== undefined) ? tax.taxPercentage : 0;
            } else if (taxType === 1 && taxType) {
                taxValue = productTire.taxValue;
            }
            const sku = await this.skuService.findOne({ where: { skuName: orderProduct[i].skuName } });
            if (sku) {
                if (productTire.hasTirePrice === 1) {
                    const findWithQty = await this.productTirePriceService.findTirePrice(orderProduct[i].productId, sku.id, orderProduct[i].quantity);
                    if (findWithQty) {
                        tirePrice = findWithQty.price;
                    } else {
                        const dateNow = new Date();
                        const todaydate = dateNow.getFullYear() + '-' + (dateNow.getMonth() + 1) + '-' + dateNow.getDate();
                        const productSpecial = await this.productSpecialService.findSpecialPriceWithSku(orderProduct[i].productId, sku.id, todaydate);
                        const productDiscount = await this.productDiscountService.findDiscountPricewithSku(orderProduct[i].productId, sku.id, todaydate);
                        if (productSpecial !== undefined) {
                            tirePrice = productSpecial.price;
                        } else if (productDiscount !== undefined) {
                            tirePrice = productDiscount.price;
                        } else {
                            tirePrice = sku.price;
                        }
                    }
                    if (taxType && taxType === 2) {
                        const percentVal = +tirePrice * (+taxValue / 100);
                        priceWithTax = +tirePrice + +percentVal;
                    } else if (taxType && taxType === 1) {
                        priceWithTax = +tirePrice + +orderProduct[i].taxValue;
                    } else {
                        priceWithTax = +tirePrice;
                    }
                    price = priceWithTax;
                } else {
                    const dateNow = new Date();
                    const todaydate = dateNow.getFullYear() + '-' + (dateNow.getMonth() + 1) + '-' + dateNow.getDate();
                    const productSpecial = await this.productSpecialService.findSpecialPriceWithSku(orderProduct[i].productId, sku.id, todaydate);
                    const productDiscount = await this.productDiscountService.findDiscountPricewithSku(orderProduct[i].productId, sku.id, todaydate);
                    if (productSpecial !== undefined) {
                        tirePrice = productSpecial.price;
                    } else if (productDiscount !== undefined) {
                        tirePrice = productDiscount.price;
                    } else {
                        tirePrice = sku.price;
                    }
                    if (taxType && taxType === 2) {
                        const perVal = +tirePrice * (+taxValue / 100);
                        priceWithTax = +tirePrice + +perVal;
                    } else if (taxType && taxType === 1) {
                        priceWithTax = +tirePrice + +taxValue;
                    } else {
                        priceWithTax = +tirePrice;
                    }
                    price = priceWithTax;
                }
            } else {
                tirePrice = productTire.price;
                if (taxType && taxType === 2) {
                    const percentAmt = +tirePrice * (+taxValue / 100);
                    priceWithTax = +tirePrice + +percentAmt;
                } else if (taxType && taxType === 1) {
                    priceWithTax = +tirePrice + +taxValue;
                } else {
                    priceWithTax = +tirePrice;
                }
                price = priceWithTax;
            }
            const skuPrice = sku ? sku.price : productTire.price;
            ///// finding price from backend ends /////
            const productDetails = new OrderProduct();
            productDetails.productId = orderProduct[i].productId;
            productDetails.orderProductPrefixId = orderData.invoicePrefix.concat('-' + orderDate + orderData.orderId) + j;
            productDetails.name = productTire.name;
            productDetails.orderId = orderData.orderId;
            productDetails.quantity = orderProduct[i].quantity;
            productDetails.productPrice = price;
            productDetails.basePrice = skuPrice;
            productDetails.discountAmount = parseFloat(skuPrice) - parseFloat(tirePrice);
            productDetails.discountedAmount = productDetails.discountAmount !== 0.00 ? tirePrice : '0.00';
            productDetails.taxType = taxType;
            productDetails.taxValue = taxValue;
            productDetails.total = +orderProduct[i].quantity * price;
            productDetails.model = productTire.name;
            productDetails.varientName = orderProduct[i].varientName ? orderProduct[i].varientName : '';
            productDetails.productVarientOptionId = orderProduct[i].productVarientOptionId ? orderProduct[i].productVarientOptionId : 0;
            productDetails.skuName = orderProduct[i].skuName ? orderProduct[i].skuName : '';
            productDetails.orderStatusId = 1;
            const productInformation = await this.orderProductService.createData(productDetails);
            await this.orderProductLogService.create(productInformation);
            const cart = await this.customerCartService.findOne({ where: { productId: orderProduct[i].productId, customerId: orderData.customerId } });
            if (cart !== undefined) {
                await this.customerCartService.delete(cart.id);
            }
            let productImageDetail;
            if (productDetails.productVarientOptionId) {
                const image = await this.productVarientOptionImageService.findOne({ where: { productVarientOptionId: productDetails.productVarientOptionId } });
                if (image) {
                    productImageDetail = image;
                } else {
                    productImageDetail = await this.productImageService.findOne({ where: { productId: productInformation.productId, defaultImage: 1 } });
                }
            } else {
                productImageDetail = await this.productImageService.findOne({ where: { productId: productInformation.productId, defaultImage: 1 } });
            }
            const productImageData = await this.productService.findOne(productInformation.productId);
            productImageData.productInformationData = productInformation;
            productImageData.productImage = productImageDetail;
            totalProductAmount = await this.orderProductService.findData(orderProduct[i].productId, orderData.orderId, productInformation.orderProductId);
            for (n = 0; n < totalProductAmount.length; n++) {
                totalAmount += +totalProductAmount[n].total;
            }
            productDetailData.push(productImageData);
            j++;
        }
        newOrder.amount = totalAmount;
        //newOrder.total = totalAmount;
        newOrder.invoiceNo = 'INV00'.concat(orderData.orderId);
        newOrder.orderPrefixId = setting.invoicePrefix.concat('-' + orderDate + orderData.orderId);
        await this.orderService.update(orderData.orderId, newOrder);
        newOrderTotal.orderId = orderData.orderId;
        newOrderTotal.value = totalAmount;
        await this.orderTotalService.createOrderTotalData(newOrderTotal);
        if (plugin.pluginName === 'CashOnDelivery') {
            const adminEmailContent = await this.emailTemplateService.findOne(6);
            const today = ('0' + nwDate.getDate()).slice(-2) + '.' + ('0' + (nwDate.getMonth() + 1)).slice(-2) + '.' + nwDate.getFullYear();
            const customerFirstName = orderData.shippingFirstname;
            const customerLastName = orderData.shippingLastname;
            const customerName = customerFirstName + ' ' + customerLastName;
            const adminMessage = adminEmailContent.content.replace('{adminname}', 'Admin').replace('{name}', customerName).replace('{orderId}', orderData.orderId);
            //const customerMessage = emailContent.content.replace('{name}', customerName);
            const adminId: any = [];
            const adminUser = await this.userService.findAll({ select: ['username'], where: { userGroupId: 1, deleteFlag: 0 } });
            for (const user of adminUser) {
                const val = user.username;
                adminId.push(val);
            }
            const adminRedirectUrl = env.adminRedirectUrl;
            MAILService.adminOrderMail(logo, adminMessage, orderData, adminEmailContent.subject, productDetailData, today, adminId, adminRedirectUrl);
           
            const order = await this.orderService.findOrder(orderData.orderId);
            order.paymentType = plugin ? plugin.pluginName : '';
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
            const successResponse: any = {
                status: 1,
                message: 'You successfully checked out the product and order details send to your mail',
                data: order,
            };
            return response.status(200).send(successResponse);
        } else {

            const pluginInfo = JSON.parse(plugin.pluginAdditionalInfo);
            orderData.paymentProcess = 0;
            await this.orderService.update(orderData.orderId, orderData);
            const route = env.baseUrl + pluginInfo.processRoute + '/' + orderData.orderPrefixId;
            const successResponse: any = {
                status: 3,
                message: 'Redirect to this url',
                data: route,
            };
            return response.status(200).send(successResponse);

        }
    }

    // Customer Order List API
    /**
     * @api {get} /api/orders/order-list My Order List
     * @apiGroup Store order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {String} status status -> closed, open, cancel
     * @apiParam (Request body) {Number} count count in number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully show the Order List..!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/orders/order-list
     * @apiErrorExample {json} Order List error
     * HTTP/1.1 500 Internal Server Error
     */
    // Order List Function
    @UseBefore(CheckCustomerMiddleware)
    @Get('/order-list')
    public async orderList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('status') status: string, @QueryParam('count') count: number | boolean, @Req() request: any, @Res() response: any): Promise<any> {
        const select = [
            'order.createdDate as createdDate',
            'order.orderPrefixId as orderPrefixId',
            'order.orderId as orderId',
            'order.shippingFirstname as customerFirstName',
            'order.shippingCity as shippingCity',
            'order.shippingCountry as shippingCountry',
            'order.shippingAddress1 as shippingAddress1',
            'order.shippingAddress2 as shippingAddress2',
            'order.shippingZone as shippingZone',
            'order.shippingZone as shippingPostcode',
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
            'OrderProduct.discountAmount as discountAmount',
            'OrderProduct.discountedAmount as discountedAmount',
            'OrderProduct.couponDiscountAmount as couponDiscountAmount',
            'OrderProduct.varientName as varientName',
            'OrderProduct.skuName as skuName',
            'OrderProduct.productVarientOptionId as productVarientOptionId',
            'orderStatus.orderStatusId as orderStatusId',
            'orderStatus.name as name',

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
            name: 'order.customerId',
            op: 'and',
            value: request.user.id,
        }, {
            name: 'order.paymentProcess',
            op: 'and',
            value: 1,
        });

        const searchConditions = [];
        if (keyword && keyword !== '') {
            searchConditions.push({
                name: ['OrderProduct.name', 'order.orderPrefixId', 'OrderProduct.orderProductPrefixId'],
                value: keyword.toLowerCase(),
            });

        }
        if (status && status === 'closed') {
            whereConditions.push({
                name: 'OrderProduct.orderStatusId',
                op: 'and',
                value: 5,
            });
        }
        if (status && status === 'opened') {
            whereConditions.push(
                {
                    name: 'OrderProduct.orderStatusId',
                    op: 'not',
                    value: 5,
                },
                {
                    name: 'OrderProduct.cancelRequestStatus',
                    op: 'cancel',
                    value: 1,
                });
        }
        if (status && status === 'cancelled') {
            whereConditions.push(
                {
                    name: 'OrderProduct.cancelRequestStatus',
                    op: 'and',
                    value: 1,
                }
            );
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
                message: 'Successfully get Count. ',
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
            if (passingOrderStatus) {
                temp.orderStatusName = passingOrderStatus.name;
                temp.orderStatusColorCode = passingOrderStatus.colorCode;
            }
            const products = await this.productService.findOne({
                where: { productId: results.productId },
                select: ['productSlug', 'name'],
            });
            if (products) {
                temp.productSlug = products.productSlug;
                temp.productName = products.name;
            }
            const orderStatus = await this.orderProductLogService.findOne({
                where: {
                    orderStatusId: 5,
                    orderProductId: results.orderProductId,
                },
            });
            if (orderStatus) {
                temp.deliveryDate = orderStatus.createdDate;
            }
            return results;
        });
        const result = await Promise.all(promises);
        const successResponse: any = {
            status: 1,
            message: 'Successfully shown the order list. ',
            data: classToPlain(result),
        };
        return response.status(200).send(successResponse);
    }

    // Customer Order Detail API
    /**
     * @api {get} /api/orders/order-detail My OrderDetail
     * @apiGroup Store order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} orderProductId orderProductId
     * @apiParamExample {json} Input
     * {
     *      "orderProductId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully show the Order Detail..!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/orders/order-detail
     * @apiErrorExample {json} Order Detail error
     * HTTP/1.1 500 Internal Server Error
     */
    // Order Detail Function
    @UseBefore(CheckCustomerMiddleware)
    @Get('/order-detail')
    public async orderDetail(@QueryParam('orderProductId') orderProductId: number, @Req() request: any, @Res() response: any): Promise<any> {
        const obj: any = {};
        const orderProduct = await this.orderProductService.findOne({
            select: ['basePrice', 'taxValue', 'taxType', 'orderProductId', 'orderId', 'productId', 'createdDate', 'modifiedDate', 'total', 'name', 'productPrice', 'orderProductPrefixId', 'quantity', 'orderStatusId', 'discountAmount', 'discountedAmount', 'varientName', 'skuName', 'productVarientOptionId', 'couponDiscountAmount'],
            where: {
                orderProductId,
            },
        });
        if (!orderProduct) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid Order Product Id',
            };
            return response.status(400).send(errorResponse);
        }
        const order = await this.orderService.findOrder({
            select: ['paymentType', 'shippingAddress1', 'shippingAddress2', 'shippingCity', 'shippingPostcode', 'shippingZone', 'shippingCountry', 'paymentAddress1', 'paymentAddress2', 'paymentCity', 'paymentPostcode', 'paymentZone', 'paymentCountry', 'currencySymbolLeft', 'currencySymbolRight', 'customerGstNo','paymentRemark'],
            where: {
                orderId: orderProduct.orderId, customerId: request.user.id,
            },
        });
        if (!order) {
            const errResponse: any = {
                status: 0,
                message: 'Invalid order for this customer',
            };
            return response.status(400).send(errResponse);
        }
        const product = await this.productImageService.findOne({
            select: ['productId', 'image', 'containerName'],
            where: {
                productId: orderProduct.productId,
                defaultImage: 1,
            },
        });
        const products = await this.productService.findOne({
            select: ['productSlug'],
            where: {
                productId: orderProduct.productId,
            },
        });
        const passingOrderStatus = await this.orderStatusService.findOne({
            where: {
                orderStatusId: orderProduct.orderStatusId,
            },
        });
        obj.orderedDate = orderProduct.createdDate;
        obj.orderProductPrefixId = orderProduct.orderProductPrefixId;
        obj.shippingAddress1 = order.shippingAddress1;
        obj.shippingAddress2 = order.shippingAddress2;
        obj.shippingCity = order.shippingCity;
        if (products) {
            obj.productSlug = products.productSlug;
        }
        obj.shippingPostcode = order.shippingPostcode;
        obj.shippingZone = order.shippingZone;
        obj.paymentMethod = order.paymentType;
        obj.paymentRemark = order.paymentRemark;
        obj.total = orderProduct.total;
        if (passingOrderStatus) {
            obj.orderStatus = passingOrderStatus.name;
        }
        obj.currencySymbolLeft = order.currencySymbolLeft;
        obj.currencySymbolRight = order.currencySymbolRight;
        obj.discountAmount = orderProduct.discountAmount;
        obj.discountedAmount = orderProduct.discountedAmount;
        obj.couponDiscountAmount = orderProduct.couponDiscountAmount;
        obj.orderProductPrefixId = orderProduct.orderProductPrefixId;
        obj.customerGstNo = order.customerGstNo;
        obj.paymentAddress1 = order.paymentAddress1;
        obj.paymentAddress2 = order.paymentAddress2;
        obj.paymentCity = order.paymentCity;
        obj.paymentPostcode = order.paymentPostcode;
        obj.paymentZone = order.paymentZone;
        obj.paymentCountry = order.paymentCountry;
        obj.orderProductPrefixId = orderProduct.orderProductPrefixId;
        if (orderProduct.modifiedDate) {
            obj.orderStatusDate = orderProduct.modifiedDate;
        } else {
            obj.orderStatusDate = orderProduct.createdDate;
        }
        if (product) {
            obj.productImage = product.image;
            obj.containerName = product.containerName;
        }
        obj.basePrice = orderProduct.basePrice;
        obj.taxValue = orderProduct.taxValue;
        obj.taxType = orderProduct.taxType;
        obj.orderId = orderProduct.orderId;
        obj.orderProductId = orderProduct.orderProductId;
        obj.productId = orderProduct.productId;
        obj.productName = orderProduct.name;
        obj.productQuantity = orderProduct.quantity;
        obj.productPrice = orderProduct.productPrice;
        obj.skuName = orderProduct.skuName;
        obj.varientName = orderProduct.varientName;
        obj.productVarientOptionId = orderProduct.productVarientOptionId;
        const orderStatus = await this.orderStatusService.findAll({
            select: ['orderStatusId', 'name'],
            where: {
                isActive: 1,
            },
        });
        const orderProductLog = await this.orderProductLogService.find({
            select: ['orderProductLogId', 'createdDate', 'orderStatusId'],
            where: {
                orderProductId: orderProduct.orderProductId,
            },
        });
        const orderStatusDate = orderStatus.map(async (value: any) => {
            const date = orderProductLog.find(item => item.orderStatusId === value.orderStatusId);
            const temp: any = value;
            if (date === undefined) {
                temp.createdDate = '';
            } else {
                temp.createdDate = date.createdDate;
            }
            return temp;
        });
        const result = await Promise.all(orderStatusDate);
        obj.deliveryStatus = result;
        // const rating = await this.productRatingService.findOne({
        //     select: ['rating', 'review'],
        //     where: {
        //         customerId: request.user.id,
        //         orderProductId: orderProduct.orderProductId,
        //         productId: orderProduct.productId,
        //     },
        // });
        const productRatingQuery = getManager().getRepository(ProductRating).createQueryBuilder("pr");
        productRatingQuery.select(["pr.rating AS rating", "pr.is_active AS isActive", "pr.review AS review", "pri.image AS image", "pri.container_name AS containerName"])
        productRatingQuery.leftJoin(ProductReviewImages, "pri", "pr.rating_id = pri.review_fk_id")
        productRatingQuery.where('pr.customer_id = :cId', {cId: request.user.id})
        productRatingQuery.andWhere('pr.order_product_id= :opId', {opId: orderProduct.orderProductId})
        productRatingQuery.andWhere('pr.product_id= :pId', {pId: orderProduct.productId});

        const queryResult = await productRatingQuery.getRawMany();
        
        // if (rating !== undefined) {
        //     obj.rating = rating.rating;
        //     obj.review = rating.review;
        // } else {
        //     obj.rating = 0;
        //     obj.review = '';
        // }
        obj.rating = 0;
        obj.review = '';
        if(queryResult && queryResult.length > 0){
        if (queryResult !== undefined) {
            obj.rating = queryResult[0].rating;
            obj.review = queryResult[0].review;
            obj.isActive = queryResult[0].isActive;
        } else {
            obj.rating = 0;
            obj.review = '';
            obj.isActive = 0
        }

        obj.reviewImages = queryResult;
    }
        
        const successResponse: any = {
            status: 1,
            message: 'Successfully show the order details',
            data: obj,
        };
        return response.status(200).send(successResponse);
    }

    // Product Rating  API
    /**
     * @api {post} /api/orders/add-rating Add Rating  API
     * @apiGroup Store order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number}  productId
     * @apiParam (Request body) {Number}  orderProductId
     * @apiParam (Request body) {String} reviews productReviews
     * @apiParam (Request body) {Number} rating productRatings
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully updated your reviews and ratings!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/orders/add-rating
     * @apiErrorExample {json} rating error
     * HTTP/1.1 500 Internal Server Error
     */
    // Order List Function
    @UseBefore(CheckCustomerMiddleware)
    @Post('/add-rating')
    public async Rating(@Body({ validate: true }) ratingValue: any, @Req() request: any, @Res() response: any): Promise<any> {
        const resultData = await this.productService.findOne({

            where: { productId: request.body.productId },
        });
        if (!resultData) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid productId',
            };
            return response.status(400).send(errorResponse);
        }
        const orderProduct = await this.orderProductService.findOne({
            where: {
                orderProductId: request.body.orderProductId,
            },
        });
        const order = await this.orderService.findOrder({
            where: {
                orderId: orderProduct.orderId, customerId: request.user.id,
            },
        });
        if (!order) {
            const errResponse: any = {
                status: 0,
                message: 'Invalid rating for this user',
            };
            return response.status(400).send(errResponse);
        }
        const rating = await this.productRatingService.findOne({

            where: {
                orderProductId: request.body.orderProductId,
            },
        });
        
        const productImages = request.body.reviewImages;
        const imageContainer = request.body.imageContainer

        if (rating) {
            
            rating.review = request.body.reviews;
            rating.rating = request.body.rating;
            if(request.body.rating>=3){
                rating.isActive = 1;
            }else{
            rating.isActive = 0;
            }

            console.log("rating>>>>",rating);
            const updateRatings = await this.productRatingService.create(rating);
            await this.saveProductReviewImages(rating.ratingId, productImages, imageContainer, "UPDATE");
            if (updateRatings) {
                const updateRating: any = await this.productRatingService.consolidateRating(request.body.productId);
                resultData.rating = updateRating !== undefined ? updateRating.RatingCount : 0;
                await this.productService.create(resultData);
                const successResponse: any = {
                    status: 1,
                    message: 'Review submitted successfully',
                };
                return response.status(200).send(successResponse);
            }
        } else {

            const customer = await this.customerService.findOne({ where: { id: request.user.id } });
            const newRating: any = new ProductRating();
            newRating.review = request.body.reviews;
            newRating.rating = request.body.rating;
            newRating.orderProductId = request.body.orderProductId;
            newRating.productId = request.body.productId;
            newRating.customerId = request.user.id;
            newRating.firstName = customer.firstName;
            newRating.lastName = customer.lastName;
            newRating.email = customer.email;
            if(request.body.rating>=3){
            newRating.isActive = 1;
            }else{
            newRating.isActive = 0;
            }
            const AddRating = await this.productRatingService.create(newRating);
            if (AddRating) {

                
                
                if(productImages && productImages.length > 0){
                    
                    
                    await this.saveProductReviewImages(AddRating.ratingId, productImages, imageContainer, "NEW");
                }
                
                const updateRating: any = await this.productRatingService.consolidateRating(request.body.productId);
                resultData.rating = updateRating !== undefined ? updateRating.RatingCount : 0;
                await this.productService.create(resultData);

                const successResponse: any = {
                    status: 1,
                    message: 'Successfully created your ratings and reviews',
                };
                return response.status(200).send(successResponse);
            }
        }
    }

    public async saveProductReviewImages (ratingId:any, productReviewImages:any, imageContainer:any, action: string){
        const productReviewImgRepo = getManager().getRepository(ProductReviewImages);
       if(action == "UPDATE"){
        await productReviewImgRepo.delete({reviewFkId: ratingId});
       }
        for(let r=0;r<productReviewImages.length;r++){
            const productRevImgs = new ProductReviewImages();
            productRevImgs.reviewFkId = ratingId;
            productRevImgs.image = productReviewImages[r];
            productRevImgs.containerName = imageContainer;
            await productReviewImgRepo.save(productRevImgs);
        }
    }
    // Product Reviews  API
    /**
     * @api {post} /api/orders/add-reviews Add Reviews  API
     * @apiGroup Store order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number}  productId productId
     * @apiParam (Request body) {Number}  orderProductId
     * @apiParam (Request body) {String} reviews productReviews
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully added reviews!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/orders/add-reviews
     * @apiErrorExample {json} reviews error
     * HTTP/1.1 500 Internal Server Error
     */
    // Order List Function
    @UseBefore(CheckCustomerMiddleware)
    @Post('/add-reviews')
    public async Reviews(@Body({ validate: true }) Value: any, @Req() request: any, @Res() response: any): Promise<any> {
        const resultData = await this.productService.findOne({

            where: { productId: request.body.productId },
        });
        if (!resultData) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid productId',
            };
            return response.status(400).send(errorResponse);
        }
        const rating = await this.productRatingService.findOne({

            where: {
                orderProductId: request.body.orderProductId,
            },
        });
        if (rating) {
            rating.review = request.body.reviews;
            const updateRating = await this.productRatingService.create(rating);
            if (updateRating) {
                const successResponse: any = {
                    status: 1,
                    message: 'Successfully updated your reviews',
                };
                return response.status(200).send(successResponse);
            }
        } else {
            const customer = await this.customerService.findOne({ where: { id: request.user.id } });
            const newRating: any = new ProductRating();
            newRating.review = request.body.reviews;
            newRating.productId = request.body.productId;
            newRating.orderProductId = request.body.orderProductId;
            newRating.customerId = request.user.id;
            newRating.firstName = customer.firstName;
            newRating.lastName = customer.lastName;
            newRating.email = customer.email;
            newRating.isActive = 1;
            await this.productRatingService.create(newRating);

            const successResponse: any = {
                status: 1,
                message: 'Successfully created your reviews',
            };
            return response.status(200).send(successResponse);

        }
    }

    // Track Order Product API
    /**
     * @api {get} /api/orders/track-order-product Track Order
     * @apiGroup Store order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} orderProductId Order Product Id
     * @apiParamExample {json} Input
     * {
     *      "orderProductId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully show the Track Order..!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/orders/track-order-product
     * @apiErrorExample {json} Track Order error
     * HTTP/1.1 500 Internal Server Error
     */
    // Track Order Function
    @UseBefore(CheckCustomerMiddleware)
    @Get('/track-order-product')
    public async trackOrder(@QueryParam('orderProductId') orderProductId: number, @Req() request: any, @Res() response: any): Promise<any> {
        const obj: any = {};
        const orderProduct = await this.orderProductService.findOne({
            select: ['basePrice', 'taxValue', 'taxType', 'orderProductId', 'trackingNo', 'trackingUrl', 'name', 'productPrice', 'orderId', 'productId', 'orderProductPrefixId', 'total', 'quantity', 'discountAmount', 'discountedAmount', 'couponDiscountAmount', 'modifiedDate', 'orderStatusId', 'createdDate', 'varientName', 'skuName', 'productVarientOptionId'],
            where: { orderProductId },
        });
        if (!orderProduct) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid Order Product Id',
            };
            return response.status(400).send(errorResponse);
        }
        const product = await this.productImageService.findOne({
            select: ['image', 'containerName', 'productId'],
            where: { productId: orderProduct.productId, defaultImage: 1 },
        });
        const order = await this.orderService.findOrder({
            select: ['shippingAddress1', 'shippingAddress2', 'shippingCity', 'shippingPostcode', 'shippingZone', 'currencySymbolLeft', 'currencySymbolRight', 'orderPrefixId'],
            where: { orderId: orderProduct.orderId, customerId: request.user.id },
        });
        if (!order) {
            const errResponse: any = {
                status: 0,
                message: 'Invalid order for this customer',
            };
            return response.status(400).send(errResponse);
        }
        const passingOrderStatus = await this.orderStatusService.findOne({
            where: {
                orderStatusId: orderProduct.orderStatusId,
            },
        });
        obj.basePrice = orderProduct.basePrice;
        obj.taxValue = orderProduct.taxValue;
        obj.taxType = orderProduct.taxType;
        obj.orderProductId = orderProduct.orderProductId;
        obj.orderId = orderProduct.orderId;
        obj.productId = orderProduct.productId;
        obj.orderProductPrefixId = orderProduct.orderProductPrefixId;
        obj.trackingId = orderProduct.trackingNo;
        obj.trackingUrl = orderProduct.trackingUrl;
        obj.productName = orderProduct.name;
        obj.productPrice = orderProduct.productPrice;
        obj.discountAmount = orderProduct.discountAmount;
        obj.discountedAmount = orderProduct.discountedAmount;
        obj.couponDiscountAmount = orderProduct.couponDiscountAmount;
        obj.varientName = orderProduct.varientName;
        obj.skuName = orderProduct.skuName;
        obj.productVarientOptionId = orderProduct.productVarientOptionId;
        obj.total = orderProduct.total;
        if (orderProduct.modifiedDate) {
            obj.orderStatusDate = orderProduct.modifiedDate;
        } else {
            obj.orderStatusDate = orderProduct.createdDate;
        }
        if (passingOrderStatus) {
            obj.orderStatus = passingOrderStatus.name;
        }
        obj.productQuantity = orderProduct.quantity;
        obj.shippingAddress1 = order.shippingAddress1;
        obj.shippingAddress2 = order.shippingAddress2;
        obj.shippingCity = order.shippingCity;
        obj.shippingPostcode = order.shippingPostcode;
        obj.shippingZone = order.shippingZone;
        obj.currencySymbolLeft = order.currencySymbolLeft;
        obj.currencySymbolRight = order.currencySymbolRight;
        obj.orderPrefixId = order.orderPrefixId;
        if (product) {
            obj.productImage = product.image;
            obj.containerName = product.containerName;
        }
        const orderStatus = await this.orderStatusService.findAll({
            select: ['orderStatusId', 'name'],
            where: {
                isActive: 1,
            },
        });
        const orderProductLog = await this.orderProductLogService.find({
            select: ['orderProductLogId', 'createdDate', 'orderStatusId'],
            where: {
                orderProductId: orderProduct.orderProductId,
            },
        });
        const orderStatusDate = orderStatus.map(async (value: any) => {
            const date = orderProductLog.find(item => item.orderStatusId === value.orderStatusId);
            const temp: any = value;
            if (date === undefined) {
                temp.createdDate = '';
            } else {
                temp.createdDate = date.createdDate;
            }
            return temp;
        });
        const result = await Promise.all(orderStatusDate);
        obj.deliveryStatus = result;
        const successResponse: any = {
            status: 1,
            message: 'Successfully shown the Track Order.',
            data: obj,
        };
        return response.status(200).send(successResponse);
    }

    //  Order Export PDF API
    /**
     * @api {get} /api/orders/order-export-pdf  Order Export PDF API
     * @apiGroup Store order
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} orderProductId Order Product Id
     * @apiParamExample {json} Input
     * {
     *      "orderProductId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully show the Order Detail..!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/orders/order-export-pdf
     * @apiErrorExample {json} Order Detail error
     * HTTP/1.1 500 Internal Server Error
     */
    // Order Detail Function
    @UseBefore(CheckCustomerMiddleware)
    @Get('/order-export-pdf')
    public async orderExportPdf(@QueryParam('orderProductId') orderProductId: number, @Req() request: any, @Res() response: any): Promise<any> {
        const orderProduct = await this.orderProductService.findOne({
            where: {
                orderProductId,
            },
        });
        if (!orderProduct) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid Order Product Id',
            };
            return response.status(400).send(errorResponse);
        }
        const orderData = await this.orderService.findOrder({
            where: { orderId: orderProduct.orderId, customerId: request.user.id }, select: ['orderId', 'orderStatusId', 'customerId', 'telephone', 'invoiceNo', 'paymentStatus', 'invoicePrefix', 'orderPrefixId', 'shippingFirstname', 'shippingLastname', 'shippingCompany', 'shippingAddress1',
                'shippingAddress2', 'shippingCity', 'email', 'shippingZone', 'shippingPostcode', 'shippingCountry', 'shippingAddressFormat',
                'paymentFirstname', 'paymentLastname', 'paymentCompany', 'paymentAddress1', 'paymentAddress2', 'paymentCity', 'couponCode', 'discountAmount', 'amount',
                'paymentPostcode', 'paymentCountry', 'paymentZone', 'paymentAddressFormat', 'total', 'customerId', 'createdDate', 'currencyCode', 'currencySymbolLeft', 'currencySymbolRight'],
        });
        if (!orderData) {
            const errResponse: any = {
                status: 0,
                message: 'Invalid Order for this customer',
            };
            return response.status(400).send(errResponse);
        }
        orderData.productList = await this.orderProductService.find({ where: { orderProductId }, select: ['orderProductId', 'orderId', 'productId', 'name', 'model', 'quantity', 'total', 'productPrice', 'basePrice', 'taxType', 'taxValue', 'discountAmount', 'discountedAmount', 'couponDiscountAmount'] }).then((val) => {
            const productVal = val.map(async (value: any) => {
                const rating = await this.productRatingService.findOne({ select: ['rating', 'review'], where: { customerId: orderData.customerId, orderProductId: value.orderProductId, productId: value.productId } });
                const tempVal: any = value;
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
                return tempVal;
            });
            const results = Promise.all(productVal);
            return results;
        });
        const select = '';
        const relation = [];
        const WhereConditions = [];
        const limit = 1;

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
            where: { orderStatusId: orderProduct.orderStatusId },
            select: ['name', 'colorCode'],
        });
        if (orderStatusData) {
            orderData.orderStatusName = orderStatusData.name;
            orderData.statusColorCode = orderStatusData.colorCode;
        }
       
        let image: any;
        if (env.imageserver === 's3') {
            image = await this.s3Service.resizeImageBase64(settingDetails.invoiceLogo, settingDetails.invoiceLogoPath, '50', '50');
        } else {
            image = await this.imageService.resizeImageBase64Extended(settingDetails.invoiceLogo, settingDetails.invoiceLogoPath, '50', '50');
        }
        orderData.logo = image;

        const htmlData = await this.pdfService.readHtmlToString('invoice', orderData);        
        const pdfBinary = await this.pdfService.createPDFFile(htmlData, true, '');
        return response.status(200).send({
            data: pdfBinary,
            status: 1,
            message: 'pdf exported',
        });
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

    
    // Order Cancel Reason List
    /**
     * @api {get} /api/orders/order-cancel-reason-list Order Cancel Reason List
     * @apiGroup Store order
     * @apiParam (Request body) {Number} limit Limit
     * @apiParam (Request body) {Number} offset Offset
     * @apiParam (Request body) {Number} count count in number or boolean
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "limit" : "",
     *      "offset": "",
     *      "count": "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Listed..!",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/orders/order-cancel-reason-list
     * @apiErrorExample {json} order cancel reason List error
     * HTTP/1.1 500 Internal Server Error
     */
    // Abuse Reason list Function
    @UseBefore(CheckCustomerMiddleware)
    @Get('/order-cancel-reason-list')
    public async reasonList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
        const select = ['id', 'reason'];
        const ReasonList: any = await this.orderCancelReasonService.list(limit, offset, select, 0, 0, count);
        const successResponse: any = {
            status: 1,
            message: 'Successfully got Order Cancel Reason list',
            data: ReasonList,
        };
        return response.status(200).send(successResponse);
    }

    // order cancel Request API
    /**
     * @api {post} /api/orders/order-cancel-request order cancel request API
     * @apiGroup Store order
     * @apiParam (Request body) {String} description
     * @apiParam (Request body) {Number} orderProductId
     * @apiParam (Request body) {Number} reasonId
     * @apiHeader {String} Authorization
     * @apiParamExample {json} Input
     * {
     *      "description" : "",
     *      "orderProductId" : "",
     *      "reasonId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully posted your cancel request",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/orders/order-cancel-request
     * @apiErrorExample {json} Order Cancel Request error
     * HTTP/1.1 500 Internal Server Error
     */
    @UseBefore(CheckCustomerMiddleware)
    @Post('/order-cancel-request')
    public async createOrderCancel(@Body({ validate: true }) orderCancelParam: OrderCancelRequest, @Req() request: any, @Res() response: any): Promise<any> {
        const orderProduct = await this.orderProductService.findOne({
            where: { orderProductId: orderCancelParam.orderProductId },
        });
        if (!orderProduct) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid Order ProductId',
            };
            return response.status(400).send(errorResponse);
        }
        const reason = await this.orderCancelReasonService.findOne({
            where: { id: orderCancelParam.reasonId },
        });
        if (!reason) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid reasonId',
            };
            return response.status(400).send(errorResponse);
        }
        const order = await this.orderService.findOrder({
            where: { orderId: orderProduct.orderId, customerId: request.user.id },
        });
        if (!order) {
            const errResponse: any = {
                status: 0,
                message: 'Invalid request for this user',
            };
            return response.status(400).send(errResponse);
        }
        orderProduct.cancelReason = reason.reason;
        orderProduct.cancelReasonDescription = orderCancelParam.description;
        orderProduct.cancelRequest = 1;
        orderProduct.cancelRequestStatus = 0;
        const orderProductUpdated = await this.orderProductService.createData(orderProduct);
        if (orderProductUpdated !== undefined) {
            const successResponse: any = {
                status: 1,
                message: 'Your order cancel request posted successfully',
                data: orderProductUpdated,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'unable to post',
            };
            return response.status(400).send(errorResponse);
        }
    }

    @Get('/test-dbdackup')
    public async testDbBackup(@Req() req: any, @Res() response: any): Promise<any> {
      
        return response.status(200).send(("tet-dbbackup"));
    }

    @Post('/order-return')
    public async orderReturn(@Body({ validate: true }) orderReturn: any, @Res() response: any): Promise<any> {
        const checkExisting = await this._orderReturn.findOne({"orderProductId":orderReturn.orderProductId})
        //const _order = getManager().getRepository(Order)
        if(checkExisting && checkExisting.returnStatus==1){
            return response.status(200).send(await this._commonService.getMessage(500, null, "Order return already submitted")).end();
        }else{
            let orderDetails = await this.orderProductService.findOne(orderReturn.orderProductId);
            
            orderReturn.returnOrderSku = orderDetails.skuName;
            
        const result = await this._orderReturn.create(orderReturn)
        if(result){
            
            if(orderReturn.returnType == "REPLACE_PRODUCT"){
                orderDetails.orderStatusId=7;    
            }else{
                orderDetails.orderStatusId=15;
            }
            await this.orderProductService.update(orderReturn.orderProductId, orderDetails);
           // await _order.createQueryBuilder().update().set({orderStatusId:orderDetails.orderStatusId}).where("order_id=:order_id", {order_id: orderDetails.orderId}).execute();
            return response.status(200).send(await this._commonService.getMessage(200, result, "Order Return Applied Successfully")).end();
        }else{
            return response.status(200).send(await this._commonService.getMessage(500, null, "Data not save")).end();
        }
    }        
    }

    @Get('/order-return-list')
    public async orderReturnList(@QueryParams() query:any, ): Promise<any> {
       //const orderList = await this._orderReturn.find({where: {returnStatus:query.returnStatus}})
      //--------------------------------------------------------
      const orderTable: string = "`order`";
      let orderIdData = query.orderId
        ? `AND tr.order_prefix_id = '${query.orderId}'`
        : "";
      let emailData = query.email ? `AND o.email like '${query.email}%'` : "";
      let customerNameData = query.customerName
        ? `AND o.shipping_firstname like '${query.customerName}%'`
        : "";
      let dateRange =
        query.fromDate && query.toDate
          ? `AND Date(tr.created_date) between Date('${query.fromDate}') AND Date('${query.toDate}')`
          : "";
      let mobileData = query.mobile
        ? `AND o.telephone = '${query.mobile}'`
        : "";

      const orderList = await getManager().query(
        `SELECT max(tr.id) id, tr.order_id as orderId,max(tr.order_product_id) as orderProductId,max(tr.product_id) as productId,max(tr.customer_id) as customerId,max(tr.order_prefix_id) as orderPrefixId,max(tr.order_product_prefix_id) as orderProductPrefixId,max(tr.total_amount) as totalAmount,o.email,o.shipping_firstname as shippingFirstname,max(tr.return_status) as returnStatus,max(tr.return_reason) as returnReason,max(tr.return_remark) as returnRemarkValue,max(tr.return_type) as returnType,max(tr.quantity) as quantity,max(tr.sku_name) as skuName,max(tr.vareint_id) as vareintId,max(tr.varient_name) as varientName,max(tr.mail_sent_status) as mailSentStatus,group_concat(tr.return_order_sku) as returnOrderSku,group_concat(tr.rp_code) as rpCode,max(tr.created_date) as createdDate,o.telephone as mobile from tm_order_return as tr INNER JOIN ${orderTable} as o ON tr.order_id=o.order_id where tr.return_status= ${query.returnStatus} ${orderIdData} ${emailData} ${customerNameData} ${dateRange} ${mobileData} group by orderId order by createdDate desc`
      );

      let result: any = {};
      if (orderList.length > 0) {
        result = {
          status: 200,
          data: orderList,
          message: "Get all data successfully",
        };
      } else {
        result = {
          status: 500,
          data: [],
          message: "No Data Found",
        };
      }
      return result;
    }

    
    @Get('/order-return-update')
    public async orderReturnUpdate(@QueryParams() query:any): Promise<any> {
        const orderReturn = getManager().getRepository(OrderReturn)
        const result = await orderReturn.createQueryBuilder().update().set({returnStatus:2}).where("order_prefix_id=:opId", {opId: query.orderProductPrefixId}).execute();
        return result
    }

        
    @Get('/order-return-by-order-id/:orderId')
    @Authorized()
    public async orderReturnByOrderId(@Param('orderId') orderId:any): Promise<any> {
        const orderReturn = getManager().getRepository(OrderReturn)
        const data = await orderReturn.find({where: {orderId,returnStatus:1}})
        const result:any={}
        if(data.length>0){
            result.status=200
            result.message='Get data successfully'
            result.data=data
        }else{
            result.status=300
            result.message='No data found'
            result.data=null
        }
        return result
    }

@Post('/update-return-request')
@Authorized()
public async updateReturnRequest(@Body() requestData:any){
    const length = requestData.length
    console.log("requestData",requestData)
    for(let i=0; i<length; i++){
        console.log("requestData[i]",requestData[i])
        await getManager().query(`UPDATE tm_order_return SET return_status = ${requestData[i].status}, modified_date=now() WHERE order_product_id = ${requestData[i].orderProductId}`)
        const orderProduct:any = await getManager().query(`select delivered_date deliveredDate from order_product WHERE order_product_id = ${requestData[i].orderProductId}`)
        console.log("orderProduct",orderProduct)
        const json = {
            orderStatusId:requestData[i].orderStatusId,
            orderProductIds:requestData[i].orderProductId,
            deliveredDate:orderProduct[0].deliveredDate,
            orderId:requestData[i].orderId
            }
            console.log("json",json)
         await this.orderService.updateOrderProductStatus(json)
    }
    
    await this._orderStatusHistoryController.saveStatusHistory(requestData[0].orderId, requestData[0].orderPrefixId,requestData,length,requestData[0].orderHistoryStatus,1,1,1)

    return {
        status:200,
        message:'Update sucessfully',
        data:null
    }
}
    

    @Post('/return-full-order')
    public async returnFullorder(@Body({ validate: true }) orderReturn: any, @Res() response: any): Promise<any> {
        const length = orderReturn.length
        let result:any
        for(let i=0; i<length; i++){
            const checkExisting = await this._orderReturn.findOne({orderProductId:orderReturn[i].orderProductId,returnStatus:1})
            if(checkExisting){
                return response.status(200).send(await this._commonService.getMessage(500, null, "Order return already submitted")).end();
            }else{
                const json = {
                    orderStatusId:21,
                    orderProductIds:orderReturn[i].orderProductId,
                    orderId:orderReturn[0].orderId
                    }
                 await this.orderService.updateOrderProductStatus(json)
            }
        }
        await this._orderStatusHistoryController.saveStatusHistory(orderReturn[0].orderId, orderReturn[0].orderPrefixId,orderReturn,length,21,1,1,1)
        result = await this._orderReturn.create(orderReturn)
        if(result){
            return response.status(200).send(await this._commonService.getMessage(200, result, "Order Return Applied Successfully")).end();
        }else{
            return response.status(200).send(await this._commonService.getMessage(500, null, "Data not save")).end();
        }
    }       
    

    @Post('/save-ingenico-request-payload')
    public async saveIngenicoRequestPayload(@Body() payloadData: any, @Req() request:any, @Res() response: any): Promise<any> {
        console.log("payloadData", payloadData)
        const decrptData = this._commonService.decrptData(payloadData.data)
        const jsonParse = JSON.parse(decrptData)
        console.log("decrptData111", decrptData)
        console.log("decrptData222", jsonParse)
        const order_prefix_id = request.query.order_prefix_id;
        const token = jsonParse.consumerData.token;
        if(order_prefix_id && token){
            const newDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            
        const ingenicoRepo = getManager().getRepository(IngenicoOrderData).createQueryBuilder();
        const updated = await ingenicoRepo.update().set({requestPayload: decrptData, modifiedDate: newDate}).where("pay_ref = :opid", {opid: order_prefix_id}).execute();
        if(updated && updated.affected != 0){
            return {
                status: 1,
                message: "updated successfully",
                data: "updated successfully"
            }
        }else{
            return {
                status: 0,
                message: "Not updated",
                data: "Please try later"
            }
        }
    }else{
        return {
            status: 0,
            message: "Failed",
            data: "provide valid information"
        }  
    }
    
    }

    @Post('/save-paytm-request-payload')
    public async savePaytmRequestPayload(@Body() payloadData: any, @Req() request:any, @Res() response: any): Promise<any> {
       
        const order_prefix_id = request.query.order_prefix_id;
        const token = request.body.data.token;
        const orderRepo =  getManager().getRepository(Order).createQueryBuilder();
        const queryRes = await orderRepo.select().where("order_prefix_id = :opid", {opid: order_prefix_id}).execute();
        
        
        
        if(queryRes && queryRes.length > 0 && token){
            const newDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            const order_id = queryRes[0].Order_order_id;
        const ingenicoRepo = getManager().getRepository(PaytmOrder).createQueryBuilder();
        const updated = await ingenicoRepo.update().set({requestPayload: JSON.stringify(payloadData), modifiedDate: newDate}).where("orderId = :opid", {opid: order_id}).execute();
        if(updated && updated.affected != 0){
            return {
                status: 1,
                message: "updated successfully",
                data: "updated successfully"
            }
        }else{
            return {
                status: 0,
                message: "Not updated",
                data: "Please try later"
            }
        }
    }else{
        return {
            status: 0,
            message: "Failed",
            data: "provide valid information"
        }  
    }
    
    }

    @Post('/update-return-status')
    public async updateReturnStatus(@Body() payloadData: any, @Req() request:any, @Res() response: any): Promise<any> {
         
        const orderReturn: any = await this._orderReturn.findOne({
            where: {
                orderId: payloadData.orderId,
            },
        });
        if (!orderReturn) {
            const errorResponse: any = {
                status: 0,
                message: 'Unable to edit order return status,try again.',
            };
            return response.status(400).send(errorResponse);
        }
        orderReturn.orderId = payloadData.orderId;
        orderReturn.returnStatus = payloadData.returnStatus;
       
        const addressSave = await this._orderReturn.create(orderReturn);
        if (addressSave) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully updated Order Return status',
                data: addressSave,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 1,
                message: 'Unable to update the Order Return status. ',
            };
            return response.status(400).send(errorResponse);
        }
    
    }
    
    }    

