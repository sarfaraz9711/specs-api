//import { Product } from '../../../models/ProductModel';
import { Service } from 'typedi';
import { getManager } from 'typeorm';
import { OrmRepository } from 'typeorm-typedi-extensions';
//import { Brackets, getConnection, Like } from 'typeorm/index';
import { FreeProductsPromtionsRepository } from '../../../repositories/Promotions/FreeProducts/FreeProductsPromotionRespository';
import moment from 'moment';
//import { FreeProductsPromtions } from '../../../models/Promotions/FreeProducts/FreeProductsPromotions';
//import { FreeProductsPromotionsCategory } from '../../../models/Promotions/FreeProducts/FreeProductPromotionsCategory';
//import { Product} from '../../../models/ProductModel';

@Service()
export class FreeProductPromotionService {
    constructor(@OrmRepository() private freeProductsPromtionsRepository: FreeProductsPromtionsRepository) {

    }

    //create 
    public async create(data: any): Promise<any> {
        return this.freeProductsPromtionsRepository.save(data);
    }

    // list all freeProducts Promotions
    public async list(): Promise<any> {
        return this.freeProductsPromtionsRepository.find();
    }

    // Get Promotion Details by Id
    public async getPromotionById(id: number): Promise<any> {
        
        return await getManager()
            .createQueryBuilder('tm_freeproductpromotions', 'h')
            .select(['h.promotion_id', 'h.free_promotion_type', 'h.start_date', 'h.end_date', 'h.is_active','h.promotion_discount_Amount','h.promotion_percentage_discount'])
            .addSelect(['category.id, category.get_product_id', 'category.buy_product_id'])
            .innerJoin('tt_free_products_promotions_category', 'category', 'h.promotion_id = category.promotion_fk_id')
            .where('h.promotion_id = :promotionId', {promotionId: id})
            .getRawMany();
    }

    
// Get all promotions with Details
    public async getAllFreeProductPromotions(): Promise<any> {

        return await getManager()
            .createQueryBuilder('tm_freeproductpromotions', 'h')
            .select(['h.promotion_id', 'h.free_promotion_type', 'h.start_date', 'h.end_date', 'h.is_active'])
            .addSelect(['category.get_product_id', 'category.buy_product_id'])
            .addSelect(['product.name', 'buy_product.name'])
            .innerJoin('tt_free_products_promotions_category', 'category', 'h.promotion_id = category.promotion_fk_id')
            .innerJoin('product', 'product', 'category.get_product_id = product.product_id')
            .innerJoin('product', 'buy_product', 'category.buy_product_id = buy_product.product_id')
            .orderBy('h.promotion_id', 'DESC')
            .getRawMany();
    }

    // Get all active promtions
    public async getAllActivePromotions(): Promise<any> {
        const today:any = new Date()
        return await getManager()
        .createQueryBuilder('tm_freeproductpromotions', 'h')
        .select(['h.promotion_id', 'h.free_promotion_type', 'h.start_date', 'h.end_date', 'h.is_active'])
        .addSelect(['category.get_product_id', 'category.buy_product_id'])
        .addSelect(['product.name', 'buy_product.name', 'product.product_slug as get_prod_slug', 'buy_product.product_slug as buy_prod_slug'])
        .innerJoin('tt_free_products_promotions_category', 'category', 'h.promotion_id = category.promotion_fk_id')
        .innerJoin('product', 'product', 'category.get_product_id = product.product_id')
        .innerJoin('product', 'buy_product', 'category.buy_product_id = buy_product.product_id')
        .where('h.is_active = :active', { active: 1 })
        .andWhere('Date(h.end_date) >= :date', { date: moment(today).format('YYYY-MM-DD') })
        .getRawMany();
        
        // return await getManager()
        //     .createQueryBuilder('tm_freeproductpromotions', 'h')
        //     .select(['h.promotion_id', 'h.free_promotion_type', 'h.start_date', 'h.end_date', 'h.is_active'])
        //     .addSelect(['category.get_product_id', 'category.buy_product_id'])
        //     .addSelect(['product.name', 'buy_product.name'])
        //     .innerJoin('tt_free_products_promotions_category', 'category', 'h.promotion_id = category.promotion_fk_id')
        //     .innerJoin('product', 'product', 'category.get_product_id = product.product_id')
        //     .innerJoin('product', 'buy_product', 'category.buy_product_id = buy_product.product_id')
        //     .where('h.is_active = :active', { active: 1 })
        //     .getRawMany();
    }

    public async getByProductId(productId:any): Promise<any> {

        return await getManager()
            .createQueryBuilder('tt_free_products_promotions_category', 'pc')
            .select(['pc.buy_product_id, pc.get_product_id'])
            .addSelect(['fp.promotion_id, fp.free_promotion_type'])
            .innerJoin('tm_freeproductpromotions', 'fp', 'pc.promotion_fk_id = fp.promotion_id')
            .andWhere('fp.is_active=1')
            .where('pc.buy_product_id = :productId', {productId: productId})
            .getRawMany();

    } 

    //update Promotions 
    public async updatePromotion(data: any, updateId: any): Promise<any> {
        const result = await this.freeProductsPromtionsRepository.createQueryBuilder()
        .update(data)
        .where({promtionId: updateId})
        .execute();
        return result.affected;
    }

    // public async updateProductPromotion(data:any):
}