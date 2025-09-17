import { Column, Entity, BeforeInsert, BeforeUpdate, PrimaryGeneratedColumn } from 'typeorm';
import { BaseModel } from './BaseModel';
import moment = require('moment/moment');
import { IsNotEmpty } from 'class-validator';
 
@Entity('tm_order_cancel_requests')
export class OrderCancelRequests extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @Column({ name: 'order_id' })
    public orderId: number;

    @Column({ name: 'order_product_id' })
    public orderProductId: number;

    @Column({ name: 'product_id' })
    public productId: number;

    @Column({ name: 'customer_id' })
    public customerId: number;

    @Column({ name: 'order_prefix_id' })
    public orderPrefixId: string;

    @Column({ name: 'total_amount' })
    public totalAmount: string;

    @Column({ name: 'cancel_request_reason' })
    public cancelRequestReason: string;

    @Column({ name: 'cancel_request_remark' })
    public cancelRequestRemark: string;

    @Column({ name: 'cancel_request_status' })
    public cancelRequestStatus: string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
