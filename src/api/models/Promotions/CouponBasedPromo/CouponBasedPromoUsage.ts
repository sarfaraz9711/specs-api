
import { Column, Entity, BeforeInsert, BeforeUpdate, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BaseModel } from '../../BaseModel';
import moment = require('moment/moment');
//import { Order } from '../../Order';
import { CouponBasedPromo } from './CouponBasedPromo';

import { IsNotEmpty } from 'class-validator';

@Entity('tt_coupon_based_promo_usage')
export class CouponBasedPromoUsage extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'coupon_usage_id' })
    public couponUsageId: number;
    @IsNotEmpty()
    @Column({ name: 'coupon_id' })
    public couponId: number;
    @Column({ name: 'customer_id' })
    public customerId: number;
    @IsNotEmpty()
    @Column({ name: 'order_id' })
    public orderId: number;

    @Column({ name: 'discount_amount' })
    public discountAmount: number;

    @ManyToOne(type => CouponBasedPromo, couponBasedPromo => couponBasedPromo.couponUsage)
    @JoinColumn({ name: 'coupon_id' })
    public promoCoupon: CouponBasedPromo[];

    // @ManyToOne(type => Order, order => order.couponUsage)
    // @JoinColumn({ name: 'order_id' })
    // public order: Order[];

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
