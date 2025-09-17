import {BeforeInsert, BeforeUpdate, Column, Entity} from 'typeorm';
import {PrimaryGeneratedColumn} from 'typeorm/index';
import moment = require('moment');
import { BaseModel } from '../BaseModel';
import { IsEmpty } from 'class-validator';

@Entity('tt_ingenico_order_transaction')
export class IngenicoTransactions extends BaseModel {

    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;

    @Column({ name: 'txn_status' })
    public txnStatus: string;

    @Column({ name: 'txn_msg' })
    public txnMsg: string;

    @Column({ name: 'txn_err_msg' })
    public txnErrMsg: string;

    @Column({ name: 'clnt_txn_ref' })
    public clntTxnRef: string;

    @Column({ name: 'tpsl_bank_cd' })
    public tpslBankCd: string;
    
    @Column({ name: 'tpsl_txn_id' })
    public tpslTxnId: string;

    @Column({ name: 'txn_amt' })
    public txnAmt: string;

    @Column({ name: 'clnt_rqst_meta' })
    public clntRqstMeta: string;

    @Column({ name: 'tpsl_txn_time' })
    public tpslTxnTime: string;

    @Column({ name: 'bal_amt' })
    public balAmt: string;

    @Column({ name: 'card_id' })
    public cardId: string;

    @Column({ name: 'alias_name' })
    public aliasName: string;

    @Column({ name: 'BankTransactionID' })
    public BankTransactionID: string;

    @Column({ name: 'mandate_reg_no' })
    public manDateRegNo: string;

    @Column({ name: 'token' })
    public token: string;

    @Column({ name: 'hash' })
    public hash: string;

    @IsEmpty()
    @Column({ name: 'pay_order_id' })
    public payOrderId: number;

    @IsEmpty()
    @Column({ name: 'final_response' })
    public finalResponse: string;
    

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

}
