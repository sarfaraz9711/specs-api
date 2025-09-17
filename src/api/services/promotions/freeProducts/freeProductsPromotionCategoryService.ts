import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
//import { Brackets, getConnection, Like } from 'typeorm/index';
import { FreeProductsPromotionsCategoryRepository } from '../../../repositories/Promotions/FreeProducts/FreeProductsPromotionCategoryRespository';

@Service()
export class FreeProductPromotionCategoryService {
    constructor(@OrmRepository() private _freeProductsPromotionsCategoryRepository: FreeProductsPromotionsCategoryRepository) {

    }

    //create 
    public async create(data: any): Promise<any> {
        return this._freeProductsPromotionsCategoryRepository.save(data);
    }



    //update Promotions 
    public async updatePromotionCategoryTable(data: any, updateId: any): Promise<any> {
        const result = await this._freeProductsPromotionsCategoryRepository.createQueryBuilder()
        .update(data)
        .where({id: updateId})
        .execute();
        return result.affected;
    }
}