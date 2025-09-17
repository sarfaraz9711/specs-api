import {BeforeInsert, BeforeUpdate, Column, Entity} from 'typeorm';
import {PrimaryGeneratedColumn} from 'typeorm/index';
import moment = require('moment');
import { BaseModel } from '../BaseModel';
import { IsEmpty } from 'class-validator';

@Entity('tt_ingenico_order_data')
export class IngenicoOrderData extends BaseModel {

    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @Column({ name: 'order_id' })
    public orderId: number;

    @Column({ name: 'total_amount' })
    public totalAmount: number;

    @Column({ name: 'customer_id' })
    public customerId: number;

    @Column({ name: 'generated_token' })
    public generatedToken: string;

    @IsEmpty()
    @Column({ name: 'pay_status' })
    public payStatus: string;

    @IsEmpty()
    @Column({ name: 'pay_ref' })
    public payRef: string;

    @IsEmpty()
    @Column({ name: 'tpslTxnId' })
    public tpslTxnId: string;

    @IsEmpty()
    @Column({ name: 'request_payload' })
    public requestPayload: string;
    
    @IsEmpty()
    @Column({ name: 'response_payload' })
    public responsePayload: string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

}
