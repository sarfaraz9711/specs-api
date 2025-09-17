
import { IsNotEmpty } from 'class-validator';
import { BeforeInsert, Column, Entity, BeforeUpdate, PrimaryGeneratedColumn } from 'typeorm';
import { BaseModel } from './BaseModel';
import moment from 'moment';

@Entity('order_total')
export class OrderTotal extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn()
    public order_total_id: number;

    @IsNotEmpty()
    @Column({ name: 'order_id' })
    public orderId: number;

    @IsNotEmpty()
    @Column({ name: 'value' })
    public value: number;

    @IsNotEmpty()
    @Column({ name: 'order_req_payload' })
    public orderReqPayload: string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
