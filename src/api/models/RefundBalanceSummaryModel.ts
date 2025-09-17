
import { Column, Entity, BeforeInsert, BeforeUpdate, PrimaryGeneratedColumn } from 'typeorm';
import { BaseModel } from './BaseModel';
import moment = require('moment/moment');
import { IsNotEmpty } from 'class-validator';

@Entity('tt_refund_balance_summary')
export class RefundBalanceSummaryModel extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @IsNotEmpty()
    @Column({ name: 'order_id' })
    public order_id: number;

    @IsNotEmpty()
    @Column({ name: 'order_prefix_id' })
    public order_prefix_id: string;

    @IsNotEmpty()
    @Column({ name: 'total_order_paid_amount' })
    public total_order_paid_amount: number;

    @IsNotEmpty()
    @Column({ name: 'total_order_balance_amount' })
    public total_order_balance_amount: number;


    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
