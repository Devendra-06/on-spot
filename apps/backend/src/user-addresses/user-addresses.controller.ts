import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UserAddressesService } from './user-addresses.service';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';

@ApiTags('User Addresses')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'addresses',
  version: '1',
})
export class UserAddressesController {
  constructor(private readonly userAddressesService: UserAddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new address' })
  create(@Request() req, @Body() createUserAddressDto: CreateUserAddressDto) {
    return this.userAddressesService.create(req.user.id, createUserAddressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all addresses for current user' })
  findAll(@Request() req) {
    return this.userAddressesService.findAllForUser(req.user.id);
  }

  @Get('default')
  @ApiOperation({ summary: 'Get default address for current user' })
  getDefault(@Request() req) {
    return this.userAddressesService.getDefaultAddress(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an address by ID' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.userAddressesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an address' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateUserAddressDto: UpdateUserAddressDto,
  ) {
    return this.userAddressesService.update(
      id,
      req.user.id,
      updateUserAddressDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address' })
  remove(@Request() req, @Param('id') id: string) {
    return this.userAddressesService.remove(id, req.user.id);
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Set address as default' })
  setDefault(@Request() req, @Param('id') id: string) {
    return this.userAddressesService.setDefault(id, req.user.id);
  }
}
