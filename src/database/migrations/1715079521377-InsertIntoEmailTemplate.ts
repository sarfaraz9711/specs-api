import {MigrationInterface, QueryRunner} from "typeorm";

export class InsertIntoEmailTemplate1715079521377 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO email_template (shortname,subject,message,is_active) VALUES ('SIGNUP_COUPON','Signup Coupon','On the minimum cart value <strong>₹{minimumPurchaseAmount}</strong> and maximum cart value <strong>₹{maximumPurchaseAmount}</strong> you can use <strong>{couponCode} </strong> coupon code for get flat <strong>₹{couponValue}</strong> discount on your cart',1)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
