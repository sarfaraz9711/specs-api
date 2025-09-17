import {MigrationInterface, QueryRunner,TableColumn} from "typeorm";

export class AddCatogoryFieldInBlogTable1711953256808 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const requestPayload = await queryRunner.hasColumn('category_name', 'blog');
        if (!requestPayload) {
        await queryRunner.addColumn('blog', new TableColumn({
            name: 'category_name',
            type: 'text',
            isPrimary: false,
            isNullable: true
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('blog', 'category_name');

    }

}
