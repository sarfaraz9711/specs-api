import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { LoyaltyPointRepository } from '../repositories/LoyaltyPointRepository';
import { LoyaltyPoint } from '../models/LoyaltyPoint';

@Service()
export class LoyaltyPointService {

    constructor(
        @OrmRepository() private loyaltyPointRepository: LoyaltyPointRepository ) {
    }

    public find(data?: any): Promise<any> {
        return this.loyaltyPointRepository.find(data);
    }

    public findOne(data: any): Promise<any> {
        return this.loyaltyPointRepository.findOne(data);
    }

    public async create(data: any): Promise<LoyaltyPoint> {
        return this.loyaltyPointRepository.save(data);
    }

    public async update(data: any): Promise<any> {
        return this.loyaltyPointRepository.update(data.redeemId, data);
    }
}
