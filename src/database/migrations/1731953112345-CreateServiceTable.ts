import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateServiceTable1731953112345 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        const table = new Table({
            name: 'service', 
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'title',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
                },
                {
                    name: 'content',
                    type: 'varchar',
                    length: '255',
                    isNullable: true,
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

        const ifExist = await queryRunner.hasTable('service');
        if (!ifExist) {
            await queryRunner.createTable(table);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable('service', true); 
    }
}
