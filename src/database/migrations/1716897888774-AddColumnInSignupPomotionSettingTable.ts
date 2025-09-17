import {MigrationInterface, QueryRunner,TableColumn} from "typeorm";

export class AddColumnInSignupPomotionSettingTable1716897888774 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const isBannerImage = await queryRunner.hasColumn('banner_image', 'signup_promotion_setting');
        if (!isBannerImage) {
        await queryRunner.addColumn('signup_promotion_setting', new TableColumn({
            name: 'banner_image',
            type: 'text',
            isPrimary: false,
            isNullable: true
            }));
        }

        const isSignUpPopUp = await queryRunner.hasColumn('sign_up_pop_up', 'signup_promotion_setting');
        if (!isSignUpPopUp) {
        await queryRunner.addColumn('signup_promotion_setting', new TableColumn({
            name: 'sign_up_pop_up',
            type: 'text',
            isPrimary: false,
            isNullable: true
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('signup_promotion_setting', 'banner_image');
        await queryRunner.dropColumn('signup_promotion_setting', 'sign_up_pop_up');


    }

}
