import {BeforeInsert, BeforeUpdate, Column, Entity} from 'typeorm';
import {PrimaryGeneratedColumn} from 'typeorm/index';
import moment = require('moment');
import { BaseModel } from '../BaseModel';

@Entity('tt_paytm_refund')
export class PaytmRefunds extends BaseModel {

    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @Column({ name: 'orderPrefixId' })
    public orderPrefixId: string;

    @Column({ name: 'mid' })
    public mid: string;

    @Column({ name: 'localRefundId' })
    public localRefundId: string;

    @Column({ name: 'refundId' })
    public refundId: string;
    
    @Column({ name: 'txnTimestamp' })
    public txnTimestamp: string;

    @Column({ name: 'resultStatus' })
    public resultStatus: string;

    @Column({ name: 'resultCode' })
    public resultCode: string;

    @Column({ name: 'resultMessage' })
    public resultMessage: string;

    @Column({ name: 'userCreditInitiateStatus' })
    public userCreditInitiateStatus: string;

    @Column({ name: 'merchantRefundRequestTimestamp' })
    public merchantRefundRequestTimestamp: string;
    
    @Column({ name: 'acceptRefundTimestamp' })
    public acceptRefundTimestamp: string;

    @Column({ name: 'acceptRefundStatus' })
    public acceptRefundStatus: string;

    @Column({ name: 'source' })
    public source: string;

    @Column({ name: 'totalRefundAmount' })
    public totalRefundAmount: string;

    @Column({ name: 'refundAmount' })
    public refundAmount: string;
    
    @Column({ name: 'txnAmount' })
    public txnAmount: string;

    @Column({ name: 'txnId' })
    public txnId: string;

    @Column({ name: 'refundDetailInfoList' })
    public refundDetailInfoList: string;

    @Column({ name: 'refundInitiateRequest' })
    public refundInitiateRequest: string;

    @Column({ name: 'refundInitiateResponse' })
    public refundInitiateResponse: string;

    @Column({ name: 'schedulerResponse' })
    public schedulerResponse: string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

}
