import {BeforeInsert, BeforeUpdate, Column, Entity} from 'typeorm';
import {PrimaryGeneratedColumn} from 'typeorm/index';
import moment = require('moment');
import { BaseModel } from '../BaseModel';
import { IsEmpty } from 'class-validator';

@Entity('tt_mig_product_log')
export class ProductLogModel extends BaseModel {

    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @Column({ name: 'order_no' })
    public orderNo: string;

    @Column({ name: 'action_date' })
    public actionDate: string;

    @Column({ name: 'action_type' })
    public actionType: string;

    @Column({ name: 'tracking_no' })
    public trackingNo: string;

    @Column({ name: 'tracking_url' })
    public trackingUrl: string;

    @IsEmpty()
    @Column({ name: 'status' })
    public status: string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    
}