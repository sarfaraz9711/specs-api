/*
 * spurtcommerce API
 * version 3.0.1
 * Copyright (c) 2019 piccosoft ltd
 * Author piccosoft ltd <support@piccosoft.com>
 * Licensed under the MIT license.
 */

import moment from 'moment';
import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { Customer } from '../models/Customer';
import { OtpRepository } from '../repositories/OtpRepository';

@Service()
export class OtpService {

    constructor(@OrmRepository() private otpRepository: OtpRepository,
                @Logger(__filename) private log: LoggerInterface) {
    }

    // create otp info
    public async create(otp: any): Promise<any> {
        this.log.info('Create a otp ');
        return this.otpRepository.save(otp);
    }

    // update otp
    public update(otp: any, id: any): Promise<any> {
        return this.otpRepository.createQueryBuilder()
            .update(otp)
            .set({ otp })
            .where('customer_id = :customer_id', { customer_id: id })
            .execute();
    }

    // find Condition
    public findOne(otp: any): Promise<any> {
        return this.otpRepository.findOne(otp);
    }

    public findLastInserted = async (customerId:any): Promise<any> => {
        let _ms = this.otpRepository.createQueryBuilder('o');
        _ms.select('o.otp');
        _ms.where('valid_till > :nmDate');
        _ms.andWhere('customer_id = :custId');
        _ms.orderBy('id',"DESC");
        _ms.setParameter("nmDate",moment().format('YYYY-MM-DD HH:mm:ss'));
        _ms.setParameter("custId",customerId);
        _ms.take(1);
        _ms.getOne();
        let _c = await _ms.execute();
        return _c;
    }


    public findLastInsertedByMobile = async (mobile:any): Promise<any> => {
        let _ms = this.otpRepository.createQueryBuilder('o');
        _ms.select(['o.otp','o.customer_id','c.email']);
        _ms.where('o.valid_till > :nmDate');
        _ms.andWhere('o.mobile_no = :mobileNumber');
        _ms.orderBy('o.id',"DESC");
        _ms.setParameter("nmDate",moment().format('YYYY-MM-DD HH:mm:ss'));
        _ms.setParameter("mobileNumber",mobile);
        _ms.innerJoin(Customer, 'c','c.id=o.customer_id');
        _ms.getOne();
        let _c = await _ms.execute();
        return _c;
    }
}
