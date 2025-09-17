import { IsNotEmpty,IsEmpty } from 'class-validator';
import moment from 'moment';
import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseModel } from '../BaseModel';
@Entity('tm_email')
export class EmailModels extends BaseModel{
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @IsEmpty()
    @Column({ name: 'SEND_TO' })
    public sendTO: string;

    @IsEmpty()
    @Column({ name: 'SENDER' })
    public sender: string;

    @IsEmpty()
    @Column({ name: 'SUBJECT' })
    public subject: string;

    @IsEmpty()
    @Column({ name: 'AS_OTP' })
    public asOtp: string;

    @IsEmpty()
    @Column({ name: 'BODY_CONTENT' })
    public bodyContent: string;

    @IsEmpty()
    @Column({ name: 'FROM_ADDR' })
    public fromAddress: string;

    @IsEmpty()
    @Column({ name: 'CC_ADDR' })
    public ccAddress: string;

    @IsEmpty()
    @Column({ name: 'STATUS' })
    public status: string;

    @IsEmpty()
    @Column({ name: 'SENDED_ON' })
    public sendOn: string;

    @IsEmpty()
    @Column({ name: 'ATTEMPT' })
    public attempt: string;

    @IsEmpty()
    @Column({ name: 'order_id' })
    public orderId: string;

    @IsEmpty()
    @Column({ name: 'order_status_id' })
    public orderStatusId: string;

    @IsEmpty()
    @Column({ name: 'mail_response' })
    public mailResp: string;


    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}