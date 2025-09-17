import { IsEmpty } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany} from 'typeorm';
import { BaseModel } from './BaseModel';
import {Pinelabsorders} from "./Pinelabsorders";

@Entity({name:'tt_pine_labs'})
export class Pinlabs extends BaseModel{


    @PrimaryGeneratedColumn()
    public id : number;
    
    @OneToMany(() => Pinelabsorders, (pno) => pno.pineLabsFk, {
        cascade : true
    })
    public pineLabsFkOrder: Pinelabsorders[];

    @IsEmpty()
    @Column({ name: 'amount',nullable: false, default: 0 })
    public amount: number;

    @IsEmpty()
    @Column({ name: 'currency_code',nullable: true})
    public currencyCode: string;

    @IsEmpty()
    @Column({ name: 'order_desc',nullable: true})
    public orderDesc: string;

    @IsEmpty()
    @Column({ name: 'country_code',nullable: true})
    public countryCode: string;
    
    @IsEmpty()
    @Column({ name: 'mobile_number',nullable: true})
    public mobileNumber: string;

    @IsEmpty()
    @Column({ name: 'email_id',nullable: true})
    public emailId: string;

    @IsEmpty()
    @Column({ name: 'billing_first_name',nullable: true})
    public billingFirstName: string;

    @IsEmpty()
    @Column({ name: 'billing_last_name',nullable: true})
    public billingLastName: string;

    @IsEmpty()
    @Column({ name: 'billing_address1',nullable: true})
    public billingAddress1: string;

    @IsEmpty()
    @Column({ name: 'billing_address2',nullable: true})
    public billingAddress2: string;

    @IsEmpty()
    @Column({ name: 'billing_address3',nullable: true})
    public billingAddress3: string;

    @IsEmpty()
    @Column({ name: 'billing_pin_code',nullable: true})
    public billingPinCode: string;

    @IsEmpty()
    @Column({ name: 'billing_city',nullable: true})
    public billingCity: string;

    @IsEmpty()
    @Column({ name: 'billing_state',nullable: true})
    public billingState: string;

    @IsEmpty()
    @Column({ name: 'billing_country',nullable: true})
    public billingCountry: string;

    @IsEmpty()
    @Column({ name: 'shipping_first_name',nullable: true})
    public shippingFirstName: string;

    @IsEmpty()
    @Column({ name: 'shipping_last_name',nullable: true})
    public shippingLastName: string;

    @IsEmpty()
    @Column({ name: 'shipping_address1',nullable: true})
    public shippingAddress1: string;

    @IsEmpty()
    @Column({ name: 'shipping_address2',nullable: true})
    public shippingAddress2: string;

    @IsEmpty()
    @Column({ name: 'shipping_address3',nullable: true})
    public shippingAddress3: string;

    @IsEmpty()
    @Column({ name: 'shipping_pin_code',nullable: true})
    public shippingPinCode: string;

    @IsEmpty()
    @Column({ name: 'shipping_city',nullable: true})
    public shippingCity: string;

    @IsEmpty()
    @Column({ name: 'shipping_state',nullable: true})
    public shippingState: string;

    @IsEmpty()
    @Column({ name: 'shipping_country',nullable: true})
    public shippingCountry: string;

    @IsEmpty()
    @Column({ name: 'additional_info_data',nullable: true})
    public additionalInfoData: string;

    @IsEmpty()
    @Column({ name: 'token_id',nullable: true})
    public tokenId: string;

    @IsEmpty()
    @Column({ name: 'plural_order_id',nullable: true})
    public pluralOrderId: string;

    @IsEmpty()
    @Column({ name: 'payment_status',nullable: true})
    public paymentStatus: string;
 


}