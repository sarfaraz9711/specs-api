import {BeforeInsert, BeforeUpdate, Column, Entity} from 'typeorm';
import {PrimaryGeneratedColumn} from 'typeorm/index';
import moment = require('moment');
import { BaseModel } from '../BaseModel';
import { IsEmpty } from 'class-validator';

@Entity('tt_mig_old_payment_details')
export class PaymentMigrationModel extends BaseModel {

    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    // @IsEmpty()
    // @Column({ name: 'old_payment_id' })
    // public oldPaymentId: number;

    @IsEmpty()
    @Column({ name: 'order_id' })
    public orderId: string;


    @IsEmpty()
    @Column({ name: 'paid_date' })
    public paidDate: string;


    @IsEmpty()
    @Column({ name: 'payment_number' })
    public payementNumber: string;


    @IsEmpty()
    @Column({ name: 'payment_information' })
    public paymentInformation: string;


    @IsEmpty()
    @Column({ name: 'payment_amount' })
    public paymentAmount: number;

    @IsEmpty()
    @Column({ name: 'payment_commission_amount' })
    public paymentComminsionAmount: number;

    @IsEmpty()
    @Column({ name: 'is_payment' })
    public isPayment: number;

    @IsEmpty()
    @Column({ name: 'payment_status' })
    public paymentStatus: number;

    
    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}