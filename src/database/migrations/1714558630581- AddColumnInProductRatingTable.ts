import {MigrationInterface, QueryRunner,TableColumn} from "typeorm";

export class ColumnInProductRatingTable1714558630581 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const isCommentApproved = await queryRunner.hasColumn('is_comment_approved', 'product_rating');
        if (!isCommentApproved) {
        await queryRunner.addColumn('product_rating', new TableColumn({
            name: 'is_comment_approved',
            type: 'varchar',
            length: '255',
            isPrimary: false,
            isNullable: true
            }));
        }

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('product_rating', 'is_comment_approved');

    }

}
