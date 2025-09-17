/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import { Get, QueryParam, JsonController, Res, Req, Param, UseBefore } from 'routing-controllers';
import { classToPlain } from 'class-transformer';
import { ProductToCategoryService } from '../../services/ProductToCategoryService';
import { ProductService } from '../../services/ProductService';
import { CategoryService } from '../../services/CategoryService';
import { ProductImageService } from '../../services/ProductImageService';
import { CustomerActivityService } from '../../services/CustomerActivityService';
import { ProductViewLog } from '../../models/productViewLog';
import { CustomerActivity } from '../../models/CustomerActivity';
import { ProductViewLogService } from '../../services/ProductViewLogService';
import { CustomerService } from '../../services/CustomerService';
import { ProductDiscountService } from '../../services/ProductDiscountService';
import { ProductSpecialService } from '../../services/ProductSpecialService';
import { CategoryPathService } from '../../services/CategoryPathService';
import { ProductRatingService } from '../../services/RatingService';
import { CustomerWishlistService } from '../../services/CustomerWishlistService';
import { TaxService } from '../../services/TaxService';
import { ProductQuestionService } from '../../services/ProductQuestionService';
import { UserService } from '../../services/UserService';
import { OrderProductService } from '../../services/OrderProductService';
import { ProductTirePriceService } from '../../services/ProductTirePriceService';
import { SkuService } from '../../services/SkuService';
import { ProductVarientOptionService } from '../../services/ProductVarientOptionService';
import { ProductVarientService } from '../../services/ProductVarientService';
import { ProductVarientOptionDetailService } from '../../services/ProductVarientOptionDetailService';
import { ProductVarientOptionImageService } from '../../services/ProductVarientOptionImageService';
import { VarientsService } from '../../services/VarientsService';
import { VarientsValueService } from '../../services/VarientsValueService';
import { ManufacturerService } from '../../services/ManufacturerService';
import { ProductVideoService } from '../../services/ProductVideoService';
import moment = require('moment');
import { CheckCustomerMiddleware, CheckTokenMiddleware } from '../../middlewares/checkTokenMiddleware';
import {createQueryBuilder, getManager} from "typeorm"; 
import { ProductReviewImages } from '../../models/ProductReviewImages';
@JsonController('/product-store')
export class ProductController {
    constructor(private productService: ProductService,
                private productToCategoryService: ProductToCategoryService,
                private categoryService: CategoryService,
                private productImageService: ProductImageService,
                private customerService: CustomerService,
                private productViewLogService: ProductViewLogService,
                private customerActivityService: CustomerActivityService,
                private taxService: TaxService,
                private userService: UserService,
                private productQuestionService: ProductQuestionService,
                private orderProductService: OrderProductService,
                private productTirePriceService: ProductTirePriceService,
                private productVarientOptionService: ProductVarientOptionService,
                private productVarientOptionDetailService: ProductVarientOptionDetailService,
                private productVarientOptionImageService: ProductVarientOptionImageService,
                private productVarientService: ProductVarientService,
                private varientsService: VarientsService,
                private varientsValueService: VarientsValueService,
                private skuService: SkuService,
                private manufacturerService: ManufacturerService,
                private productDiscountService: ProductDiscountService, private productSpecialService: ProductSpecialService,
                private categoryPathService: CategoryPathService, private productRatingService: ProductRatingService, private customerWishlistService: CustomerWishlistService, private productVideoService: ProductVideoService) {
    }

    // Product Details API
    /**
     * @api {get} /api/product-store/productdetail/:productslug   Product detail API
     * @apiGroup Store
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1"
     *      "message": "Successfully get product Detail",
     *      "data":"{}"
     * }
     * @apiSampleRequest /api/product-store/productdetail/:productslug
     * @apiErrorExample {json} productDetail error
     * HTTP/1.1 500 Internal Server Error
     */
    @UseBefore(CheckTokenMiddleware)
    @Get('/productdetail/:productslug')
    public async productDetail(@Param('productslug') productslug: string, @Req() request: any, @Res() response: any): Promise<any> {
        const productDetail: any = await this.productService.findOne({
                productSlug: productslug
        });
        if (!productDetail) {
            const errResponse: any = {
                status: 0,
                message: 'Invalid product',
            };
            return response.status(404).send(errResponse);
        }
        const date = new Date ();
        if (productDetail.dateAvailable > date) {
            return response.status(404).send({
                status: 0,
                message: 'Invalid product',
            });
        }
        const productDetails: any = classToPlain(productDetail);
        if (productDetails.taxType === 2) {
            const tax = await this.taxService.findOne({ taxId: productDetails.taxValue });
            if (tax) {
                productDetails.taxValue = tax.taxPercentage;
            } else {
                productDetails.taxValue = '';
            }
        }


        let _catName = await this.productService.getCategoryName(productDetail.productId);
        if(_catName){
            productDetails.categoryName = _catName;
        }else{
            productDetails.categoryName = _catName;
        }
        





        // const where = [{
        //     name: 'productId',
        //     op: 'where',
        //     value:  productDetail.productId,
        // }];
        //const rating = await this.productRatingService.list(0, 0, 0, 0, where, true);
       const ratingRes =  await this.productRatingService.getAvgRating(productDetail.productId);
        const rating = Number(ratingRes.rating).toFixed(1);
        const whereConditions = [
            {
                name: 'ProductRating.productId',
                op: 'where',
                value:  productDetail.productId,
            },
            {
                name: 'ProductRating.isActive',
                op: 'and',
                value: 1,
            },
                {
                    name: 'ProductRating.review',
                    op: 'NOT',
                },
                {
                    name: 'ProductRating.isCommentApproved',
                    op: 'and',
                    value: 1,
                },
        ];
       
        const review = await this.productRatingService.listByQueryBuilder(0, 0, 0, whereConditions, 0, 0, 0, 0, true);
        console.log("data ratingCount>>",productDetails);
        productDetails.ratingCount = rating ? rating : 0;
        productDetails.reviewCount = review ? review : 'null';
        const manufacturer = await this.manufacturerService.findOne({ manufacturerId: productDetails.manufacturerId });
        productDetails.manufacturerName = manufacturer ? manufacturer.name : '';
        productDetails.productImage = await this.productImageService.findAll({
            select: ['productId', 'image', 'containerName', 'defaultImage'],
            where: {
                productId: productDetail.productId,
            },
        });
        productDetails.productOriginalImage = productDetails.productImage.slice();
        productDetails.Category = await this.productToCategoryService.findAll({
            select: ['categoryId', 'productId'],
            where: { productId: productDetail.productId },
        }).then((val) => {
            const category = val.map(async (value: any) => {
                const categoryNames = await this.categoryService.findOne({ categoryId: value.categoryId });
                const temp: any = value;
                if (categoryNames !== undefined) {
                    temp.categoryName = categoryNames.name;
                    temp.categorySlug = categoryNames.categorySlug;
                } else {
                    temp.categoryName = '';
                    temp.categorySlug = '';
                }
                return temp;
            });
            const results = Promise.all(category);
            return results;
        });
        productDetails.productOption = [];
        productDetails.skuName = '';
        productDetails.skuId = productDetails.skuId ? productDetails.skuId : '';
        productDetails.variantName = '';
        productDetails.variantId = '';
        let skuValue = undefined;
        let skuId = undefined;
        if (productDetails.isSimplified === 1) {
            skuValue = await this.skuService.findOne({ id: productDetails.skuId });
            if (skuValue) {
                productDetails.price = skuValue.price;
                productDetails.skuName = skuValue.skuName;
                productDetails.skuId = skuValue.skuId;
                productDetails.outOfStockThreshold = skuValue.outOfStockThreshold;
                productDetails.notifyMinQuantity = skuValue.notifyMinQuantity;
                productDetails.minQuantityAllowedCart = skuValue.minQuantityAllowedCart;
                productDetails.maxQuantityAllowedCart = skuValue.maxQuantityAllowedCart;
                productDetails.enableBackOrders = skuValue.enableBackOrders;
                if (productDetails.hasStock === 1) {
                    if (skuValue.quantity <= skuValue.outOfStockThreshold) {
                        productDetails.stockStatus = 'outOfStock';
                    } else {
                        productDetails.stockStatus = 'inStock';
                    }
                } else {
                    productDetails.stockStatus = 'inStock';
                }
                skuId = skuValue.id;
            }
        } else {
            skuValue = await this.productVarientOptionService.findOne({ productId: productDetail.productId, isActive: 1 });
            if (skuValue) {
                productDetails.variantName = skuValue.varientName;
                productDetails.variantId = skuValue.id;
                const image = await this.productVarientOptionImageService.findAll({
                    select: ['id', 'image', 'containerName', 'defaultImage', 'productVarientOptionId'],
                    where: { productVarientOptionId: skuValue.id },
                });
                if (image && image.length > 0) {
                    const tempImage = productDetails.productImage.map(element => {
                        return Object.assign({}, element, {
                            defaultImage: 0,
                        });
                    });
                    image[0].defaultImage = 1;
                    tempImage.unshift(image[0]);
                    productDetails.productImage = tempImage;
                }
                const selectedVariant: any = {};
                const productVarientOption = await this.productVarientOptionDetailService.findAll({
                    select: ['id', 'productVarientOptionId', 'varientsValueId'],
                    where: { productVarientOptionId: skuValue.id },
                }).then((varientValue) => {
                    const varientValueList = varientValue.map(async (vv: any) => {
                        const tempValue: any = vv;
                        const varientValueData = await this.varientsValueService.findOneData({
                            select: ['id', 'valueName', 'varientsId'],
                            where: { id: vv.varientsValueId },
                        });
                        if (varientValueData !== undefined) {
                            selectedVariant[varientValueData.varientsId] = vv.varientsValueId;
                        }
                        tempValue.valueName = (varientValueData !== undefined) ? varientValueData.valueName : '';
                        return tempValue;
                    });
                    const rslt = Promise.all(varientValueList);
                    return rslt;
                });
                const productVarientSku = await this.skuService.findOne({ id: skuValue.skuId });
                if(productVarientSku){
                productDetails.price = productVarientSku.price;
                productDetails.skuName = productVarientSku.skuName;
                productDetails.skuId = productVarientSku.skuId;
                productDetails.productVarientOption = productVarientOption;
                productDetails.selectedVariant = selectedVariant;
                productDetails.outOfStockThreshold = productVarientSku.outOfStockThreshold;
                productDetails.notifyMinQuantity = productVarientSku.notifyMinQuantity;
                productDetails.minQuantityAllowedCart = productVarientSku.minQuantityAllowedCart;
                productDetails.maxQuantityAllowedCart = productVarientSku.maxQuantityAllowedCart;
                productDetails.enableBackOrders = productVarientSku.enableBackOrders;
                
                if (productDetails.hasStock === 1) {
                    if (productVarientSku.quantity <= productVarientSku.outOfStockThreshold) {
                        productDetails.stockStatus = 'outOfStock';
                    } else {
                        productDetails.stockStatus = 'inStock';
                    }
                } else {
                    productDetails.stockStatus = 'inStock';
                }
                skuId = productVarientSku.id;
            }
            }
        }
        if (skuId) {
            const nowDate = new Date();
            const todaydate = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
            const productSpecial = await this.productSpecialService.findSpecialPriceWithSku(productDetail.productId, skuId, todaydate);
            const productDiscount = await this.productDiscountService.findDiscountPricewithSku(productDetail.productId, skuId, todaydate);
            if (productSpecial !== undefined) {
                productDetails.pricerefer = productSpecial.price;
                productDetails.flag = 1;
            } else if (productDiscount !== undefined) {
                productDetails.pricerefer = productDiscount.price;
                productDetails.flag = 0;
            } else {
                productDetails.pricerefer = '';
                productDetails.flag = '';
            }
            productDetails.productTirePrices = await this.productTirePriceService.findAll({
                select: ['id', 'quantity', 'price'],
                where: { productId: productDetail.productId, skuId },
            });
        } else {
            productDetails.pricerefer = '';
            productDetails.flag = '';
            productDetails.productTirePrices = await this.productTirePriceService.findAll({
                select: ['id', 'quantity', 'price'],
                where: { productId: productDetail.productId },
            });
        }
        if (request.id) {
            let customerId;
            customerId = request.id;
            const wishStatus = await this.customerWishlistService.findOne({
                where: {
                    productId: productDetail.productId,
                    customerId,
                },
            });
            const orderProduct = await this.orderProductService.buyedCount(productDetail.productId, customerId);
            if (orderProduct.length > 0) {
                productDetails.buyed = 1;
            } else {
                productDetails.buyed = 0;
            }
            if (wishStatus) {
                productDetails.wishListStatus = 1;
            } else {
                productDetails.wishListStatus = 0;
            }
           // const customerDetail = await this.customerService.findOne({ where: { id: customerId } });
             await this.customerService.findOne({ where: { id: customerId } });
            
            await getManager().query(`DELETE FROM customer_activity WHERE customer_id = ${customerId} AND description = 'productviewed' AND product_id = ${productDetail.productId}`)
            
            const customerProductViewsCountRes =  await getManager().query(`SELECT COUNT(*) AS count FROM customer_activity WHERE customer_id = ${customerId} AND description = 'productviewed'`);
            
            const cCount = customerProductViewsCountRes[0].count;
            
            if(cCount <= 5){
                

                const customerActivity = new CustomerActivity();
                customerActivity.customerId = customerId;
                customerActivity.activityId = 2;
                customerActivity.description = 'productviewed';
                customerActivity.productId = productDetail.productId;
                await this.customerActivityService.create(customerActivity);
            }else{

               const querySelect =  await getManager().query(`SELECT MIN(customer_activity_id) cai FROM customer_activity WHERE customer_id = ${customerId} AND description = 'productviewed'`)
               await getManager().query(`DELETE FROM customer_activity WHERE customer_activity_id = ${querySelect[0].cai}`)

               const customerActivity = new CustomerActivity();
                customerActivity.customerId = customerId;
                customerActivity.activityId = 2;
                customerActivity.description = 'productviewed';
                customerActivity.productId = productDetail.productId;
                await this.customerActivityService.create(customerActivity);
           
            }
            
           /* const viewLog: any = new ProductViewLog();
            viewLog.productId = productDetail.productId;
            viewLog.customerId = customerDetail.id;
            viewLog.firstName = customerDetail.firstName;
            viewLog.lastName = customerDetail.lastName;
            viewLog.username = customerDetail.username;
            viewLog.email = customerDetail.email;
            viewLog.mobileNumber = customerDetail.mobileNumber;
            viewLog.address = customerDetail.address;
            await this.productViewLogService.create(viewLog);*/
        } else {
            productDetails.wishListStatus = 0;
            productDetails.buyed = 0;
        }
        productDetails.questionList = await this.productQuestionService.findAll({
            select: ['questionId', 'productId', 'question', 'type', 'referenceId', 'createdDate'],
            where: { productId: productDetail.productId, isActive: 1 },
            limit: 4,
        }).then((val) => {
            const user = val.map(async (value: any) => {
                const referenceId = value.referenceId;
                const type = value.type;
                const temp: any = value;
                if (type && type === 2) {
                    const customer = await this.customerService.findOne({
                        select: ['id', 'firstName', 'avatar', 'avatarPath', 'city'],
                        where: { id: referenceId },
                    });
                    if (customer !== undefined) {
                        temp.postedBy = customer;
                    }
                } else {
                    const adminUser = await this.userService.findOne({
                        select: ['userId', 'firstName', 'avatar', 'avatarPath'],
                        where: { userId: referenceId },
                    });
                    if (adminUser !== undefined) {
                        temp.postedBy = adminUser;
                    }
                }
                return temp;
            });
            const resultData = Promise.all(user);
            return resultData;
        });
        // product video
        productDetails.productVideo = await this.productVideoService.findOne({
            select: ['id', 'name', 'path', 'type', 'productId'],
            where: { productId: productDetail.productId },
        });
        const selectVarientIds:any[]=[]
        productDetails.productvarientList = await this.productVarientOptionService.findAll({
            select: ['id', 'productId', 'skuId', 'varientName', 'isActive', 'createdDate'],
            where: { productId: productDetail.productId, isActive: 1 },
        }).then((val) => {
            const productVarList = val.map(async (value: any) => {
                const temp: any = value;
                const sku = await this.skuService.findOne({
                    where: { id: value.skuId },
                });
                const image = await this.productVarientOptionImageService.findAll({
                    select: ['id', 'image', 'containerName', 'defaultImage', 'productVarientOptionId'],
                    where: { productVarientOptionId: value.id },
                });
                const productVarientOption = await this.productVarientOptionDetailService.findAll({
                    select: ['id', 'productVarientOptionId', 'varientsValueId'],
                    where: { productVarientOptionId: value.id },
                }).then((varientValue) => {
                    const varientValueList = varientValue.map(async (vv: any) => {
                        return vv.varientsValueId;
                    });
                    const rslt = Promise.all(varientValueList);
                    return rslt;
                });
                temp.skuName = sku && sku.skuName;
                temp.skuId =  sku && sku.id;
                temp.price =  sku && sku.price;
                temp.quantity =  sku && sku.quantity;
                temp.optionImage = image;
                temp.productVarientOption = productVarientOption;
                productVarientOption.forEach(element => {
                    selectVarientIds.push(element) 
                });
                temp.outOfStockThreshold =  sku && sku.outOfStockThreshold;
                temp.hasStock =  sku && sku.hasStock;
                temp.notifyMinQuantity =  sku && sku.notifyMinQuantity;
                temp.minQuantityAllowedCart =  sku && sku.minQuantityAllowedCart;
                temp.maxQuantityAllowedCart =  sku && sku.maxQuantityAllowedCart;
                temp.enableBackOrders =  sku && sku.enableBackOrders;
                if (productDetails.hasStock === 1) {
                    if (sku.quantity <= sku.outOfStockThreshold) {
                        temp.stockStatus = 'outOfStock';
                    } else {
                        temp.stockStatus = 'inStock';
                    }
                } else {
                    temp.stockStatus = 'inStock';
                }
                if (sku) {
                    const nowDate = new Date();
                    const todaydate = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
                    const productSpecial = await this.productSpecialService.findSpecialPriceWithSku(productDetail.productId, sku.id, todaydate);
                    const productDiscount = await this.productDiscountService.findDiscountPricewithSku(productDetail.productId, sku.id, todaydate);
                    if (productSpecial !== undefined) {
                        temp.pricerefer = productSpecial.price;
                        temp.flag = 1;
                    } else if (productDiscount !== undefined) {
                        temp.pricerefer = productDiscount.price;
                        temp.flag = 0;
                    } else {
                        temp.pricerefer = '';
                        temp.flag = '';
                    }
                    temp.productTirePrices = await this.productTirePriceService.findAll({
                        select: ['id', 'quantity', 'price'],
                        where: { productId: productDetail.productId, skuId: sku.id },
                    });
                } else {
                    temp.pricerefer = '';
                    temp.flag = '';
                    temp.productTirePrices = await this.productTirePriceService.findAll({
                        select: ['id', 'quantity', 'price'],
                        where: { productId: productDetail.productId },
                    });
                }
                return temp;
            });
            const resultData = Promise.all(productVarList);
            return resultData;
        });
        productDetails.productVarient = await this.productVarientService.findAll({
            select: ['id', 'varientsId', 'productId'],
            where: { productId: productDetail.productId },
        }).then((val) => {
            const varientDetail = val.map(async (value: any) => {
                const varients = await this.varientsService.findOne({ where: { id: value.varientsId } });
                if (varients) {
                    const varientList = await this.varientsValueService.find({ where: { varientsId: varients.id }, order: {sortOrder:'ASC'}});
                    const actVarient:any[]=[]
                    varientList.forEach(element => {
                        if(selectVarientIds.includes(element.id)){
                        actVarient.push(element)
                        }
                    });
                    varients.varientsValue = actVarient
                    const temp: any = varients;
                    
                    return temp;
                }
            });
            const results = Promise.all(varientDetail);
            return results;
        });
        const successResponse: any = {
            status: 1,
            message: 'Successfully got productDetail',
            data: productDetails,
        };
        return response.status(200).send(successResponse);
    }

    // Featured Product List API
    /**
     * @api {get} /api/product-store/featureproduct-list Feature Product List
     * @apiGroup Store
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {Number} count count in number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get feature product List..!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/product-store/featureproduct-list
     * @apiErrorExample {json} FeatureProduct List error
     * HTTP/1.1 500 Internal Server Error
     */
    @UseBefore(CheckTokenMiddleware)
    @Get('/featureproduct-list')
    public async featureProductList(@QueryParam('FuroFeaturedProductcategory') FuroFeaturedProductcategory: string,@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('count') count: number | boolean, @Req() request: any, @Res() response: any): Promise<any> {
        console.log("furo featured product from featured *******************&&&&&&&&&&&&&& FuroFeaturedProductcategory",FuroFeaturedProductcategory);
        const currentDate = moment().format('YYYY-MM-DD');
        const select = [
            'Product.promotionId as promotionId',
            'Product.promotionFlag as promotionFlag',
            'Product.promotionType as promotionType',
            'Product.promotionProductYid as promotionProductYid',
            'Product.promotionProductYSlug as promotionProductYSlug',
            'Product.taxType as taxType',
            'Product.taxValue as taxValue',
            'Product.productId as productId',
            'Product.name as name',
            'Product.skuId as skuId',
            'Product.isSimplified as isSimplified',
            'Product.quantity as quantity',
            'Product.rating rating',
            'Product.description as description',
            'Product.sortOrder as sortOrder',
            'Product.price as price',
            'Product.productSlug as productSlug',
            'Product.isActive as isActive',
            'Product.hasStock as hasStock',
            'Product.outOfStockThreshold as outOfStockThreshold',
            '(SELECT pi.container_name as containerName FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as containerName',
            '(SELECT pi.image as image FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as image',
            '(SELECT pi.default_image as defaultImage FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as defaultImage',
            '(SELECT COUNT(pr.rating) as ratingCount FROM product_rating pr WHERE pr.product_id = Product.productId) as ratingCount',
            '(SELECT COUNT(pr.review) as reviewCount FROM product_rating pr WHERE pr.product_id = Product.productId AND pr.review IS NOT NULL) as reviewCount',
            'IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value` LIMIT 1), (Product.taxValue) )  as taxValue',
            'IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AS skuId',
            '(SELECT sku.sku_name as skuName FROM sku WHERE sku.id = skuId) as skuName',
            '(SELECT sku.price as price FROM sku WHERE sku.id = skuId) as skuPrice',
            '(SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = skuId AND ((pd2.date_start <= CURDATE() AND  pd2.date_end >= CURDATE())) ' +
            ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) AS productDiscount',
            '(SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = skuId AND ((ps.date_start <= CURDATE() AND ps.date_end > CURDATE()))' + ' ' + 'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) AS productSpecial'];
            const relations = [];
            if (request.id) {
                select.push('customerWishlist.wishlistProductId as wishlistProductId');
                relations.push({
                    tableName: 'Product.wishlist',
                    op: 'leftCond',
                    aliasName: 'customerWishlist',
                    cond: 'customerWishlist.customerId = ' + request.id,
                });
            }
            let whereConditions = [];
            let productIds:any 
            if(FuroFeaturedProductcategory!=undefined){
                const furoFeaturedProductIds = await getManager().query(`SELECT p.product_id as productId FROM product as p INNER JOIN product_to_category as ptc ON p.product_id = ptc.product_id inner join category as c ON ptc.category_id=c.category_id where p.is_featured=1 and c.name like '%sport%' limit 24`);
                console.log("data furo >>>>>>",furoFeaturedProductIds);
                //productIds=(furoProductIds[0].productId.split(",")).toString()
                 productIds = furoFeaturedProductIds.map(obj => obj.productId);
                 console.log("featured product ids************************################",productIds);
            }
            if(productIds && productIds.length>0){
  
                  whereConditions = [
                    {
                        name: 'Product.isActive',
                        op: 'and',
                        value: 1,
                    },
                    {
                        name: 'Product.productId',
                        op: 'IN',
                        value: `${productIds}`,
                    },
                ];
            }
            else{
             whereConditions = [
            {
                name: 'Product.deleteFlag',
                op: 'where',
                value: 0,
            },
            {
                name: 'Product.isFeatured',
                op: 'and',
                value: 1,
            },
            {
                name: 'Product.isActive',
                op: 'and',
                value: 1,
            },
            {
                name: 'Product.dateAvailable',
                op: 'raw',
                sign: '<=',
                value: currentDate.toString(),
            },
        ];
    }
        const search = [];
        const sort = [];
        sort.push({
            name: 'Product.sortOrder',
            order: 'ASC',
        });
        const featureProduct = await this.productService.listByQueryBuilder(limit, offset, select, whereConditions, search, relations, [], sort, false, true);
        if (count) {
            const featureProductCount = await this.productService.listByQueryBuilder(limit, offset, select, whereConditions, search, relations, [], [], true, true);
            return response.status(200).send({
                status: 1,
                message: 'Successfully get feature product count',
                data: featureProductCount,
            });
        }
        const promises = featureProduct.map(async (result: any) => {
            const temp: any = result;
            if (result.productSpecial !== null) {
                temp.pricerefer = result.productSpecial;
                temp.flag = 1;
            } else if (result.productDiscount !== null) {
                temp.pricerefer = result.productDiscount;
                temp.flag = 0;
            } else {
                temp.pricerefer = '';
                temp.flag = '';
            }
            if (result.hasStock === 1) {
                if (result.quantity <= result.outOfStockThreshold) {
                    temp.stockStatus = 'outOfStock';
                } else {
                    temp.stockStatus = 'inStock';
                }
            } else {
                temp.stockStatus = 'inStock';
            }
            if ((result.wishlistProductId !== null) && result.wishlistProductId) {
                temp.wishListStatus = 1;
            } else {
                temp.wishListStatus = 0;
            }
            return temp;
        });
        const finalResult = await Promise.all(promises);
        const successResponse: any = {
            status: 1,
            message: 'Successfully get feature product List',
            data: finalResult,
        };
        return response.status(200).send(successResponse);
    }

    // Today Deals Product List API
    /**
     * @api {get} /api/product-store/todayDeals-list Today Deals List
     * @apiGroup Store
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {Number} count count in number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get today deals product List..!!",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/product-store/todayDeals-list
     * @apiErrorExample {json} TodayDeals List error
     * HTTP/1.1 500 Internal Server Error
     */
    @UseBefore(CheckTokenMiddleware)
    @Get('/todayDeals-list')
    public async todayDealsList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('count') count: number | boolean, @Req() request: any, @Res() response: any): Promise<any> {
        const currentDate = moment().format('YYYY-MM-DD');
        const select = [
        'Product.promotionId as promotionId',
        'Product.promotionFlag as promotionFlag',
        'Product.promotionType as promotionType',
        'Product.promotionProductYid as promotionProductYid',
        'Product.promotionProductYSlug as promotionProductYSlug',
        'Product.taxType as taxType',
        'Product.taxValue as taxValue',
        'Product.productId as productId',
        'Product.name as name',
        'Product.rating as rating',
        'Product.description as description',
        'Product.location as location',
        'Product.metaTagTitle as metaTagTitle',
        'Product.todayDeals as todayDeals',
        'Product.hasStock as hasStock',
        'Product.outOfStockThreshold as outOfStockThreshold',
        'Product.quantity as quantity',
        'Product.skuId as skuId',
        'Product.isSimplified as isSimplified',
        'Product.price as price',
        'Product.isActive as isActive',
        'Product.productSlug as productSlug',
        '(SELECT pi.container_name as containerName FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as containerName',
        '(SELECT pi.image as image FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as image',
        '(SELECT pi.default_image as defaultImage FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as defaultImage',
        '(SELECT COUNT(pr.rating) as ratingCount FROM product_rating pr WHERE pr.product_id = Product.productId) as ratingCount',
        '(SELECT COUNT(pr.review) as reviewCount FROM product_rating pr WHERE pr.product_id = Product.productId AND pr.review IS NOT NULL) as reviewCount',
        'IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value` LIMIT 1), (Product.taxValue) )  as taxValue',
        'IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AS skuId',
        '(SELECT sku.sku_name as skuName FROM sku WHERE sku.id = skuId) as skuName',
        '(SELECT sku.price as price FROM sku WHERE sku.id = skuId) as skuPrice',
        '(SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = skuId AND ((pd2.date_start <= CURDATE() AND  pd2.date_end >= CURDATE())) ' +
        ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) AS productDiscount',
        '(SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = skuId AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' + 'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) AS productSpecial',
    ];
    const relations = [];
    if (request.id) {
        select.push('customerWishlist.wishlistProductId as wishlistProductId');
        relations.push({
            tableName: 'Product.wishlist',
            op: 'leftCond',
            aliasName: 'customerWishlist',
            cond: 'customerWishlist.customerId = ' + request.id,
        });
    }
        const whereConditions = [
            {
                name: 'Product.deleteFlag',
                op: 'where',
                value: 0,
            },
            {
                name: 'Product.todayDeals',
                op: 'and',
                value: 1,
            },
            {
                name: 'Product.isActive',
                op: 'and',
                value: 1,
            },
            {
                name: 'Product.dateAvailable',
                op: 'raw',
                sign: '<=',
                value: currentDate.toString(),
            },
        ];
        const search = [];
        const sort = [];
        sort.push({
            name: 'Product.sortOrder',
            order: 'ASC',
        });
        const todayDeals = await this.productService.listByQueryBuilder(limit, offset, select, whereConditions, search, relations, [], sort, false, true);
        if (count) {
            const todayDealsCount = await this.productService.listByQueryBuilder(limit, offset, select, whereConditions, search, relations, [], sort, true, true);
            return response.status(200).send({
                status: 1,
                message: 'Successfully got today deals count',
                data: todayDealsCount,
            });
        }
        const promises = todayDeals.map(async (result: any) => {
            const temp: any = result;
            if (result.productSpecial !== null) {
                temp.pricerefer = result.productSpecial;
                temp.flag = 1;
            } else if (result.productDiscount !== null) {
                temp.pricerefer = result.productDiscount;
                temp.flag = 0;
            } else {
                temp.pricerefer = '';
                temp.flag = '';
            }
            if (result.hasStock === 1) {
                if (result.quantity <= result.outOfStockThreshold) {
                    temp.stockStatus = 'outOfStock';
                } else {
                    temp.stockStatus = 'inStock';
                }
            } else {
                temp.stockStatus = 'inStock';
            }
            if ((result.wishlistProductId !== null) && result.wishlistProductId) {
                temp.wishListStatus = 1;
            } else {
                temp.wishListStatus = 0;
            }
            return temp;
        });
        const finalResult = await Promise.all(promises);
        const successResponse: any = {
            status: 1,
            message: 'Successfully got today deals List',
            data: finalResult,
        };
        return response.status(200).send(successResponse);
    }

    // Get Category API
    /**
     * @api {get} /api/product-store/Get-Category Get Category API
     * @apiGroup Store
     * @apiParam (Request body) {Number} CategoryId categoryId
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "successfully got the category.",
     *      "data":"{ }"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/product-store/Get-Category
     * @apiErrorExample {json} Category error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/Get-Category')
    public async getCategory(@QueryParam('CategoryId') CategoryId: number, @Res() response: any): Promise<any> {
        const select = ['categoryId', 'name', 'parentInt', 'sortOrder', 'categorySlug'];
        const search = [];
        const WhereConditions = [{
            name: 'categoryId',
            value: CategoryId,
        }];
        const category: any = await this.categoryService.list(0, 0, select, search, WhereConditions, 0, 0);
        const promise = category.map(async (result: any) => {
            const temp: any = result;
            const categoryLevel: any = await this.categoryPathService.find({
                select: ['level', 'pathId'],
                where: { categoryId: result.categoryId },
                order: { level: 'ASC' },
            }).then((values) => {
                const categories = values.map(async (val: any) => {
                    const categoryNames = await this.categoryService.findOne({ categoryId: val.pathId });
                    const tempVal: any = val;
                    tempVal.categoryName = categoryNames.name;
                    return tempVal;
                });
                const results = Promise.all(categories);
                return results;
            });
            temp.levels = categoryLevel;
            return temp;
        });
        const value = await Promise.all(promise);
        if (category) {
            const successResponse: any = {
                status: 1,
                message: 'successfully got the category. ',
                data: value,
            };
            return response.status(200).send(successResponse);
        }
    }

    // Get product rating/review API
    /**
     * @api {get} /api/product-store/Get-Product-rating Get product Rating API
     * @apiGroup Store
     * @apiParam (Request body) {Number} productId productId
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {Number} count count in number
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "successfully got the product rating and review.",
     *      "data":"{ }"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/product-store/Get-Product-rating
     * @apiErrorExample {json} Product error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/Get-Product-rating')
    public async getProductRating(@QueryParam('productId') productId: string, @QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
       
        const productDetail: any = await this.productService.findOne({
            productSlug: productId,
        });
        if (!productDetail) {
            const errorResponse: any = {
                status: 1,
                message: 'Invalid product.',
            };
            return response.status(404).send(errorResponse);
        }
        const select = ['ratingId', 'review', 'rating', 'createdDate', 'firstName', 'lastName', 'productId', 'customerId', 'isActive','isCommentApproved'];
        const relation = [];
        const WhereConditions = [
            {
                name: 'productId',
                op: 'where',
                value: productDetail.productId,
            }, {
                name: 'isActive',
                op: 'where',
                value: 1,
            },
        ];
        const rating: any = await this.productRatingService.list(limit, offset, select, relation, WhereConditions, count);
        
        const productReviewImageQuery = getManager().getRepository(ProductReviewImages).createQueryBuilder("pri");
        const promise = rating.map(async (result: any) => {
            const temp: any = result;
            const customer: any = await this.customerService.findOne({
                select: ['firstName', 'avatar', 'avatarPath'],
                where: { id: result.customerId },
            });
            const val = Object.assign({}, temp, customer);

            
            productReviewImageQuery.select(["image AS image", "container_name AS containerName"])
            productReviewImageQuery.where("review_fk_id = :rfId", {rfId: result.ratingId});
            let reviewImages = await productReviewImageQuery.getRawMany();
           
            val.reviewImages = reviewImages;
            return val;
        });
        const value = await Promise.all(promise);
        if (value) {
            const successResponse: any = {
                status: 1,
                message: 'successfully got the product Rating. ',
                data: value,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 1,
                message: 'unable to get product Rating.',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Get product rating/review  countAPI
    /**
     * @api {get} /api/product-store/get-rating-statistics Get Rating Statistics API
     * @apiGroup Store
     * @apiParam (Request body) {Number} productId productId
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "successfully got the product rating and review statistics.",
     *      "data":"{ }"
     *      "status": "1"
     * }
     * @apiSampleRequest /api/product-store/get-rating-statistics
     * @apiErrorExample {json} Product error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/get-rating-statistics')
    public async getRatingStatistics(@QueryParam('productId') id: number, @Res() response: any): Promise<any> {
        const ratings: any = [];
        for (let stars = 1; stars <= 5; stars++) {
            const WhereConditions = [
                {
                    name: 'rating',
                    op: 'where',
                    value: stars,
                }, {
                    name: 'productId',
                    op: 'where',
                    value: id,
                }, {
                    name: 'isActive',
                    op: 'where',
                    value: 1,
                },
            ];
            const count = 1;
            const star = await this.productRatingService.list(0, 0, 0, 0, WhereConditions, count);
            ratings.push(star);
        }
        const totalRatingReview = await this.productRatingService.ratingStatistics(id);
        const starsCount = { oneStar: ratings[0], twoStar: ratings[1], threeStar: ratings[2], fourStar: ratings[3], fiveStar: ratings[4] };
        if (starsCount) {
            const successResponse: any = {
                status: 1,
                message: 'successfully got the product ratings & review count.',
                data: { starsCount, totalRatingReview },
            };
            return response.status(200).send(successResponse);
        }
    }

    // Product Compare API
    /**
     * @api {get} /api/product-store/product-compare Product Compare API
     * @apiGroup Store
     * @apiParam (Request body) {String} productId productId
     * @apiParam (Request body) {String} data data
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully Product Compared",
     *      "status": "1",
     *      "data": {},
     * }
     * @apiSampleRequest /api/product-store/product-compare
     * @apiErrorExample {json} product compare error
     * HTTP/1.1 500 Internal Server Error
     */

    @Get('/Product-Compare')
    public async productCompare(@QueryParam('productId') productId: string, @QueryParam('data') data: string, @Res() response: any): Promise<any> {
        const productid = productId.split(',');
        if (productid.length === 0) {
            return response.status(200).send({
                status: 1,
                data: [],
            });
        }
        if (productid.length === 1) {
            if (data === '0') {
                const Response: any = {
                    status: 1,
                    message: 'Product Compared Successfully ',
                };
                return response.status(200).send(Response);
            } else {
                const Detail = [];
                const List = await this.productService.findOne({ where: { productId: productid } });
                const defaultValue = await this.productImageService.findOne({
                    where: {
                        productId: List.productId,
                        defaultImage: 1,
                    },
                });
                const temp: any = List;
                const manufacturer = await this.manufacturerService.findOne({ manufacturerId: List.manufacturerId });
                const where = [{
                    name: 'productId',
                    op: 'where',
                    value: List.productId,
                }];
                const rating = await this.productRatingService.list(0, 0, 0, 0, where, true);
                const whereCondition = [
                    {
                        name: 'ProductRating.productId',
                        op: 'where',
                        value: List.productId,
                    },
                    {
                        name: 'ProductRating.review',
                        op: 'NOT',
                    },
                ];
                const review = await this.productRatingService.listByQueryBuilder(0, 0, 0, whereCondition, 0, 0, 0, 0, true);
                temp.ratingCount = rating ? rating : 0;
                temp.reviewCount = review ? review : 'null';
                temp.manufacturerName = manufacturer ? manufacturer.name : '';
                temp.skuName = '';
                let skuValue = undefined;
                let skuId = undefined;
                if (List.isSimplified === 1) {
                    skuValue = await this.skuService.findOne({ id: List.skuId });
                    if (skuValue) {
                        temp.price = skuValue.price;
                        temp.skuName = skuValue.skuName;
                        skuId = skuValue.id;
                    }
                } else {
                    skuValue = await this.productVarientOptionService.findOne({ productId: List.productId, isActive: 1 });
                    if (skuValue) {
                        const productVarientSku = await this.skuService.findOne({ id: skuValue.skuId });
                        if(productVarientSku){
                        temp.price = productVarientSku.price;
                        temp.skuName = productVarientSku.skuName;
                        skuId = productVarientSku.id;
                        }
                    } else {
                        const sku = await this.skuService.findOne({ id: List.skuId });
                        if (sku) {
                            temp.price = sku.price;
                            temp.skuName = sku.skuName;
                            skuId = sku.id;
                        }
                    }
                }
                if (skuId) {
                    const nowDate = new Date();
                    const todaydate = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
                    const productSpecial = await this.productSpecialService.findSpecialPriceWithSku(List.productId, skuId, todaydate);
                    const productDiscount = await this.productDiscountService.findDiscountPricewithSku(List.productId, skuId, todaydate);
                    if (productSpecial !== undefined) {
                        temp.pricerefer = productSpecial.price;
                        temp.flag = 1;
                    } else if (productDiscount !== undefined) {
                        temp.pricerefer = productDiscount.price;
                        temp.flag = 0;
                    } else {
                        temp.pricerefer = '';
                        temp.flag = '';
                    }
                } else {
                    temp.pricerefer = '';
                    temp.flag = '';
                }
                if (List.taxType === 2) {
                    const tax = await this.taxService.findOne({ taxId: List.taxValue });
                    if (tax) {
                        temp.taxValue = tax.taxPercentage;
                    } else {
                        temp.taxValue = '';
                    }
                }
                temp.productImage = defaultValue;
                if (List.hasStock === 1) {
                    if (List.quantity <= List.outOfStockThreshold) {
                        temp.stockStatus = 'outOfStock';
                    } else {
                        temp.stockStatus = 'inStock';
                    }
                } else {
                    temp.stockStatus = 'inStock';
                }
                Detail.push(temp);
                const Response: any = {
                    status: 1,
                    message: 'Product Compared Successfully',
                    data: Detail,
                };
                return response.status(200).send(Response);
            }
        } else {
            if (data === '0') {
                const categoryDataDetail = [];
                // product find the which category
                for (const id of productid) {
                    const categoryId = await this.productToCategoryService.findAll({ where: { productId: id } });
                    const categoryDataValue = categoryId.map((item: any) => {
                        return item.categoryId;
                    });
                    categoryDataDetail.push(categoryDataValue);
                }
                let categoryData;
                if (categoryDataDetail.length === 2) {
                    categoryData = categoryDataDetail[0].filter(e => categoryDataDetail[1].indexOf(e) !== -1);
                } else {
                    const intersectionsTwo = categoryDataDetail[0].filter(e => categoryDataDetail[1].indexOf(e) !== -1);
                    categoryData = intersectionsTwo.filter(e => categoryDataDetail[2].indexOf(e) !== -1);
                }
                if (categoryData.length === 0) {
                    const errorResponse: any = {
                        status: 1,
                        message: 'please choose same category product',
                    };
                    return response.status(400).send(errorResponse);
                }
                const successResponse: any = {
                    status: 1,
                    message: 'Product Compared Successfully',
                };
                return response.status(200).send(successResponse);
            } else {
                const productDataDetail = [];
                const categoryDataDetail = [];
                // product find the which category
                for (const id of productid) {
                    const categoryId = await this.productToCategoryService.findAll({ where: { productId: id } });
                    const categoryDataValue = categoryId.map((item: any) => {
                        return item.categoryId;
                    });
                    categoryDataDetail.push(categoryDataValue);
                }
                let categoryData;
                if (categoryDataDetail.length === 2) {
                    categoryData = categoryDataDetail[0].filter(e => categoryDataDetail[1].indexOf(e) !== -1);
                } else {
                    const intersectionsTwo = categoryDataDetail[0].filter(e => categoryDataDetail[1].indexOf(e) !== -1);
                    categoryData = intersectionsTwo.filter(e => categoryDataDetail[2].indexOf(e) !== -1);
                }
                if (categoryData.length === 0) {
                    const errorResponse: any = {
                        status: 1,
                        message: 'please choose same category product',
                    };
                    return response.status(400).send(errorResponse);
                }
                let productListData;
                // find the product to compare
                for (const id of productid) {
                    productListData = await this.productService.findOne(id);
                    const defaultValue = await this.productImageService.findOne({
                        where: {
                            productId: productListData.productId,
                            defaultImage: 1,
                        },
                    });
                    const temp: any = productListData;
                    const manufacturer = await this.manufacturerService.findOne({ manufacturerId: productListData.manufacturerId });
                    const where = [{
                        name: 'productId',
                        op: 'where',
                        value: productListData.productId,
                    }];
                    const rating = await this.productRatingService.list(0, 0, 0, 0, where, true);
                    const whereCondition = [
                        {
                            name: 'ProductRating.productId',
                            op: 'where',
                            value: productListData.productId,
                        },
                        {
                            name: 'ProductRating.review',
                            op: 'NOT',
                        },
                    ];
                    const review = await this.productRatingService.listByQueryBuilder(0, 0, 0, whereCondition, 0, 0, 0, 0, true);
                    temp.ratingCount = rating ? rating : 0;
                    temp.reviewCount = review ? review : 'null';
                    temp.manufacturerName = manufacturer ? manufacturer.name : '';
                    temp.skuName = '';
                    let skuValue = undefined;
                    let skuId = undefined;
                    if (productListData.isSimplified === 1) {
                            skuValue = await this.skuService.findOne({ id: productListData.skuId });
                            if (skuValue) {
                            temp.price = skuValue.price;
                            temp.skuName = skuValue.skuName;
                            skuId = skuValue.id;
                        }
                    } else {
                        skuValue = await this.productVarientOptionService.findOne({ productId: productListData.productId, isActive: 1 });
                        const productVarientSku = await this.skuService.findOne({ id: skuValue.skuId });
                        if (skuValue && productVarientSku) {
                            temp.price = productVarientSku.price;
                            temp.skuName = productVarientSku.skuName;
                            skuId = productVarientSku.id;
                        } else {
                            const sku = await this.skuService.findOne({ id: productListData.skuId });
                            if (sku) {
                                temp.price = sku.price;
                                temp.skuName = sku.skuName;
                                skuId = sku.id;
                            }
                        }
                    }
                    if (skuId) {
                        const nowDate = new Date();
                        const todaydate = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
                        const productSpecial = await this.productSpecialService.findSpecialPriceWithSku(productListData.productId, skuId, todaydate);
                        const productDiscount = await this.productDiscountService.findDiscountPricewithSku(productListData.productId, skuId, todaydate);
                        if (productSpecial !== undefined) {
                            temp.pricerefer = productSpecial.price;
                            temp.flag = 1;
                        } else if (productDiscount !== undefined) {
                            temp.pricerefer = productDiscount.price;
                            temp.flag = 0;
                        } else {
                            temp.pricerefer = '';
                            temp.flag = '';
                        }
                    } else {
                        temp.pricerefer = '';
                        temp.flag = '';
                    }
                    if (productListData.taxType === 2) {
                        const tax = await this.taxService.findOne({ taxId: productListData.taxValue });
                        if (tax) {
                            temp.taxValue = tax.taxPercentage;
                        } else {
                            temp.taxValue = '';
                        }
                    }
                    temp.productImage = defaultValue;
                    if (productListData.hasStock === 1) {
                        if (productListData.quantity <= productListData.outOfStockThreshold) {
                            temp.stockStatus = 'outOfStock';
                        } else {
                            temp.stockStatus = 'inStock';
                        }
                    } else {
                        temp.stockStatus = 'inStock';
                    }
                    productDataDetail.push(temp);
                }
                const successResponse: any = {
                    status: 1,
                    message: 'Product Compared Successfully',
                    data: productDataDetail,
                };
                return response.status(200).send(successResponse);
            }
        }
    }
    // Product Search list Api
    /**
     * @api {get} /api/product-store/productSearchList Product Search List API
     * @apiGroup Store
     * @apiParam (Request body) {String} keyword Product Name
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1"
     *      "message": "Successfully get product list",
     *      "data":"{}"
     * }
     * @apiSampleRequest /api/product-store/productSearchList
     * @apiErrorExample {json} productSearchList error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/productSearchList')
    public async productSearchList( @QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @Res() response: any, @Req() request: any): Promise<any> {
        const select = [
            'Product.productId as productId',
            'Product.sku as sku',
            'Product.name as name',
            'Product.quantity as quantity',
            'Product.price as price',
            'Product.isFeatured as isFeatured',
            'Product.todayDeals as todayDeals',
            'Product.productSlug as productSlug',
            'Product.isActive as isActive',
        ];
        const relations = [];
        const currentDate = moment().format('YYYY-MM-DD');
        const whereConditions = [];
         whereConditions.push({
            name: 'Product.isActive',
            op: 'and',
            value: 1,
        }, {
            name: 'Product.dateAvailable',
            op: 'raw',
            sign: '<=',
            value: currentDate.toString(),
        });
        const searchConditions = [];
        if (keyword !== '') {
            searchConditions.push({
                name: ['Product.search_keywords'],
                value: keyword,
            });
        }
        const productSearchList = await this.productService.listByQueryBuilder( limit, offset, select, whereConditions, searchConditions, relations, [], [], false, true);
        const productList = productSearchList.map(async (value: any) => {
            const temp = value;
            const defaultValue = await this.productImageService.findOne({
                where: {
                    productId: value.productId,
                    defaultImage: 1,
                },
            });
            temp.productImage = defaultValue;
            const productToCategory = await this.productToCategoryService.findOne({
                where: {
                    productId: value.productId,
                    isActive: 1,
                },
            });
            if (productToCategory) {
                const category = await this.categoryService.findOne({
                    select: ['categoryId', 'name', 'isActive', 'categorySlug'],
                    where: {
                        categoryId: productToCategory.categoryId,
                        isActive: 1,
                    },
                });
                temp.categoryName = category;
            } else {
                temp.categoryName = '';
            }
            return temp;
        });
        const results = await Promise.all(productList);
        if (productSearchList) {
            const successReponse: any = {
                status: 1,
                message: 'Successfully got a product search list.',
                data: results,
            };
            return response.status(200).send(successReponse);
        }
    }

    @Get("/product-varient-list")
    public async productVarientList(@QueryParam('productId') productId:any, @Req() request: any, @Res() response: any): Promise<any>{
     await createQueryBuilder("product_varient")
     .innerJoin("product_varient.varients_id", "varients.id")
     .where('product_varient.product_id = :product_id', {productId})
     .getMany()

     
    //  const user = await createQueryBuilder("user")
    //  .innerJoin("user.photos", "photo")
    //  .where("user.name = :name", { name: "Timber" })
    //  .getOne()
     //'v.name', 'vv.value_name'
    }

    @Get('/productdetailById')
    public async productDetailById(@QueryParam('productId') productId:any, @Req() request: any, @Res() response: any): Promise<any> {
        const productDetail: any = await this.productService.findOne({
                productId: productId,
               // isActive: 1,
        });
        if (!productDetail) {
            const errResponse: any = {
                status: 0,
                message: 'Invalid product',
            };
            return response.status(404).send(errResponse);
        }
        const date = new Date ();
        if (productDetail.dateAvailable > date) {
            return response.status(404).send({
                status: 0,
                message: 'Invalid product',
            });
        }
        const productDetails: any = classToPlain(productDetail);
        if (productDetails.taxType === 2) {
            const tax = await this.taxService.findOne({ taxId: productDetails.taxValue });
            if (tax) {
                productDetails.taxValue = tax.taxPercentage;
            } else {
                productDetails.taxValue = '';
            }
        }
        const where = [{
            name: 'productId',
            op: 'where',
            value:  productDetail.productId,
        }];
        const rating = await this.productRatingService.list(0, 0, 0, 0, where, true);
        const whereConditions = [
            {
                name: 'ProductRating.productId',
                op: 'where',
                value:  productDetail.productId,
            },
                {
                    name: 'ProductRating.review',
                    op: 'NOT',
                },
        ];
        const review = await this.productRatingService.listByQueryBuilder(0, 0, 0, whereConditions, 0, 0, 0, 0, true);
        productDetails.ratingCount = rating ? rating : 0;
        productDetails.reviewCount = review ? review : 'null';
        const manufacturer = await this.manufacturerService.findOne({ manufacturerId: productDetails.manufacturerId });
        productDetails.manufacturerName = manufacturer ? manufacturer.name : '';
        productDetails.productImage = await this.productImageService.findAll({
            select: ['productId', 'image', 'containerName', 'defaultImage'],
            where: {
                productId: productDetail.productId,
            },
        });
        productDetails.productOriginalImage = productDetails.productImage.slice();
        productDetails.Category = await this.productToCategoryService.findAll({
            select: ['categoryId', 'productId'],
            where: { productId: productDetail.productId },
        }).then((val) => {
            const category = val.map(async (value: any) => {
                const categoryNames = await this.categoryService.findOne({ categoryId: value.categoryId });
                const temp: any = value;
                if (categoryNames !== undefined) {
                    temp.categoryName = categoryNames.name;
                    temp.categorySlug = categoryNames.categorySlug;
                } else {
                    temp.categoryName = '';
                    temp.categorySlug = '';
                }
                return temp;
            });
            const results = Promise.all(category);
            return results;
        });
        productDetails.productOption = [];
        productDetails.skuName = '';
        productDetails.skuId = productDetails.skuId ? productDetails.skuId : '';
        productDetails.variantName = '';
        productDetails.variantId = '';
        let skuValue = undefined;
        let skuId = undefined;
        if (productDetails.isSimplified === 1) {
            skuValue = await this.skuService.findOne({ id: productDetails.skuId });
            if (skuValue) {
                productDetails.price = skuValue.price;
                productDetails.skuName = skuValue.skuName;
                productDetails.skuId = skuValue.skuId;
                productDetails.outOfStockThreshold = skuValue.outOfStockThreshold;
                productDetails.notifyMinQuantity = skuValue.notifyMinQuantity;
                productDetails.minQuantityAllowedCart = skuValue.minQuantityAllowedCart;
                productDetails.maxQuantityAllowedCart = skuValue.maxQuantityAllowedCart;
                productDetails.enableBackOrders = skuValue.enableBackOrders;
                if (productDetails.hasStock === 1) {
                    if (skuValue.quantity <= skuValue.outOfStockThreshold) {
                        productDetails.stockStatus = 'outOfStock';
                    } else {
                        productDetails.stockStatus = 'inStock';
                    }
                } else {
                    productDetails.stockStatus = 'inStock';
                }
                skuId = skuValue.id;
            }
        } else {
            skuValue = await this.productVarientOptionService.findOne({ productId: productDetail.productId, isActive: 1 });
            if (skuValue) {
                productDetails.variantName = skuValue.varientName;
                productDetails.variantId = skuValue.id;
                const image = await this.productVarientOptionImageService.findAll({
                    select: ['id', 'image', 'containerName', 'defaultImage', 'productVarientOptionId'],
                    where: { productVarientOptionId: skuValue.id },
                });
                if (image && image.length > 0) {
                    const tempImage = productDetails.productImage.map(element => {
                        return Object.assign({}, element, {
                            defaultImage: 0,
                        });
                    });
                    image[0].defaultImage = 1;
                    tempImage.unshift(image[0]);
                    productDetails.productImage = tempImage;
                }
                const selectedVariant: any = {};
                const productVarientOption = await this.productVarientOptionDetailService.findAll({
                    select: ['id', 'productVarientOptionId', 'varientsValueId'],
                    where: { productVarientOptionId: skuValue.id },
                }).then((varientValue) => {
                    const varientValueList = varientValue.map(async (vv: any) => {
                        const tempValue: any = vv;
                        const varientValueData = await this.varientsValueService.findOneData({
                            select: ['id', 'valueName', 'varientsId'],
                            where: { id: vv.varientsValueId },
                        });
                        if (varientValueData !== undefined) {
                            selectedVariant[varientValueData.varientsId] = vv.varientsValueId;
                        }
                        tempValue.valueName = (varientValueData !== undefined) ? varientValueData.valueName : '';
                        return tempValue;
                    });
                    const rslt = Promise.all(varientValueList);
                    return rslt;
                });
                const productVarientSku = await this.skuService.findOne({ id: skuValue.skuId });
                if(productVarientSku){
                productDetails.price = productVarientSku.price;
                productDetails.skuName = productVarientSku.skuName;
                productDetails.skuId = productVarientSku.skuId;
                productDetails.productVarientOption = productVarientOption;
                productDetails.selectedVariant = selectedVariant;
                productDetails.outOfStockThreshold = productVarientSku.outOfStockThreshold;
                productDetails.notifyMinQuantity = productVarientSku.notifyMinQuantity;
                productDetails.minQuantityAllowedCart = productVarientSku.minQuantityAllowedCart;
                productDetails.maxQuantityAllowedCart = productVarientSku.maxQuantityAllowedCart;
                productDetails.enableBackOrders = productVarientSku.enableBackOrders;
                
                if (productDetails.hasStock === 1) {
                    if (productVarientSku.quantity <= productVarientSku.outOfStockThreshold) {
                        productDetails.stockStatus = 'outOfStock';
                    } else {
                        productDetails.stockStatus = 'inStock';
                    }
                } else {
                    productDetails.stockStatus = 'inStock';
                }
                skuId = productVarientSku.id;
            }
            }
        }
        if (skuId) {
            const nowDate = new Date();
            const todaydate = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
            const productSpecial = await this.productSpecialService.findSpecialPriceWithSku(productDetail.productId, skuId, todaydate);
            const productDiscount = await this.productDiscountService.findDiscountPricewithSku(productDetail.productId, skuId, todaydate);
            if (productSpecial !== undefined) {
                productDetails.pricerefer = productSpecial.price;
                productDetails.flag = 1;
            } else if (productDiscount !== undefined) {
                productDetails.pricerefer = productDiscount.price;
                productDetails.flag = 0;
            } else {
                productDetails.pricerefer = '';
                productDetails.flag = '';
            }
            productDetails.productTirePrices = await this.productTirePriceService.findAll({
                select: ['id', 'quantity', 'price'],
                where: { productId: productDetail.productId, skuId },
            });
        } else {
            productDetails.pricerefer = '';
            productDetails.flag = '';
            productDetails.productTirePrices = await this.productTirePriceService.findAll({
                select: ['id', 'quantity', 'price'],
                where: { productId: productDetail.productId },
            });
        }
        if (request.id) {
            let customerId;
            customerId = request.id;
            const wishStatus = await this.customerWishlistService.findOne({
                where: {
                    productId: productDetail.productId,
                    customerId,
                },
            });
            const orderProduct = await this.orderProductService.buyedCount(productDetail.productId, customerId);
            if (orderProduct.length > 0) {
                productDetails.buyed = 1;
            } else {
                productDetails.buyed = 0;
            }
            if (wishStatus) {
                productDetails.wishListStatus = 1;
            } else {
                productDetails.wishListStatus = 0;
            }
            const customerDetail = await this.customerService.findOne({ where: { id: customerId } });
            const customerActivity = new CustomerActivity();
            customerActivity.customerId = customerId;
            customerActivity.activityId = 2;
            customerActivity.description = 'productviewed';
            customerActivity.productId = productDetail.productId;
            await this.customerActivityService.create(customerActivity);
            const viewLog: any = new ProductViewLog();
            viewLog.productId = productDetail.productId;
            viewLog.customerId = customerDetail.id;
            viewLog.firstName = customerDetail.firstName;
            viewLog.lastName = customerDetail.lastName;
            viewLog.username = customerDetail.username;
            viewLog.email = customerDetail.email;
            viewLog.mobileNumber = customerDetail.mobileNumber;
            viewLog.address = customerDetail.address;
            await this.productViewLogService.create(viewLog);
        } else {
            productDetails.wishListStatus = 0;
            productDetails.buyed = 0;
        }
        productDetails.questionList = await this.productQuestionService.findAll({
            select: ['questionId', 'productId', 'question', 'type', 'referenceId', 'createdDate'],
            where: { productId: productDetail.productId, isActive: 1 },
            limit: 4,
        }).then((val) => {
            const user = val.map(async (value: any) => {
                const referenceId = value.referenceId;
                const type = value.type;
                const temp: any = value;
                if (type && type === 2) {
                    const customer = await this.customerService.findOne({
                        select: ['id', 'firstName', 'avatar', 'avatarPath', 'city'],
                        where: { id: referenceId },
                    });
                    if (customer !== undefined) {
                        temp.postedBy = customer;
                    }
                } else {
                    const adminUser = await this.userService.findOne({
                        select: ['userId', 'firstName', 'avatar', 'avatarPath'],
                        where: { userId: referenceId },
                    });
                    if (adminUser !== undefined) {
                        temp.postedBy = adminUser;
                    }
                }
                return temp;
            });
            const resultData = Promise.all(user);
            return resultData;
        });
        // product video
        productDetails.productVideo = await this.productVideoService.findOne({
            select: ['id', 'name', 'path', 'type', 'productId'],
            where: { productId: productDetail.productId },
        });
        productDetails.productVarient = await this.productVarientService.findAll({
            select: ['id', 'varientsId', 'productId'],
            where: { productId: productDetail.productId },
        }).then((val) => {
            const varientDetail = val.map(async (value: any) => {
                const varients = await this.varientsService.findOne({ where: { id: value.varientsId } });
                if (varients) {
                    varients.varientsValue = await this.varientsValueService.find({ where: { varientsId: varients.id } });
                    const temp: any = varients;
                    return temp;
                }
            });
            const results = Promise.all(varientDetail);
            return results;
        });
        productDetails.productvarientList = await this.productVarientOptionService.findAll({
            select: ['id', 'productId', 'skuId', 'varientName', 'isActive', 'createdDate'],
            where: { productId: productDetail.productId, isActive: 1 },
        }).then((val) => {
            const productVarList = val.map(async (value: any) => {
                const temp: any = value;
                const sku = await this.skuService.findOne({
                    where: { id: value.skuId },
                });
                const image = await this.productVarientOptionImageService.findAll({
                    select: ['id', 'image', 'containerName', 'defaultImage', 'productVarientOptionId'],
                    where: { productVarientOptionId: value.id },
                });
                const productVarientOption = await this.productVarientOptionDetailService.findAll({
                    select: ['id', 'productVarientOptionId', 'varientsValueId'],
                    where: { productVarientOptionId: value.id },
                }).then((varientValue) => {
                    const varientValueList = varientValue.map(async (vv: any) => {
                        return vv.varientsValueId;
                    });
                    const rslt = Promise.all(varientValueList);
                    return rslt;
                });
                temp.skuName = sku.skuName;
                temp.skuId = sku.id;
                temp.price = sku.price;
                temp.quantity = sku.quantity;
                temp.optionImage = image;
                temp.productVarientOption = productVarientOption;
                temp.outOfStockThreshold = sku.outOfStockThreshold;
                temp.hasStock = sku.hasStock;
                temp.notifyMinQuantity = sku.notifyMinQuantity;
                temp.minQuantityAllowedCart = sku.minQuantityAllowedCart;
                temp.maxQuantityAllowedCart = sku.maxQuantityAllowedCart;
                temp.enableBackOrders = sku.enableBackOrders;
                if (productDetails.hasStock === 1) {
                    if (sku.quantity <= sku.outOfStockThreshold) {
                        temp.stockStatus = 'outOfStock';
                    } else {
                        temp.stockStatus = 'inStock';
                    }
                } else {
                    temp.stockStatus = 'inStock';
                }
                if (sku) {
                    const nowDate = new Date();
                    const todaydate = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
                    const productSpecial = await this.productSpecialService.findSpecialPriceWithSku(productDetail.productId, sku.id, todaydate);
                    const productDiscount = await this.productDiscountService.findDiscountPricewithSku(productDetail.productId, sku.id, todaydate);
                    if (productSpecial !== undefined) {
                        temp.pricerefer = productSpecial.price;
                        temp.flag = 1;
                    } else if (productDiscount !== undefined) {
                        temp.pricerefer = productDiscount.price;
                        temp.flag = 0;
                    } else {
                        temp.pricerefer = '';
                        temp.flag = '';
                    }
                    temp.productTirePrices = await this.productTirePriceService.findAll({
                        select: ['id', 'quantity', 'price'],
                        where: { productId: productDetail.productId, skuId: sku.id },
                    });
                } else {
                    temp.pricerefer = '';
                    temp.flag = '';
                    temp.productTirePrices = await this.productTirePriceService.findAll({
                        select: ['id', 'quantity', 'price'],
                        where: { productId: productDetail.productId },
                    });
                }
                return temp;
            });
            const resultData = Promise.all(productVarList);
            return resultData;
        });
        const successResponse: any = {
            status: 1,
            message: 'Successfully got productDetail',
            data: productDetails,
        };
        return response.status(200).send(successResponse);
    }

    @Get('/search-product-by-keyword')
    public async searchProductByKeyword(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @Res() response: any, @Req() request: any): Promise<any> {
        let resultFinal = [];
        if(!keyword.startsWith(" ")){
        const searchedKeywords = keyword.split(" ");
        let sqlStr = "";
        if (searchedKeywords.length == 1) {
            
            sqlStr += `pro.search_keywords LIKE "%${searchedKeywords}%" `
        } else {
            for (let i = 0; i < searchedKeywords.length; i++) {
                if (i == searchedKeywords.length - 1) {
                    
                    if (!keyword.endsWith(" ")) {
                        
                        sqlStr += ` pro.search_keywords LIKE "%${searchedKeywords[i]}%"`
                    }
                } else {
                    
                    if (searchedKeywords[i].length > 0) {
                        sqlStr += `pro.search_keywords LIKE "%${searchedKeywords[i]}%" AND `
                    }
                }
            }
        }
        const checkAnd = sqlStr.substring(sqlStr.length - 4);
        if (checkAnd == "AND ") {
            sqlStr = sqlStr.substring(0, sqlStr.length - 4);
        }
       
        let searchResults = await getManager().query(`SELECT cat.category_id AS categoryId, cat.name AS name, cat.category_slug AS categorySlug, cat.is_active AS isActive FROM product pro INNER JOIN product_to_category pc ON(pro.product_id = pc.product_id) INNER JOIN category cat ON (pc.category_id = cat.category_id) WHERE cat.is_active = 1 AND pro.is_active=1 AND ${sqlStr} GROUP BY cat.category_id`);
      //  resultFinal = searchResults;

       if(searchResults && searchResults.length > 0){
        for(let i=0; i<searchResults.length;i++){
            const catInfo = await getManager().query(`SELECT parent_int AS parentCategoryId, name AS parentCategoryName, category_slug AS parentCategorySlug FROM category WHERE category_id = (SELECT parent_int FROM category WHERE category_id = ${searchResults[i].categoryId})`);
            
            if(catInfo && catInfo.length > 0 ){
                resultFinal.push({categoryId:searchResults[i].categoryId, categorySlug:searchResults[i].categorySlug, isActive:searchResults[i].isActive, name:searchResults[i].name,  parentCategoryId: catInfo[0].parentCategoryId, parentCategoryName: catInfo[0].parentCategoryName, parentCategorySlug: catInfo[0].parentCategorySlug})
            }
            else{
                resultFinal.push({categoryId:searchResults[i].categoryId, categorySlug:searchResults[i].categorySlug, isActive:searchResults[i].isActive, name:searchResults[i].name, parentCategoryId: searchResults[i].categoryId, parentCategoryName: searchResults[i].name, parentCategorySlug:searchResults[i].categorySlug})
            }

        }
       }
    }
       
        const successResponse: any = {
            status: 1,
            message: 'Successfully got searched items',
            data: resultFinal,
        };
        return response.status(200).send(successResponse);

    }

    @Get('/get-customer-recent-view-products')
    @UseBefore(CheckCustomerMiddleware)
    public async getCustomerRecentViewProducts(@Res() response: any, @Req() request: any): Promise<any> {
        createQueryBuilder()
        const customerId = request.user.id;

        const querySelect =  await getManager().query(`SELECT GROUP_CONCAT(product_id) pids FROM customer_activity WHERE customer_id = ${customerId} AND description = 'productviewed'`)
        const successResponse: any = {
            status: 1,
            message: 'Successfully got searched items',
            data: querySelect[0].pids,
        };
        return response.status(200).send(successResponse);
    }

    @Get('/get-products-removed-from-cart')
    @UseBefore(CheckCustomerMiddleware)
    public async getProductsRemovedFromCart(@Res() response: any, @Req() request: any): Promise<any> {
        createQueryBuilder()
        const customerId = request.user.id;

        const querySelect =  await getManager().query(`SELECT GROUP_CONCAT(product_id) pids FROM customer_activity WHERE customer_id = ${customerId} AND description = 'productRemovedFromCart'`)
        const successResponse: any = {
            status: 1,
            message: 'Successfully got searched items',
            data: querySelect[0].pids,
        };
        return response.status(200).send(successResponse);
    }

}


