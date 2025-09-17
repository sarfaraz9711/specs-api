/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import {Service} from 'typedi';
import {OrmRepository} from 'typeorm-typedi-extensions';
import {Logger, LoggerInterface} from '../../decorators/Logger';
import {Like, Brackets, getConnection, getManager} from 'typeorm/index';
import {Between} from 'typeorm/index';
import {OrderRepository} from '../repositories/OrderRepository';
import {Order} from '../models/Order';
import { OrderProduct } from '../models/OrderProduct';
@Service()
export class OrderService {

    constructor(@OrmRepository() private orderRepository: OrderRepository,
                @Logger(__filename) private log: LoggerInterface) {
    }

    // create order
    public async create(order: any): Promise<any> {
        this.log.info('Create a new order ');
        return this.orderRepository.save(order);
    }

    // order count
    public find(order: any): Promise<any> {
        return this.orderRepository.find(order);
    }

    // order count
    public findAll( ): Promise<any> {
        return this.orderRepository.find( );
    }

    // order count
    public findById(orderId:any): Promise<any> {
        return this.orderRepository.findByIds(orderId);
    }

    // findOne Condition
    public findOne(whereCondition: any): Promise<any> {
        this.log.info('Find Order Detail');
        const condition: any = {};
        if (whereCondition && whereCondition.length > 0) {
            condition.where = whereCondition[0];
            condition.relations = whereCondition[1].relation;
        } else {
            condition.orderId = whereCondition;
        }
        return this.orderRepository.findOne(condition);
    }

    // update order
    public update(id: any, order: any): Promise<any> {
        order.oderId = id;
        return this.orderRepository.save(order);
    }

    // order List
    public list(limit: number, offset: number, select: any = [], search: any = [], whereConditions: any = [], relation: any = [], count: number | boolean): Promise<any> {
        const condition: any = {};

        if (select && select.length > 0) {
            condition.select = select;
        }

        condition.where = {};

        if (whereConditions && whereConditions.length > 0) {
            whereConditions.forEach((item: any) => {
                condition.where[item.name] = item.value1;
            });
        }

        if (search && search.length > 0) {
            search.forEach((table: any) => {
                const operator: string = table.op;
                if (operator === 'like' && table.value !== undefined && table.value !== '' ) {
                    condition.where[table.name] = Like('%' + table.value + '%');
                } else if (operator === 'where' && table.value !== undefined && table.value !== '' ) {
                    condition.where[table.name] = table.value ;
                 }
                 else if (operator === 'and' && table.value !== undefined && table.value !== '' ) {
                    condition.where[table.name] = table.value ;
                }
                 else if (operator == 'between' && table.value !== undefined) {
                    console.log("data name>>>*******************************************",table.value);
                    let date_value=table.value.split(",");

                    condition.where[table.name] = Between(date_value[0],date_value[1]);
                    //condition.where[table.name] = Between(`Date('${date_value[0]}')`, `Date('${date_value[1]}')`);
                    //condition.where(`Date(${table.name})` + ' BETWEEN ' + `Date('${date_value[0]}')` +' AND '+`Date('${date_value[1]}')`);

                }
                else if (operator == 'likeop' && table.value !== undefined) {
                    condition.where[table.name] = Like(table.value + '%');

                }
            });
        }

        if (relation && relation.length > 0) {
            condition.relations = relation;
        }

        if (limit && limit > 0) {
            condition.take = limit;
            condition.skip = offset;
        }

        condition.order = {
            createdDate: 'DESC',
        };
  console.log("condition data>>>",condition);
        if (count) {
            return this.orderRepository.count(condition);
        } else {
            const query = this.orderRepository.find(condition);
            return query;
        }
    }

    // findOne order
    public findOrder(order: any): Promise<any> {
        return this.orderRepository.findOne(order);
    }

    // delete order
    public async delete(id: number): Promise<any> {
        return await this.orderRepository.delete(id);
    }

    // sales list
    public async salesList(): Promise<any> {
        return await this.orderRepository.salesList();
    }

    // dashboard transaction list
    public async transactionList(year: number): Promise<any> {
        return await this.orderRepository.transactionList(year);
    }

    // find today orders
    public async findAlltodayOrder(todaydate: string): Promise<any> {
        return await this.orderRepository.findAllTodayOrder(todaydate);
    }

    // find today orders count
    public async findAllTodayOrderCount(todaydate: string): Promise<any> {
        return await this.orderRepository.findAllTodayOrderCount(todaydate);
    }

    public async listByQueryBuilder(
        limit: number,
        offset: number,
        select: any = [],
        whereConditions: any = [],
        searchConditions: any = [],
        relations: any = [],
        groupBy: any = [],
        sort: any = [],
        count: boolean = false,
        rawQuery: boolean = false)
        : Promise<Order[] | any> {

        const query: any = await getConnection().getRepository(Order).createQueryBuilder('Order');
        // Select
        if (select && select.length > 0) {
            query.select(select);
        }
        // Join
        if (relations && relations.length > 0) {
            relations.forEach((joinTb: any) => {
                if (joinTb.op === 'left') {
                    query.leftJoin(joinTb.tableName, joinTb.aliasName);
                } else {
                query.innerJoin(joinTb.tableName, joinTb.aliasName);
                }
            });
        }
        // Where
        if (whereConditions && whereConditions.length > 0) {
            whereConditions.forEach((item: any) => {
                if (item.op === 'where' && item.sign === undefined) {
                    query.where(item.name + ' = ' + item.value);
                } else if (item.op === 'and' && item.sign === undefined) {
                    query.andWhere(item.name + ' = ' + item.value);
                } else if (item.op === 'and' && item.sign !== undefined) {
                    query.andWhere(' \'' + item.name + '\'' + ' ' + item.sign + ' \'' + item.value + '\'');
                } else if (item.op === 'raw' && item.sign !== undefined) {
                    query.andWhere(item.name + ' ' + item.sign + ' \'' + item.value + '\'');
                } else if (item.op === 'or' && item.sign === undefined) {
                    query.orWhere(item.name + ' = ' + item.value);
                } else if (item.op === 'IN' && item.sign === undefined) {
                    query.andWhere(item.name + ' IN (' + item.value + ')');
                }
            });
        }
        // Keyword Search
        if (searchConditions && searchConditions.length > 0) {
            searchConditions.forEach((table: any) => {
                if ((table.name && table.name instanceof Array && table.name.length > 0) && (table.value && table.value instanceof Array && table.value.length > 0)) {
                    const namesArray = table.name;
                    namesArray.forEach((name: string, index: number) => {
                        query.andWhere(new Brackets(qb => {
                            const valuesArray = table.value;
                            valuesArray.forEach((value: string | number, subIndex: number) => {
                                if (subIndex === 0) {
                                    qb.andWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + value + '%\'');
                                    return;
                                }
                                qb.orWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + value + '%\'');
                            });
                        }));
                    });
                } else if (table.name && table.name instanceof Array && table.name.length > 0) {
                    query.andWhere(new Brackets(qb => {
                        const namesArray = table.name;
                        namesArray.forEach((name: string, index: number) => {
                            if (index === 0) {
                                qb.andWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + table.value + '%\'');
                                return;
                            }
                            qb.orWhere('LOWER(' + name + ')' + ' LIKE ' + '\'%' + table.value + '%\'');
                        });
                    }));
                } else if (table.value && table.value instanceof Array && table.value.length > 0) {
                    query.andWhere(new Brackets(qb => {
                        const valuesArray = table.value;
                        valuesArray.forEach((value: string | number, index: number) => {
                            if (index === 0) {
                                qb.andWhere('LOWER(' + table.name + ')' + ' LIKE ' + '\'%' + value + '%\'');
                                return;
                            }
                            qb.orWhere('LOWER(' + table.name + ')' + ' LIKE ' + '\'%' + value + '%\'');
                        });
                    }));
                }
            });
        }
        // GroupBy
        if (groupBy && groupBy.length > 0) {
            let i = 0;
            groupBy.forEach((item: any) => {
                if ( i === 0) {
                    query.groupBy(item.name);
                } else {
                    query.addGroupBy(item.name);
                }
                i++;
            });
        }
        // orderBy
        if (sort && sort.length > 0) {
            sort.forEach((item: any) => {
                query.orderBy('' + item.name + '', '' + item.order + '');
            });
        }
        // Limit & Offset
        if (limit && limit > 0) {
            query.limit(limit);
            query.offset(offset);
        }
        if (!count) {
            if (rawQuery) {
               return query.getRawMany();
            }
            return query.getMany();
        } else {
            return query.getCount();
        }
    }

    // find total orders
    public async findTotalOrderAmount(): Promise<any> {
        return await this.orderRepository.findTotalOrderAmount();
    }

     // order count
     public async orderCount(orderId: string, orderStatusId: string, totalAmount: string, customerName: string, dateAdded: string): Promise<any> {
         return await this.orderRepository.orderCount(orderId, orderStatusId, totalAmount, customerName, dateAdded);
    }
    // find dashboard Orders Count
    public async dashboardOrdersCount(duration: number): Promise<any> {
        return await this.orderRepository.dashboardOrdersCount(duration);
    }
    // getting orders count
    public async ordersCount(duration: number): Promise<any> {
        return await this.orderRepository.ordersCount(duration);
    }

    public async updateOrderStatus(data:any){
        const _orderProduct = getManager().getRepository(OrderProduct)
        const _order = getManager().getRepository(Order)
        await _orderProduct.createQueryBuilder().update().set({orderStatusId:data.updateOrderStatusId}).where("order_id=:order_id", {order_id: data.orderId}).execute();
        if(data.updateOrderStatusId==11){
            await _order.createQueryBuilder().update().set({orderStatusId:data.updateOrderStatusId, paymentProcess:0}).where("order_id=:order_id", {order_id: data.orderId}).execute();
        }else{
            await _order.createQueryBuilder().update().set({orderStatusId:data.updateOrderStatusId}).where("order_id=:order_id", {order_id: data.orderId}).execute();
        }
        
    }

    public async updateOrderProductStatus(data:any){
        console.log("ddadasdadadas",data)
        const deliveredDate:any = data.deliveredDate?data.deliveredDate:null
        if(data.orderStatusId==5){
        const orderTable: string = "`order`"
        await getManager().query(`update order_product set order_status_id=${data.orderStatusId}, modified_date=DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 HOUR), INTERVAL 30 MINUTE), delivered_date='${deliveredDate}' where order_product_id in (${data.orderProductIds})`);
        let isOrderUpdate:boolean=true
        if(data.orderId){
        const orderProducts:any = await getManager().query(`select order_status_id orderStatusId, order_product_id orderProductId from order_product where order_id=${data.orderId}`)
        console.log("orderProductsorderProducts",orderProducts)
        const length:any = orderProducts.length;
        for(let i=0; i<length; i++){
            if(orderProducts[i].orderStatusId==1 || orderProducts[i].orderStatusId==20 || orderProducts[i].orderStatusId==4 || orderProducts[i].orderStatusId==12){
                isOrderUpdate=false
            }
        }
    }else{
        isOrderUpdate=true
    }
        if(isOrderUpdate){
        await getManager().query(`UPDATE ${orderTable} SET order_status_id = ${data.orderStatusId}, modified_date = DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 HOUR), INTERVAL 30 MINUTE) WHERE order_id = ${data.orderId}`)
        }
        }else{
            let orderStatusUpdateId:any=data.orderStatusId
            if(data.orderStatusId==22 && data.statusCode!='EOD-777'){
                orderStatusUpdateId=5
            }
        await getManager().query(`update order_product set order_status_id=${orderStatusUpdateId}, modified_date=DATE_ADD(DATE_ADD(NOW(), INTERVAL 5 HOUR), INTERVAL 30 MINUTE) where order_product_id in (${data.orderProductIds})`);
        }
    }

}
