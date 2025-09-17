/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { Product } from '../models/ProductModel';
import { ProductRepository } from '../repositories/ProductRepository';
import { Brackets, getConnection, getManager, getRepository, Like } from 'typeorm';
import { ProductVarientOption } from '../models/ProductVarientOption';
import { ProductToCategoryRepository } from '../repositories/ProductToCategoryRepository';
import { Category } from '../models/CategoryModel';

@Service()
export class ProductService {
    constructor(
        @OrmRepository() private productRepository: ProductRepository,
        @OrmRepository() private productToCategory : ProductToCategoryRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    // find product
    public find(product: any): Promise<any> {
        return this.productRepository.find(product);
    }

    // find product
    public findAll(): Promise<any> {
        return this.productRepository.find();
    }

    public async getAllActiveProducts(): Promise<any> {
        const activeProducts = await getRepository(Product).createQueryBuilder("p")
        .select(["p.productSlug", "p.modifiedDate"])
        .where("p.isActive = :colStatus", { colStatus: 1 })
        .getRawMany();
        return activeProducts;
    }
    // find one product
    public async findOne(findCondition: any): Promise<any> {
        return await this.productRepository.findOne(findCondition);
    }


    // find one product
    public async findByIds(ids: any): Promise<any> {
        return await this.productRepository.findByIds(ids);
    }

    // product list
    public list(limit: number, offset: number, select: any = [], relation: any = [], whereConditions: any = [], search: any = [], price: number, count: number | boolean): Promise<any> {
        const condition: any = {};

        if (select && select.length > 0) {
            condition.select = select;
        }

        if (relation && relation.length > 0) {
            condition.relations = relation;
        }

        condition.where = {};

        if (whereConditions && whereConditions.length > 0) {
            whereConditions.forEach((item: any) => {
                const operator: string = item.op;
                if (operator === 'where' && item.value !== '') {
                    condition.where[item.name] = item.value;
                } else if (operator === 'like' && item.value !== '') {
                    condition.where[item.name] = Like('%' + item.value + '%');
                }
            });
        }

        if (search && search.length > 0) {
            search.forEach((item: any) => {
                const operator: string = item.op;
                if (operator === 'like' && item.value !== '') {
                    condition.where[item.name] = Like('%' + item.value + '%');
                }
            });
        }

        if (price && price === 1) {
            condition.order = {
                price: 'ASC',
                createdDate: 'DESC',
            };
        } else if (price && price === 2) {
            condition.order = {
                price: 'DESC',
                createdDate: 'DESC',
            };
        } else {
            condition.order = {
                createdDate: 'DESC',
            };
        }

        if (limit && limit > 0) {
            condition.take = limit;
            condition.skip = offset;
        }
        if (count) {
            return this.productRepository.count(condition);
        }
        return this.productRepository.find(condition);
    }

    // create product
    public async create(product: Product): Promise<Product> {
        const newProduct = await this.productRepository.save(product);
        return newProduct;
    }

    // update product
    public update(id: any, product: Product): Promise<Product> {
        this.log.info('Update a product', id, product);
        product.productId = id;
        return this.productRepository.save(product);
    }

    // delete product
    public async delete(id: number): Promise<any> {
        this.log.info('Delete a product');
        const newProduct = await this.productRepository.delete(id);
        return newProduct;
    }

    // query builder product list
    public async productList(limit: number, offset: number, select: any = [], searchConditions: any = [], whereConditions: any = [], categoryId: any = [], priceFrom: string, priceTo: string, price: number, count: number | boolean): Promise<any> {
        return await this.productRepository.productList(limit, offset, select, searchConditions, whereConditions, categoryId, priceFrom, priceTo, price, count);
    }

    // Recent selling product
    public async recentProductSelling(limit: number): Promise<any> {
        return await this.productRepository.recentProductSelling(limit);
    }

    // Maximum Product price
    public async productMaxPrice(maximum: any): Promise<any> {
        return await this.productRepository.productMaxPrice(maximum);
    }

    public async slugData(data: string): Promise<any> {
        return await this.productRepository.productSlug(data);
    }

    public async slug(data: string): Promise<any> {
        return await this.productRepository.productSlugData(data);
    }

    public async findSkuName(productId: number, skuName: string, flag: number): Promise<any> {
        return await this.productRepository.findSkuName(productId, skuName, flag);
    }

    // findSkuForProductVarient
    public async findSkuForProductVarient(productId: number): Promise<any> {
        return await this.productRepository.findSkuForProductVarient(productId);
    }

    public async findProducts(productId: any): Promise<any> {
        return await this.productRepository.findProducts(productId);
    }

    public async listByQueryBuilder(
        limit: number,
        offset: number,
        select: any = [],
        whereConditions: any = [],
        searchConditions: any = [],
        relations: any = [],
        groupBy: any = [],
        sort: any = [],
        count: boolean = false,
        rawQuery: boolean = false)
        : Promise<Product[] | any> {

        const query: any = await getConnection().getRepository(Product).createQueryBuilder();
        // Select
        if (select && select.length > 0) {
            query.select(select);
        }
        // Join
        if (relations && relations.length > 0) {
            relations.forEach((joinTb: any) => {
                if (joinTb.op === 'left') {
                    query.leftJoin(joinTb.tableName, joinTb.aliasName);
                }else if (joinTb.op === 'specialInnerJoin-Discount') {
                    query.innerJoin(joinTb.tableName,joinTb.aliasName, 'Product.product_id=discountAliasTable.product_id');
                } else if (joinTb.op === 'leftCond') {
                    query.leftJoin(joinTb.tableName, joinTb.aliasName, joinTb.cond);
                } else {
                    query.innerJoin(joinTb.tableName, joinTb.aliasName);
                }
            });
        }
        // Where
        if (whereConditions && whereConditions.length > 0) {
            let a=[];
            let c=[];
            whereConditions.forEach((item: any) => {
                if (item.op === 'where' && item.sign === undefined) {
                    query.where(item.name + ' = ' + item.value);
                } else if (item.op === 'and' && item.sign === undefined) {
                    query.andWhere(item.name + ' = ' + item.value );
                } else if (item.op === 'and' && item.sign =='less' ) {
                    query.andWhere(item.name +' < ' +item.value );
                } else if (item.op === 'and' && item.sign =='big' ) {
                    query.andWhere(item.name +' >= ' +item.value );
                } else if (item.op === 'and' && item.sign !== undefined) {
                    query.andWhere(' \'' + item.name + '\'' + ' ' + item.sign + ' \'' + item.value + '\'');
                } else if (item.op === 'raw' && item.sign !== undefined) {
                    query.andWhere(item.name + ' ' + item.sign + ' \'' + item.value + '\'');
                } else if (item.op === 'or' && item.sign === undefined) {
                    query.orWhere(item.name + ' like ' + ' \'%' + item.value + '%\'');
                } else if (item.op === 'IN' && item.sign === undefined) {
                    query.andWhere(item.name + ' IN (' + item.value + ')');
                } else if (item.op === 'like' && item.sign === undefined) {
                    query.andWhere(item.name + ' like ' +  ' \'%' + item.value + '%\'');
                }else if (item.op == 'gt') {
                    query.andWhere(item.name + ' >= ' +   item.value);
                } else if (item.op === 'likeoddddr' && item.sign === undefined) {
                    let sizeFilterArray= item.value;
                    let colorsFilterArray= item.value1;
                    sizeFilterArray.forEach(element => {
                        a.push(item.name + ' like ' +   ' \'%' + element + '%\'');
                    });
                    colorsFilterArray.forEach(element => {
                        c.push(item.name + ' like ' +   ' \'%' + element + '%\'');
                    });
                    
                    if(item.type==2){
                        query.andWhere( a.join(" or ")+ " and " +c.join(" or "));
                    }else if(sizeFilterArray.length>0){
                        query.andWhere( a.join(" or "));
                    }else{
                        query.andWhere( c.join(" or "));
                    }

                    
                }else if (item.op === 'likeor' && item.sign === undefined && item.flag === "sizeFilter") {
                    let values = item.value;
                    if (values.length > 0) {
                        let _tempInc = 0;
                        let sizeQuery = "(";
                        for (let sizeItem of values) {
                            if (_tempInc == values.length - 1) {
                                sizeQuery = sizeQuery + item.name + ` LIKE "%${sizeItem}%" `
                            } else {
                                sizeQuery = sizeQuery + item.name + ` LIKE "%${sizeItem}%" OR `
                            }
                            _tempInc++;
                        }
                        sizeQuery = sizeQuery + ")"
                        query.andWhere(sizeQuery);

                    }
                    // const namesArray = item.name;
                    //     namesArray.forEach((name: string, index: number) => {
                    //         query.andWhere(new Brackets(qb => {
                    //             const valuesArray = item.value;
                    //             valuesArray.forEach((value: string | number, subIndex: number) => {
                    //                 if (subIndex === 0) {
                    //                     qb.andWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + value + '%\'');
                    //                     return;
                    //                 }
                    //                 qb.andWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + value + '%\'');
                    //             });
                    //         }));
                    //     });

                }
                else if (item.op === 'likeor' && item.sign === undefined && item.flag === "colorFilter") {
                    let values = item.value;
                    if (values.length > 0) {
                        let _tempInc = 0;
                        let sizeQuery = "(";
                        for (let sizeItem of values) {
                            if (_tempInc == values.length - 1) {
                                sizeQuery = sizeQuery + item.name + ` LIKE "%${sizeItem}%" `
                            } else {
                                sizeQuery = sizeQuery + item.name + ` LIKE "%${sizeItem}%" OR `
                            }
                            _tempInc++;
                        }
                        sizeQuery = sizeQuery + ")"
                        query.andWhere(sizeQuery);

                    }
                }
                else if (item.op === 'likeor' && item.sign === undefined && item.flag === "commonFilter") {
                    
                    var _mainObject = item.value;
                    let ic = 0;
                    let _totalLength = _mainObject.length;
                    if(_mainObject.length > 0){
                        let myQuery = "(";
                    for(let val of _mainObject){
                    
                        if(val[1].length > 0){
                            let _temp = val[1].length;
                            let _tempInc = 0;
                            for(let _c of val[1]){
                                
                                if(_tempInc == _temp-1){
                                    myQuery = myQuery + item.name+` like "%${_c}%"`;
                                }else{
                                    myQuery = myQuery + item.name+` like "${_c}%" OR `;
                                }
                                _tempInc++;
                            }    
                        }

                        if(_totalLength-1 == ic){
                            myQuery = myQuery + ")";
                        }else{
                            myQuery = myQuery + ") and (";
                        }
                        
                        ic++;
                    }
                    
                    query.andWhere(myQuery);
                    }
                }
                 else if (item.op === 'IS NULL' && item.sign === undefined) {
                    query.orWhere(item.name + 'IS NULL' + item.value);
                } else if (item.op === 'IN' && item.sign === 'variant') {
                    const subQb: any = getConnection()
                        .getRepository(ProductVarientOption)
                        .createQueryBuilder('PVO');
                    subQb.select(['DISTINCT(`PVO`.`product_id`)']);
                    subQb.innerJoin('PVO.productVarientOptionDetail', 'PVOD');
                    subQb.innerJoin('PVOD.varientsValue', 'VV');
                    subQb.innerJoin('VV.varients', 'V');
                    subQb.where('PVO.is_active = ' + 1 + ' ');
                    const val = item.value;
                    val.forEach((data: any, subIndex: number) => {
                        if (subIndex === 0) {
                            subQb.andWhere('LOWER(V.name) = ' + '"' + data.name + '" AND LOWER(VV.value_name) = ' + '"' + data.value + '"');
                            return;
                        }
                        subQb.orWhere('LOWER(V.name) = ' + '"' + data.name + '" AND LOWER(VV.value_name) = ' + '"' + data.value + '"');
                    });
                    query.andWhere(item.name + ' IN (' + subQb.getSql() + ')');
                }else if(item.op === 'Inor' && item.sign === undefined){
                    
                    query.andWhere(item.name + ' IN (' + item.value + ')');
                }else if(item.op === 'IN' && item.sign === "rating"){
                    
                    query.andWhere(item.name + ' IN (' + item.value + ')');
                    query.andWhere('productRating.is_active=1');
                }
            });
        }
        // Keyword Search
        if (searchConditions && searchConditions.length > 0) {
            searchConditions.forEach((table: any) => {
                
                    if ((table.op === "SEARCH_FILTER" && table.name && table.name instanceof Array && table.name.length > 0) && (table.value && table.value instanceof Array && table.value.length > 0)) {
                        
                        const namesArray = table.name;
                        namesArray.forEach((name: string, index: number) => {
                            query.andWhere(new Brackets(qb => {
                                const valuesArray = table.value;
                                valuesArray.forEach((value: string | number, subIndex: number) => {
                                    if (subIndex === 0) {
                                        qb.andWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + value + '%\'');
                                        return;
                                    }
                                    qb.andWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + value + '%\'');
                                });
                            }));
                        });
                    
                }else if((table.op === undefined && table.name && table.name instanceof Array && table.name.length > 0) && (table.value && table.value instanceof Array && table.value.length > 0)) {
                    
                    const namesArray = table.name;
                    namesArray.forEach((name: string, index: number) => {
                        query.andWhere(new Brackets(qb => {
                            const valuesArray = table.value;
                            valuesArray.forEach((value: string | number, subIndex: number) => {
                                if (subIndex === 0) {
                                    qb.andWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + value + '%\'');
                                    return;
                                }
                                qb.orWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + value + '%\'');
                            });
                        }));
                    });
                } else if (table.op === undefined && table.name && table.name instanceof Array && table.name.length > 0) {
                    
                    query.andWhere(new Brackets(qb => {
                        const namesArray = table.name;
                        namesArray.forEach((name: string, index: number) => {
                            if (index === 0) {
                                qb.andWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + table.value + '%\'');
                                return;
                            }
                            qb.orWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + table.value + '%\'');
                        });
                    }));
                } else if (table.op === undefined && table.value && table.value instanceof Array && table.value.length > 0) {
                    
                    query.andWhere(new Brackets(qb => {
                        const valuesArray = table.value;
                        valuesArray.forEach((value: string | number, index: number) => {
                            if (index === 0) {
                                qb.andWhere('LOWER(' + table.name + ')' + ' LIKE ' + '\'%' + value + '%\'');
                                return;
                            }
                            qb.andWhere('LOWER(' + table.name + ')' + ' LIKE ' + '\'%' + value + '%\'');
                        });
                    }));
                }
            });
        }
        query.groupBy('productId');
        if(relations.some(item=>item.aliasName=='customerWishlist')){
        query.addGroupBy('wishlistProductId')
        }
        // GroupBy
        if (false && groupBy && groupBy.length > 0) {
            let i = 0;
            groupBy.forEach((item: any) => {
                if (i === 0) {
                    query.groupBy(item.name);
                } else {
                    query.addGroupBy(item.name);
                }
                i++;
            });
        }
        // orderBy
        if (sort && sort.length > 0) {
            sort.forEach((item: any) => {
                query.orderBy('' + item.name + '', '' + item.order + '');
            });
        }
        // Limit & Offset
        if (limit && limit > 0) {
            query.limit(limit);
            query.offset(offset);
        }
        if (!count) {
            if (rawQuery) {
                return query.getRawMany();
            }
            return query.getMany();
        } else {
            return query.getCount();
        }
    }

    public addSlashes(str: string): string {
        return (str + '').replace(/'/g, "''");
    }

    public async checkSlug(slug: string, id: number, count: number = 0): Promise<number> {
        if (count > 0) {
            slug = slug + count;
        }
        return await this.productRepository.checkSlugData(slug, id);
    }


     //Get individual Promotion detail
     public async getPromotionById(productId: number): Promise<any> {
        const condition: any = {};
		condition.where = {};
        if (productId) {
            condition.where = {
                productId: productId,
            };
        }
            return await this.productRepository.find(condition);
    }

    /*public async finddataByIds(ids: any): Promise<any> {
     
          return this.productRepository.manager.query(`SELECT product_image.image as image,product.product_id as productId,product.sku as sku,product.upc as upc,product.quantity as quantity,product.stock_status_id as stockStatusId,product.image_path as imagePath,product.manufacturer_id as manufacturerId,product.shipping as shipping,product.price as price,product.date_available as dateAvailable,product.sort_order as sortOrder,product.name as name,product.description as description,product.amount as amount,product.meta_tag_title as metaTagTitle,product.meta_tag_description as metaTagDescription,product.meta_tag_keyword as metaTagKeyword,product.product_size_color as productSizeColor,product.discount as discount,product.subtract_stock as subtractStock,product.minimum_quantity as minimumQuantity,product.location as location,product.wishlist_status as wishListStatus,product.delete_flag as deleteFlag,product.is_featured as isFeatured,product.rating as rating,'product.condition' as 'condition',product.today_deals as todayDeals,product.is_active as isActive,product.created_by as createdBy,product.modified_by as modifiedBy,product.created_date as createdDate,product.modified_date as modifiedDate,product.keywords as keywords,product.price_update_file_log_id as priceUpdateFileLogId,product.product_slug as productSlug,product.service_charges as serviceCharges,product.tax_type as taxType,product.tax_value as taxValue,product.height as height,product.weight as weight,product.length as length,product.width as width,product.has_stock as hasStock,product.has_tire_price as hasTirePrice,product.out_of_stock_threshold as outOfStockThreshold,product.notify_min_quantity_below as notifyMinQuantity,product.min_quantity_allowed_cart as minQuantityAllowedCart,product.max_quantity_allowed_cart as maxQuantityAllowedCart,product.enable_back_orders as enableBackOrders,product.pincode_based_delivery as pincodeBasedDelivery,product.sku_id as skuId,product.is_simplified as isSimplified,product.hsn as hsn,product.attribute_keyword as attributeKeyword,product.quotation_available as quotationAvailable,product.promotion_id as promotionId,product.promotion_flag as promotionFlag,product.promotion_type as promotionType,product.promotion_product_y_id as promotionProductYid,product.promotion_product_y_slug as promotionProductYSlug,product.promotion_free_product_price as promotionFreeProductPrice FROM product_image LEFT JOIN product ON product_image.product_id = product.product_id WHERE product_image.product_id IN (${ids})`);
     
     }*/



     public async getCategoryName(productId:any):Promise<any>{
        let _ms = this.productToCategory.createQueryBuilder('pc');
        _ms.select(["c.name as  categoryName"]);
        _ms.innerJoin(Category,'c','c.categoryId = pc.categoryId');
        _ms.where('c.isActive=1');
        _ms.groupBy('c.name')
        let _re = await _ms.getRawMany();
        return _re;
     }
     public async getProductDiscount():Promise<any>{

        let o = await getManager().query('(select * from (SELECT round((((s.price-d.price)*100)/s.price)) as discount FROM product_discount as d inner join sku as s on s.id=d.sku_id group by discount) as t order by discount)');
        return o;
        // if(o.length > 0){
        //     return JSON.parse(JSON.stringify(o));
        // }else{
        //     return [];
        // }


        // let _m = this._sku.createQueryBuilder('s');
        // _m.select(['round((((s.price-d.price)*100)/s.price)) as discount','d.product_id']);
        // _m.innerJoin(ProductDiscount,'d','s.id=d.sku_id');
        // let _r = await _m.getRawMany();
        // return _r;
    }

    public async listByQueryBuilderExcel(
        limit: number,
        offset: number,
        select: any = [],
        whereConditions: any = [],
        searchConditions: any = [],
        relations: any = [],
        groupBy: any = [],
        sort: any = [],
        count: boolean = false,
        rawQuery: boolean = false)
        : Promise<Product[] | any> {

        const query: any = await getConnection().getRepository(Product).createQueryBuilder();
        // Select
        if (select && select.length > 0) {
            query.select(select);
        }
        // Join
        if (relations && relations.length > 0) {
            relations.forEach((joinTb: any) => {
                if (joinTb.op === 'left') {
                    query.leftJoin(joinTb.tableName, joinTb.aliasName);
                }else if (joinTb.op === 'specialInnerJoin-Discount') {
                    query.innerJoin(joinTb.tableName,joinTb.aliasName, 'Product.product_id=discountAliasTable.product_id');
                } else if (joinTb.op === 'leftCond') {
                    query.leftJoin(joinTb.tableName, joinTb.aliasName, joinTb.cond);
                } else {
                    query.innerJoin(joinTb.tableName, joinTb.aliasName);
                }
            });
        }
        // Where
        if (whereConditions && whereConditions.length > 0) {
            
            whereConditions.forEach((item: any) => {
                if (item.op === 'where' && item.sign === undefined) {
                    query.where(item.name + ' = ' + item.value);
                }else if(item.op === 'and' && item.sign === undefined){
                    query.andWhere(`Date(${item.name})` + ' = ' + `Date(${item.value})`);

                } else if(item.op === 'dateRange' && item.sign === undefined){
                    query.where(item.name + ' >= ' + item.value);
                }
            });
        }
       
        query.groupBy('productId');
        if(relations.some(item=>item.aliasName=='customerWishlist')){
        query.addGroupBy('wishlistProductId')
        }
        // GroupBy
        if (false && groupBy && groupBy.length > 0) {
            let i = 0;
            groupBy.forEach((item: any) => {
                if (i === 0) {
                    query.groupBy(item.name);
                } else {
                    query.addGroupBy(item.name);
                }
                i++;
            });
        }
        // orderBy
        if (sort && sort.length > 0) {
            sort.forEach((item: any) => {
                query.orderBy('' + item.name + '', '' + item.order + '');
            });
        }
        // Limit & Offset
        if (limit && limit > 0) {
            query.limit(limit);
            query.offset(offset);
        }
        if (!count) {
            if (rawQuery) {
                return query.getRawMany();
            }
            return query.getMany();
        } else {
            return query.getCount();
        }
    }
}