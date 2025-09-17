/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm/index';
import { OrderProduct } from './OrderProduct';
import { Customer } from './Customer';
import moment = require('moment');
import { OrderStatus } from './OrderStatus';
import { OrderProductLog } from './OrderProductLog';
import { CouponUsage } from './CouponUsage';
import { CouponUsageProduct } from './CouponUsageProduct';
import { IsEmpty, IsNotEmpty } from 'class-validator';
import { BaseModel } from './BaseModel';

// const { CommonService : dd } = require('../common/commonService');
//         let c = new dd();



@Entity('order')
export class Order extends BaseModel {
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'order_id' })
    public orderId: number;

    @Column({ name: 'customer_id' })
    public customerId: number;

    @Column({ name: 'currency_id' })
    public currencyId: number;

    @Column({ name: 'shipping_zone_id' })
    public shippingZoneId: number;

    @Column({ name: 'payment_zone_id' })
    public paymentZoneId: number;

    @Column({ name: 'shipping_country_id' })
    public shippingCountryId: number;

    @Column({ name: 'payment_country_id' })
    public paymentCountryId: number;

    @Column({ name: 'invoice_no' })
    public invoiceNo: string;

    @Column({ name: 'invoice_prefix' })
    public invoicePrefix: string;
    @IsNotEmpty()
    @Column({ name: 'firstname' })
    public firstname: string;

    @Column({ name: 'lastname' })
    public lastname: string;
    @IsNotEmpty()
    @Column({ name: 'email' })
    public email: string;
    @IsNotEmpty()
    @Column({ name: 'telephone' })
    public telephone: number;

    @Column({ name: 'fax' })
    public fax: string;

    @Column({ name: 'shipping_firstname' })
    public shippingFirstname: string;

    @Column({ name: 'shipping_lastname' })
    public shippingLastname: string;

    @Column({ name: 'shipping_company' })
    public shippingCompany: string;
    @IsNotEmpty()
    @Column({ name: 'shipping_address_1' })
    public shippingAddress1: string;

    @Column({ name: 'shipping_address_2' })
    public shippingAddress2: string;

    @Column({ name: 'shipping_city' })
    public shippingCity: string;

    @Column({ name: 'shipping_postcode' })
    public shippingPostcode: string;

    @Column({ name: 'shipping_country' })
    public shippingCountry: string;

    @Column({ name: 'shipping_zone' })
    public shippingZone: string;

    @Column({ name: 'shipping_address_format' })
    public shippingAddressFormat: string;

    @Column({ name: 'shipping_method' })
    public shippingMethod: string;
    
    @Column({ name: 'shipping_charges' })
    public shippingCharges: string;
    
    @Column({ name: 'phone_number_alter' })
    public phoneNumberAlter: string;

    @Column({ name: 'credit_note_order' })
    public creditNoteForOrder: string;

    @Column({ name: 'payment_firstname' })
    public paymentFirstname: string;

    @Column({ name: 'payment_lastname' })
    public paymentLastname: string;

    @Column({ name: 'payment_company' })
    public paymentCompany: string;

    @Column({ name: 'payment_address_1' })
    public paymentAddress1: string;

    @Column({ name: 'payment_address_2' })
    public paymentAddress2: string;

    @Column({ name: 'payment_city' })
    public paymentCity: string;

    @Column({ name: 'payment_postcode' })
    public paymentPostcode: string;

    @Column({ name: 'payment_country' })
    public paymentCountry: string;

    @Column({ name: 'payment_zone' })
    public paymentZone: string;

    @Column({ name: 'payment_address_format' })
    public paymentAddressFormat: string;

    @Column({ name: 'payment_method' })
    public paymentMethod: string;

    @Column({ name: 'comment' })
    public comment: string;

    @Column({ name: 'coupon_code' })
    public couponCode: string;

    @Column({ name: 'discount_amount' })
    public discountAmount: number;

    @Column({ name: 'amount' })
    public amount: number;

    @Column({ name: 'total' })
    public total: number;

    @Column({ name: 'reward' })
    public reward: number;

    @Column({ name: 'order_status_id' })
    public orderStatusId: number;

    @Column({ name: 'order_prefix_id' })
    public orderPrefixId: string;

    @Column({ name: 'affiliate_id' })
    public affiliateId: number;

    @Column({ name: 'commision' })
    public commision: number;

    @Column({ name: 'currency_code' })
    public currencyCode: string;

    @Column({ name: 'currency_value' })
    public currencyValue: number;

    @Column({ name: 'currency_symbol_left' })
    public currencySymbolLeft: string;

    @Column({ name: 'currency_symbol_Right' })
    public currencySymbolRight: string;

    @Column({ name: 'ip' })
    public ip: string;

    @Column({ name: 'payment_flag' })
    public paymentFlag: number;

    @Column({ name: 'payment_status' })
    public paymentStatus: number;

    @Column({ name: 'payment_remark' })
    public paymentRemark: string;

    @Column({ name: 'tracking_url' })
    public trackingUrl: string;

    @Column({ name: 'tracking_no' })
    public trackingNo: string;

    @Column({ name: 'order_name' })
    public orderName: string;

    @Column({ name: 'payment_type' })
    public paymentType: string;

    @Column({ name: 'payment_process' })
    public paymentProcess: number;

    @Column({ name: 'payment_details' })
    public paymentDetails: string;

    @Column({ name: 'order_cancel_reason' })
    public orderCancelReson: string;

    @Column({ name: 'order_cancel_remark' })
    public orderCancelRemark: string;

    @Column({ name: 'back_orders' })
    public backOrders: number;

    @Column({ name: 'is_active' })
    public isActive: number;

    @Column({ name: 'total_tax' })
    public totalTax: number;

    @Column({ name: 'total_items_price' })
    public totalItemsPrice: number;

    @Column({ name: 'customer_gst_no' })
    public customerGstNo: string;

    @IsEmpty()
    @Column({ name: 'tracking_id_fk' })
    public trackingIdFk: number;

    @Column({ name: 'uc_order_status' })
    public ucOrderStatus: string;

    @Column({ name: 'sent_on_uc' })
    public sentOnUc: boolean;

    @IsEmpty()
    @Column({ name: 'store_id' })
    public storeId: number;

    @Column({ name: 'payment_state_code' })
    public paymentStateCode: string;

    @Column({ name: 'shipping_state_code' })
    public shippingStateCode: string;

    @Column({ name: 'sent_on_mloyal' })
    public sentOnMloyal: number;

    @Column({ name: 'applied_cn_amount' })
    public appliedCnAmount: number;

    @Column({ name: 'applied_cn_code' })
    public appliedCnCode: string;

    @Column({ name: 'given_return_cancelled_type' })
    public givenReturnCancelledType: string;

    @Column({ name: 'old_cn_source_order_ids' })
    public oldCnSourceOrderIds: string;

    @ManyToOne(type => OrderStatus, orderStatus => orderStatus.statusOfOrder)
    @JoinColumn({ name: 'order_status_id' })
    public orderStatus: OrderStatus;

    @ManyToOne(type => Customer, customer => customer.order)
    @JoinColumn({ name: 'customer_id' })
    public customer: Customer;

    @OneToMany(type => OrderProduct, orderProduct => orderProduct.product)
    public productlist: OrderProduct[];

    @OneToMany(type => OrderProduct, orderProduct => orderProduct.order)
    public orderProduct: OrderProduct[];

    @OneToMany(type => OrderProductLog, orderProductLog => orderProductLog.order)
    public orderProductLog: OrderProductLog[];

    @OneToMany(type => CouponUsage, couponUsage => couponUsage.order)
    public couponUsage: CouponUsage[];

    @OneToMany(type => CouponUsageProduct, couponUsageProduct => couponUsageProduct.order)
    public couponUsageProduct: CouponUsageProduct[];

    @BeforeInsert()
    public async createDetails(): Promise<void> {
       this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
       // this.createdDate = c.getDateInIstFormat(true);
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
       this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
       // this.modifiedDate = c.getDateInIstFormat(true);
    }


    
}
