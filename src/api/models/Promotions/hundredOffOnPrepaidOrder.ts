
import { Column, Entity, BeforeInsert, BeforeUpdate, PrimaryGeneratedColumn } from 'typeorm';
import { BaseModel } from '../BaseModel';
import moment = require('moment/moment');
import { IsNotEmpty } from 'class-validator';

@Entity('tt-hundred-rupee-off-on-prepaid-order')
export class HundredOffOnPreProdOrder extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'id' })
    public promtionId: number;
    @IsNotEmpty()

    @Column({ name: 'order_id' })
    public orderId: number;
    @IsNotEmpty()

    @Column({ name: 'discounted_amount' })
    public discountedAmount: string;


    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
