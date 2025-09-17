import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddResourcesColumnInPluginTable1684395655875 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const resourcesColumn = await queryRunner.hasColumn('plugins', 'resources');
        if (!resourcesColumn) {
            await queryRunner.addColumn('plugins', new TableColumn({
                name: 'resources',
                type: 'text',
                isPrimary: false,
                isNullable: true,
                default: null,
                }));
            }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('plugins', 'resources');
    }

}
