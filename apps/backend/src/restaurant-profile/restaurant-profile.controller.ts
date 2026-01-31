import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RestaurantProfileService } from './restaurant-profile.service';
import {
  UpdateRestaurantProfileDto,
  HolidayClosureDto,
  SpecialHourDto,
} from './dto/update-restaurant-profile.dto';

@ApiTags('Restaurant Profile')
@Controller({
  path: 'restaurant-profile',
  version: '1',
})
export class RestaurantProfileController {
  constructor(
    private readonly restaurantProfileService: RestaurantProfileService,
  ) {}

  @Get('public')
  @ApiOperation({ summary: 'Get public restaurant info (name and logo)' })
  getPublicInfo() {
    return this.restaurantProfileService.getPublicInfo();
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get restaurant profile' })
  getProfile() {
    return this.restaurantProfileService.getProfile();
  }

  @Patch()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update restaurant profile' })
  updateProfile(@Body() updateRestaurantProfileDto: UpdateRestaurantProfileDto) {
    return this.restaurantProfileService.updateProfile(
      updateRestaurantProfileDto,
    );
  }

  @Patch('holiday-closures')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update holiday closures' })
  updateHolidayClosures(@Body() body: { holidayClosures: HolidayClosureDto[] }) {
    return this.restaurantProfileService.updateHolidayClosures(
      body.holidayClosures,
    );
  }

  @Patch('special-hours')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update special hours' })
  updateSpecialHours(@Body() body: { specialHours: SpecialHourDto[] }) {
    return this.restaurantProfileService.updateSpecialHours(body.specialHours);
  }

  @Get('is-open')
  @ApiOperation({ summary: 'Check if restaurant is currently open' })
  isOpen() {
    return this.restaurantProfileService.isOpen();
  }
}
