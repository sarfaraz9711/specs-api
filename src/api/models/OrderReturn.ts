import { Column, Entity, BeforeInsert, BeforeUpdate, PrimaryGeneratedColumn } from 'typeorm';
import { BaseModel } from './BaseModel';
import moment = require('moment/moment');
import { IsNotEmpty } from 'class-validator';
 
@Entity('tm_order_return')
export class OrderReturn extends BaseModel {
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

    @Column({ name: 'order_product_prefix_id' })
    public orderProductPrefixId: string;

    @Column({ name: 'total_amount' })
    public totalAmount: string;

    @Column({ name: 'return_reason' })
    public returnReason: string;

    @Column({ name: 'return_remark' })
    public returnRemarkValue: string;

    @Column({ name: 'return_type' })
    public returnType: string;

    @Column({ name: 'quantity' })
    public quantity: number;

    @Column({ name: 'sku_name' })
    public skuName: number;

    @Column({ name: 'vareint_id' })
    public vareintId: number;

    @Column({ name: 'varient_name' })
    public varientName: string;

    @Column({ name: 'return_status' })
    public returnStatus: number;

    @Column({ name: 'mail_sent_status' })
    public mailSentStatus: string;

    @Column({ name: 'return_order_sku' })
    public returnOrderSku: string;

    @Column({ name: 'rp_code' })
    public rpCode: string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
