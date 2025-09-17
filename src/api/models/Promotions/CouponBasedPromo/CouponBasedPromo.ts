import { Column, Entity, BeforeInsert, BeforeUpdate, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BaseModel } from '../../BaseModel';
import moment = require('moment/moment');
import { CouponBasedPromoUsage } from './CouponBasedPromoUsage';
import { IsNotEmpty } from 'class-validator';

@Entity('tm_coupon_based_promotion')
export class CouponBasedPromo extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'coupon_id' })
    public couponId: number;
    
    @Column({ name: 'coupon_name' })
    public couponName: string;
    
    @IsNotEmpty()
    @Column({ name: 'coupon_code' })
    public couponCode: string;
    
    @Column({ name: 'coupon_type' })
    public couponType: number;
    
    @Column({ name: 'coupon_promotion_type' })
    public couponPromotionType: string;
    
    @Column({ name: 'discount' })
    public couponValue: number;

    @Column({ name: 'minimum_purchase_amount' })
    public minimumPurchaseAmount: number;

    @Column({ name: 'maximum_purchase_amount' })
    public maximumPurchaseAmount: number;

    @Column({ name: 'email_restrictions' })
    public emailRestrictions: string;


    @Column({ name: 'start_date' })
    public startDate: string;

    @Column({ name: 'end_date' })
    public endDate: string;

    @Column({ name: 'max_coupon_use' })
    public maxCouponUse: number;

    @Column({ name: 'no_of_max_coupon_use_per_user' })
    public noOfMaxCouponUsePerUser: number;

    @Column({ name: 'is_active' })
    public isActive: number;

    @Column({ name: 'order_id' })
    public orderId: string;

    @OneToMany(type => CouponBasedPromoUsage, couponUsage => couponUsage.promoCoupon)
    public couponUsage: CouponBasedPromoUsage[];

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
