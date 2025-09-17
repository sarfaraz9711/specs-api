import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { HundredOffOnPreprodOrdersRepository } from '../../repositories/Promotions/hundredOffOnPrepaidOderRepo';

@Service()
export class HundredOffOnPreprodOrdersService {
    constructor(@OrmRepository() private _hundredOffOnPrepaidOrdersRepository: HundredOffOnPreprodOrdersRepository) { }

    //create 
    public async create(data: any): Promise<any> {
        return this._hundredOffOnPrepaidOrdersRepository.save(data);
    }
} 