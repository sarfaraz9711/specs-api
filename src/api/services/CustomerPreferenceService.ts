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
import { CustomerPreference } from '../models/CustomerPreference';
import { CustomerPreferenceRepository } from '../repositories/CustomerPreferenceRepository';

// import {Like} from 'typeorm';

@Service()
export class CustomerPreferenceService {

    constructor(
        @OrmRepository() private CustomerPreferenceCreateRepository: CustomerPreferenceRepository,
		// @Logger(__filename) private log: LoggerInterface
    ) { }

    
    // create customer
    public async create(customerPreference: CustomerPreference): Promise<CustomerPreference> {
       // this.log.info('Create a new user => ', user.toString());
        const newCustomerPreference = await this.CustomerPreferenceCreateRepository.save(customerPreference);
        return newCustomerPreference;
    }

    //Preference list
    public list(): Promise<any> {
	
            return this.CustomerPreferenceCreateRepository.find();
    }

     // update preference
     public update(id:any,customerPreference:any): Promise<any> {
       let customerPreferenceUpdate= this.CustomerPreferenceCreateRepository.createQueryBuilder()
             .update()
             .set({
                customer_preference: customerPreference.customer_preference,
                status: customerPreference.status

           })
          .where("Id = :Id", { Id: id })
            .execute()

            return customerPreferenceUpdate;
       
    }

     //Preference list by customer
     public listByCustomer(customerPreferenceId:any): Promise<any> {
	
      let customerPreference= this.CustomerPreferenceCreateRepository.createQueryBuilder().select('id,customer_id,customer_preference,status')
      .where(" customer_id= :customer_id", { customer_id:customerPreferenceId  }).execute()
      return customerPreference;
}

public findOne(customerPreferenceId:any): Promise<any> {
  let customerPreference= this.CustomerPreferenceCreateRepository.createQueryBuilder().select('id,customer_id,customer_preference')
  .where(" customer_id= :customer_id", { customer_id:customerPreferenceId  }).execute()
  return customerPreference;
}
	 
}
