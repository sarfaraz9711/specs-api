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
//import { Contact } from '../models/Contact';
import { ContactUsRepository } from '../repositories/ContactUsRepository';
import {Like} from 'typeorm';

@Service()
export class ContactService {

    constructor(
        @OrmRepository() private ContactUsCreateRepository: ContactUsRepository,
		// @Logger(__filename) private log: LoggerInterface
    ) { }

	 // contact Us list
     public list(limit: number, offset: number,keyword: string, count: number): Promise<any> {
		const condition: any = {};
		condition.where = {};

        if (keyword) {
            condition.where = {
                name: Like('%' + keyword + '%'),
            };
        }

        if (limit && limit > 0) {
            condition.take = limit;
            condition.skip = offset;
        }
            return this.ContactUsCreateRepository.find(condition);
    }
	
	 // contact Us count
     public count(): Promise<any> {
            return this.ContactUsCreateRepository.find();
    }

   
}
