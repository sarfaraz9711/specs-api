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
import { Order } from '../../models/Order';
import { AdditionalDataModel } from '../../models/dbMigration/AdditionalDataModel';

import { OrderRepository } from '../../repositories/OrderRepository';


@Service()
export class DataMigrationService {

    constructor(
        @OrmRepository() private orderRepository: OrderRepository,
		// @Logger(__filename) private log: LoggerInterface
    ) { }

      // find All Order
      public async findAllOrder(orderId: any): Promise<any> {
        if(orderId){
            let _ms=this.orderRepository.createQueryBuilder()
                                         .select("*")
                                         .from(Order, "order")
                                         .where("order.orderId IN (:...order)", { order: orderId });
                                         _ms.getMany();
                                         let _c = await _ms.execute();
                                         return _c;
        }else{
            //return this.orderRepository.manager.query('SELECT * FROM tt_mig_additional_order_details_mapping as ad inner JOIN `order` as o ON ad.order_id = o.order_id');
        let _ms = this.orderRepository.createQueryBuilder('o');
        _ms.select(['*']);
        _ms.innerJoin(AdditionalDataModel, 'ad','ad.order_id=o.order_id');
        _ms.getOne();
        let _c = await _ms.execute();
        return _c;

        }
    }

}