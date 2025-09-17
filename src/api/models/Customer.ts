/*
* spurtcommerce
* http://www.spurtcommerce.com
*
* Copyright (c) 2022 Piccosoft Software Labs Pvt Ltd
* Author Piccosoft Software Labs Pvt Ltd <support@spurtcommerce.com>
* Licensed under the MIT license.
*/

import { Column, Entity, BeforeInsert, BeforeUpdate, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn} from 'typeorm';
import { BaseModel } from './BaseModel';
import * as bcrypt from 'bcrypt';
import moment = require('moment/moment');
import { Exclude } from 'class-transformer';
import { ProductRating } from './ProductRating';
import { CustomerGroup } from './CustomerGroup';
import { Order } from './Order';
import { Country } from './Country';
import { ProductAnswerLikeDislike } from './ProductAnswerLikeDislike';
import { AnswerReportAbuse } from './AnswerReportAbuse';
import { Quotation } from './Quotation';
import { IsEmpty, IsNotEmpty } from 'class-validator';
import { ProductViewLog } from './productViewLog';

@Entity('customer')
export class Customer extends BaseModel {

    public static hashPassword(password: string): Promise<string> {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    }

    public static comparePassword(user: Customer, password: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                resolve(res === true);
            });
        });
    }
    @IsNotEmpty()
    @PrimaryGeneratedColumn({ name: 'id' })
    public id: number;
    @IsNotEmpty()
    @Column({ name: 'first_name' })
    public firstName: string;

    @Column({ name: 'last_name' })
    public lastName: string;
    @IsNotEmpty()
    @Column({ name: 'username' })
    public username: string;
    @IsNotEmpty()
    @Exclude()
    @Column({ name: 'password' })
    public password: string;
    @IsNotEmpty()
    @Column({ name: 'email' })
    public email: string;

    @Column({ name: 'mobile' })
    public mobileNumber: string;

    @Column({ name: 'address' })
    public address: string;

    @Column({ name: 'country_id' })
    public countryId: number;

    @Column({ name: 'zone_id' })
    public zoneId: number;

    @Column({ name: 'city' })
    public city: string;

    @Column({ name: 'local' })
    public local: string;

    @Column({ name: 'oauth_data' })
    public oauthData: string;

    @Column({ name: 'avatar' })
    public avatar: string;
    @Exclude()
    @Column({ name: 'newsletter' })
    public newsletter: string;

    @Column({ name: 'avatar_path' })
    public avatarPath: string;
    @Exclude()
    @Column({ name: 'customer_group_id' })
    public customerGroupId: number;

    @Column({ name: 'last_login' })
    public lastLogin: string;
    @Exclude()
    @Column({ name: 'safe' })
    public safe: number;

    @Column({ name: 'ip' })
    public ip: number;
    @Exclude()
    @Column({ name: 'mail_status' })
    public mailStatus: number;

    @Column({ name: 'pincode' })
    public pincode: string;
    @Exclude()
    @Column({ name: 'delete_flag' })
    public deleteFlag: number;
    @Exclude()
    @Column({ name: 'is_active' })
    public isActive: number;

    @Column({ name: 'mig_user_active' })
    public migUserActive: number;

    @Column({ name: 'forget_password_key'})
    public forgetPasswordKey: number;

    @Column({ name: 'locked_on'})
    public lockedOn: string;

    @IsEmpty()
    @Column({ name: 'gender'})
    public gender: string;

    @IsEmpty()
    @Column({ name: 'old_user_id'})
    public oldUserId: string;

    @IsEmpty()
    @Column({ name: 'user_creation_date'})
    public userCreationDate: string;

    @ManyToOne(type => CustomerGroup, customergroup => customergroup.customer)
    @JoinColumn({ name: 'customer_group_id' })
    public customerGroup: CustomerGroup;

    @ManyToOne(type => Country, country => country.customer)
    @JoinColumn({ name: 'country_id' })
    public country: Country;

    @IsEmpty()
    @Column({ name: 'state'})
    public state: string;

    @IsEmpty()
    @Column({ name: 'DOB'})
    public DOB: string;

    @IsEmpty()
    @Column({ name: 'customer_type'})
    public customerType: number;

    @OneToMany(type => ProductRating, productRating => productRating.product)
    public productRating: ProductRating[];

    @OneToMany(type => Order, order => order.customer)
    public order: Order[];

    @OneToMany(type => ProductViewLog, productviewlog => productviewlog.customer)
    public productviewlog: ProductViewLog[];

    @OneToMany(type => ProductAnswerLikeDislike, productAnswerLike => productAnswerLike.customer)
    public productAnswerLike: ProductAnswerLikeDislike[];

    @OneToMany(type => AnswerReportAbuse, answerReportAbuse => answerReportAbuse.customer)
    public answerReportAbuse: AnswerReportAbuse[];

    @OneToMany(type => Quotation, quotation => quotation.customer)
    public quotation: Quotation[];

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.modifiedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    }
}
