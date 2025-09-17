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
//import { Enquiry } from '../models/Enquiry';
import { FacilityInventorySyncModel } from '../../models/Schedulers/FacilityInventorySyncModel';

import { FacilityInventorySyncRepository } from '../../repositories/Schedulers/FacilityInventorySyncRepository';
//import {Like} from 'typeorm';

@Service()
export class FacilityInventorySyncService {

    constructor(
        @OrmRepository() private facilityInventorySyncRepository: FacilityInventorySyncRepository,
		// @Logger(__filename) private log: LoggerInterface
    ) { }

    
    // create facility inventory
    public async create(facilityInventorySyncModel: FacilityInventorySyncModel): Promise<FacilityInventorySyncModel> {
       // this.log.info('Create a new user => ', user.toString());
        const newFacilityInventorySync = await this.facilityInventorySyncRepository.save(facilityInventorySyncModel);
        return newFacilityInventorySync;
    } 

    // list
    public findFacilityInventory(): Promise<any> {
        const condition: any = {};
        condition.where = {};
        condition.order = {
            id: 'DESC',
        };
        condition.take = 1;
        
        return this.facilityInventorySyncRepository.find(condition);

    }
}
