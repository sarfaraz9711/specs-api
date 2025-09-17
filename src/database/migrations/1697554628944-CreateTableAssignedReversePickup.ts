import {MigrationInterface, QueryRunner, Table} from "typeorm";

export class CreateTableAssignedReversePickup1697554628944 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: 'tt_assigned_reverse_pickups',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    length: '11',
                    isPrimary: true,
                    isNullable: false,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'rp_code',
                    type: 'VARCHAR',
                    length: '255',
                    isPrimary: false,
                    isNullable: true,
                    default: null,
                    collation: "utf8mb4_unicode_ci"
                },
                {
                    name: 'req_payload',
                    type: 'text',
                    isPrimary: false,
                    isNullable: true,
                    
                    collation: "utf8mb4_unicode_ci"
                },
                {
                    name: 'res_payload',
                    type: 'text',
                    isPrimary: false,
                    isNullable: true,
                    
                    collation: "utf8mb4_unicode_ci"
                },
                {
                    name: 'created_date',
                    type: 'datetime',
                    isPrimary: false,
                    isNullable: true,
                    default: 'CURRENT_TIMESTAMP',
                }, {
                    name: 'modified_date',
                    type: 'datetime',
                    isPrimary: false,
                    isNullable: true,
                    default: 'CURRENT_TIMESTAMP',
                }, {
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
                }
            ]
        })
        const ifExsist = await queryRunner.hasTable('tt_assigned_reverse_pickups');
        if (!ifExsist) {
            await queryRunner.createTable(table);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('tt_assigned_reverse_pickups', true);
    }

}
