
import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { OrderReturnRepository } from '../repositories/OrderReturnRepository';
import { OrderReturn } from '../models/OrderReturn';



@Service()
export class OrderReturnService {

    constructor(
        @OrmRepository() private orderReturnRepository: OrderReturnRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    // create
    public async create(orderReturnReason: OrderReturn): Promise<any> {
        this.log.info('Create a new address ');
        return this.orderReturnRepository.save(orderReturnReason);
    }

    // findOne
    public findOne(orderReturnReason: any): Promise<any> {
        return this.orderReturnRepository.findOne(orderReturnReason);
    }

    // findOne
    public find(orderReturnReason: any): Promise<any> {
        return this.orderReturnRepository.find(orderReturnReason);
    }

    public findAll(): Promise<any> {
        return this.orderReturnRepository.find();
    }


    // update
    public update(orderReturnReason: OrderReturn): Promise<any> {
        return this.orderReturnRepository.save(orderReturnReason);
    }

    // delete
    public async delete(id: number): Promise<any> {
        await this.orderReturnRepository.delete(id);
        return 1;
    }

    
}
