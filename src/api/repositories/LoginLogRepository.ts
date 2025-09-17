/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { EntityRepository, Repository } from 'typeorm';

import { LoginLog } from '../models/LoginLog';

@EntityRepository(LoginLog)
export class LoginLogRepository extends Repository<LoginLog> {
    public async logList(limit: number): Promise<any> {
        const query: any = await this.manager.createQueryBuilder(LoginLog, 'LoginLog');
        query.select(['COUNT(LoginLog.id) as logcount', 'DATE(created_date) as createdDate']);
        query.groupBy('createdDate');
        query.orderBy('createdDate', 'DESC');
        query.limit(limit);
        return query.getRawMany();
    }

    public async customerVisitList( month: number, year: number): Promise<any> {
        const query: any = await this.manager.createQueryBuilder(LoginLog, 'loginLog');
        query.select(['COUNT(loginLog.id) as visitCount', 'DAYOFMONTH(MAX(created_date)) as dayOfMonth', 'MONTH(MAX(created_date)) as month', 'YEAR(MAX(created_date)) as year']);
        if (month && year) {
            query.andWhere('MONTH(loginLog.created_date) = :month AND YEAR(loginLog.created_date) = :year', {month, year});
        }
        query.groupBy('DATE(created_date)');
        query.orderBy('DATE(created_date)', 'ASC');
        return query.getRawMany();
    }
}
