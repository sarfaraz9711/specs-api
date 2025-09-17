import {BeforeInsert, BeforeUpdate, Column, Entity} from 'typeorm';
import {PrimaryGeneratedColumn} from 'typeorm/index';
import moment = require('moment');
import { BaseModel } from '../BaseModel';
import { IsEmpty } from 'class-validator';

@Entity('tt_mig_additional_order_details_mapping')
export class AdditionalDataModel extends BaseModel {

    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @IsEmpty()
    @Column({ name: 'order_id' })
    public orderId: string;

    @IsEmpty()
    @Column({ name: 'old_order_id' })
    public oldOrderId: string;

    @IsEmpty()
    @Column({ name: 'old_order_by_id' })
    public oldOrderById: number;

    @IsEmpty()
    @Column({ name: 'old_invoice_no' })
    public oldInvoiceNo: string;

    @IsEmpty()
    @Column({ name: 'order_date' })
    public orderDate: string;

    @IsEmpty()
    @Column({ name: 'store_id' })
    public storeId: number;

    // @IsEmpty()
    // @Column({ name: 'created_date' })
    // public created_date: number;

    // @IsEmpty()
    // @Column({ name: 'modified_date' })
    // public modified_date: number;


    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    
}