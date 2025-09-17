
import {BeforeInsert, BeforeUpdate, Column, Entity} from 'typeorm';
import {PrimaryGeneratedColumn} from 'typeorm/index';
import {BaseModel} from '../BaseModel';
import moment = require('moment');
@Entity('tt_mig_payment_order')
export class MigPaymentOrder extends BaseModel {

    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @Column({ name: 'order_id' })
    public orderId: number;

    @Column({ name: 'payment_gateway' })
    public paymentGateway: string;

    @Column({ name: 'paytm_ref_id' })
    public paytmRefId: string;

    @Column({ name: 'total' })
    public total: string;

    @Column({ name: 'status' })
    public status: number;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

}
