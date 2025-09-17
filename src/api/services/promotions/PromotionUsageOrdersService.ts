import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { PromotionsUsageOrdersRepository } from '../../repositories/Promotions/PromotionUsageOrdersRepo';

@Service()
export class PromotionsUsageOrdersService {
    constructor(@OrmRepository() private _promotionsUsageOrdersRepository: PromotionsUsageOrdersRepository) { }

    //create 
    public async create(data: any): Promise<any> {
        return this._promotionsUsageOrdersRepository.save(data);
    }

    public find(order: any): Promise<any> {
        return this._promotionsUsageOrdersRepository.find(order);
    }

    public findOne(order: any): Promise<any> {
        return this._promotionsUsageOrdersRepository.findOne(order);
    }

} 