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
import { Feedback } from '../models/Feedback';
import { FeedbackRepository } from '../repositories/FeedbackRepository';
//import {Like} from 'typeorm';

@Service()
export class FeedbackService {

    constructor(
        @OrmRepository() private FeedbackCreateRepository: FeedbackRepository,
		// @Logger(__filename) private log: LoggerInterface
    ) { }

    
    // create user
    public async create(feedback: Feedback): Promise<Feedback> {
       // this.log.info('Create a new user => ', user.toString());
        const newFeedback = await this.FeedbackCreateRepository.save(feedback);
        return newFeedback;
    }
	
	 // feedback list
    public list(limit: number, offset: number, count: number): Promise<any> {
		const condition: any = {};
		condition.where = {};

        if (limit && limit > 0) {
            condition.take = limit;
            condition.skip = offset;
        }
            return this.FeedbackCreateRepository.find(condition);
    }
	
	 // feedback count
    public count(): Promise<any> {
            return this.FeedbackCreateRepository.find();
    } 
}
