import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSettingsAndRestaurantProfile1738160000000
  implements MigrationInterface
{
  name = 'CreateSettingsAndRestaurantProfile1738160000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create setting table if not exists
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "setting" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "siteName" character varying NOT NULL DEFAULT 'Foodly',
        "currency" character varying NOT NULL DEFAULT 'INR',
        "currencySymbol" character varying NOT NULL DEFAULT '₹',
        "deliveryFee" numeric(10,2) NOT NULL DEFAULT 50.00,
        "taxRate" numeric(5,2) NOT NULL DEFAULT 5,
        "minimumOrder" numeric(10,2) NOT NULL DEFAULT 100,
        "maintenanceMode" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_setting" PRIMARY KEY ("id")
      )
    `);

    // Create restaurant_profile table if not exists
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "restaurant_profile" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL DEFAULT 'My Restaurant',
        "description" text,
        "phone" character varying,
        "email" character varying,
        "address" character varying,
        "city" character varying,
        "state" character varying,
        "zipCode" character varying,
        "country" character varying,
        "openingHours" jsonb NOT NULL DEFAULT '{}',
        "socialLinks" jsonb NOT NULL DEFAULT '{}',
        "logoId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_restaurant_profile" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key for logo if it doesn't exist
    const fkExists = await queryRunner.query(`
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'FK_restaurant_profile_logo'
    `);

    if (fkExists.length === 0) {
      await queryRunner.query(`
        ALTER TABLE "restaurant_profile"
        ADD CONSTRAINT "FK_restaurant_profile_logo"
        FOREIGN KEY ("logoId") REFERENCES "file"("id")
        ON DELETE SET NULL ON UPDATE NO ACTION
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "restaurant_profile" DROP CONSTRAINT IF EXISTS "FK_restaurant_profile_logo"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "restaurant_profile"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "setting"`);
  }
}
