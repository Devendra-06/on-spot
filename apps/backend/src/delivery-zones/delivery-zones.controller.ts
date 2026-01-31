import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DeliveryZonesService } from './delivery-zones.service';
import { CreateDeliveryZoneDto } from './dto/create-delivery-zone.dto';
import { UpdateDeliveryZoneDto } from './dto/update-delivery-zone.dto';

@ApiTags('Delivery Zones')
@Controller({
  path: 'delivery-zones',
  version: '1',
})
export class DeliveryZonesController {
  constructor(private readonly deliveryZonesService: DeliveryZonesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create a new delivery zone' })
  create(@Body() createDeliveryZoneDto: CreateDeliveryZoneDto) {
    return this.deliveryZonesService.create(createDeliveryZoneDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all delivery zones' })
  findAll() {
    return this.deliveryZonesService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active delivery zones only (public)' })
  findActive() {
    return this.deliveryZonesService.findActive();
  }

  @Get('check/:postalCode')
  @ApiOperation({ summary: 'Check if postal code is deliverable (public)' })
  checkDeliverability(@Param('postalCode') postalCode: string) {
    return this.deliveryZonesService.checkDeliverability(postalCode);
  }

  @Get('check-area')
  @ApiOperation({ summary: 'Check if area name is deliverable (public)' })
  checkDeliverabilityByArea(@Query('area') areaName: string) {
    return this.deliveryZonesService.checkDeliverabilityByArea(areaName);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get a delivery zone by ID' })
  findOne(@Param('id') id: string) {
    return this.deliveryZonesService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update a delivery zone' })
  update(
    @Param('id') id: string,
    @Body() updateDeliveryZoneDto: UpdateDeliveryZoneDto,
  ) {
    return this.deliveryZonesService.update(id, updateDeliveryZoneDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Delete a delivery zone' })
  remove(@Param('id') id: string) {
    return this.deliveryZonesService.remove(id);
  }
}
