import { IsNotEmpty } from 'class-validator';
import moment from 'moment';
import {
    BeforeInsert,
     BeforeUpdate,
     Column, Entity, PrimaryGeneratedColumn
} from 'typeorm';
import { BaseModel } from './BaseModel';

@Entity('tm_loyalty_point_transaction')
export class LoyaltyPoint extends BaseModel{

    @PrimaryGeneratedColumn({name: 'id'})
    @IsNotEmpty()
    public redeemId: number;
	
    @Column({ name: 'balance_points' })
    public balancePoints: string;

    @Column({ name: 'points_value' })
    public pointsValue: string;

    @Column({ name: 'redeem_points' })
    public redeemPoints: string;

    @Column({ name: 'reference_no' })
    public referenceNo: string;

    @Column({ name: 'mobile_no' })
    public mobileNo: string;

    @Column({ name: 'order_id' })
    public orderId: string;

    @Column({ name: 'status' })
    public status: string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
	


}
