import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '../../../../roles/infrastructure/persistence/relational/entities/role.entity';
import { RoleEnum } from '../../../../roles/roles.enum';

@Injectable()
export class RoleSeedService {
  constructor(
    @InjectRepository(RoleEntity)
    private repository: Repository<RoleEntity>,
  ) { }

  async run() {
    const countUser = await this.repository.count({
      where: {
        id: RoleEnum.user,
      },
    });

    if (!countUser) {
      await this.repository.save(
        this.repository.create({
          id: RoleEnum.user,
          name: 'User',
        }),
      );
    }

    const countAdmin = await this.repository.count({
      where: {
        id: RoleEnum.admin,
      },
    });

    if (!countAdmin) {
      await this.repository.save(
        this.repository.create({
          id: RoleEnum.admin,
          name: 'Admin',
        }),
      );
    }

    const rolesToSeed = [
      { id: RoleEnum.restaurant_admin, name: 'Restaurant Admin' },
      { id: RoleEnum.restaurant_manager, name: 'Restaurant Manager' },
      { id: RoleEnum.restaurant_staff, name: 'Restaurant Staff' },
      { id: RoleEnum.delivery, name: 'Delivery' },
    ];

    for (const role of rolesToSeed) {
      const count = await this.repository.count({
        where: {
          id: role.id,
        },
      });

      if (!count) {
        await this.repository.save(
          this.repository.create({
            id: role.id,
            name: role.name,
          }),
        );
      }
    }
  }
}
