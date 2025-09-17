import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AddColumnInSettingsTable1679918482436 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        const deliveredDate = await queryRunner.hasColumn('settings', 'registeredAddress');
        if (!deliveredDate) {
            await queryRunner.addColumn('settings', new TableColumn({
                name: 'registeredAddress',
                type: 'text',
                isPrimary: false,
                isNullable: true,
                default: null,
                }));
            }
            
            const cin_number = await queryRunner.hasColumn('settings', 'cin_number');
            if (!cin_number) {
                await queryRunner.addColumn('settings', new TableColumn({
                    name: 'cin_number',
                    type: 'text',
                    isPrimary: false,
                    isNullable: true,
                    default: null,
                    }));
                }
                const gstin_number = await queryRunner.hasColumn('settings', 'gstin_number');
                if (!gstin_number) {
                    await queryRunner.addColumn('settings', new TableColumn({
                        name: 'gstin_number',
                        type: 'text',
                        isPrimary: false,
                        isNullable: true,
                        default: null,
                        }));
                    }

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('settings', 'registeredAddress');
    }

}
