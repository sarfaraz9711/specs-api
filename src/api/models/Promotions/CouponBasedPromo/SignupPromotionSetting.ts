import { Column, Entity, BeforeInsert, BeforeUpdate, PrimaryGeneratedColumn } from 'typeorm';
import { BaseModel } from '../../BaseModel';
import moment = require('moment/moment');
import { IsNotEmpty } from 'class-validator';

@Entity('signup_promotion_setting')
export class SignupPromotionsSetting extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'id' })
    public Id: number;
    
    @Column({ name: 'is_setting_active' })
    public isSettingActive: number;
    
    @IsNotEmpty()
    @Column({ name: 'apply_as' })
    public applyAs: number;
    
    @Column({ name: 'coupon_value' })
    public couponValue: number;
    
    @Column({ name: 'coupon_code' })
    public couponCode: string;
    
    @Column({ name: 'minimum_purchase_amount' })
    public minimumPurchaseAmount: number;

    @Column({ name: 'maximum_purchase_amount' })
    public maximumPurchaseAmount: number;

    @Column({ name: 'start_date' })
    public startDate: string;

    @Column({ name: 'end_date' })
    public endDate: string;

    @Column({ name: 'max_coupon_use' })
    public maxCouponUse: number;

    @Column({ name: 'no_of_max_coupon_use_per_user' })
    public noOfMaxCouponUsePerUser: number;

    @Column({ name: 'discount_type_amount_in' })
    public discountTypeAmountIn: string;

    @Column({ name: 'banner_image' })
    public bannerImage: string;

    @Column({ name: 'sign_up_pop_up' })
    public signUpPopUp: string;

    @Column({ name: 'signup_popup_image' })
    public signupPopupImage: string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
