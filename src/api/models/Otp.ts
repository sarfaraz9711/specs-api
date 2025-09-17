// import * as bcrypt from 'bcrypt';
// import { Exclude } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import {env} from "../../env"
import moment from 'moment';
import {
    BeforeInsert,
    BeforeUpdate,
    Column, Entity, PrimaryGeneratedColumn
} from 'typeorm';
import { BaseModel } from './BaseModel';
@Entity('tt_user_otp_data')

export class Otp  extends BaseModel{

    @PrimaryGeneratedColumn({ name: 'id' })
    @IsNotEmpty()
    public id: number;
    
    @IsNotEmpty()
    @Column({ name: 'mobile_no' })
    public mobile_no: string;
    
    @IsNotEmpty()
    @Column({ name: 'otp' })
    public otp: number;

    @IsNotEmpty()
    @Column({ name: 'customer_id' })
    public customer_id: number;

    @IsNotEmpty()
    @Column({name: "otp_type"})
    public otpType : string;

    @IsNotEmpty()
    @Column({name: "valid_till"})
    public validTill : string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        let _d = moment().add(env.OTP_TIME_LIMIT_IN_SECONDS,'seconds');
        this.validTill = _d.format('YYYY-MM-DD HH:mm:ss');
        
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
