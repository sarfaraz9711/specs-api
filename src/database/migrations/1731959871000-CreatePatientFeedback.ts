import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePatientFeedback1731959871000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {

        const table = new Table({
            name: 'patient_feedback',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment'
                },
                {
                    name: 'name',
                    type: 'varchar',
                    length: '255',
                    isNullable: false
                },
                {
                    name: 'feedback',
                    type: 'text',
                    isNullable: false
                },
                {

                    name: 'address',
                    type: 'varchar',
                    length: '255',
                    isNullable: false
                },
                {
                    name: 'is_active',
                    type: 'int',
                    isNullable: true,
                },
                {
                    name: 'created_by',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                }, {
                    name: 'modified_by',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                },
                {
                    name: 'created_date',
                    type: 'timestamp',
                    isNullable: true,
                },
                {
                    name: 'modified_date',
                    type: 'timestamp',
                    isNullable: true,
                },
            ],
        });

        const ifExist = await queryRunner.hasTable('patient_feedback');
        if (!ifExist) {
            await queryRunner.createTable(table, true);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('patient_feedback');
    }
}
