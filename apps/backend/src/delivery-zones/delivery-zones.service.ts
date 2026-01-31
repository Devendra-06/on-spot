import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryZone } from './entities/delivery-zone.entity';
import { CreateDeliveryZoneDto } from './dto/create-delivery-zone.dto';
import { UpdateDeliveryZoneDto } from './dto/update-delivery-zone.dto';

@Injectable()
export class DeliveryZonesService {
  constructor(
    @InjectRepository(DeliveryZone)
    private readonly deliveryZoneRepository: Repository<DeliveryZone>,
  ) {}

  create(createDeliveryZoneDto: CreateDeliveryZoneDto) {
    return this.deliveryZoneRepository.save(
      this.deliveryZoneRepository.create(createDeliveryZoneDto),
    );
  }

  findAll() {
    return this.deliveryZoneRepository.find({
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  findActive() {
    return this.deliveryZoneRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const zone = await this.deliveryZoneRepository.findOne({
      where: { id },
    });
    if (!zone) {
      throw new NotFoundException(`Delivery zone with ID ${id} not found`);
    }
    return zone;
  }

  async update(id: string, updateDeliveryZoneDto: UpdateDeliveryZoneDto) {
    const zone = await this.findOne(id);
    this.deliveryZoneRepository.merge(zone, updateDeliveryZoneDto);
    return this.deliveryZoneRepository.save(zone);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.deliveryZoneRepository.softDelete(id);
  }

  async checkDeliverability(postalCode: string): Promise<{
    isDeliverable: boolean;
    zone?: DeliveryZone;
    deliveryFee?: number;
    estimatedMinutes?: number;
    minimumOrder?: number;
  }> {
    const zones = await this.findActive();

    for (const zone of zones) {
      if (zone.postalCodes) {
        const codes = zone.postalCodes
          .split(',')
          .map((c) => c.trim().toLowerCase());
        if (codes.includes(postalCode.toLowerCase().trim())) {
          return {
            isDeliverable: true,
            zone,
            deliveryFee: Number(zone.deliveryFee),
            estimatedMinutes: zone.estimatedDeliveryMinutes ?? undefined,
            minimumOrder: zone.minimumOrder
              ? Number(zone.minimumOrder)
              : undefined,
          };
        }
      }
    }

    return { isDeliverable: false };
  }

  async checkDeliverabilityByArea(areaName: string): Promise<{
    isDeliverable: boolean;
    zone?: DeliveryZone;
    deliveryFee?: number;
    estimatedMinutes?: number;
    minimumOrder?: number;
  }> {
    const zones = await this.findActive();

    for (const zone of zones) {
      if (zone.areaNames) {
        const areas = zone.areaNames
          .split(',')
          .map((a) => a.trim().toLowerCase());
        if (areas.includes(areaName.toLowerCase().trim())) {
          return {
            isDeliverable: true,
            zone,
            deliveryFee: Number(zone.deliveryFee),
            estimatedMinutes: zone.estimatedDeliveryMinutes ?? undefined,
            minimumOrder: zone.minimumOrder
              ? Number(zone.minimumOrder)
              : undefined,
          };
        }
      }
    }

    return { isDeliverable: false };
  }
}
