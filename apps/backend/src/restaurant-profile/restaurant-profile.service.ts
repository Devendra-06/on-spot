import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  RestaurantProfile,
  HolidayClosure,
  SpecialHour,
} from './entities/restaurant-profile.entity';
import { UpdateRestaurantProfileDto } from './dto/update-restaurant-profile.dto';

@Injectable()
export class RestaurantProfileService {
  constructor(
    @InjectRepository(RestaurantProfile)
    private readonly restaurantProfileRepository: Repository<RestaurantProfile>,
  ) {}

  async getProfile(): Promise<RestaurantProfile> {
    let profile = await this.restaurantProfileRepository.findOne({
      where: {},
      relations: ['logo'],
    });
    if (!profile) {
      profile = await this.restaurantProfileRepository.save(
        this.restaurantProfileRepository.create({
          openingHours: {
            monday: { open: '09:00', close: '22:00' },
            tuesday: { open: '09:00', close: '22:00' },
            wednesday: { open: '09:00', close: '22:00' },
            thursday: { open: '09:00', close: '22:00' },
            friday: { open: '09:00', close: '23:00' },
            saturday: { open: '10:00', close: '23:00' },
            sunday: { open: '10:00', close: '21:00' },
          },
          holidayClosures: [],
          specialHours: [],
        }),
      );
    }
    return profile;
  }

  async getPublicInfo(): Promise<{ name: string; logo: { id: string; path: string } | null }> {
    const profile = await this.restaurantProfileRepository.findOne({
      where: {},
      relations: ['logo'],
      select: ['id', 'name'],
    });
    return {
      name: profile?.name || 'Restaurant',
      logo: profile?.logo || null,
    };
  }

  async updateProfile(
    updateRestaurantProfileDto: UpdateRestaurantProfileDto,
  ): Promise<RestaurantProfile> {
    const profile = await this.getProfile();
    this.restaurantProfileRepository.merge(profile, updateRestaurantProfileDto);
    return this.restaurantProfileRepository.save(profile);
  }

  async updateHolidayClosures(
    holidayClosures: HolidayClosure[],
  ): Promise<RestaurantProfile> {
    const profile = await this.getProfile();
    profile.holidayClosures = holidayClosures;
    return this.restaurantProfileRepository.save(profile);
  }

  async updateSpecialHours(
    specialHours: SpecialHour[],
  ): Promise<RestaurantProfile> {
    const profile = await this.getProfile();
    profile.specialHours = specialHours;
    return this.restaurantProfileRepository.save(profile);
  }

  async isOpen(checkDate?: Date): Promise<{
    isOpen: boolean;
    reason?: string;
    nextOpen?: string;
    currentHours?: { open: string; close: string };
  }> {
    const profile = await this.getProfile();
    const now = checkDate || new Date();
    const dateStr = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    const dayOfWeek = now
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();

    // Check if it's a holiday closure
    const holidayClosure = profile.holidayClosures?.find(
      (h) => h.date === dateStr,
    );
    if (holidayClosure) {
      return {
        isOpen: false,
        reason: holidayClosure.reason || 'Closed for holiday',
      };
    }

    // Check for special hours
    const specialHour = profile.specialHours?.find((s) => s.date === dateStr);
    if (specialHour) {
      const isWithinSpecialHours =
        currentTime >= specialHour.open && currentTime < specialHour.close;
      return {
        isOpen: isWithinSpecialHours,
        reason: specialHour.reason || 'Special hours',
        currentHours: { open: specialHour.open, close: specialHour.close },
      };
    }

    // Check regular opening hours
    const todayHours = profile.openingHours?.[dayOfWeek];
    if (!todayHours || todayHours.closed) {
      return {
        isOpen: false,
        reason: 'Closed today',
      };
    }

    const isWithinHours =
      currentTime >= todayHours.open && currentTime < todayHours.close;

    return {
      isOpen: isWithinHours,
      currentHours: { open: todayHours.open, close: todayHours.close },
      reason: isWithinHours ? undefined : 'Outside business hours',
    };
  }
}
