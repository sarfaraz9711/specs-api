import {MigrationInterface, QueryRunner} from "typeorm";

export class AlterOrderTableForEmail1687937590099 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `order` CHANGE `email` `email` MEDIUMTEXT NULL');
        await queryRunner.query('ALTER TABLE `order_log` CHANGE `email` `email` MEDIUMTEXT NULL');
        await queryRunner.query('ALTER TABLE `tt_mig_additional_order_details_mapping` CHANGE `old_order_by_id` `old_order_by_id` MEDIUMTEXT NOT NULL');
        await queryRunner.query('ALTER TABLE `order_log` CHANGE `shipping_firstname` `shipping_firstname` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL, CHANGE `shipping_lastname` `shipping_lastname` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL, CHANGE `shipping_company` `shipping_company` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL, CHANGE `payment_firstname` `payment_firstname` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL, CHANGE `payment_lastname` `payment_lastname` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL, CHANGE `payment_company` `payment_company` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL');
        await queryRunner.query('ALTER TABLE `order` CHANGE `shipping_firstname` `shipping_firstname` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL, CHANGE `shipping_lastname` `shipping_lastname` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL, CHANGE `shipping_company` `shipping_company` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL, CHANGE `payment_firstname` `payment_firstname` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL, CHANGE `payment_lastname` `payment_lastname` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL, CHANGE `payment_company` `payment_company` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL');
        await queryRunner.query('ALTER TABLE `order` CHANGE `firstname` `firstname` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL, CHANGE `lastname` `lastname` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL');
        await queryRunner.query('ALTER TABLE `order_log` CHANGE `firstname` `firstname` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL, CHANGE `lastname` `lastname` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL');
                 
    } 

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE `order` CHANGE `email` `email` MEDIUMTEXT NULL');
        await queryRunner.query('ALTER TABLE `order_log` CHANGE `email` `email` MEDIUMTEXT NULL');
        await queryRunner.query('ALTER TABLE `tt_mig_additional_order_details_mapping` CHANGE `old_order_by_id` `old_order_by_id` MEDIUMTEXT NOT NULL');
        await queryRunner.query('ALTER TABLE `order_log` CHANGE `shipping_firstname` `shipping_firstname` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL, CHANGE `shipping_lastname` `shipping_lastname` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL, CHANGE `shipping_company` `shipping_company` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL, CHANGE `payment_firstname` `payment_firstname` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL, CHANGE `payment_lastname` `payment_lastname` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL, CHANGE `payment_company` `payment_company` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL');
        await queryRunner.query('ALTER TABLE `order` CHANGE `shipping_firstname` `shipping_firstname` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL, CHANGE `shipping_lastname` `shipping_lastname` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL, CHANGE `shipping_company` `shipping_company` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL, CHANGE `payment_firstname` `payment_firstname` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL, CHANGE `payment_lastname` `payment_lastname` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL, CHANGE `payment_company` `payment_company` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL');
        await queryRunner.query('ALTER TABLE `order` CHANGE `firstname` `firstname` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL, CHANGE `lastname` `lastname` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL');
        await queryRunner.query('ALTER TABLE `order_log` CHANGE `firstname` `firstname` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL, CHANGE `lastname` `lastname` VARCHAR(255) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci NULL');
    }

}
