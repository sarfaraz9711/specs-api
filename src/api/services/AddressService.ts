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
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { AddressRepository } from '../repositories/AddressRepository';
import { Address } from '../models/Address';

@Service()
export class AddressService {

    constructor(
        @OrmRepository() private addressRepository: AddressRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    // create address
    public async create(address: Address): Promise<any> {
        this.log.info('Create a new address ');
        return this.addressRepository.save(address);
    }

    // find Condition
    public findOne(address: any): Promise<any> {
        return this.addressRepository.findOne(address);
    }
    // update address
    public update(id: number, address: Address): Promise<any> {
        address.addressId = id;
        return this.addressRepository.save(address);
    }

    // address List
    public list(limit: number, offset: number, whereConditions: any = [], count: number | boolean): Promise<any> {
        const condition: any = {};

        condition.where = {};

        if (whereConditions && whereConditions.length > 0) {
            whereConditions.forEach((item: any) => {
                condition.where[item.name] = item.value;
            });
        }

        condition.order = {
            createdDate: 'DESC',
        };

        if (limit && limit > 0) {
            condition.take = limit;
            condition.skip = offset;
        }
        if (count) {
            return this.addressRepository.count(condition);
        } else {
            return this.addressRepository.find(condition);
        }
    }

    // delete address
    public async delete(id: number): Promise<any> {
        await this.addressRepository.delete(id);
        return 1;
    }

    // find Customer addresses
    public find(address: any): Promise<any> {
        return this.addressRepository.find(address);
    }

    public findAddress(): Promise<any> {
        return this.addressRepository.find();
        //return this.addressRepository.find(address)
       // return this.addressRepository.manager.query(`SELECT * FROM address where customer_id = ${customerId} and first_name = ${shippingFirstName} and address_1 = ${shippingAddress1}`);

    }

   
    
}
