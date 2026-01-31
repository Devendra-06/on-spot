import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

import { HomeService } from './home.service';

@ApiTags('Home')
@Controller()
export class HomeController {
  constructor(
    private service: HomeService,
    private dataSource: DataSource,
  ) { }

  @Get('seed-db')
  async seedDb() {
    // 1. Insert Statuses
    await this.dataSource.query(
      `INSERT INTO "status" ("id", "name") VALUES (1, 'Active') ON CONFLICT ("id") DO NOTHING`,
    );
    await this.dataSource.query(
      `INSERT INTO "status" ("id", "name") VALUES (2, 'Inactive') ON CONFLICT ("id") DO NOTHING`,
    );

    // 2. Insert Roles
    await this.dataSource.query(
      `INSERT INTO "role" ("id", "name") VALUES (1, 'Admin') ON CONFLICT ("id") DO NOTHING`,
    );
    await this.dataSource.query(
      `INSERT INTO "role" ("id", "name") VALUES (2, 'User') ON CONFLICT ("id") DO NOTHING`,
    );
    await this.dataSource.query(
      `INSERT INTO "role" ("id", "name") VALUES (3, 'Restaurant Admin') ON CONFLICT ("id") DO NOTHING`,
    );
    await this.dataSource.query(
      `INSERT INTO "role" ("id", "name") VALUES (4, 'Restaurant Manager') ON CONFLICT ("id") DO NOTHING`,
    );
    await this.dataSource.query(
      `INSERT INTO "role" ("id", "name") VALUES (5, 'Restaurant Staff') ON CONFLICT ("id") DO NOTHING`,
    );
    await this.dataSource.query(
      `INSERT INTO "role" ("id", "name") VALUES (6, 'Delivery') ON CONFLICT ("id") DO NOTHING`,
    );

    // 3. Create Super Admin User
    await this.dataSource.query(
      `INSERT INTO "user" ("email", "password", "provider", "firstName", "lastName", "roleId", "statusId")
       VALUES ('admin@example.com', '$2b$10$8MkaqfwWR3nYnznQfHJ/3eEyztaJ/6o2hZdPCRqXBYqnoz2M0cFaC', 'email', 'Super', 'Admin', 1, 1)
       ON CONFLICT ("email") DO NOTHING`,
    );

    return 'Database Seeded Successfully! You can now login.';
  }

  @Get()
  appInfo() {
    return this.service.appInfo();
  }
}
