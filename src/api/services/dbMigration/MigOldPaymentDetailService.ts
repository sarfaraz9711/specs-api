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
import { PaymentMigrationModel } from '../../models/dbMigration/PaymentMigrationModel';
import { PaymentMigrationRepository } from '../../repositories/dbMigration/migOldPaymentDetailRepository';



@Service()
export class MigOldPaymentDetailService {

    constructor(
        @OrmRepository() private paymentMigrationRepository: PaymentMigrationRepository,
		// @Logger(__filename) private log: LoggerInterface
    ) { }
    // create franchisee
    public async create(paymentMigrationModel: PaymentMigrationModel): Promise<any> {
        
       // this.log.info('Create a new user => ', user.toString());
        const newEnquiry = await this.paymentMigrationRepository.save(paymentMigrationModel);
        return newEnquiry;
    }
	
	

   
}
