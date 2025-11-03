import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

export class AlterAppointmentBooked1730099553693 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const isFacilityCode = await queryRunner.hasColumn('agent_id', 'appointment_booked');
        if (!isFacilityCode ) {
        await queryRunner.addColumn('appointment_booked', new TableColumn({
            name: 'agent_id',
            type: 'varchar',
            length: '255',
            isPrimary: false,
            isNullable: true
            }));
        }

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('appointment_booked', 'agent_id');
    }

}
