import {MigrationInterface, QueryRunner,Table} from "typeorm";

export class ttHundredRupeeOffOnPrepaidOrder1691732559287 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: 'tt-hundred-rupee-off-on-prepaid-order',
            columns: [
                {
                    name: 'id',
                    type: 'integer',
                    length: '11',
                    isPrimary: true,
                    isNullable: false,
                    isGenerated: true,
                    generationStrategy: 'increment',
                }, {
                    name: 'order_id',
                    type: 'integer',
                    length: '11',
                    isPrimary: false,
                    isNullable: false,
                }, {
                    name: 'discounted_amount',
                    type: 'int',
                    length: '11',
                    isPrimary: false,
                    isNullable: true,
                }
            ],
        });
        const ifExsist = await queryRunner.hasTable('tt-hundred-rupee-off-on-prepaid-order');
        if (!ifExsist) {
            await queryRunner.createTable(table);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('tt-hundred-rupee-off-on-prepaid-order');

    }

}
