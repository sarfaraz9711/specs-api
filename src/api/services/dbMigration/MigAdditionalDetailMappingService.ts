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
//import { AdditionalDataModel } from '../../models/dbMigration/AdditionalDataModel';
import { AdditionalDataModelRepository } from '../../repositories/dbMigration/migAdditionalOrderDetailMappingRepository';


@Service()
export class MigAdditionalDetailService {

    constructor(
        @OrmRepository() private additionalDataModelRepository: AdditionalDataModelRepository,
		// @Logger(__filename) private log: LoggerInterface
    ) { }
    // create franchisee
    public async create(additionalData: any): Promise<any> {
        return this.additionalDataModelRepository.save(additionalData);
    }

    public findOne(additionalDataModel: any): Promise<any> {
        return this.additionalDataModelRepository.findOne(additionalDataModel);
    }
}