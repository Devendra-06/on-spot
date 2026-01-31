import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAddress } from './entities/user-address.entity';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { DeliveryZonesService } from '../delivery-zones/delivery-zones.service';

@Injectable()
export class UserAddressesService {
  constructor(
    @InjectRepository(UserAddress)
    private readonly userAddressRepository: Repository<UserAddress>,
    private readonly deliveryZonesService: DeliveryZonesService,
  ) {}

  async create(userId: number, createUserAddressDto: CreateUserAddressDto) {
    // Check delivery zone by postal code
    const deliveryCheck = await this.deliveryZonesService.checkDeliverability(
      createUserAddressDto.postalCode,
    );

    // If this is set as default, unset other defaults
    if (createUserAddressDto.isDefault) {
      await this.userAddressRepository.update(
        { userId },
        { isDefault: false },
      );
    }

    const address = this.userAddressRepository.create({
      ...createUserAddressDto,
      userId,
      deliveryZoneId: deliveryCheck.zone?.id || null,
    });

    return this.userAddressRepository.save(address);
  }

  findAllForUser(userId: number) {
    return this.userAddressRepository.find({
      where: { userId },
      relations: ['deliveryZone'],
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: number) {
    const address = await this.userAddressRepository.findOne({
      where: { id, userId },
      relations: ['deliveryZone'],
    });
    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }
    return address;
  }

  async update(
    id: string,
    userId: number,
    updateUserAddressDto: UpdateUserAddressDto,
  ) {
    const address = await this.findOne(id, userId);

    // If postal code is being updated, re-check delivery zone
    if (
      updateUserAddressDto.postalCode &&
      updateUserAddressDto.postalCode !== address.postalCode
    ) {
      const deliveryCheck = await this.deliveryZonesService.checkDeliverability(
        updateUserAddressDto.postalCode,
      );
      (updateUserAddressDto as any).deliveryZoneId =
        deliveryCheck.zone?.id || null;
    }

    // If this is set as default, unset other defaults
    if (updateUserAddressDto.isDefault) {
      await this.userAddressRepository.update(
        { userId },
        { isDefault: false },
      );
    }

    this.userAddressRepository.merge(address, updateUserAddressDto);
    return this.userAddressRepository.save(address);
  }

  async remove(id: string, userId: number) {
    await this.findOne(id, userId);
    return this.userAddressRepository.delete({ id, userId });
  }

  async setDefault(id: string, userId: number) {
    const address = await this.findOne(id, userId);

    // Unset other defaults
    await this.userAddressRepository.update({ userId }, { isDefault: false });

    // Set this as default
    address.isDefault = true;
    return this.userAddressRepository.save(address);
  }

  async getDefaultAddress(userId: number) {
    return this.userAddressRepository.findOne({
      where: { userId, isDefault: true },
      relations: ['deliveryZone'],
    });
  }
}
