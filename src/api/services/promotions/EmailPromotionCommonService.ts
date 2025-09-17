/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { NotifyCustomerRepository } from '../../repositories/NotifyCustomerRepository';
//import { Notifycustomer } from '../../models/NotifyCustomerModel';

@Service()
export class EmailPromotionCommonService {

    constructor(
        @OrmRepository() private notifyCustomerRepository: NotifyCustomerRepository,
        ) {
    }


     // notify customer list
     public list(): Promise<any> {
		const condition: any = {};
		condition.where = {};

            condition.where = {
                status: 1
            };

        
            return this.notifyCustomerRepository.find(condition);
    }

   
    
}
