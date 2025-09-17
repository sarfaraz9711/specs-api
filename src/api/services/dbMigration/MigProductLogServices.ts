/*
 * spurtcommerce API
 * version 3.0.1
 * Copyright (c) 2019 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
// import { Logger, LoggerInterface } from '../../decorators/Logger';
import { ProductLogModel } from '../../models/dbMigration/ProductLogModel';
import { ProductLogModelRepository } from '../../repositories/dbMigration/migProductLogRepository';
@Service()
export class MigProductLogService {

    constructor(
        @OrmRepository() private productLogModelRepository: ProductLogModelRepository,
		// @Logger(__filename) private log: LoggerInterface
    ) { }
    // create order tracking insert
    public async create(productLogModel: ProductLogModel): Promise<any> {
       // this.log.info('Create a new user => ', user.toString());
        const newOrderTracking = await this.productLogModelRepository.save(productLogModel);
        return newOrderTracking;
    }

}