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
import { Like } from 'typeorm/index';
import { CustomerRepository } from '../repositories/CustomerRepository';
import { NotifyCustomerRepository } from '../repositories/NotifyCustomerRepository';
@Service()
export class CustomerService {

    constructor(
        @OrmRepository() private customerRepository: CustomerRepository,
        @OrmRepository() private notifyCustomerRepository: NotifyCustomerRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    // create customer
    public async create(customer: any): Promise<any> {
        this.log.info('Create a new customer ');
        return this.customerRepository.save(customer);
    }

    // find Condition
    public findOne(customer: any): Promise<any> {
        return this.customerRepository.findOne(customer);
    }

    // find Condition
    public findAll(): Promise<any> {
        return this.customerRepository.find();
    }

    // find Condition
    public find(data: any): Promise<any> {
        return this.customerRepository.find(data);
    }

    // update customer
    public update(id: any, customer: any): Promise<any> {
        customer.customerId = id;
        return this.customerRepository.save(customer);
    }
    // customer List
    public list(limit: any, offset: any, search: any = [], whereConditions: any = [], order: number, count: number | boolean): Promise<any> {
        const condition: any = {};

        condition.where = {};

        if (whereConditions && whereConditions.length > 0) {
            whereConditions.forEach((item: any) => {
                condition.where[item.name] = item.value;
            });
        }

        if (search && search.length > 0) {
            search.forEach((table: any) => {
                const operator: string = table.op;
                if (operator === 'where' && table.value !== '') {
                    condition.where[table.name] = table.value;
                } else if (operator === 'like' && table.value !== '') {
                    condition.where[table.name] = Like('%' + table.value + '%');
                }
            });
        }

        if (order && order > 0) {
            condition.order = {
                createdDate: 'DESC',
            };
            condition.take = 5;

        }

        condition.order = {
            createdDate: 'DESC',
        };

        if (limit && limit > 0) {
            condition.take = limit;
            condition.skip = offset;
        }
        if (count) {
            return this.customerRepository.count(condition);
        } else {
            return this.customerRepository.find(condition);
        }
    }
    // delete customer
    public async delete(id: number): Promise<any> {
        return await this.customerRepository.delete(id);
    }
    // today customer count
    public async todayCustomerCount(todaydate: string): Promise<any> {
    return await this.customerRepository.TodayCustomerCount(todaydate);
    }
    // dashboard custome count based on filter
    public async dashboardCustomerCount(duration: number): Promise<any> {
    return await this.customerRepository.dashboardCustomerCount(duration);
    }
	
	 public updateoptpassword(password: any, id: any, customer: any): Promise<any> {
        return this.customerRepository.createQueryBuilder()
            .update(customer)
            .set({ password })
            .where('id = :id', { id: id })
            .execute();
    }


    public updateStatus(id: any): Promise<any> {
        return this.customerRepository.createQueryBuilder()
            .update()
            .set({ isActive : 1 })
            .where('id = :id', { id: id })
            .execute();
    }

   
    public findCustomer(customerId: any): Promise<any> {
        return this.customerRepository.manager.query(`SELECT * FROM customer where id=${customerId}`);

    }

     // create notify customer
     public async createNotifyCustomer(notifyCustomer: any): Promise<any> {
        this.log.info('Create a new customer ');
        return this.notifyCustomerRepository.save(notifyCustomer);
    }

    // list notify customer
    public async listNotifyCustomer(): Promise<any> {
        this.log.info('Create a new customer ');
        return this.notifyCustomerRepository.find();
    }

     // update notify customer
    public updateNotifyCustomer(Id: any, email: any,status: any,mobileNo: any,): Promise<any> {
        let customerNotifyUpdate= this.notifyCustomerRepository.createQueryBuilder()
             .update()
             .set({
                email: email,
                status:status,
                mobileNo:mobileNo,
           })
          .where("Id = :Id", { Id: Id })
            .execute()

            return customerNotifyUpdate;
    }

     // notify customer list by customerId
     public customerListByCustomerId(customerId: number): Promise<any> {
		const condition: any = {};
		condition.where = {};

            condition.where = {
                customerId: customerId
            };
        

            return this.notifyCustomerRepository.findOne(condition);
    }

}
