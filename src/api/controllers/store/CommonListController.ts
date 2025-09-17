/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import 'reflect-metadata';
import { Get, JsonController, Res, Req, QueryParam, Body, Post, Param, QueryParams, UseBefore } from 'routing-controllers';
import { BannerService } from '../../services/BannerService';
import { MAILService } from '../../../auth/mail.services';
import { classToPlain } from 'class-transformer';
import { CategoryService } from '../../services/CategoryService';
import { ProductService } from '../../services/ProductService';
import arrayToTree from 'array-to-tree';
import { ProductRelated } from '../../models/ProductRelated';
import { ProductRelatedService } from '../../services/ProductRelatedService';
import { ProductImageService } from '../../services/ProductImageService';
import { CustomerWishlistService } from '../../services/CustomerWishlistService';
import jwt from 'jsonwebtoken';
import { CountryService } from '../../services/CountryService';
import { ContactService } from '../../services/ContactService';
import { ContactRequest } from './requests/ContactRequest';
import { Contact } from '../../models/Contact';
import { EmailTemplateService } from '../../services/EmailTemplateService';
import { ZoneService } from '../../services/zoneService';
import { LanguageService } from '../../services/LanguageService';
import { ProductDiscountService } from '../../services/ProductDiscountService';
import { ProductSpecialService } from '../../services/ProductSpecialService';
import { ProductToCategoryService } from '../../services/ProductToCategoryService';
import { CategoryPathService } from '../../services/CategoryPathService';
import { PluginService } from '../../services/PluginService';
import { UserService } from '../../services/UserService';
import { BlogService } from '../../services/BlogService';
import { CustomerService } from '../../services/CustomerService';
import { OrderStatusService } from '../../services/OrderStatusService';
import { TaxService } from '../../services/TaxService';
import { BlogRelatedService } from '../../services/BlogRelatedService';
import { OrderProductService } from '../../services/OrderProductService';
import { OrderProductLogService } from '../../services/OrderProductLogService';
import { ProductQuestionService } from '../../services/ProductQuestionService';
import { ProductAnswerService } from '../../services/ProductAnswerService';
import { ProductAnswerLikeService } from '../../services/ProductAnswerLikeDislikeService';
import { SettingService } from '../../services/SettingService';
import { env } from '../../../env';
import { SkuService } from '../../services/SkuService';
import { ProductVarientOptionService } from '../../services/ProductVarientOptionService';
import { ListRequest } from './requests/ListRequest';
import { ProductRatingService } from '../../services/RatingService';
import moment = require('moment');
import { CheckTokenMiddleware } from '../../middlewares/checkTokenMiddleware';
import { MoreThan, createQueryBuilder, getManager } from 'typeorm';
// import { Varients } from '../../models/Varients';
// import { VarientsValue } from '../../models/VarientsValue';
import {OrderProduct} from '../../models/OrderProduct'
import { CommonService } from '../../common/commonService';
import { ProductVarientOption } from '../../models/ProductVarientOption';
// import { ProductVarientOptionDetail } from '../../models/ProductVarientOptionDetail';
import { Sku } from '../../models/SkuModel';
import { DiscountOffer } from '../../models/DiscountOffer';
@JsonController('/list')
export class CommonListController {
    constructor(
        private bannerService: BannerService,
        private taxService: TaxService, private categoryService: CategoryService, private productRelatedService: ProductRelatedService,
        private productService: ProductService, private productImageService: ProductImageService, private languageService: LanguageService,
        private customerWishlistService: CustomerWishlistService, private countryService: CountryService, private contactService: ContactService,
        private emailTemplateService: EmailTemplateService, private blogService: BlogService, private blogRelatedService: BlogRelatedService,
        private zoneService: ZoneService, private productDiscountService: ProductDiscountService, private productSpecialService: ProductSpecialService,
        private productRatingService: ProductRatingService,
        private productToCategoryService: ProductToCategoryService,
        private categoryPathService: CategoryPathService, private pluginService: PluginService, private customerService: CustomerService,
        private userService: UserService, private orderStatusService: OrderStatusService, private productQuestionService: ProductQuestionService, private productAnswerLikeService: ProductAnswerLikeService, private settingsService: SettingService,
        private orderProductService: OrderProductService, private orderProductLogService: OrderProductLogService, private productAnswerService: ProductAnswerService, private productVarientOptionService: ProductVarientOptionService, private skuService: SkuService,
        private _m : CommonService
    ) {
    }

    // Banner List API
    /**
     * @api {get} /api/list/banner-list Banner List
     * @apiGroup Store List
     * @apiParam (Request body) {Number} limit Limit
     * @apiParam (Request body) {Number} offset Offset
     * @apiParam (Request body) {Number} count count in number or boolean
     * @apiParamExample {json} Input
     * {
     *      "limit" : "",
     *      "offset": "",
     *      "count": "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Thank you Banner list show successfully..!",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/list/banner-list
     * @apiErrorExample {json} Banner List error
     * HTTP/1.1 500 Internal Server Error
     */
    // Product list Function
    @Get('/banner-list')
    public async bannerList(@QueryParam('bannerFor') bannerFor: string, @QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
        const select = ['bannerFor','bannerId', 'title', 'image', 'imagePath', 'content', 'link', 'position', 'isActive'];
        const search = [
            {
                name: 'title',
                op: 'like',
                value: keyword,
            },
        ];
        const WhereConditions = [
            {
                name: 'isActive',
                value: 1,
            },{
                name:'bannerFor',
                value:bannerFor
            }
        ];
        const bannerList: any = await this.bannerService.list(limit, offset, select, search, WhereConditions, count);
        const successResponse: any = {
            status: 1,
            message: 'Successfully got banner list',
            data: bannerList,
        };
        return response.status(200).send(successResponse);
    }

    // Category List Tree API
    /**
     * @api {get} /api/list/category-list Category List Tree API
     * @apiGroup Store List
     * @apiParam (Request body) {Number} limit Limit
     * @apiParam (Request body) {Number} offset Offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {Number} sortOrder sortOrder
     * @apiParam (Request body) {Number} count count in number or boolean
     * @apiParamExample {json} Input
     * {
     *      "limit" : "",
     *      "offset": "",
     *      "keyorder": "",
     *      "sortOrder": "",
     *      "count": "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "category list shown successfully..!",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/list/category-list
     * @apiErrorExample {json} Category List error
     * HTTP/1.1 500 Internal Server Error
     */
    // Category List Function
    @Get('/category-list')
    public async ParentCategoryList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('sortOrder') sortOrder: number, @QueryParam('count') count: number | boolean, @Req() request: any, @Res() response: any): Promise<any> {
        const select = ['categoryId', 'name', 'image', 'imagePath', 'parentInt', 'sortOrder', 'metaTagTitle', 'categorySlug', 'metaTagDescription', 'metaTagKeyword', 'isActive'];
        const search = [
            {
                name: 'name',
                op: 'like',
                value: keyword,
            }, {
                name: 'isActive',
                op: 'where',
                value: 1,
            },
        ];
        const WhereConditions = [];
        const categoryData = await this.categoryService.list(limit, offset, select, search, WhereConditions, sortOrder, count);
        if (count) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully get All category List',
                data: categoryData,
            };
            return response.status(200).send(successResponse);
        } else {
            const categoryList = arrayToTree(categoryData, {
                parentProperty: 'parentInt',
                customID: 'categoryId',
            });
            const successResponse: any = {
                status: 1,
                message: 'Successfully got the list of categories.',
                data: categoryList,
            };
            return response.status(200).send(successResponse);
        }
    }



    @Get('/get-product-by-category')
    public async getProductByCategory(@QueryParams() filterData: any): Promise<any> {
        const result = await createQueryBuilder('product_to_category', 'ptc')
            .select(['p.product_id as productId', 'p.name as productName', 'p.price as productPrice', 'p.tax_type as taxType', 'tx.tax_percentage as taxValue', 'p.product_slug as productSlug', 'p.promotion_flag as promotionFlag', 'pd.price as discountPrice', 'pim.image as productImage', 'pim.container_name as imagePath', 'ROUND(SUM(CASE WHEN pr.rating IS NULL THEN 0 ELSE pr.rating END)/COUNT(*),1) as productRating'])
            .innerJoin('product', 'p', 'ptc.product_id=p.product_id')
            .innerJoin('(SELECT * FROM (SELECT DENSE_RANK() OVER (PARTITION BY product_id ORDER BY product_image_id ASC) AS rankings, product_id, image, container_name FROM `product_image`) AS t WHERE rankings=1)', 'pim', 'ptc.product_id=pim.product_id')
            .innerJoin('tax','tx','tx.tax_id=p.tax_value')
            .leftJoin('product_rating', 'pr', 'ptc.product_id=pr.product_id')
            .leftJoin('product_discount', 'pd', 'pd.product_id=p.product_id')
            .where('category_id=:category_id', { category_id: filterData.categoryId })
            .andWhere('p.is_active=1')
            .orderBy('p.product_id', 'DESC')
            .groupBy('productId, productName, productPrice, productSlug, productImage, promotionFlag, discountPrice, imagePath')
            .offset(filterData.offset)
            .limit(filterData.limit)
            .getRawMany()

        let sendResponse: any;
        if (result.length > 0) {
            sendResponse = {
                status: 200,
                message: 'Successfully get the Data',
                data: result,
            };
        } else {
            sendResponse = {
                status: 500,
                message: 'Data not available',
                data: "",
            };
        }
        return sendResponse
    }


    // Related Product Adding API
    /**
     * @api {post} /api/list/add-related-product Add a Related Product
     * @apiGroup Store List
     * @apiParam (Request body) {Number} productId Product Id
     * @apiParam (Request body) {string} relatedProductId Related Product Id
     * @apiParamExample {json} Input
     * {
     *      "productId" : "",
     *      "relatedProductId": "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Related Product adding successfully..!",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/list/add-related-product
     * @apiErrorExample {json} Related Product Adding error
     * HTTP/1.1 500 Internal Server Error
     */
    // Category List Function
    @Post('/add-related-product')
    public async addRelatedProduct(@Body({ validate: true }) productParam: any, @Req() request: any, @Res() response: any): Promise<any> {
        const productId = productParam.productId;
        const relatedProductId = productParam.relatedProductId;
        const eachData: any = relatedProductId.split(',');
        let i;
        for (i = 0; i < eachData.length; i++) {
            const relatedProduct = new ProductRelated();
            relatedProduct.productId = productId;
            relatedProduct.relatedProductId = eachData[i];
            await this.productRelatedService.create(relatedProduct);
        }
        const successResponse: any = {
            status: 1,
            message: 'Successfully added the related products.',
        };
        return response.status(200).send(successResponse);
    }

    // Product List API
    /**
     * @api {get} /api/list/productlist Product List API
     * @apiGroup Store List
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} manufacturerId manufacturerId
     * @apiParam (Request body) {String} categoryId categoryId
     * @apiParam (Request body) {Number} priceFrom price from you want to list
     * @apiParam (Request body) {Number} priceTo price to you want to list
     * @apiParam (Request body) {Number} price orderBy 0->desc 1->asc
     * @apiParam (Request body) {Number} condition  1->new 2->used
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {String} count count in boolean or number
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1"
     *      "message": "Successfully get product list",
     *      "data":"{}"
     * }
     * @apiSampleRequest /api/list/productlist
     * @apiErrorExample {json} productList error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/productlist')
    public async productList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string,
        @QueryParam('manufacturerId') manufacturerId: string, @QueryParam('categoryId') categoryId: string, @QueryParam('priceFrom') priceFrom: string,
        @QueryParam('priceTo') priceTo: string, @QueryParam('price') price: number, @QueryParam('condition') condition: number, @QueryParam('count') count: number | boolean, @Req() request: any, @Res() response: any): Promise<any> {
        const select = ['product.productId', 'product.sku', 'product.name', 'product.quantity', 'product.description', 'product.price',
            'product.isActive AS isActive', 'product.manufacturerId AS manufacturerId', 'product.location AS location', 'product.minimumQuantity AS minimumQuantity',
            'product.taxType', 'product.taxValue', 'product.subtractStock', 'product.wishListStatus', 'product.stockStatusId', 'product.shipping', 'product.sortOrder', 'product.condition', 'product.productSlug',
            'product.dateAvailable', 'product.amount', 'product.metaTagTitle', 'product.metaTagDescription', 'product.metaTagKeyword', 'product.discount', 'product.rating', 'product.isSimplified', 'product.skuId'];

        const searchConditions = [
            {
                name: 'product.isActive',
                op: 'where',
                value: 1,
            },
            {
                name: 'product.manufacturerId',
                op: 'and',
                value: manufacturerId,
            },
            {
                name: 'product.name',
                op: 'and',
                value: keyword,
            },
            {
                name: 'product.condition',
                op: 'andWhere',
                value: condition,
            },
        ];

        const whereConditions: any = [{
            name: 'product.productId',
            op: 'inraw',
            value: categoryId,
        }];

        const productList: any = await this.productService.productList(limit, offset, select, searchConditions, whereConditions, categoryId, priceFrom, priceTo, price, count);
        if (count) {
            const Response: any = {
                status: 1,
                message: 'Successfully got Products count',
                data: productList,
            };
            return response.status(200).send(Response);
        }
        const promises = productList.map(async (result: any) => {
            const productToCategory = await this.productToCategoryService.findAll({
                select: ['categoryId', 'productId'],
                where: { productId: result.productId },
            }).then((val) => {
                const category = val.map(async (value: any) => {
                    const categoryNames = await this.categoryService.findOne({ categoryId: value.categoryId });
                    const tempValue: any = value;
                    tempValue.categoryName = categoryNames.name;
                    return tempValue;
                });
                const results = Promise.all(category);
                return results;
            });
            if (result.taxType === 2) {
                const tax = await this.taxService.findOne({ taxId: result.taxValue });
                if (tax) {
                    result.taxValue = tax.taxPercentage;
                } else {
                    result.taxValue = '';
                }
            }
            const productImage = await this.productImageService.findOne({
                select: ['productId', 'image', 'containerName', 'defaultImage'],
                where: {
                    productId: result.productId,
                    defaultImage: 1,
                },
            });
            const where = [{
                name: 'productId',
                op: 'where',
                value: result.productId,
            }];
            const rating = await this.productRatingService.list(0, 0, 0, 0, where, true);
            const whereCondition = [
                {
                    name: 'ProductRating.productId',
                    op: 'where',
                    value: result.productId,
                },
                {
                    name: 'ProductRating.review',
                    op: 'NOT',
                },
            ];
            const review = await this.productRatingService.listByQueryBuilder(0, 0, 0, whereCondition, 0, 0, 0, 0, true);
            const temp: any = result;
            temp.ratingCount = rating ? rating : 0;
            temp.reviewCount = review ? review : 'null';
            temp.Images = productImage;
            temp.Category = productToCategory;
            temp.skuName = '';
            let skuValue = undefined;
            let skuId = undefined;
            if (result.isSimplified === 1) {
                skuValue = await this.skuService.findOne({ id: result.skuId });
                if (skuValue) {
                    temp.price = skuValue.price;
                    temp.skuName = skuValue.skuName;
                    skuId = skuValue.id;
                }
            } else {
                skuValue = await this.productVarientOptionService.findOne({ productId: result.productId });
                if (skuValue) {
                    const productVarientSku = await this.skuService.findOne({ id: skuValue.skuId });
                    temp.price = productVarientSku.price;
                    temp.skuName = productVarientSku.skuName;
                    skuId = productVarientSku.id;
                }
            }
            if (skuId) {
                const nowDate = new Date();
                const todaydate = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate();
                const productSpecial = await this.productSpecialService.findSpecialPriceWithSku(result.productId, skuId, todaydate);
                const productDiscount = await this.productDiscountService.findDiscountPricewithSku(result.productId, skuId, todaydate);
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
            if (result.hasStock === 1) {
                if (result.quantity <= result.outOfStockThreshold) {
                    temp.stockStatus = 'outOfStock';
                } else {
                    temp.stockStatus = 'inStock';
                }
            } else {
                temp.stockStatus = 'inStock';
            }
            if (request.header('authorization')) {
                const encryptString = request.header('authorization').split(' ')[1];
                const Crypto = require('crypto-js');
                const bytes = Crypto.AES.decrypt(encryptString, env.cryptoSecret);
                const originalEncryptedString = bytes.toString(Crypto.enc.Utf8);
                const userId = jwt.verify(originalEncryptedString, env.jwtSecret, { ignoreExpiration: true });
                const userUniqueId: any = Object.keys(userId).map((key: any) => {
                    return [(key), userId[key]];
                });
                const wishStatus = await this.customerWishlistService.findOne({
                    where: {
                        productId: result.productId,
                        customerId: userUniqueId[0][1],
                    },
                });
                if (wishStatus !== undefined) {
                    temp.wishListStatus = 1;
                } else {
                    temp.wishListStatus = 0;
                }
            } else {
                temp.wishListStatus = 0;
            }
            return temp;
        });
        const finalResult = await Promise.all(promises);
        const maximum: any = ['Max(product.price) As maximumProductPrice'];
        const maximumPrice: any = await this.productService.productMaxPrice(maximum);
        const productPrice: any = maximumPrice.maximumProductPrice;
        const successResponse: any = {
            status: 1,
            message: 'Successfully got the complete list of products.',
            data: {
                maximumProductPrice: productPrice,
                productList: finalResult,
            },
        };
        return response.status(200).send(successResponse);
    }


    @UseBefore(CheckTokenMiddleware)
    @Get('/get-product-count-list')
    public async customProductListCount(
        @QueryParams() params: any,
        @Req() request: any,
        @Res() response: any
    ): Promise<any> {
        return new Promise(async () => {
            const limit = params.limit;
            const offset = params.offset;
            const selects = ['Product.productId as productId',
                'Product.product_size_color as product_size_color',
                'Product.taxType as taxType',
                'Product.taxValue as taxValue',
                'Product.name as name',
                'Product.price as price',
                'Product.description as description',
                'Product.manufacturerId as manufacturerId',
                'Product.dateAvailable as dateAvailable',
                'Product.sku as sku',
                'Product.skuId as skuId',
                'Product.isSimplified as isSimplified',
                'Product.upc as upc',
                'Product.quantity as quantity',
                'Product.rating as rating',
                'Product.isActive as isActive',
                'Product.productSlug as productSlug',
                'Product.metaTagTitle as metaTagTitle',
                'Product.metaTagDescription as metaTagDescription',
                'Product.metaTagKeyword as metaTagKeyword',
                'Product.hasStock as hasStock',
                'Product.outOfStockThreshold as outOfStockThreshold',
                'Product.stockStatusId as stockStatusId',
                'Product.createdDate as createdDate',
                'Product.keywords as keywords',
                'Product.promotionFlag as promotionFlag',
                'Product.attributeKeyword as attributeKeyword',
                '(SELECT pi.container_name as containerName FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as containerName',
                '(SELECT pi.image as image FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as image',
                '(SELECT pi.default_image as defaultImage FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as defaultImage',
                '(SELECT COUNT(pr.rating) as ratingCount FROM product_rating pr WHERE pr.product_id = Product.productId) as ratingCount',
                '(SELECT COUNT(pr.review) as reviewCount FROM product_rating pr WHERE pr.product_id = Product.productId AND pr.review IS NOT NULL AND pr.is_active=1) as reviewCount',
                'IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue )  as taxValue',
                'IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AS skuId',
                '(SELECT sku.sku_name as skuName FROM sku WHERE sku.id = skuId) as skuName',
                '(SELECT sku.price as price FROM sku WHERE sku.id = skuId) as price',
                '(SELECT sku.price as price FROM sku WHERE sku.id = skuId) as modifiedPrice',
                '(SELECT price FROM product_discount pd2 WHERE pd2.product_id=Product.product_id AND pd2.sku_id = skuId AND ((pd2.date_start <= CURDATE() AND  pd2.date_end >= CURDATE())) ' +
                ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) AS productDiscount',
                '(SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = skuId AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' + 'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) AS productSpecial',
            ];
            const whereCondition = [];
            const currentDate = moment().format('YYYY-MM-DD');
            const relations = [];
            const groupBy = [];
            if (params.categoryslug === '' || params.categoryslug === undefined) {
                whereCondition.push({
                    name: 'Product.isActive',
                    op: 'and',
                    value: 1,
                }, {
                    name: 'Product.dateAvailable',
                    op: 'raw',
                    sign: '<=',
                    value: currentDate.toString(),
                });
                if(params.productDiscountPercent==='0'){
                    whereCondition.push({
                        name: 'Product.discount',
                        op: 'and',
                        value: 0,
                    })
                }

            } else {

                relations.push({
                    tableName: 'Product.productToCategory',
                    op: 'left',
                    aliasName: 'productToCategory',
                }, {
                    tableName: 'productToCategory.category',
                    op: 'left',
                    aliasName: 'category',
                });


                if (+params.productDiscountPercent>0) {
                    // selects.push('customerWishlist.wishlistProductId as wishlistProductId');
                    relations.push({
                        tableName: '(SELECT round((((s.price-d.price)*100)/s.price)) as discount,product_id FROM product_discount as d inner join sku as s on s.id=d.sku_id)',
                        op: 'specialInnerJoin-Discount',
                        aliasName: 'discountAliasTable',
                      //  cond: 'productRating.rating = ' + request.id,
                    });
        
                     whereCondition.push(
                     {
                         name: 'discountAliasTable.discount',
                         op: 'gt',
                        //  sign: "rating",
                         value: 1,
                     });
                 }
                 if(params.productDiscountPercent==='0'){
                        whereCondition.push({
                            name: 'Product.discount',
                            op: 'and',
                            sign: 'less',
                            value: 1,
                        })
                 }

                if (params.catIds) {
                    whereCondition.push({
                        name: 'Product.isActive',
                        op: 'and',
                        value: 1,
                    },
                        {
                            name: 'category.category_id',
                            op: 'Inor',

                            value: params.catIds,
                        },
                        {
                            name: 'Product.dateAvailable',
                            op: 'raw',
                            sign: '<=',
                            value: currentDate.toString(),
                        });

                } else {
                    whereCondition.push({
                        name: 'Product.isActive',
                        op: 'and',
                        value: 1,
                    }, {
                        name: 'category.category_slug',
                        op: 'and',
                        value: '"' + params.categoryslug + '"',
                    }, {
                        name: 'Product.dateAvailable',
                        op: 'raw',
                        sign: '<=',
                        value: currentDate.toString(),
                    });
                }


            }

            if (params.rating) {
                // selects.push('customerWishlist.wishlistProductId as wishlistProductId');
                relations.push({
                    tableName: 'Product.productRating',
                    op: 'Join',
                    aliasName: 'productRating',
                    //  cond: 'productRating.rating = ' + request.id,
                });

                whereCondition.push(
                    {
                        name: 'productRating.rating',
                        op: 'IN',
                        sign: "rating",
                        value: params.rating,
                    });
            }

            if (request.id) {
                selects.push('customerWishlist.wishlistProductId as wishlistProductId');
                relations.push({
                    tableName: 'Product.wishlist',
                    op: 'leftCond',
                    aliasName: 'customerWishlist',
                    cond: 'customerWishlist.customerId = ' + request.id,
                });
            }
            if (params.sizeValueFilter || params.colorsValueFilter) {
                let sizeFilterArray = [];
                let colorsValueFilter = [];
                let count = 0;
                //  [ 'red,Green,Blue,Black', 'M', '10L,15L,20L' ]

                if (params.sizeValueFilter) {
                    sizeFilterArray = params.sizeValueFilter.split(",");
                    count++;
                }
                if (params.colorsValueFilter) {
                    colorsValueFilter = params.colorsValueFilter.split(",");
                    count++;
                }


                
                whereCondition.push({
                    name: 'Product.product_size_color',
                    op: 'likeor',
                    value: sizeFilterArray,
                    value1: colorsValueFilter,
                    type: count
                });
            }
            
           

            if(params.Color){
                whereCondition.push({
                    name: 'Product.product_size_color',
                    op: 'likeor',
                    value: params.Color.split(","),
                    flag: "colorFilter"
                }); 
            }
            if(params.Size){
                whereCondition.push({
                    name: 'Product.product_size_color',
                    op: 'likeor',
                    value: params.Size.split(","),
                    flag: "sizeFilter"
                }); 
            }
            

            if (params.manufacturerId) {
                whereCondition.push({
                    name: 'Product.manufacturer_id',
                    op: 'IN',
                    value: params.manufacturerId,
                });
            }
            const searchConditions = [];
            if (params.keyword) {
                searchConditions.push({
                    name: ['Product.search_keywords'],
                    value: params.keyword.split(" "),
                    op: "SEARCH_FILTER"
                });
            }

            if (params.priceFrom) {
                whereCondition.push({
                    name: 'CASE WHEN (SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id LIMIT 1) THEN (((SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1)*(SELECT price FROM product_discount WHERE product_id = Product.productId LIMIT 1))/100)+(SELECT price FROM product_discount WHERE product_id = Product.productId LIMIT 1) ELSE (((SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1)*(SELECT price FROM product WHERE product_id = Product.productId LIMIT 1))/100)+(SELECT price FROM product WHERE product_id = Product.productId LIMIT 1) END',
                    op: 'raw',
                    sign: '>=',
                    value: params.priceFrom,
                });
            }
            if (params.priceTo) {
                whereCondition.push({
                    name: 'CASE WHEN (SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id LIMIT 1) THEN (((SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1)*(SELECT price FROM product_discount WHERE product_id = Product.productId LIMIT 1))/100)+(SELECT price FROM product_discount WHERE product_id = Product.productId LIMIT 1) ELSE (((SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1)*(SELECT price FROM product WHERE product_id = Product.productId LIMIT 1))/100)+(SELECT price FROM product WHERE product_id = Product.productId LIMIT 1) END',
                    op: 'raw',
                    sign: '<=',
                    value: params.priceTo,
                });
            }

            const sort = [];
            var popularFilter:boolean=false
            if(params.price=="MAX" || params.price=="NEW" || params.price=="DISCOUNT" || params.price=="POPULAR"){ 
                let sortValue:string;
                
                if(params.price=='MAX'){
                    sortValue="quantity"
                }else if(params.price=='DISCOUNT'){
                    sortValue="discount"
                }else if(params.price=='POPULAR'){
                    popularFilter=true
                }else{
                    sortValue="createdDate"
                }

                if(popularFilter){
                    sort.push({
                        name: 'productId',
                        order: 'ASC',
                    });
                }else{
                    sort.push({
                        name: 'productId',
                        order: 'ASC',
                    },{
                        name: 'Product.'+sortValue,
                        order: 'DESC',
                    });
                }
                
                
            }else if(params.price){
                sort.push({
                    name: 'productId',
                    order: 'ASC',
                },{ 
                    name: '(CASE WHEN ((productSpecial IS NOT NULL) AND `Product`.`tax_type` = 2 AND (taxValue != 0 || taxValue != NULL)) THEN (taxValue/100 * productSpecial) + productSpecial WHEN ((productSpecial IS NOT NULL) AND `Product`.`tax_type` = 1 AND (taxValue != 0 || taxValue != NULL)) THEN (productSpecial + taxValue) ' +
                        ' WHEN ((productDiscount IS NOT NULL) AND `Product`.`tax_type` = 2 AND (taxValue != 0 || taxValue != NULL)) THEN (taxValue/100 * productDiscount) + productDiscount WHEN (productDiscount IS NOT NULL AND `Product`.`tax_type` = 1 AND (taxValue != 0 || taxValue != NULL)) THEN (taxValue + productDiscount) WHEN (productSpecial IS NOT NULL) THEN productSpecial' +
                        ' WHEN (productDiscount IS NOT NULL) THEN productDiscount WHEN (`Product`.`tax_type` = 2 AND (taxValue != 0 || taxValue != NULL)) THEN (taxValue/100 * modifiedPrice) + modifiedPrice WHEN (`Product`.`tax_type` = 1 AND (taxValue != 0 || taxValue != NULL)) THEN (taxValue + modifiedPrice) ELSE modifiedPrice END)',
                    order: params.price,
                });
            }else{
                sort.push({
                    name: 'productId',
                    order: 'ASC',
                });
            }
               
            
            const productList: any = await this.productService.listByQueryBuilder(limit, offset, selects, whereCondition, searchConditions, relations, groupBy, sort, false, true);
            
            const successResponse: any = {
                status: 1,
                message: 'Successfully got the complete list of products.',
                data: {productCount: productList.length}
            };
            return response.status(200).send(successResponse);
        });
    }
    // Custom Product List API
    /**
     * @api {get} /api/list/custom-product-list Custom Product List API
     * @apiGroup Store List
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {Number} manufacturerId manufacturerId
     * @apiParam (Request body) {String} categoryslug categoryslug
     * @apiParam (Request body) {Number} priceFrom price from you want to list
     * @apiParam (Request body) {Number} priceTo price to you want to list
     * @apiParam (Request body) {String} price ASC OR DESC
     * @apiParam (Request body) {String} keyword keyword
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "status": "1"
     *      "message": "Successfully get product list",
     *      "data":"{}"
     * }
     * @apiSampleRequest /api/list/custom-product-list
     * @apiErrorExample {json} productList error
     * HTTP/1.1 500 Internal Server Error
     */
    @UseBefore(CheckTokenMiddleware)
    @Get('/custom-product-list')
    public async customProductList(
        @QueryParams() params: any,
        @Req() request: any,
        @Res() response: any
    ){
        try{
        const redisData = await this._m.getRedisData('productList', params)
        if(redisData){
            redisData.message=redisData.message+'[Redis]'
            return redisData
        }
  const limit = params.limit;
            let offset = params.offset;
            const selects = ['Product.productId as productId',
                'Product.product_size_color as product_size_color',
                'Product.taxType as taxType',
                'Product.taxValue as taxValue',
                'Product.name as name',
                'Product.description as description',
                'Product.manufacturerId as manufacturerId',
                'Product.dateAvailable as dateAvailable',
                'Product.sku as sku',
                'Product.skuId as skuId',
                'Product.isSimplified as isSimplified',
                'Product.upc as upc',
                'Product.quantity as quantity',
                'Product.rating as rating',
                'Product.isActive as isActive',
                'Product.productSlug as productSlug',
                'Product.productSellingPrice as productSellingPrice',
                'Product.flashImage as flashImage',
                'Product.metaTagTitle as metaTagTitle',
                'Product.metaTagDescription as metaTagDescription',
                'Product.metaTagKeyword as metaTagKeyword',
                'Product.hasStock as hasStock',
                'Product.outOfStockThreshold as outOfStockThreshold',
                'Product.stockStatusId as stockStatusId',
                'Product.createdDate as createdDate',
                'Product.keywords as keywords',
                'Product.promotionFlag as promotionFlag',
                'Product.attributeKeyword as attributeKeyword',
                '(SELECT pi.container_name as containerName FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as containerName',
                '(SELECT pi.image as image FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as image',
                '(SELECT pi.default_image as defaultImage FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as defaultImage',
                '(SELECT COUNT(pr.rating) as ratingCount FROM product_rating pr WHERE pr.product_id = Product.productId AND pr.is_active=1) as ratingCount',
                '(SELECT COUNT(pr.review) as reviewCount FROM product_rating pr WHERE pr.product_id = Product.productId AND pr.review IS NOT NULL AND pr.is_active=1 AND pr.is_comment_approved=1) as reviewCount',
                'IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue )  as taxValue',
                'IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AS skuId',
                '(SELECT sku.sku_name as skuName FROM sku WHERE sku.id = skuId) as skuName',
                '(SELECT sku.price as price FROM sku WHERE sku.id = skuId) as price',
                '(SELECT sku.price as price FROM sku WHERE sku.id = skuId) as modifiedPrice',
                '(SELECT price FROM product_discount pd2 WHERE pd2.product_id=Product.product_id AND pd2.sku_id = skuId AND ((pd2.date_start <= CURDATE() AND  pd2.date_end >= CURDATE())) ' +
                ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) AS productDiscount',
                '(SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = skuId AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' + 'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) AS productSpecial',
            ];
            const whereCondition = [];
            const currentDate = moment().format('YYYY-MM-DD');
            const relations = [];
            const groupBy = [];
            
            
            if(params.productIds!=undefined || params.topSellingProducts!=undefined){
                let productIds:any 
                if(params.topSellingProducts!=undefined){
                    const orderTable: string = "`order`"
                     const topSellingProductIds = await getManager().query(`SELECT GROUP_CONCAT(product_id) AS pids FROM ( SELECT COUNT(op.order_product_id) AS total_count, op.product_id, op.name AS NAME FROM ${orderTable} AS o JOIN order_product op ON(o.order_id = op.order_id)  INNER JOIN product AS p ON p.product_id=op.product_id WHERE p.is_active=1 AND op.product_id <> 0 GROUP  BY op.product_id, op.name ORDER BY total_count DESC LIMIT ${params.limit}) top_products`);
                     if(topSellingProductIds[0].pids){
                     productIds=(topSellingProductIds[0].pids.split(",")).toString()
                     }
                }else{
                    productIds=params.productIds
                }

                if(!productIds){
                    productIds = 99999999;
                }
                whereCondition.push({
                    name: 'Product.productId',
                    op: 'IN',
                    value: `${productIds}`,
                },{
                    name: 'Product.isActive',
                    op: 'and',
                    value: 1,
                })
            }else if(params.furoCategoryProduct!=undefined){
                let productIds:any 
                const furoProductIds = await getManager().query(`SELECT p.product_id as productId FROM product as p INNER JOIN product_to_category as ptc ON p.product_id = ptc.product_id inner join category as c ON ptc.category_id=c.category_id where c.name like '%sport%' limit 24`);
                console.log("data furo >>>>>>",furoProductIds);
                //productIds=(furoProductIds[0].productId.split(",")).toString()
                 productIds = furoProductIds.map(obj => obj.productId);
                if(productIds.length>0){
                whereCondition.push({
                    name: 'Product.productId',
                    op: 'IN',
                    value: `${productIds}`,
                },{
                    name: 'Product.isActive',
                    op: 'and',
                    value: 1,
                })
            }

            }else if(params.topSellingFuroCategoryProduct!=undefined){
                let productIds:any 
                     const topSellingProductIds = await getManager().query('SELECT GROUP_CONCAT(product_id) AS pids FROM ( SELECT COUNT(op.order_product_id) AS total_count, op.product_id, op.name AS NAME FROM `order` AS o JOIN order_product op ON(o.order_id = op.order_id)  INNER JOIN product AS p ON p.product_id=op.product_id  inner join product_to_category as ptc ON p.product_id=ptc.product_id inner join category as c ON ptc.category_id=c.category_id where c.name like "%sport%" AND p.is_active=1 AND op.product_id <> 0 GROUP  BY op.product_id, op.name ORDER BY total_count DESC LIMIT 24) top_products');
                     if(topSellingProductIds[0].pids){
                     productIds=(topSellingProductIds[0].pids.split(",")).toString()
                     }
                
                if(!productIds){
                    productIds = 99999999;
                }
                whereCondition.push({
                    name: 'Product.productId',
                    op: 'IN',
                    value: `${productIds}`,
                },{
                    name: 'Product.isActive',
                    op: 'and',
                    value: 1,
                })

            }else if(params.categoryslug=="offer-discount"){
                const _discount = getManager().getRepository(DiscountOffer)
                const currentDate = moment().format('YYYY-MM-DD');
                
                const disocuntResult = await _discount.findOne({where:{id:params.discountOfferId, endDate: MoreThan(currentDate.toString()) }})
                const size:any = params.Size?params.Size:''
                const color:any = params.Color?params.Color:''
                const disocunt:any = params.productDiscountPercent?params.productDiscountPercent:0
                let idsArray:any[]=[99999999]
                if(disocuntResult){
                const filterIds = await getManager().query(`SELECT p.product_id  from product p 
                where p.product_id in (${disocuntResult.productIds}) and 
                p.discount>=${disocunt} and 
                p.product_selling_price between ${params.priceFrom} and ${params.priceTo} and 
                p.is_active=1 and 
                product_size_color like '%${color}%' and product_size_color like '%${size}%' 
                group by p.product_id;`)

                console.log(filterIds, "Nero ++++++++++++++++++++++++++++++++++++++++FIlderidsss")
                idsArray = [];
                if(filterIds.length>0){
                 filterIds.forEach((element:any) => {
                    idsArray.push(element.product_id)
                });
                idsArray = idsArray.splice(offset,limit)
                offset=0
                // if(idsArray && idsArray.length<1){
                //     idsArray = [99999999];
                // }
                console.log(idsArray, "nerosdfsfsd+++++++++++++++++++++++++++++++++++++++")
                if(idsArray.length<1){
                    idsArray.push(99999999);  
                }
                whereCondition.push({
                    name: 'Product.productId',
                    op: 'IN',
                    value: `${idsArray}`,
                },{
                    name: 'Product.isActive',
                    op: 'and',
                    value: 1,
                })
                params.categoryslug=''
            }else{
                const successResponse: any = {
                    status: 1,
                    message: 'Successfully got the complete list of products.',
                    data: [],
                    categoryLevel:'',
                };
                return response.status(200).send(successResponse);
            }
            }
            }else if (params.categoryslug === '' || params.categoryslug === undefined) {
                whereCondition.push({
                    name: 'Product.isActive',
                    op: 'and',
                    value: 1,
                }, {
                    name: 'Product.dateAvailable',
                    op: 'raw',
                    sign: '<=',
                    value: currentDate.toString(),
                });

            } else {

                relations.push({
                    tableName: 'Product.productToCategory',
                    op: 'left',
                    aliasName: 'productToCategory',
                }, {
                    tableName: 'productToCategory.category',
                    op: 'left',
                    aliasName: 'category',
                });

                
                if(params.productDiscountPercent=='0'){
                    whereCondition.push({
                        name: 'Product.discount',
                        op: 'and',
                        value: 0,
                    })
                }
                
                if (+params.productDiscountPercent>0) {
                    whereCondition.push({
                    name: 'Product.discount',
                    op: 'and',
                    sign: 'big',
                    value: params.productDiscountPercent,
                })
                }

                // if (+params.productDiscountPercent>0) {
                //     // selects.push('customerWishlist.wishlistProductId as wishlistProductId');
                //     relations.push({
                //         tableName: '(SELECT round((((s.price-d.price)*100)/s.price)) as discount,product_id FROM product_discount as d inner join sku as s on s.id=d.sku_id)',
                //         op: 'specialInnerJoin-Discount',
                //         aliasName: 'discountAliasTable',
                //       //  cond: 'productRating.rating = ' + request.id,
                //     });
        
                //      whereCondition.push(
                //      {
                //          name: 'discountAliasTable.discount',
                //          op: 'gt',
                //         //  sign: "rating",
                //          value: 1,
                //      });
                //  }
                //  if(params.productDiscountPercent==='0'){
                //         whereCondition.push({
                //             name: 'Product.discount',
                //             op: 'and',
                //             sign: 'less',
                //             value: 1,
                //         })
                //  }

                if (params.catIds) {
                    whereCondition.push({
                        name: 'Product.isActive',
                        op: 'and',
                        value: 1,
                    },
                        {
                            name: 'category.category_id',
                            op: 'Inor',

                            value: params.catIds,
                        },
                        {
                            name: 'Product.dateAvailable',
                            op: 'raw',
                            sign: '<=',
                            value: currentDate.toString(),
                        });

                } else {
                    whereCondition.push({
                        name: 'Product.isActive',
                        op: 'and',
                        value: 1,
                    }, {
                        name: 'category.category_slug',
                        op: 'and',
                        value: '"' + params.categoryslug + '"',
                    }, {
                        name: 'Product.dateAvailable',
                        op: 'raw',
                        sign: '<=',
                        value: currentDate.toString(),
                    });
                }


            }

            if (params.rating) {
                // selects.push('customerWishlist.wishlistProductId as wishlistProductId');
                relations.push({
                    tableName: 'Product.productRating',
                    op: 'Join',
                    aliasName: 'productRating',
                    //  cond: 'productRating.rating = ' + request.id,
                });

                whereCondition.push(
                    {
                        name: 'productRating.rating',
                        op: 'IN',
                        sign: "rating",
                        value: params.rating,
                    });
            }

            if (request.id) {
                selects.push('customerWishlist.wishlistProductId as wishlistProductId');
                relations.push({
                    tableName: 'Product.wishlist',
                    op: 'leftCond',
                    aliasName: 'customerWishlist',
                    cond: 'customerWishlist.customerId = ' + request.id,
                });
            }
            if (params.sizeValueFilter || params.colorsValueFilter) {
                let sizeFilterArray = [];
                let colorsValueFilter = [];
                let count = 0;
                //  [ 'red,Green,Blue,Black', 'M', '10L,15L,20L' ]

                if (params.sizeValueFilter) {
                    sizeFilterArray = params.sizeValueFilter.split(",");
                    count++;
                }
                if (params.colorsValueFilter) {
                    colorsValueFilter = params.colorsValueFilter.split(",");
                    count++;
                }


                // sizeFilterArray.forEach((element, i) => {
                //     whereCondition.push({
                //         name: 'Product.product_size_color',
                //         op: 'likeand',
                //         value: element,
                //         count:i++
                // }); 
                // });
                whereCondition.push({
                    name: 'Product.product_size_color',
                    op: 'likeor',
                    value: sizeFilterArray,
                    value1: colorsValueFilter,
                    type: count
                });
            }
            
           // const entries = Object.entries(params);
            
            // const data: any = entries.splice(14)
            // if (data != undefined && data.length > 0) {
            //     var tempStore:any = {};

            //     // data.forEach((d:any, i) => {
            //     //     if(d[1].length > 0){  
            //     //   temp = {
            //     //     ...temp,
            //     //     [d[0]]: d[1].split(',')
            //     //   }
            //     // }
            //     // });

            //     for (let t = 0; t < data.length; t++) {
            //         if (data[t][1].length > 0) {
            //             tempStore = {
            //                 ...tempStore,
            //                 [data[t][0]]: data[t][1].split(',')
            //             }
            //         }
            //     }

            //     let colorObj = tempStore.Color;
            //     let _mainObject = Object.entries(tempStore);
            //     // whereCondition.push({
            //     //     name: 'Product.product_size_color',
            //     //     op: 'likeor',
            //     //     value: _mainObject,
            //     //     flag: "commonFilter"
            //     // });
            //     whereCondition.push({
            //         name: 'Product.product_size_color',
            //         op: 'likeor',
            //         value: tempStore.Color,
            //         flag: "colorFilter"
            //     });
            //     whereCondition.push({
            //         name: 'Product.product_size_color',
            //         op: 'likeor',
            //         value: tempStore.Size,
            //         flag: "sizeFilter"
            //     });
            // }

            if(params.Color){
                whereCondition.push({
                    name: 'Product.product_size_color',
                    op: 'likeor',
                    value: params.Color.split(","),
                    flag: "colorFilter"
                }); 
            }
            if(params.Size){
                whereCondition.push({
                    name: 'Product.product_size_color',
                    op: 'likeor',
                    value: params.Size.split(","),
                    flag: "sizeFilter"
                }); 
            }
            //     whereCondition.push({
            //         name: 'Product.product_id',
            //         op: 'IN',
            //         value: [{name: "color", value:"red"}, {name: "color", value:"Green"}, {name: "size", value:"XL"}],

            //         sign: "variant"
            // });
            // if (params.colorsValueFilter) {
            //     let colorsFilterArray= params.colorsValueFilter.split(",")
            //     // colorsFilterArray.forEach((element, i) => {
            //     //     whereCondition.push({
            //     //         name: 'Product.product_size_color',
            //     //         op: 'like',
            //     //         value: element,
            //     //         count: i++
            //     // }); 
            //     // });
            //     whereCondition.push({
            //         name: 'Product.product_size_color',
            //         op: 'likeor',
            //         value: params.colorsValueFilter,
            //         type: "color"
            // }); 
            // }

            if (params.manufacturerId) {
                whereCondition.push({
                    name: 'Product.manufacturer_id',
                    op: 'IN',
                    value: params.manufacturerId,
                });
            }
            const searchConditions = [];
            if (params.keyword) {
                searchConditions.push({
                    name: ['Product.search_keywords'],
                    value: params.keyword.split(" "),
                    op: "SEARCH_FILTER"
                });
            }

            if (params.priceFrom) {
                whereCondition.push({
                    // name: '(CASE WHEN (((SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' +
                    //     'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) IS NOT NULL) AND `Product`.`tax_type` = 2 AND (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != 0 || IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != NULL)) THEN (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue )/100 * (SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' +
                    //     'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1)) + (SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' +
                    //     'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) WHEN (((SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' +
                    //     'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) IS NOT NULL) AND `Product`.`tax_type` = 1 AND (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != 0 || IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != NULL)) THEN ((SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = ' +
                    //     ' IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' +
                    //     'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) + IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue )) ' +
                    //     ' WHEN (((SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    //     ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) IS NOT NULL) AND `Product`.`tax_type` = 2 AND (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != 0 || IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != NULL)) THEN (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue )/100 * (SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = ' +
                    //     'IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    //     ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1)) + (SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    //     ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) WHEN ((SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    //     ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) IS NOT NULL AND `Product`.`tax_type` = 1 AND (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != 0 || IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != NULL)) THEN (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) + (SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = ' +
                    //     'IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    //     ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1)) WHEN ((SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' +
                    //     'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) IS NOT NULL) THEN (SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))'
                    //     + ' ' + 'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1)' +
                    //     ' WHEN ((SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    //     ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) IS NOT NULL) THEN (SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    //     ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) WHEN (`Product`.`tax_type` = 2 AND (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != 0 || IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != NULL)) THEN (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue )/100 * (SELECT sku.price as price FROM sku WHERE sku.id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ))) + (SELECT sku.price as price FROM sku WHERE sku.id = ' +
                    //     ' IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) )) WHEN (`Product`.`tax_type` = 1 AND (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != 0 || IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != NULL)) THEN (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) + (SELECT sku.price as price FROM sku WHERE sku.id = ' +
                    //     'IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ))) ELSE (SELECT sku.price as price FROM sku WHERE sku.id = ' +
                    //     'IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) )) END)',
                    name: 'CASE WHEN (SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id LIMIT 1) THEN (((SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1)*(SELECT price FROM product_discount WHERE product_id = Product.productId LIMIT 1))/100)+(SELECT price FROM product_discount WHERE product_id = Product.productId LIMIT 1) ELSE (((SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1)*(SELECT price FROM product WHERE product_id = Product.productId LIMIT 1))/100)+(SELECT price FROM product WHERE product_id = Product.productId LIMIT 1) END',
                    op: 'raw',
                    sign: '>=',
                    value: params.priceFrom,
                });
            }
            if (params.priceTo) {
                whereCondition.push({
                    name: 'CASE WHEN (SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id LIMIT 1) THEN (((SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1)*(SELECT price FROM product_discount WHERE product_id = Product.productId LIMIT 1))/100)+(SELECT price FROM product_discount WHERE product_id = Product.productId LIMIT 1) ELSE (((SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1)*(SELECT price FROM product WHERE product_id = Product.productId LIMIT 1))/100)+(SELECT price FROM product WHERE product_id = Product.productId LIMIT 1) END',
                    // name: '(CASE WHEN (((SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' +
                    //     'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) IS NOT NULL) AND `Product`.`tax_type` = 2 AND (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != 0 || IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != NULL)) THEN (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue )/100 * (SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' +
                    //     'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1)) + (SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' +
                    //     'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) WHEN (((SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' +
                    //     'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) IS NOT NULL) AND `Product`.`tax_type` = 1 AND (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != 0 || IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != NULL)) THEN ((SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = ' +
                    //     ' IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' +
                    //     'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) + IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue )) ' +
                    //     ' WHEN (((SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    //     ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) IS NOT NULL) AND `Product`.`tax_type` = 2 AND (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != 0 || IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != NULL)) THEN (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue )/100 * (SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = ' +
                    //     'IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    //     ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1)) + (SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    //     ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) WHEN ((SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    //     ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) IS NOT NULL AND `Product`.`tax_type` = 1 AND (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != 0 || IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != NULL)) THEN (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) + (SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = ' +
                    //     'IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    //     ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1)) WHEN ((SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' +
                    //     'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) IS NOT NULL) THEN (SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))'
                    //     + ' ' + 'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1)' +
                    //     ' WHEN ((SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    //     ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) IS NOT NULL) THEN (SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    //     ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) WHEN (`Product`.`tax_type` = 2 AND (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != 0 || IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != NULL)) THEN (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue )/100 * (SELECT sku.price as price FROM sku WHERE sku.id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ))) + (SELECT sku.price as price FROM sku WHERE sku.id = ' +
                    //     ' IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) )) WHEN (`Product`.`tax_type` = 1 AND (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != 0 || IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != NULL)) THEN (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) + (SELECT sku.price as price FROM sku WHERE sku.id = ' +
                    //     'IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ))) ELSE (SELECT sku.price as price FROM sku WHERE sku.id = ' +
                    //     'IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) )) END)',
                    op: 'raw',
                    sign: '<=',
                    value: params.priceTo,
                });
            }

            const sort = [];
            var popularFilter:boolean=false
            if(params.price=="MAX" || params.price=="NEW" || params.price=="DISCOUNT" || params.price=="POPULAR"){ 
                let sortValue:string;
                
                if(params.price=='MAX'){
                    sortValue="quantity"
                }else if(params.price=='DISCOUNT'){
                    sortValue="discount"
                }else if(params.price=='POPULAR'){
                    popularFilter=true
                }else{
                    sortValue="createdDate"
                }

                if(popularFilter){
                    sort.push({
                        name: 'productId',
                        order: 'ASC',
                    });
                }else{
                    sort.push({
                        name: 'productId',
                        order: 'ASC',
                    },{
                        name: 'Product.'+sortValue,
                        order: 'DESC',
                    });
                }
                
                
            }else if(params.price){
                sort.push({
                    name: 'productId',
                    order: 'ASC',
                },{ 
                    name: '(CASE WHEN ((productSpecial IS NOT NULL) AND `Product`.`tax_type` = 2 AND (taxValue != 0 || taxValue != NULL)) THEN (taxValue/100 * productSpecial) + productSpecial WHEN ((productSpecial IS NOT NULL) AND `Product`.`tax_type` = 1 AND (taxValue != 0 || taxValue != NULL)) THEN (productSpecial + taxValue) ' +
                        ' WHEN ((productDiscount IS NOT NULL) AND `Product`.`tax_type` = 2 AND (taxValue != 0 || taxValue != NULL)) THEN (taxValue/100 * productDiscount) + productDiscount WHEN (productDiscount IS NOT NULL AND `Product`.`tax_type` = 1 AND (taxValue != 0 || taxValue != NULL)) THEN (taxValue + productDiscount) WHEN (productSpecial IS NOT NULL) THEN productSpecial' +
                        ' WHEN (productDiscount IS NOT NULL) THEN productDiscount WHEN (`Product`.`tax_type` = 2 AND (taxValue != 0 || taxValue != NULL)) THEN (taxValue/100 * modifiedPrice) + modifiedPrice WHEN (`Product`.`tax_type` = 1 AND (taxValue != 0 || taxValue != NULL)) THEN (taxValue + modifiedPrice) ELSE modifiedPrice END)',
                    order: params.price,
                });
            }else{
                sort.push({
                    name: 'productId',
                    order: 'ASC',
                });
            }
               
            
            const productList: any = await this.productService.listByQueryBuilder(limit, offset, selects, whereCondition, searchConditions, relations, groupBy, sort, false, true);
            let productVarientListId:any[]=[]
            let promises = productList.map(async (result: any) => {
                const temp: any = result;
                temp.taxValue = +result.taxValue;
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

if(popularFilter){
    const productCount = await createQueryBuilder(OrderProduct, 'op')
                    .select('COUNT(product_id) as productCount, product_id as productId')
                    .where('product_id =(:productIds)', {productIds:result.productId})
                    .groupBy('product_id')
                    .getRawOne()
                    temp.productCount=(productCount && productCount.productCount)?+productCount.productCount:0
                    
}
                productVarientListId.push(result.productId)
                return temp;
            });
            let finalResult = await Promise.all(promises);
            if(productVarientListId.length>0){
            let productVarientsArray = await createQueryBuilder(ProductVarientOption , "pvo")
            .select(['pvo.varient_name as val, pvo.product_id as productId'])
            .innerJoin(Sku, 's', 's.id=pvo.sku_id')
            .where('pvo.product_id IN (:product_id)', { product_id: productVarientListId })
            .andWhere('s.quantity>0')
            .andWhere('s.is_active=1')
            .getRawMany();
            finalResult.map(item=>{
                let availablevarient:any[]=[]
                productVarientsArray.forEach(element => {
                    if(element.productId==item.productId){
                        availablevarient.push((element.val).split(',')[0])
                    }
                });
                return Object.assign(item, {sizeVarients:availablevarient})
            })
        }
            if(popularFilter){
                finalResult = finalResult.sort((a,b)=>{
                return b.productCount-a.productCount
            })
            
        }

        
            let categoryLevel;
            if (params.categoryslug && params.categoryslug!="offer-discount") {
                const category = await this.categoryService.findOne({ categorySlug: params.categoryslug, isActive: 1 });
                if (category) {
                    const categoryLevels: any = await this.categoryPathService.find({
                        select: ['level', 'pathId'],
                        where: { categoryId: category.categoryId },
                        order: { level: 'ASC' },
                    }).then((values) => {
                        const categories = values.map(async (val: any) => {
                            const categoryData = await this.categoryService.findOne({ categoryId: val.pathId });
                            const tempVal: any = val;
                            tempVal.categoryName = categoryData ? categoryData.name : '';
                            tempVal.categoryId = categoryData ? categoryData.categoryId : '';
                            tempVal.categorySlug = categoryData ? categoryData.categorySlug : '';
                            tempVal.parentInt = categoryData ? categoryData.parentInt : '';
                            tempVal.metaTagTitle = categoryData ? categoryData.metaTagTitle : '';
                            tempVal.metaTagDescription = categoryData ? categoryData.metaTagDescription : '';
                            tempVal.metaTagKeyword = categoryData ? categoryData.metaTagKeyword : '';
                            return tempVal;
                        });
                        const results = Promise.all(categories);
                        return results;
                    });
                    categoryLevel = categoryLevels;
                } else {
                    const errorResponse: any = {
                        status: 0,
                        message: 'Invalid category',
                    };
                    return response.status(400).send(errorResponse);
                }
            } else {
                categoryLevel = '';
            }
            const successResponse: any = {
                status: 1,
                data: finalResult,
                categoryLevel,
                message : 'Successfully got the complete list of products.'
            };
            try{
                await this._m.setRedisData(params,'productList',successResponse)
            }catch{
                console.log("Set Redis Catch")
            }
            return response.status(200).send(successResponse);
        }catch{
            const errorResponse: any = {
                status: 0,
                message: 'Server Error',
            };
            return response.status(500).send(errorResponse);
        }
    }

    @UseBefore(CheckTokenMiddleware)
    @Get('/filter-product-list')
    public async filterProductList(
        @QueryParams() params: ListRequest,
        @Req() request: any,
        @Res() response: any
    ): Promise<any> {
        return new Promise(async () => {
            const whereCondition = [];
            const currentDate = moment().format('YYYY-MM-DD');
            const relations = [];
            const groupBy = [];
            const limit = 0;
            const offset = 0;
            const selects = [];
            const searchConditions = [];
            const sort = [];
            whereCondition.push({
                name: 'Product.isActive',
                op: 'and',
                value: 1,
            }, {
                name: 'Product.filter_ankle_value',
                op: 'and',
                value: '"' + params.categoryslug + '"',
            }, {
                name: 'Product.dateAvailable',
                op: 'raw',
                sign: '<=',
                value: currentDate.toString(),
            });

            const productList: any = await this.productService.listByQueryBuilder(limit, offset, selects, whereCondition, searchConditions, relations, groupBy, sort, false, true);
            const promises = productList.map(async (result: any) => {
                const temp: any = result;
                return temp;
                temp.taxValue = +result.taxValue;
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
                message: 'Successfully got the complete list of products.',
                data: finalResult
            };
            return response.status(200).send(successResponse);
        });
    }

    // Related Product Showing API
    /**
     * @api {get} /api/list/related-product-list Related Product List
     * @apiGroup Store List
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} productId Product Id
     * @apiParam (Request body) {Number} count
     * @apiParamExample {json} Input
     * {
     *      "productId" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Related Product List Showing Successfully..!",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/list/related-product-list
     * @apiErrorExample {json} Related Product List error
     * HTTP/1.1 500 Internal Server Error
     */
    // Category List Function
    @UseBefore(CheckTokenMiddleware)
    @Get('/related-product-list')
    public async relatedProductList(@QueryParam('productId') productid: string, @QueryParam('count') count: number | boolean, @Req() request: any, @Res() response: any): Promise<any> {
        const productDetail: any = await this.productService.findOne({
            productSlug: productid,
        });
        if (!productDetail) {
            return response.status(200).send({
                status: 1,
                message: 'Related product list is successfully being shown. ',
                data: [],
            });
        }
        const currentDate = moment().format('YYYY-MM-DD');
        const selects = ['ProductRelated.relatedProductId as productId',
            'ProductRelated.id as id',
            'product.taxType as taxType',
            'product.taxValue as taxValue',
            'product.skuId as skuId',
            'product.price as price',
            'product.name as name',
            'product.isSimplified as isSimplified',
            'product.description as description',
            'product.quantity as quantity',
            'product.productId as productId',
            'product.rating as rating',
            'product.productSlug as productSlug',
            'product.hasStock as hasStock',
            'product.outOfStockThreshold as outOfStockThreshold',
            '(SELECT pi.container_name as containerName FROM product_image pi WHERE pi.product_id = product.productId AND pi.default_image = 1 LIMIT 1) as containerName',
            '(SELECT pi.image as image FROM product_image pi WHERE pi.product_id = product.productId AND pi.default_image = 1 LIMIT 1) as image',
            '(SELECT pi.default_image as defaultImage FROM product_image pi WHERE pi.product_id = product.productId AND pi.default_image = 1 LIMIT 1) as defaultImage',
            '(SELECT COUNT(pr.rating) as ratingCount FROM product_rating pr WHERE pr.product_id = product.productId) as ratingCount',
            '(SELECT COUNT(pr.review) as reviewCount FROM product_rating pr WHERE pr.product_id = product.productId AND pr.review IS NOT NULL) as reviewCount',
            'IF(product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `product`.`tax_value` AND `product`.`tax_type` = 2 LIMIT 1), (product.taxValue) )  as taxValue',
            'IF(product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = product.productId AND pvo.is_active = 1 LIMIT 1) ) AS skuId',
            '(SELECT sku.sku_name as skuName FROM sku WHERE sku.id = skuId) as skuName',
            '(SELECT sku.price as price FROM sku WHERE sku.id = skuId) as price',
            '(SELECT price FROM product_discount pd2 WHERE pd2.product_id = product.product_id AND pd2.sku_id = skuId AND ((pd2.date_start <= CURDATE() AND  pd2.date_end >= CURDATE())) ' +
            ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) AS productDiscount',
            '(SELECT price FROM product_special ps WHERE ps.product_id = product.product_id AND ps.sku_id = skuId AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' + 'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) AS productSpecial'];
        const whereCondition = [];
        const searchConditions = [];
        const relations = [];
        relations.push({
            tableName: 'ProductRelated.productRelated',
            aliasName: 'product',
        });
        if (request.id) {
            selects.push('customerWishlist.wishlistProductId as wishlistProductId');
            relations.push({
                tableName: 'product.wishlist',
                op: 'leftCond',
                aliasName: 'customerWishlist',
                cond: 'customerWishlist.customerId = ' + request.id,
            });
        }
        whereCondition.push({
            name: 'ProductRelated.productId',
            op: 'and',
            value: productDetail.productId,
        }, {
            name: 'product.is_active',
            op: 'and',
            value: 1,
        }, {
            name: 'product.dateAvailable',
            op: 'raw',
            sign: '<=',
            value: currentDate.toString(),
        });
        const groupBy = [];
        const sort = [];
        sort.push({
            name: 'ProductRelated.id',
            order: 'ASC',
        });
        if (count) {
            const relatedDataCount: any = await this.productRelatedService.listByQueryBuilder(0, 0, selects, whereCondition, searchConditions, relations, groupBy, sort, true, true);
            const Response: any = {
                status: 1,
                message: 'Related product list is successfully being shown. ',
                data: relatedDataCount,
            };
            return response.status(200).send(Response);
        }
        const relatedData: any = await this.productRelatedService.listByQueryBuilder(0, 0, selects, whereCondition, searchConditions, relations, groupBy, sort, false, true);
        const promises = relatedData.map(async (results: any) => {
            const temp: any = results;
            if (results.productSpecial !== null) {
                temp.pricerefer = results.productSpecial;
                temp.flag = 1;
            } else if (results.productDiscount !== null) {
                temp.pricerefer = results.productDiscount;
                temp.flag = 0;
            } else {
                temp.pricerefer = '';
                temp.flag = '';
            }
            if (results.hasStock === 1) {
                if (results.quantity <= results.outOfStockThreshold) {
                    temp.stockStatus = 'outOfStock';
                } else {
                    temp.stockStatus = 'inStock';
                }
            } else {
                temp.stockStatus = 'inStock';
            }
            if ((results.wishlistProductId !== null) && results.wishlistProductId) {
                temp.wishListStatus = 1;
            } else {
                temp.wishListStatus = 0;
            }
            return temp;
        });
        const result = await Promise.all(promises);
        const successResponse: any = {
            status: 1,
            message: 'Related product list is successfully being shown. ',
            data: classToPlain(result),
        };
        return response.status(200).send(successResponse);
    }


    @Get('/related-product-list-ids')
public async relatedProductsId(@QueryParams() query:any){
        const data =  await getManager().query(`SELECT group_concat(pr.related_product_id) productIds, p.is_active FROM product_related pr inner join product p on p.product_id=pr.related_product_id WHERE pr.product_id=${query.productId} and p.is_active=1;`)
            let result:any={}
        if(data[0].productIds){
            result.status=200
            result.data=data[0].productIds
        }else{
            result.status=500
            result.data=null
        }
        return result
    }

    // Country List API
    /**
     * @api {get} /api/list/country-list Country List API
     * @apiGroup Store List
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {Number} count count should be number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get country list",
     *      "data":{
     *      "countryId"
     *      "name"
     *      "isoCode2"
     *      "isoCode3"
     *      "addressFormat"
     *      "postcodeRequired"
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/list/country-list
     * @apiErrorExample {json} countryFront error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/country-list')
    public async countryList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
        const select = ['countryId', 'name', 'isoCode2', 'isoCode3', 'postcodeRequired', 'isActive'];
        const search = [
            {
                name: 'name',
                op: 'like',
                value: keyword,
            },
            {
                name: 'isActive',
                op: 'where',
                value: 1,
            },
        ];
        const WhereConditions = [];
        const countryList = await this.countryService.list(limit, offset, select, search, WhereConditions, count);
        const successResponse: any = {
            status: 1,
            message: 'Successfully got the list of countries.',
            data: countryList,
        };
        return response.status(200).send(successResponse);

    }

    // Contact Us API
    /**
     * @api {post} /api/list/contact-us  Contact Us API
     * @apiGroup Store List
     * @apiParam (Request body) {String} name Name
     * @apiParam (Request body) {String} email Email
     * @apiParam (Request body) {String} phoneNumber Phone Number
     * @apiParam (Request body) {String} message Message
     * @apiParamExample {json} Input
     * {
     *      "name" : "",
     *      "email" : "",
     *      "phoneNumber" : "",
     *      "message" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Your mail send to admin..!",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/list/contact-us
     * @apiErrorExample {json} Contact error
     * HTTP/1.1 500 Internal Server Error
     */
    // ContactUs Function
    @Post('/contact-us')
    public async userContact(@Body({ validate: true }) contactParam: ContactRequest, @Req() request: any, @Res() response: any): Promise<any> {
        const contactInformation = new Contact();
        contactInformation.name = contactParam.name;
        contactInformation.email = contactParam.email;
        contactInformation.phoneNumber = contactParam.phoneNumber;
        contactInformation.message = contactParam.message;
        const informationData = await this.contactService.create(contactInformation);
        const emailContent = await this.emailTemplateService.findOne(3);
        const logo = await this.settingsService.findOne();
        const message = emailContent.content.replace('{name}', informationData.name).replace('{email}', informationData.email).replace('{phoneNumber}', informationData.phoneNumber).replace('{message}', informationData.message);
        const adminId: any = [];
        const adminUser = await this.userService.findAll({ select: ['email'], where: { email: 'superadmin@redchief.in'}});
        for (const user of adminUser) {
            const val = user.username;
            adminId.push(val);
        }
        const redirectUrl = env.storeRedirectUrl;
        const sendMailRes = MAILService.contactMail(logo, message, emailContent.subject, adminId, redirectUrl);
        if (sendMailRes) {
            const successResponse: any = {
                status: 1,
                message: 'Your request Successfully send',
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'Mail does not send',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Zone List API
    /**
     * @api {get} /api/list/zone-list Zone List API
     * @apiGroup Store List
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {String} countryId countryId
     * @apiParam (Request body) {Number} count count should be number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get zone list",
     *      "data":{
     *      "countryId"
     *      "code"
     *      "name"
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/list/zone-list
     * @apiErrorExample {json} Zone error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/zone-list')
    public async zonelist(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('countryId') countryId: number, @QueryParam('keyword') keyword: string, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
        const select = ['zoneId', 'countryId', 'code', 'name', 'isActive'];
        const search = [
            {
                name: 'name',
                op: 'like',
                value: keyword,
            },
            {
                name: 'isActive',
                op: 'where',
                value: 1,
            },
        ];
        if (countryId) {
            search.push({
                name: 'countryId',
                op: 'where',
                value: countryId,
            });
        }
        const WhereConditions = [];
        const relation = ['country'];

        const zoneList = await this.zoneService.list(limit, offset, select, search, WhereConditions, relation, count);
        if (zoneList) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully get all zone List',
                data: classToPlain(zoneList),
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 1,
                message: 'unable to get zone List',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Language List API
    /**
     * @api {get} /api/list/language-list Language List API
     * @apiGroup Store List
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {Number} count count should be number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully got language list",
     *      "data":{
     *      "languageId"
     *      "name"
     *      "status"
     *      "code"
     *      "sortOrder"
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/list/language-list
     * @apiErrorExample {json} Language error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/language-list')
    public async languageList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
        const select = ['languageId', 'name', 'code', 'image', 'imagePath', 'isActive', 'sortOrder', 'isActive'];
        const search = [
            {
                name: 'name',
                op: 'like',
                value: keyword,
            },
            {
                name: 'isActive',
                op: 'where',
                value: 1,
            },
        ];
        const WhereConditions = [];
        const languageList = await this.languageService.list(limit, offset, select, search, WhereConditions, count);
        if (languageList) {
            const successResponse: any = {
                status: 1,
                message: 'successfully got the complete language list.',
                data: languageList,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'unable to show language list',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // Specific parent Category List API
    /**
     * @api {get} /api/list/specific-category-list Specific Category List
     * @apiGroup Store List
     * @apiParam (Request body) {String} categorySlug categorySlug
     * @apiParamExample {json} Input
     * {
     *      "parentInt" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Category listed successfully..!",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/list/specific-category-list
     * @apiErrorExample {json} Category List error
     * HTTP/1.1 500 Internal Server Error
     */
    // Category List Function
    @Get('/specific-category-list')
    public async SpecificcategoryList(@QueryParam('categorySlug') categorySlugParam: string, @Req() request: any, @Res() response: any): Promise<any> {

        const categoryDataId = await this.categoryService.findOne({
            where: {
                categorySlug: categorySlugParam,
            },
        });

        if (categoryDataId === undefined) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid categoryId',
            };
            return response.status(400).send(errorResponse);
        }

        
        const isLeafCat = await this.categoryService.findOne({
            where: {
                categoryId: categoryDataId.parentInt,
            },
        });


        const categoryDetailId = await this.categoryPathService.findOne({ categoryId: categoryDataId.categoryId, level: 0 });
        const select = ['categoryId', 'name', 'image', 'imagePath', 'parentInt', 'sortOrder', 'metaTagTitle', 'metaTagDescription', 'metaTagKeyword', 'categorySlug'];
        const search = [
            {
                name: 'isActive',
                op: 'where',
                value: 1,
            },
        ];
        const categoryData = await this.categoryService.list(0, 0, select, search, 0, 0, 0);
        const categoryList = arrayToTree(categoryData, {
            parentProperty: 'parentInt',
            customID: 'categoryId',
        });


        if (categoryDetailId) {
            const mainCategoryId = categoryDetailId.pathId;
            let dataList;
            const key = 'categoryId';
            for (const data of categoryList) {
                if (data[key] === mainCategoryId) {
                    dataList = data;
                }
            }

            let newResp:any = {};
            if (categoryDataId.parentInt == 0 || isLeafCat.parentInt < 1) {
                newResp = dataList;
            } else {

                const newD = dataList && dataList.children.filter((item) => item.categoryId == categoryDataId.parentInt);


                if (newD) {
                    newResp = newD[0];
                }

            }
            try{
            newResp.searchCategoryId=categoryDataId.categoryId
            }catch{
                console.log("catch")
            }
            const successResponse: any = {
                status: 1,
                message: 'Successfully get the related category List',
                data: newResp,
            };
            return response.status(200).send(successResponse);
        } else {
            const successResponse: any = {
                status: 0,
                message: 'Category List not available',
            };
            return response.status(200).send(successResponse);

        }
    }

    // get payment setting API
    /**
     * @api {get} /api/list/get-payment-setting Get payment setting API
     * @apiGroup Store List
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {Number} count count should be number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully got payment setting",
     *      "data":{
     *      "plugin_name"
     *      "plugin_avatar"
     *      "plugin_avatar_path"
     *      "plugin_type"
     *      "plugin_status"
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/list/get-payment-setting
     * @apiErrorExample {json} get payment setting error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/get-payment-setting')
    public async paymentSettingList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
        const select = ['id', 'pluginName', 'pluginAvatar', 'pluginAvatarPath', 'pluginType', 'pluginAdditionalInfo', 'pluginStatus', 'resources'];

        const search = [
            {
                name: 'pluginType',
                op: 'like',
                value: keyword,
            },
            {
                name: 'pluginStatus',
                op: 'where',
                value: 1,
            },
        ];
        const WhereConditions = [];
        const paymentSettingList = await this.pluginService.list(limit, offset, select, search, WhereConditions, count);
        const successResponse: any = {
            status: 1,
            message: 'Successfully got payment List.',
            data: paymentSettingList,
        };
        return response.status(200).send(successResponse);

    }

    // Active product count API
    /**
     * @api {get} /api/list/product-count  Product Count API
     * @apiGroup Store List
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} manufacturerId keyword for search
     * @apiParam (Request body) {String} keyword keyword for search
     * @apiParam (Request body) {String} categoryslug categoryslug
     * @apiParam (Request body) {Number} priceFrom price from you want to list
     * @apiParam (Request body) {Number} priceTo price to you want to list
     * @apiParam (Request body) {String} variant
     * @apiParam (Request body) {String} attribute
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get Product Count",
     *      "data":{
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/list/product-count
     * @apiErrorExample {json} product count error
     * HTTP/1.1 500 Internal Server Error
     */
    @UseBefore(CheckTokenMiddleware)
    @Get('/product-count')
    public async productCount(@QueryParams() params: ListRequest, @Req() request: any, @Res() response: any): Promise<any> {
        const currentDate = moment().format('YYYY-MM-DD');
        const maximum: any = ['Max(product.price) As maximumProductPrice'];
        const maximumPrice: any = await this.productService.productMaxPrice(maximum);
        const productPrice: any = maximumPrice.maximumProductPrice;
        const limit = params.limit;
        const offset = params.offset;
        const selects = ['Product.productId as productId',
            'Product.taxType as taxType',
            'Product.taxValue as taxValue',
            'Product.name as name',
            'Product.price as price',
            'Product.description as description',
            'Product.manufacturerId as manufacturerId',
            'Product.dateAvailable as dateAvailable',
            'Product.sku as sku',
            'Product.skuId as skuId',
            'Product.isSimplified as isSimplified',
            'Product.upc as upc',
            'Product.quantity as quantity',
            'Product.rating as rating',
            'Product.isActive as isActive',
            'Product.productSlug as productSlug',
            'Product.metaTagTitle as metaTagTitle',
            'Product.metaTagDescription as metaTagDescription',
            'Product.metaTagKeyword as metaTagKeyword',
            'Product.hasStock as hasStock',
            'Product.outOfStockThreshold as outOfStockThreshold',
            'Product.stockStatusId as stockStatusId',
            'Product.createdDate as createdDate',
            'Product.keywords as keywords',
            'Product.attributeKeyword as attributeKeyword',
            '(SELECT pi.container_name as containerName FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as containerName',
            '(SELECT pi.image as image FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as image',
            '(SELECT pi.default_image as defaultImage FROM product_image pi WHERE pi.product_id = Product.productId AND pi.default_image = 1 LIMIT 1) as defaultImage',
            '(SELECT COUNT(pr.rating) as ratingCount FROM product_rating pr WHERE pr.product_id = Product.productId) as ratingCount',
            '(SELECT COUNT(pr.review) as reviewCount FROM product_rating pr WHERE pr.product_id = Product.productId AND pr.review IS NOT NULL) as reviewCount',
            'IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue )  as taxValue',
            'IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AS skuId',
            '(SELECT sku.sku_name as skuName FROM sku WHERE sku.id = skuId) as skuName',
            '(SELECT sku.price as price FROM sku WHERE sku.id = skuId) as price',
            '(SELECT sku.price as price FROM sku WHERE sku.id = skuId) as modifiedPrice',
            '(SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = skuId AND ((pd2.date_start <= CURDATE() AND  pd2.date_end >= CURDATE())) ' +
            ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) AS productDiscount',
            '(SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = skuId AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' + 'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) AS productSpecial',
        ];
        const whereCondition = [];
        const relations = [];
        const groupBy = [];
        if (params.categoryslug === '' || params.categoryslug === undefined) {
            whereCondition.push({
                name: 'Product.isActive',
                op: 'and',
                value: 1,
            }, {
                name: 'Product.dateAvailable',
                op: 'raw',
                sign: '<=',
                value: currentDate.toString(),
            });
        } else {
            relations.push({
                tableName: 'Product.productToCategory',
                op: 'left',
                aliasName: 'productToCategory',
            }, {
                tableName: 'productToCategory.category',
                op: 'left',
                aliasName: 'category',
            });
            whereCondition.push({
                name: 'Product.isActive',
                op: 'and',
                value: 1,
            }, {
                name: 'category.category_slug',
                op: 'and',
                value: '"' + params.categoryslug + '"',
            }, {
                name: 'Product.dateAvailable',
                op: 'raw',
                sign: '<=',
                value: currentDate.toString(),
            });
        }

        if (request.id) {
            selects.push('customerWishlist.wishlistProductId as wishlistProductId');
            relations.push({
                tableName: 'Product.wishlist',
                op: 'leftCond',
                aliasName: 'customerWishlist',
                cond: 'customerWishlist.customerId = ' + request.id,
            });
        }

        if (params.manufacturerId) {
            whereCondition.push({
                name: 'Product.manufacturer_id',
                op: 'IN',
                value: params.manufacturerId,
            });
        }
        const searchConditions = [];
        if (params.keyword) {
            searchConditions.push({
                name: ['Product.keywords', 'Product.name'],
                value: params.keyword.toLowerCase(),
            });
        }

        if (params.priceFrom) {
            whereCondition.push({
                name: '(CASE WHEN (((SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' +
                    'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) IS NOT NULL) AND `Product`.`tax_type` = 2 AND (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != 0 || IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != NULL)) THEN (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue )/100 * (SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' +
                    'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1)) + (SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' +
                    'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) WHEN (((SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' +
                    'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) IS NOT NULL) AND `Product`.`tax_type` = 1 AND (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != 0 || IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != NULL)) THEN ((SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = ' +
                    ' IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' +
                    'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) + IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue )) ' +
                    ' WHEN (((SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) IS NOT NULL) AND `Product`.`tax_type` = 2 AND (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != 0 || IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != NULL)) THEN (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue )/100 * (SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = ' +
                    'IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1)) + (SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) WHEN ((SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) IS NOT NULL AND `Product`.`tax_type` = 1 AND (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != 0 || IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != NULL)) THEN (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) + (SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = ' +
                    'IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1)) WHEN ((SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' +
                    'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) IS NOT NULL) THEN (SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))'
                    + ' ' + 'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1)' +
                    ' WHEN ((SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) IS NOT NULL) THEN (SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) WHEN (`Product`.`tax_type` = 2 AND (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != 0 || IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != NULL)) THEN (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue )/100 * (SELECT sku.price as price FROM sku WHERE sku.id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ))) + (SELECT sku.price as price FROM sku WHERE sku.id = ' +
                    ' IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) )) WHEN (`Product`.`tax_type` = 1 AND (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != 0 || IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != NULL)) THEN (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) + (SELECT sku.price as price FROM sku WHERE sku.id = ' +
                    'IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ))) ELSE (SELECT sku.price as price FROM sku WHERE sku.id = ' +
                    'IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) )) END)',
                op: 'raw',
                sign: '>=',
                value: params.priceFrom,
            });
        }
        if (params.priceTo) {
            whereCondition.push({
                name: '(CASE WHEN (((SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' +
                    'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) IS NOT NULL) AND `Product`.`tax_type` = 2 AND (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != 0 || IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != NULL)) THEN (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue )/100 * (SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' +
                    'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1)) + (SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' +
                    'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) WHEN (((SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' +
                    'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) IS NOT NULL) AND `Product`.`tax_type` = 1 AND (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != 0 || IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != NULL)) THEN ((SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = ' +
                    ' IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' +
                    'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) + IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue )) ' +
                    ' WHEN (((SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) IS NOT NULL) AND `Product`.`tax_type` = 2 AND (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != 0 || IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != NULL)) THEN (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue )/100 * (SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = ' +
                    'IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1)) + (SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) WHEN ((SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) IS NOT NULL AND `Product`.`tax_type` = 1 AND (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != 0 || IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != NULL)) THEN (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) + (SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = ' +
                    'IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1)) WHEN ((SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))' + ' ' +
                    'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1) IS NOT NULL) THEN (SELECT price FROM product_special ps WHERE ps.product_id = Product.product_id AND ps.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((ps.date_start <= CURDATE() AND ps.date_end >= CURDATE()))'
                    + ' ' + 'ORDER BY ps.priority ASC, ps.price ASC LIMIT 1)' +
                    ' WHEN ((SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) IS NOT NULL) THEN (SELECT price FROM product_discount pd2 WHERE pd2.product_id = Product.product_id AND pd2.sku_id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ) AND ((pd2.date_start <= CURDATE() AND pd2.date_end >= CURDATE())) ' +
                    ' ORDER BY pd2.priority ASC, pd2.price ASC LIMIT 1) WHEN (`Product`.`tax_type` = 2 AND (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != 0 || IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != NULL)) THEN (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue )/100 * (SELECT sku.price as price FROM sku WHERE sku.id = IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ))) + (SELECT sku.price as price FROM sku WHERE sku.id = ' +
                    ' IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) )) WHEN (`Product`.`tax_type` = 1 AND (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != 0 || IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) != NULL)) THEN (IF(Product.taxType = 2, (SELECT tax.tax_percentage FROM tax WHERE tax.tax_id = `Product`.`tax_value`  LIMIT 1), Product.taxValue ) + (SELECT sku.price as price FROM sku WHERE sku.id = ' +
                    'IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) ))) ELSE (SELECT sku.price as price FROM sku WHERE sku.id = ' +
                    'IF(Product.isSimplified = 1, (SELECT id as skuId FROM sku WHERE sku.id = Product.skuId), (SELECT pvo.sku_id as skuId FROM product_varient_option pvo WHERE pvo.product_id = Product.productId AND pvo.is_active = 1 LIMIT 1) )) END)',
                op: 'raw',
                sign: '<=',
                value: params.priceTo,
            });
        }

        const sort = [];
        if (params.price && params.price!="MAX" && params.price!="NEW" && params.price!="DISCOUNT" && params.price!="POPULAR") {
            sort.push({
                name: '(CASE WHEN ((productSpecial IS NOT NULL) AND `Product`.`tax_type` = 2 AND (taxValue != 0 || taxValue != NULL)) THEN (taxValue/100 * productSpecial) + productSpecial WHEN ((productSpecial IS NOT NULL) AND `Product`.`tax_type` = 1 AND (taxValue != 0 || taxValue != NULL)) THEN (productSpecial + taxValue) ' +
                    ' WHEN ((productDiscount IS NOT NULL) AND `Product`.`tax_type` = 2 AND (taxValue != 0 || taxValue != NULL)) THEN (taxValue/100 * productDiscount) + productDiscount WHEN (productDiscount IS NOT NULL AND `Product`.`tax_type` = 1 AND (taxValue != 0 || taxValue != NULL)) THEN (taxValue + productDiscount) WHEN (productSpecial IS NOT NULL) THEN productSpecial' +
                    ' WHEN (productDiscount IS NOT NULL) THEN productDiscount WHEN (`Product`.`tax_type` = 2 AND (taxValue != 0 || taxValue != NULL)) THEN (taxValue/100 * modifiedPrice) + modifiedPrice WHEN (`Product`.`tax_type` = 1 AND (taxValue != 0 || taxValue != NULL)) THEN (taxValue + modifiedPrice) ELSE modifiedPrice END)',
                order: params.price,
            });
        } else {
            sort.push({
                name: 'Product.sortOrder',
                order: 'ASC',
            });
        }
        const productList: any = await this.productService.listByQueryBuilder(limit, offset, selects, whereCondition, searchConditions, relations, groupBy, sort, true, true);
        const successResponse: any = {
            status: 1,
            message: 'Successfully get Product Count',
            data: {
                productCount: productList,
                maximumProductPrice: productPrice,
            },
        };
        return response.status(200).send(successResponse);

    }

    // Blog List API
    /**
     * @api {get} /api/list/blog/blog-list Blog List API
     * @apiGroup Store List
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {Number} count count should be number or boolean
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get blog list",
     *      "data":{},
     *      "status": "1"
     * }
     * @apiSampleRequest /api/list/blog/blog-list
     * @apiErrorExample {json} Blog error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/blog/blog-list')
    public async BlogList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('isActive') isActive: number, @QueryParam('count') count: number | boolean, @Res() response: any): Promise<any> {
        const select = ['id', 'title', 'description', 'categoryId', 'image', 'imagePath', 'isActive', 'metaTagTitle', 'metaTagDescription', 'metaTagKeyword', 'createdDate', 'createdBy', 'blogSlug'];
        const search = [
            {
                name: 'title',
                op: 'like',
                value: keyword,
            },
            {
                name: 'isActive',
                op: 'like',
                value: 1,
            },
        ];
        const WhereConditions = [];
        const getBlogList = await this.blogService.list(limit, offset, select, search, WhereConditions, count);
        if (count) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully get All Blog List',
                data: getBlogList,
            };
            return response.status(200).send(successResponse);
        } else {
            const blogList = getBlogList.map(async (val: any) => {
                const data: any = val;
                const getCategoryName = await this.categoryService.findOne({
                    where: { categoryId: val.categoryId },
                    select: ['name'],
                });
                const getUser = await this.userService.findOne({
                    where: { userId: val.createdBy },
                    select: ['firstName', 'avatar', 'avatarPath'],
                });
                if (getCategoryName !== undefined) {
                    data.categoryName = getCategoryName.name;
                }
                if (getUser !== undefined) {
                    data.createdByName = getUser.firstName;
                    data.createdByImage = getUser.avatar;
                    data.createdByImagePath = getUser.avatarPath;
                }
                return data;
            });
            const results: any = await Promise.all(blogList);
            const featuredPost = results[0];
            results.shift();
            if (blogList) {
                const successResponse: any = {
                    status: 1,
                    message: 'Successfully get blog list',
                    data: { results, featuredPost },
                };
                return response.status(200).send(successResponse);
            } else {
                const errorResponse: any = {
                    status: 0,
                    message: 'unable to list blog',
                };
                return response.status(400).send(errorResponse);
            }
        }
    }
    // get Blog Detail API
    /**
     * @api {get} /api/list/blog/blog-detail/:blogSlug Blog Detail API
     * @apiGroup Store List
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get blog Detail",
     *      "data":{
     *      "id" : "",
     *      "title" : "",
     *      "categoryId" : "",
     *      "description" : "",
     *      "image" : "",
     *      "imagePath" : "",
     *      "isActive" : "",
     *      "metaTagTitle" : "",
     *      "metaTagDescription" : "",
     *      "metaTagKeyword" : "",
     *      "status" : "",
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/list/blog/blog-detail/:blogSlug
     * @apiErrorExample {json} Blog error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/blog/blog-detail/:blogSlug')
    public async BlogDetail(@Param('blogSlug') blogSlug: string, @Res() response: any): Promise<any> {
        const blog = await this.blogService.findOne({
            where: {
                blogSlug,
            },
        });
        if (!blog) {
            const errorResponse: any = {
                status: 0,
                message: 'invalid blog',
            };
            return response.status(404).send(errorResponse);
        }
        const blogDetails = await this.blogService.findOne(blog);
        const getCategoryName = await this.categoryService.findOne({
            where: { categoryId: blogDetails.categoryId },
            select: ['name'],
        });
        if (getCategoryName !== undefined) {
            blogDetails.categoryName = getCategoryName.name;
        }
        if (blogDetails) {
            const successResponse: any = {
                status: 1,
                message: 'Successfully get blog Details',
                data: blogDetails,
            };
            return response.status(200).send(successResponse);
        } else {
            const errorResponse: any = {
                status: 0,
                message: 'unable to get blog Details',
            };
            return response.status(400).send(errorResponse);
        }
    }

    // order log List API
    /**
     * @api {get} /api/list/orderLoglist Order Log List API
     * @apiGroup Store
     * @apiHeader {String} Authorization
     * @apiParam (Request body) {String} orderPrefixId orderPrefixId
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Successfully get order log list",
     *      "data":{
     *      "orderStatus" : "",
     *      "createdDate" : "",
     *      }
     *      "status": "1"
     * }
     * @apiSampleRequest /api/list/orderLoglist
     * @apiErrorExample {json} order log error
     * HTTP/1.1 500 Internal Server Error
     */
    @Get('/orderLoglist')
    public async listOrderLog(@QueryParam('orderPrefixId') orderProductPrefixId: string, @Res() response: any): Promise<any> {
        const orderProductData = await this.orderProductService.findOne({
            where: {
                orderProductPrefixId,
            },
        });
        if (!orderProductData) {
            const errorResponse: any = {
                status: 0,
                message: 'Invalid OrderProductId',
            };
            return response.status(400).send(errorResponse);
        }
        const orderProductId = orderProductData.orderProductId;
        const select = ['orderProductId', 'orderStatusId', 'total', 'createdDate', 'modifiedDate'];
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
            message: 'Successfully got the complete order Log list.',
            data: result,
        };
        return response.status(200).send(successResponse);
    }

    // Related Blog Showing API
    /**
     * @api {get} /api/list/related-blog-list Related Blog List
     * @apiGroup Store List
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} blogSlug Blog Slug
     * @apiParam (Request body) {Number} count
     * @apiParamExample {json} Input
     * {
     *      "blogSlug" : "",
     * }
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *      "message": "Related Blog List Showing Successfully..!",
     *      "status": "1"
     * }
     * @apiSampleRequest /api/list/related-blog-list
     * @apiErrorExample {json} Related Blog List error
     * HTTP/1.1 500 Internal Server Error
     */
    // Blog List Function
    @Get('/related-blog-list')
    public async relatedBlogList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('blogSlug') blogSlug: string, @QueryParam('count') count: number | boolean, @Req() request: any, @Res() response: any): Promise<any> {
        const blogDetail: any = await this.blogService.findOne({
            blogSlug,
        });
        if (!blogDetail) {
            return response.status(200).send({
                status: 1,
                message: 'Related blog list is successfully being shown. ',
                data: [],
            });
        }
        const whereConditions = [
            {
                name: 'blogId',
                value: blogDetail.id,
            },
        ];
        const relatedData = await this.blogRelatedService.list(limit, offset, 0, 0, whereConditions, count);
        if (count) {
            const Response: any = {
                status: 1,
                message: 'Related blog list is successfully being shown. ',
                data: relatedData,
            };
            return response.status(200).send(Response);
        }
        const promises = relatedData.map(async (results: any) => {
            const Id = results.relatedBlogId;
            const blog = await this.blogService.findOne({
                select: ['id', 'title', 'categoryId', 'description', 'image', 'imagePath', 'isActive', 'metaTagTitle', 'metaTagDescription', 'metaTagKeyword', 'blogSlug', 'createdDate'],
                where: { id: Id },
            });
            const category = await this.categoryService.findOne({ where: { categoryId: blog.categoryId } });
            const temp: any = blog;
            if (category !== undefined) {
                temp.categoryName = category.name;
            }
            return temp;
        });
        const result = await Promise.all(promises);
        const successResponse: any = {
            status: 1,
            message: 'Related blog list is successfully being shown. ',
            data: result,
        };
        return response.status(200).send(successResponse);
    }

    // Question List API
    /**
     * @api {get} /api/list/question-list Question List API
     * @apiGroup Store List
     * @apiParam (Request body) {Number} productId productId
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {String} count count in number or boolean
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully get question list",
     *    "data":"{}"
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/list/question-list
     * @apiErrorExample {json} question error
     * HTTP/1.1 500 Internal Server Error
     */
    @UseBefore(CheckTokenMiddleware)
    @Get('/question-list')
    public async questionList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('productId') productId: number, @QueryParam('count') count: number | boolean, @Req() request: any, @Res() response: any): Promise<any> {
        const productDetail = await this.productService.findOne({
            where: { productId },
        });
        if (!productDetail) {
            const errorResponse: any = {
                status: 1,
                message: 'Invalid ProductId',
            };
            return response.status(400).send(errorResponse);
        }
        const select = ['questionId', 'productId', 'question', 'referenceId', 'type', 'isActive'];
        const whereConditions = [];
        const search: any = [
            {
                name: 'productId',
                op: 'where',
                value: productId,
            },
            {
                name: 'isActive',
                op: 'where',
                value: 1,
            },
            {
                name: 'question',
                op: 'like',
                value: keyword,
            },
        ];

        const questionList = await this.productQuestionService.list(limit, offset, select, search, whereConditions, count);
        if (count) {
            return response.status(200).send({
                status: 1,
                message: 'Successfully get count',
                data: questionList,
            });
        }
        const promise = questionList.map(async (result: any) => {
            const type = result.type;
            const temp: any = result;
            const answer = await this.productAnswerService.findOne({
                select: ['questionId', 'answerId', 'answer', 'referenceId', 'likes', 'dislikes', 'type', 'createdDate', 'isActive'],
                where: { questionId: result.questionId, isActive: 1, defaultAnswer: 1 },
            });
            if (answer) {
                if (request.id) {
                    const likeType = await this.productAnswerLikeService.findOne({
                        where: {
                            answerId: answer.answerId,
                            customerId: request.id,
                        },
                    });
                    if (likeType) {
                        answer.likeType = likeType.type;
                    } else {
                        answer.likeType = 0;
                    }
                } else {
                    answer.likeType = 0;
                }
            }
            temp.answerList = answer;
            if (type && type === 2) {
                const customer = await this.customerService.findOne({
                    select: ['id', 'firstName', 'avatar', 'avatarPath', 'city'],
                    where: { id: result.referenceId },
                });
                if (customer !== undefined) {
                    temp.postedBy = customer;
                }
            } else if (type && type === 1) {
                const adminUser = await this.userService.findOne({
                    select: ['userId', 'firstName', 'avatar', 'avatarPath'],
                    where: { userId: result.referenceId },
                });
                if (adminUser !== undefined) {
                    temp.postedBy = adminUser;
                }
            }
            const searchQuestion: any = [
                {
                    name: 'questionId',
                    op: 'where',
                    value: result.questionId,
                },
                {
                    name: 'isActive',
                    op: 'where',
                    value: 1,
                },
            ];
            const ansCount = await this.productAnswerService.list(0, 0, [], searchQuestion, [], 1);
            temp.answerCount = ansCount;
            return temp;
        });
        const value = await Promise.all(promise);
        const successResponse: any = {
            status: 1,
            message: 'Successfully get all question List',
            data: value,
        };
        return response.status(200).send(successResponse);

    }

    // Answer List API
    /**
     * @api {get} /api/list/answer-list Answer List API
     * @apiGroup Store List
     * @apiParam (Request body) {Number} questionId questionId
     * @apiParam (Request body) {Number} limit limit
     * @apiParam (Request body) {Number} offset offset
     * @apiParam (Request body) {String} keyword keyword
     * @apiParam (Request body) {String} count count in number or boolean
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully got answer list",
     *    "data":"{}"
     *    "status": "1"
     *  }
     * @apiSampleRequest /api/list/answer-list
     * @apiErrorExample {json} answer error
     * HTTP/1.1 500 Internal Server Error
     */
    @UseBefore(CheckTokenMiddleware)
    @Get('/answer-list')
    public async answerList(@QueryParam('limit') limit: number, @QueryParam('offset') offset: number, @QueryParam('keyword') keyword: string, @QueryParam('questionId') questionId: number, @QueryParam('count') count: number | boolean, @Req() request: any, @Res() response: any): Promise<any> {
        const question = await this.productQuestionService.findOne({
            where: { questionId },
        });
        if (!question) {
            const errorResponse: any = {
                status: 1,
                message: 'Invalid QuestionId',
            };
            return response.status(400).send(errorResponse);
        }
        const select = ['questionId', 'answerId', 'answer', 'referenceId', 'likes', 'dislikes', 'type', 'defaultAnswer', 'createdDate', 'isActive'];
        const whereConditions = [];
        const search: any = [
            {
                name: 'questionId',
                op: 'where',
                value: questionId,
            },
            {
                name: 'isActive',
                op: 'where',
                value: 1,
            },
            {
                name: 'answer',
                op: 'like',
                value: keyword,
            },
        ];

        const answerList = await this.productAnswerService.list(limit, offset, select, search, whereConditions, count);
        if (count) {
            return response.status(200).send({
                status: 1,
                message: 'Successfully get count',
                data: answerList,
            });
        }
        const promise = answerList.map(async (result: any) => {
            const type = result.type;
            const temp: any = result;
            if (type && type === 2) {
                const customer = await this.customerService.findOne({
                    select: ['id', 'firstName', 'avatar', 'avatarPath', 'city'],
                    where: { id: result.referenceId },
                });
                if (customer !== undefined) {
                    temp.postedBy = customer;
                }
            } else if (type && type === 1) {
                const adminUser = await this.userService.findOne({
                    select: ['userId', 'firstName', 'avatar', 'avatarPath'],
                    where: { userId: result.referenceId },
                });
                if (adminUser !== undefined) {
                    temp.postedBy = adminUser;
                }
            }
            if (request.id) {
                const likeType = await this.productAnswerLikeService.findOne({
                    where: {
                        answerId: result.answerId,
                        customerId: request.id,
                    },
                });
                if (likeType) {
                    temp.likeType = likeType.type;
                } else {
                    temp.likeType = 0;
                }
            } else {
                temp.likeType = 0;
            }
            return temp;
        });
        const value = await Promise.all(promise);
        const successResponse: any = {
            status: 1,
            message: 'Successfully get all answer List',
            data: value,
        };
        return response.status(200).send(successResponse);

    }

    // Answer List API
    /**
     * @api {get} /api/list/get-discount-list Discount List
     * @apiGroup Product Discount
     * @apiHeader {String} Authorization
     * @apiSuccessExample {json} Success
     * HTTP/1.1 200 OK
     * {
     *    "message": "Successfully got list",
     *    "data":"[{}]"
     *    "status": "200"
     *  }
     * @apiSampleRequest /api/list/get-discount-list
     * @apiErrorExample {json} answer error
     * HTTP/1.1 500 Internal Server Error
     */
    //@UseBefore(CheckTokenMiddleware)
    @Get('/get-discount-list')
    public async getDiscountList(@Req() request: any, @Res() response: any): Promise<any> {
        let _res = await this.productService.getProductDiscount();
        if(_res){
            return response.status(200).send(await this._m.getMessage(200,_res));
        }else{
            return response.status(200).send(await this._m.getMessage(300,{}));
        }
    }

    @Get('/product-list-data')
    public async productListData(@QueryParams() params: any, @Res() response: any): Promise<any> {

        const category= await getManager().query(`SELECT category_id pathId, name categoryName, category_id categoryId, category_slug categorySlug, parent_int parentInt, meta_tag_title metaTagTitle, meta_tag_description metaTagDescription, meta_tag_keyword metaTagKeyword FROM category WHERE category_slug='${params.categoryslug}' UNION ALL SELECT category_id pathId, name categoryName, category_id categoryId, category_slug categorySlug, parent_int parentInt, meta_tag_title metaTagTitle, meta_tag_description metaTagDescription, meta_tag_keyword metaTagKeyword FROM category WHERE category_id=(SELECT parent_int FROM category WHERE category_slug='${params.categoryslug}')`)
        
        //${category[0].categoryId}
        const productData = await getManager().query(`SELECT pt.attribute_keyword attributeKeyword, pi.container_name containerName, pi.default_image defaultImage, pi.image image, pt.created_date createdDate,  pt.date_available dateAvailable, pt.description description, pt.delete_flag flag, pt.has_stock hasStock, pt.is_active isActive, pt.is_simplified isSimplified, pt.keywords keywords, pt.manufacturer_id manufacturerId, pt.meta_tag_description metaTagDescription, pt.meta_tag_keyword metaTagKeyword, pt.meta_tag_title metaTagTitle, pt.name name, pt.out_of_stock_threshold outOfStockThreshold, pt.price price, pt.product_id productId, pt.product_slug productSlug, pt.product_size_color product_size_color, pt.promotion_flag promotionFlag, pt.quantity quantity, pt.rating rating, pt.sku sku, pt.sku_id skuId, pt.stock_status_id stockStatusId, pt.tax_type taxType, pt.upc upc FROM product_to_category ptc INNER JOIN product pt ON pt.product_id=ptc.product_id INNER JOIN product_image pi ON pi.product_id=pt.product_id WHERE ptc.category_id=${category[0].categoryId} AND pt.is_active=1 AND pi.default_image=1 ORDER BY pt.created_date DESC LIMIT ${params.limit} OFFSET ${params.offset}`)
        const allData = {
            categoryLevel:category,
            data:productData,
            message:"Successfully got the complete list of products.",
            status: 1
        }
    return allData         
    }

    @Get('/get-top-selling-products')
    public async getTopSellingProducts(@QueryParams() filterData: any): Promise<any> {

        const topSellingProductIds = await getManager().query('SELECT GROUP_CONCAT(product_id) as pids from ( SELECT COUNT(op.order_product_id) AS total_count, op.product_id, op.name as name from `order` AS o join order_product op on(o.order_id = op.order_id) WHERE op.product_id <> 0 GROUP  BY op.product_id, op.name ORDER BY total_count DESC LIMIT 10) top_products');

        const pids = topSellingProductIds[0].pids && topSellingProductIds[0].pids.split(",");
        
        const result = await createQueryBuilder('product', 'p')
            .select(['p.product_id as productId', 'p.name as productName', 'p.price as productPrice', 'p.tax_type as taxType', 'tx.tax_percentage as taxValue', 'p.product_slug as productSlug', 'p.promotion_flag as promotionFlag', 'pd.price as discountPrice', 'pim.image as productImage', 'pim.container_name as imagePath', 'ROUND(SUM(CASE WHEN pr.rating IS NULL THEN 0 ELSE pr.rating END)/COUNT(*),1) as productRating'])
            
            .innerJoin('(SELECT * FROM (SELECT DENSE_RANK() OVER (PARTITION BY product_id ORDER BY product_image_id ASC) AS rankings, product_id, image, container_name FROM `product_image`) AS t WHERE rankings=1)', 'pim', 'p.product_id=pim.product_id')
            .innerJoin('tax','tx','tx.tax_id=p.tax_value')
            .leftJoin('product_rating', 'pr', 'p.product_id=pr.product_id')
            .leftJoin('product_discount', 'pd', 'pd.product_id=p.product_id')
            .where('p.product_id IN (:pid)', { pid: pids })
            .andWhere('p.is_active=1')
            .orderBy('p.product_id', 'DESC')
            .groupBy('productId, productName, productPrice, productSlug, productImage, promotionFlag, discountPrice, imagePath')
            .limit(10)
            .getRawMany()

            
        let sendResponse: any;
        if (result.length > 0) {
            sendResponse = {
                status: 200,
                message: 'Data found Successfully',
                data: result,
            };
        } else {
            sendResponse = {
                status: 500,
                message: 'Data not available',
                data: "",
            };
        }
        return sendResponse
    }  

    @Get('/get-active-languages')
    public async getActiveLanguages(): Promise<any> {

        const activeLang = await getManager().query('SELECT name, code, image, image_path, redirect_url FROM language WHERE is_active=1');
 
        let sendResponse: any;
        if (activeLang.length > 0) {
            sendResponse = {
                status: 200,
                message: 'Data found Successfully',
                data: activeLang,
            };
        } else {
            sendResponse = {
                status: 500,
                message: 'Data not available',
                data: "",
            };
        }
        return sendResponse
    }


    public async deleteRedisGroup(groupName:any){
        const client:any = require('./client')

        const groupPattern = `${groupName}:*`; // The pattern for the keys to delete
        let cursor = '0'; // Start cursor for SCAN
      
        try {
          let totalDeleted = 0; // Counter for total deleted keys
      
          // Use a do-while loop to scan through keys until we reach the end (cursor === '0')
          do {
            // Perform SCAN command with MATCH for pattern and COUNT for number of keys per iteration
            const [newCursor, keys] = await client.scan(cursor, 'MATCH', groupPattern, 'COUNT', 100);
      
            cursor = newCursor; // Update cursor for next iteration
      
            if (keys.length > 0) {
              // If we found keys, delete them
              await client.del(keys); // Delete the keys
              totalDeleted += keys.length; // Add the number of deleted keys to the counter
              console.log(`Deleted ${keys.length} keys`);
            }
      
          } while (cursor !== '0'); // Continue scanning until the cursor is '0', meaning we've scanned all keys
      
          console.log(`Total deleted keys: ${totalDeleted}`);
        } catch (err) {
          console.error('Error:', err);
        } 
    }
}
