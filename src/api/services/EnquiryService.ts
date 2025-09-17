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
import { Enquiry } from '../models/Enquiry';
import { EnquiryRepository } from '../repositories/EnquiryRepository';
import {Like} from 'typeorm';

@Service()
export class EnquiryService {

    constructor(
        @OrmRepository() private EnquiryCreateRepository: EnquiryRepository,
		// @Logger(__filename) private log: LoggerInterface
    ) { }

    
    // create franchisee
    public async create(enquiry: Enquiry): Promise<Enquiry> {
       // this.log.info('Create a new user => ', user.toString());
        const newEnquiry = await this.EnquiryCreateRepository.save(enquiry);
        return newEnquiry;
    }
	
	 // franchisee list
    public list(limit: number, offset: number,keyword: string, count: number): Promise<any> {
		const condition: any = {};
		condition.where = {};

        if (keyword) {
            condition.where = {
                Name: Like('%' + keyword + '%'),
            };
        }

        if (limit && limit > 0) {
            condition.take = limit;
            condition.skip = offset;
        }
            return this.EnquiryCreateRepository.find(condition);
    }

   
}
