import { MigrationInterface, QueryRunner } from 'typeorm';

export class Phase2OperationsFeatures1738250000000
  implements MigrationInterface
{
  name = 'Phase2OperationsFeatures1738250000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ==================== MENU ENHANCEMENTS ====================

    // Add new columns to menu table (use DO block for conditional adds)
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu' AND column_name = 'isAvailable') THEN
          ALTER TABLE "menu" ADD COLUMN "isAvailable" boolean NOT NULL DEFAULT true;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu' AND column_name = 'stockQuantity') THEN
          ALTER TABLE "menu" ADD COLUMN "stockQuantity" integer;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu' AND column_name = 'lowStockThreshold') THEN
          ALTER TABLE "menu" ADD COLUMN "lowStockThreshold" integer NOT NULL DEFAULT 5;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu' AND column_name = 'autoDisableOnStockout') THEN
          ALTER TABLE "menu" ADD COLUMN "autoDisableOnStockout" boolean NOT NULL DEFAULT true;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu' AND column_name = 'sortOrder') THEN
          ALTER TABLE "menu" ADD COLUMN "sortOrder" integer NOT NULL DEFAULT 0;
        END IF;
      END $$;
    `);

    // Create menu_variant table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "menu_variant" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "price" numeric(10,2) NOT NULL,
        "stockQuantity" integer,
        "isAvailable" boolean NOT NULL DEFAULT true,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "menuId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_menu_variant" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key if not exists
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_menu_variant_menu') THEN
          ALTER TABLE "menu_variant" ADD CONSTRAINT "FK_menu_variant_menu" FOREIGN KEY ("menuId") REFERENCES "menu"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);

    // Create menu_addon table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "menu_addon" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "price" numeric(10,2) NOT NULL,
        "stockQuantity" integer,
        "isAvailable" boolean NOT NULL DEFAULT true,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "isRequired" boolean NOT NULL DEFAULT false,
        "groupName" character varying,
        "menuId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_menu_addon" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key if not exists
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_menu_addon_menu') THEN
          ALTER TABLE "menu_addon" ADD CONSTRAINT "FK_menu_addon_menu" FOREIGN KEY ("menuId") REFERENCES "menu"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);

    // ==================== DELIVERY ZONES ====================

    // Create delivery_zone table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "delivery_zone" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "deliveryFee" numeric(10,2) NOT NULL,
        "minimumOrder" numeric(10,2),
        "estimatedDeliveryMinutes" integer,
        "postalCodes" text,
        "areaNames" text,
        "isActive" boolean NOT NULL DEFAULT true,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_delivery_zone" PRIMARY KEY ("id")
      )
    `);

    // ==================== USER ADDRESSES ====================

    // Create user_address table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_address" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "label" character varying NOT NULL,
        "addressLine1" character varying NOT NULL,
        "addressLine2" character varying,
        "city" character varying NOT NULL,
        "state" character varying,
        "postalCode" character varying NOT NULL,
        "country" character varying,
        "latitude" numeric(10,7),
        "longitude" numeric(10,7),
        "instructions" character varying,
        "isDefault" boolean NOT NULL DEFAULT false,
        "userId" integer NOT NULL,
        "deliveryZoneId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_address" PRIMARY KEY ("id")
      )
    `);

    // Add foreign keys if not exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_user_address_user') THEN
          ALTER TABLE "user_address" ADD CONSTRAINT "FK_user_address_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_user_address_delivery_zone') THEN
          ALTER TABLE "user_address" ADD CONSTRAINT "FK_user_address_delivery_zone" FOREIGN KEY ("deliveryZoneId") REFERENCES "delivery_zone"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);

    // ==================== RESTAURANT PROFILE ENHANCEMENTS ====================

    // Add holiday closures and special hours to restaurant_profile
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurant_profile' AND column_name = 'holidayClosures') THEN
          ALTER TABLE "restaurant_profile" ADD COLUMN "holidayClosures" jsonb NOT NULL DEFAULT '[]';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurant_profile' AND column_name = 'specialHours') THEN
          ALTER TABLE "restaurant_profile" ADD COLUMN "specialHours" jsonb NOT NULL DEFAULT '[]';
        END IF;
      END $$;
    `);

    // ==================== ORDER ENHANCEMENTS ====================

    // Add delivery fields to order table
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order' AND column_name = 'deliveryAddressId') THEN
          ALTER TABLE "order" ADD COLUMN "deliveryAddressId" uuid;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order' AND column_name = 'deliveryZoneId') THEN
          ALTER TABLE "order" ADD COLUMN "deliveryZoneId" uuid;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order' AND column_name = 'deliveryFee') THEN
          ALTER TABLE "order" ADD COLUMN "deliveryFee" numeric(10,2) NOT NULL DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order' AND column_name = 'subtotal') THEN
          ALTER TABLE "order" ADD COLUMN "subtotal" numeric(10,2) NOT NULL DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order' AND column_name = 'taxAmount') THEN
          ALTER TABLE "order" ADD COLUMN "taxAmount" numeric(10,2) NOT NULL DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order' AND column_name = 'specialInstructions') THEN
          ALTER TABLE "order" ADD COLUMN "specialInstructions" character varying;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order' AND column_name = 'deliveryAddressSnapshot') THEN
          ALTER TABLE "order" ADD COLUMN "deliveryAddressSnapshot" jsonb;
        END IF;
      END $$;
    `);

    // Add foreign keys for order
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_order_delivery_address') THEN
          ALTER TABLE "order" ADD CONSTRAINT "FK_order_delivery_address" FOREIGN KEY ("deliveryAddressId") REFERENCES "user_address"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'FK_order_delivery_zone') THEN
          ALTER TABLE "order" ADD CONSTRAINT "FK_order_delivery_zone" FOREIGN KEY ("deliveryZoneId") REFERENCES "delivery_zone"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
        END IF;
      END $$;
    `);

    // ==================== ORDER ITEM ENHANCEMENTS ====================

    // Add variant and addon fields to order_item table
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_item' AND column_name = 'variantId') THEN
          ALTER TABLE "order_item" ADD COLUMN "variantId" character varying;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_item' AND column_name = 'variantName') THEN
          ALTER TABLE "order_item" ADD COLUMN "variantName" character varying;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_item' AND column_name = 'variantPrice') THEN
          ALTER TABLE "order_item" ADD COLUMN "variantPrice" numeric(10,2);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_item' AND column_name = 'selectedAddons') THEN
          ALTER TABLE "order_item" ADD COLUMN "selectedAddons" jsonb;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_item' AND column_name = 'addonsTotal') THEN
          ALTER TABLE "order_item" ADD COLUMN "addonsTotal" numeric(10,2) NOT NULL DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_item' AND column_name = 'itemTotal') THEN
          ALTER TABLE "order_item" ADD COLUMN "itemTotal" numeric(10,2) NOT NULL DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_item' AND column_name = 'itemNotes') THEN
          ALTER TABLE "order_item" ADD COLUMN "itemNotes" character varying;
        END IF;
      END $$;
    `);

    // Create indexes for better query performance
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_menu_variant_menuId" ON "menu_variant" ("menuId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_menu_addon_menuId" ON "menu_addon" ("menuId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_user_address_userId" ON "user_address" ("userId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_delivery_zone_isActive" ON "delivery_zone" ("isActive")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_delivery_zone_isActive"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_user_address_userId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_menu_addon_menuId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_menu_variant_menuId"`);

    // Remove order_item columns
    await queryRunner.query(`
      ALTER TABLE "order_item"
      DROP COLUMN IF EXISTS "itemNotes",
      DROP COLUMN IF EXISTS "itemTotal",
      DROP COLUMN IF EXISTS "addonsTotal",
      DROP COLUMN IF EXISTS "selectedAddons",
      DROP COLUMN IF EXISTS "variantPrice",
      DROP COLUMN IF EXISTS "variantName",
      DROP COLUMN IF EXISTS "variantId"
    `);

    // Remove order foreign keys
    await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT IF EXISTS "FK_order_delivery_zone"`);
    await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT IF EXISTS "FK_order_delivery_address"`);

    // Remove order columns
    await queryRunner.query(`
      ALTER TABLE "order"
      DROP COLUMN IF EXISTS "deliveryAddressSnapshot",
      DROP COLUMN IF EXISTS "specialInstructions",
      DROP COLUMN IF EXISTS "taxAmount",
      DROP COLUMN IF EXISTS "subtotal",
      DROP COLUMN IF EXISTS "deliveryFee",
      DROP COLUMN IF EXISTS "deliveryZoneId",
      DROP COLUMN IF EXISTS "deliveryAddressId"
    `);

    // Remove restaurant_profile columns
    await queryRunner.query(`
      ALTER TABLE "restaurant_profile"
      DROP COLUMN IF EXISTS "specialHours",
      DROP COLUMN IF EXISTS "holidayClosures"
    `);

    // Drop user_address table
    await queryRunner.query(`DROP TABLE IF EXISTS "user_address"`);

    // Drop delivery_zone table
    await queryRunner.query(`DROP TABLE IF EXISTS "delivery_zone"`);

    // Drop menu_addon table
    await queryRunner.query(`DROP TABLE IF EXISTS "menu_addon"`);

    // Drop menu_variant table
    await queryRunner.query(`DROP TABLE IF EXISTS "menu_variant"`);

    // Remove menu columns
    await queryRunner.query(`
      ALTER TABLE "menu"
      DROP COLUMN IF EXISTS "sortOrder",
      DROP COLUMN IF EXISTS "autoDisableOnStockout",
      DROP COLUMN IF EXISTS "lowStockThreshold",
      DROP COLUMN IF EXISTS "stockQuantity",
      DROP COLUMN IF EXISTS "isAvailable"
    `);
  }
}
