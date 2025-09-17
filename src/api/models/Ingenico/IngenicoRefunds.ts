import {BeforeInsert, BeforeUpdate, Column, Entity} from 'typeorm';
import {PrimaryGeneratedColumn} from 'typeorm/index';
import moment = require('moment');
import { BaseModel } from '../BaseModel';

@Entity('tt_ingenico_refunds')
export class IngenicoRefunds extends BaseModel {

    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @Column({ name: 'merchantCode' })
    public merchantCode: string;

    @Column({ name: 'merchantTransactionIdentifier' })
    public merchantTransactionIdentifier: string;

    @Column({ name: 'merchantTransactionRequestType' })
    public merchantTransactionRequestType: string;

    @Column({ name: 'responseType' })
    public responseType: string;
    
    @Column({ name: 'transactionState' })
    public transactionState: string;

    @Column({ name: 'token' })
    public token: string;

    @Column({ name: 'bankSelectionCode' })
    public bankSelectionCode: string;

    @Column({ name: 'amount' })
    public amount: string;
    @Column({ name: 'refundAmount' })
    public refundAmount: string;
    
    @Column({ name: 'balanceAmount' })
    public balanceAmount: string;

    @Column({ name: 'bankReferenceIdentifier' })
    public bankReferenceIdentifier: string;
    
    @Column({ name: 'dateTime' })
    public dateTime: string;

    @Column({ name: 'errorMessage' })
    public errorMessage: string;

    @Column({ name: 'identifier' })
    public identifier: string;

    @Column({ name: 'refundIdentifier' })
    public refundIdentifier: string;

    @Column({ name: 'statusCode' })
    public statusCode: string;
    
    @Column({ name: 'statusMessage' })
    public statusMessage: string;

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
