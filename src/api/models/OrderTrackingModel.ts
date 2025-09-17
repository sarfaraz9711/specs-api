
import { IsNotEmpty } from 'class-validator';
import { BeforeInsert, Column, Entity, BeforeUpdate, PrimaryGeneratedColumn } from 'typeorm';
import { BaseModel } from './BaseModel';
import moment from 'moment';

@Entity('tt_order_status_tracking')
export class OrderTrackingModel extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn()
    public id: number;

    @IsNotEmpty()
    @Column({ name: 'order_id' })
    public orderId: number;

    @IsNotEmpty()
    @Column({ name: 'transactional_date' })
    public transactionalDate: string;


    @IsNotEmpty()
    @Column({ name: 'shipping_provider' })
    public shippingProvider: string;

    @IsNotEmpty()
    @Column({ name: 'action_type' })
    public actionType: string;

    @IsNotEmpty()
    @Column({ name: 'tracking_url' })
    public trackingUrl: string;

    @IsNotEmpty()
    @Column({ name: 'tracking_no' })
    public trackingNo: string;
    

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
