import { IsNotEmpty,IsEmpty } from 'class-validator';
import moment from 'moment';
import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseModel } from '../BaseModel';
@Entity('tm_ecom_master')
export class EcomModel extends BaseModel{
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @IsEmpty()
    @Column({ name: 'status' })
    public status: string;

    @IsEmpty()
    @Column({ name: 'city_type' })
    public city_type: string;

    @IsEmpty()
    @Column({ name: 'embargo_flag' })
    public embargo_flag: string;

    @IsEmpty()
    @Column({ name: 'pincode' })
    public pincode: string;

    @IsEmpty()
    @Column({ name: 'embargo_end_date' })
    public embargo_end_date: string;

    @IsEmpty()
    @Column({ name: 'active' })
    public active: string;

    @IsEmpty()
    @Column({ name: 'state_code' })
    public state_code: string;

    @IsEmpty()
    @Column({ name: 'city' })
    public city: string;

    @IsEmpty()
    @Column({ name: 'dccode' })
    public dccode: string;

    @IsEmpty()
    @Column({ name: 'route' })
    public route: string;

    @IsEmpty()
    @Column({ name: 'state' })
    public state: string;

    @IsEmpty()
    @Column({ name: 'date_of_discontinuance' })
    public date_of_discontinuance: string;

    @IsEmpty()
    @Column({ name: 'city_code' })
    public city_code: string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}