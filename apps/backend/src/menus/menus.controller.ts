import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  SetMetadata,
} from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { CreateVariantDto, UpdateVariantDto } from './dto/create-variant.dto';
import { CreateAddonDto, UpdateAddonDto } from './dto/create-addon.dto';

import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UseGuards } from '@nestjs/common';

// Public decorator
export const Public = () => SetMetadata('isPublic', true);

@ApiTags('Menus')
@Controller({
  path: 'menus',
  version: '1',
})
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create a new menu item' })
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menusService.create(createMenuDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all menu items (public)' })
  findAll() {
    return this.menusService.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: 'Get only available menu items (public)' })
  findAvailable() {
    return this.menusService.findAvailable();
  }

  @Get('low-stock')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get menu items with low stock' })
  getLowStock() {
    return this.menusService.getLowStockItems();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a menu item by ID (public)' })
  findOne(@Param('id') id: string) {
    return this.menusService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update a menu item' })
  update(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    return this.menusService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Delete a menu item' })
  remove(@Param('id') id: string) {
    return this.menusService.remove(id);
  }

  // ==================== AVAILABILITY ====================

  @Patch(':id/availability')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Toggle menu item availability' })
  updateAvailability(
    @Param('id') id: string,
    @Body() body: { isAvailable: boolean },
  ) {
    return this.menusService.updateAvailability(id, body.isAvailable);
  }

  // ==================== STOCK ====================

  @Patch(':id/stock')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update menu item stock quantity' })
  updateStock(
    @Param('id') id: string,
    @Body() body: { stockQuantity: number | null },
  ) {
    return this.menusService.updateStock(id, body.stockQuantity);
  }

  // ==================== SORT ORDER ====================

  @Patch('reorder')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update sort order for multiple menu items' })
  updateSortOrder(@Body() body: { items: { id: string; sortOrder: number }[] }) {
    return this.menusService.updateSortOrder(body.items);
  }

  // ==================== VARIANTS ====================

  @Get(':id/variants')
  @ApiOperation({ summary: 'Get all variants for a menu item (public)' })
  getVariants(@Param('id') menuId: string) {
    return this.menusService.getVariants(menuId);
  }

  @Post(':id/variants')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create a variant for a menu item' })
  createVariant(
    @Param('id') menuId: string,
    @Body() createVariantDto: CreateVariantDto,
  ) {
    return this.menusService.createVariant(menuId, createVariantDto);
  }

  @Patch(':id/variants/:variantId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update a variant' })
  updateVariant(
    @Param('id') menuId: string,
    @Param('variantId') variantId: string,
    @Body() updateVariantDto: UpdateVariantDto,
  ) {
    return this.menusService.updateVariant(menuId, variantId, updateVariantDto);
  }

  @Delete(':id/variants/:variantId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Delete a variant' })
  deleteVariant(
    @Param('id') menuId: string,
    @Param('variantId') variantId: string,
  ) {
    return this.menusService.deleteVariant(menuId, variantId);
  }

  // ==================== ADDONS ====================

  @Get(':id/addons')
  @ApiOperation({ summary: 'Get all addons for a menu item (public)' })
  getAddons(@Param('id') menuId: string) {
    return this.menusService.getAddons(menuId);
  }

  @Post(':id/addons')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create an addon for a menu item' })
  createAddon(
    @Param('id') menuId: string,
    @Body() createAddonDto: CreateAddonDto,
  ) {
    return this.menusService.createAddon(menuId, createAddonDto);
  }

  @Patch(':id/addons/:addonId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update an addon' })
  updateAddon(
    @Param('id') menuId: string,
    @Param('addonId') addonId: string,
    @Body() updateAddonDto: UpdateAddonDto,
  ) {
    return this.menusService.updateAddon(menuId, addonId, updateAddonDto);
  }

  @Delete(':id/addons/:addonId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Delete an addon' })
  deleteAddon(
    @Param('id') menuId: string,
    @Param('addonId') addonId: string,
  ) {
    return this.menusService.deleteAddon(menuId, addonId);
  }
}
