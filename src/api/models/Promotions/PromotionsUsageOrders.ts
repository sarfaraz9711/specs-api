
import { Column, Entity, BeforeInsert, BeforeUpdate, PrimaryGeneratedColumn } from 'typeorm';
import { BaseModel } from '../BaseModel';
import moment = require('moment/moment');
import { IsNotEmpty } from 'class-validator';

@Entity('tt_promotions_usage_orders')
export class PromotionsUsageOrders extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'id' })
    public promtionId: number;
    @IsNotEmpty()

    @Column({ name: 'order_id' })
    public orderId: number;
    @IsNotEmpty()

    @Column({ name: 'promotion_type' })
    public promotionType: string;

    @Column({ name: 'promotion_sub_type' })
    public promotionSubType: string;

    @Column({ name: 'promotion_identifier' })
    public promotionIdentifier: string;

    @Column({ name: 'coupon_code' })
    public couponCode: string;

    @Column({ name: 'discount_value' })
    public discountValue: string;

    @Column({ name: 'discounted_amount' })
    public discountedAmount: string;

    @Column({ name: 'bought_products_ids' })
    public boughtProductsIds: string;

    @Column({ name: 'free_products_ids' })
    public freeProductsIds: string;

    @Column({ name: 'start_date' })
    public startDate: string;

    @Column({ name: 'end_date' })
    public endDate: string;

    @Column({ name: 'start_time' })
    public startTime: string;

    @Column({ name: 'end_time' })
    public endTime: string;


    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
