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
import { PincodeMaster } from '../../models/Master/PincodeMaster';
import { PincodeRepository } from '../../repositories/Master/PincodeRepository';
//import {Like} from 'typeorm';

@Service()
export class PincodeService {

    constructor(
        @OrmRepository() private _pincodeRepository: PincodeRepository,
		// @Logger(__filename) private log: LoggerInterface
    ) { }

    // create franchisee
    public async create(pincode:any): Promise<PincodeMaster> {
       // this.log.info('Create a new user => ', user.toString());
        const newPincode = await this._pincodeRepository.save(pincode);
        return newPincode;
    }

     // All pin code list
     public async alllist(): Promise<any> {
        // this.log.info('Create a new user => ', user.toString());
        const newPincode = await this._pincodeRepository.find();
        return newPincode;
     }

     public async findById(pinCode:any): Promise<any> {
        // this.log.info('Create a new user => ', user.toString());
        const newPincode = await this._pincodeRepository.findOne({where : {"pincode": pinCode}});
        return newPincode;
     }

     
}
