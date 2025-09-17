import { IsNotEmpty,IsEmpty } from 'class-validator';
import moment from 'moment';
import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseModel } from '../BaseModel';
@Entity('tm_delivery_expected_ecom')
export class DeliveryPartenerEcomModel extends BaseModel{
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @IsEmpty()
    @Column({ name: 'pincode' })
    public pincode: string;

    @IsEmpty()
    @Column({ name: 'city_name' })
    public cityName: string;

    @IsEmpty()
    @Column({ name: 'dc_code' })
    public dcCode: string;

    @IsEmpty()
    @Column({ name: 'state' })
    public state: string;

    @IsEmpty()
    @Column({ name: 'region' })
    public region: string;

    @IsEmpty()
    @Column({ name: 'regular_up_ros' })
    public regularUpRos: string;

    @IsEmpty()
    @Column({ name: 'precutoff' })
    public preCutoff: string;

    @IsEmpty()
    @Column({ name: 'nocutoff' })
    public noCutoff: string;

    @IsEmpty()
    @Column({ name: 'delivery_partner' })
    public deliveryPartener: string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}