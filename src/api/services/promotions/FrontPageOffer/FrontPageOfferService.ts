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
import { FrontPageOfferRepository } from '../../../repositories/Promotions/FrontPageOffer/FrontPageOfferRepository';
import { FrontPageOffer } from '../../../models/Promotions/frontPageOffer/frontPageOfferModel';

@Service()
export class FrontPageOfferService {

    constructor(
        @OrmRepository() private frontPageOfferRepository: FrontPageOfferRepository,
        ) {
    }

    // create front page offer
    public async create(frontPageOffer: FrontPageOffer): Promise<any> {
        return this.frontPageOfferRepository.save(frontPageOffer);
    }

    public async findAll(): Promise<any> {
        return this.frontPageOfferRepository.find()
    }
    public async find(data:any): Promise<any> {
        return this.frontPageOfferRepository.find(data)
    }
    public async findOne(data:any): Promise<any> {
        return this.frontPageOfferRepository.findOne(data)
    }



    //front page offer list
    public async list(showon: string): Promise<any> {
        const condition: any = {};

        condition.where = {};
       // if (showon) {
            condition.where = {
                showOn: showon,
            };
       // }

        condition.order = {
            createdDate: 'DESC',
        };
      
            condition.take = 1;
        
        return this.frontPageOfferRepository.find(condition);
    }

}
