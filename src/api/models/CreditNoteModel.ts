
import { Column, Entity, BeforeInsert, BeforeUpdate, PrimaryGeneratedColumn } from 'typeorm';
import { BaseModel } from './BaseModel';
import moment = require('moment/moment');
import { IsNotEmpty } from 'class-validator';

@Entity('tt_credit_notes')
export class CreditNoteModel extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @IsNotEmpty()
    @Column({ name: 'cn_code' })
    public cn_code: string;

    @Column({ name: 'cn_amount' })
    public cn_amount: number;

    @Column({ name: 'cn_source_order_id' })
    public cn_source_order_id: string;

    @Column({ name: 'order_product_id' })
    public order_product_id: string;

    @Column({ name: 'cn_created_date' })
    public cn_created_date: string;

    @Column({ name: 'cn_expiry_date' })
    public cn_expiry_date: string;

    @Column({ name: 'status' })
    public status: boolean;

    @Column({ name: 'cn_applied_order_id' })
    public cn_applied_order_id: string;

    @Column({ name: 'email_id' })
    public emailId: string;

    @Column({ name: 'mobile' })
    public mobile: string;

    @Column({ name: 'channel_name' })
    public channelName: string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
