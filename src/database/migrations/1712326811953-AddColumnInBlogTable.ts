import {MigrationInterface, QueryRunner,TableColumn} from "typeorm";

export class AddColumnInBlogTable1712326811953 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const requestPayload = await queryRunner.hasColumn('banner_image', 'blog');
        if (!requestPayload) {
        await queryRunner.addColumn('blog', new TableColumn({
            name: 'banner_image',
            type: 'text',
            isPrimary: false,
            isNullable: true
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
