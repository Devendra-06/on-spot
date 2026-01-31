'use client';
import React, { useEffect, useState } from 'react';
import CardBox from '@/app/components/shared/CardBox';
import { Button } from '@/components/ui/button';
import {
  menusService,
  MenuItem,
  MenuVariant,
  MenuAddon,
} from '@/app/services/menus.service';
import { categoriesService } from '@/app/services/categories.service';
import { filesService } from '@/app/services/files.service';
import { Icon } from '@iconify/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function MenuItemsPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [photoId, setPhotoId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Variant/Addon dialog
  const [variantDialogOpen, setVariantDialogOpen] = useState(false);
  const [addonDialogOpen, setAddonDialogOpen] = useState(false);
  const [currentMenuItem, setCurrentMenuItem] = useState<MenuItem | null>(null);
  const [variantName, setVariantName] = useState('');
  const [variantPrice, setVariantPrice] = useState('');
  const [editingVariant, setEditingVariant] = useState<MenuVariant | null>(
    null,
  );
  const [addonName, setAddonName] = useState('');
  const [addonPrice, setAddonPrice] = useState('');
  const [addonGroup, setAddonGroup] = useState('');
  const [editingAddon, setEditingAddon] = useState<MenuAddon | null>(null);

  const fetchData = async () => {
    try {
      const [menusData, categoriesData] = await Promise.all([
        menusService.findAll(),
        categoriesService.findAll(),
      ]);
      setMenus(menusData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setDesc(item.description || '');
    setPrice(String(item.price));
    setCategoryId(item.category?.id || '');
    setPhotoId(item.photo?.id || '');
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    setError('');
    if (!name || !price || !categoryId) {
      setError('Please fill in Name, Price, and Category.');
      return;
    }

    try {
      const payload = {
        name,
        description: desc,
        price: Number(price),
        categoryId,
        photoId,
      };

      if (editingItem) {
        await menusService.update(editingItem.id, payload);
        toast.success('Menu item updated');
      } else {
        await menusService.create(payload);
        toast.success('Menu item created');
      }
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Failed to save menu item', error);
      setError(error.response?.data?.message || 'Failed to save menu item');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await menusService.delete(id);
        toast.success('Menu item deleted');
        fetchData();
      } catch (error) {
        console.error('Failed to delete item', error);
        toast.error('Failed to delete menu item');
      }
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await menusService.updateAvailability(item.id, !item.isAvailable);
      toast.success(
        item.isAvailable ? 'Item marked unavailable' : 'Item marked available',
      );
      fetchData();
    } catch (error) {
      console.error('Failed to toggle availability', error);
      toast.error('Failed to update availability');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const data = await filesService.upload(e.target.files[0]);
        setPhotoId(data.id);
      } catch (error) {
        console.error('Upload failed', error);
      } finally {
        setUploading(false);
      }
    }
  };

  const resetForm = () => {
    setName('');
    setDesc('');
    setPrice('');
    setCategoryId('');
    setPhotoId('');
  };

  // Variant handlers
  const handleOpenVariantDialog = (item: MenuItem, variant?: MenuVariant) => {
    setCurrentMenuItem(item);
    if (variant) {
      setEditingVariant(variant);
      setVariantName(variant.name);
      setVariantPrice(String(variant.price));
    } else {
      setEditingVariant(null);
      setVariantName('');
      setVariantPrice('');
    }
    setVariantDialogOpen(true);
  };

  const handleSaveVariant = async () => {
    if (!currentMenuItem || !variantName || !variantPrice) {
      toast.error('Please fill in variant name and price');
      return;
    }

    try {
      if (editingVariant) {
        await menusService.updateVariant(
          currentMenuItem.id,
          editingVariant.id!,
          {
            name: variantName,
            price: Number(variantPrice),
          },
        );
        toast.success('Variant updated');
      } else {
        await menusService.createVariant(currentMenuItem.id, {
          name: variantName,
          price: Number(variantPrice),
        });
        toast.success('Variant added');
      }
      setVariantDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save variant', error);
      toast.error('Failed to save variant');
    }
  };

  const handleDeleteVariant = async (menuId: string, variantId: string) => {
    if (confirm('Delete this variant?')) {
      try {
        await menusService.deleteVariant(menuId, variantId);
        toast.success('Variant deleted');
        fetchData();
      } catch (error) {
        console.error('Failed to delete variant', error);
        toast.error('Failed to delete variant');
      }
    }
  };

  // Addon handlers
  const handleOpenAddonDialog = (item: MenuItem, addon?: MenuAddon) => {
    setCurrentMenuItem(item);
    if (addon) {
      setEditingAddon(addon);
      setAddonName(addon.name);
      setAddonPrice(String(addon.price));
      setAddonGroup(addon.groupName || '');
    } else {
      setEditingAddon(null);
      setAddonName('');
      setAddonPrice('');
      setAddonGroup('');
    }
    setAddonDialogOpen(true);
  };

  const handleSaveAddon = async () => {
    if (!currentMenuItem || !addonName || !addonPrice) {
      toast.error('Please fill in addon name and price');
      return;
    }

    try {
      if (editingAddon) {
        await menusService.updateAddon(currentMenuItem.id, editingAddon.id!, {
          name: addonName,
          price: Number(addonPrice),
          groupName: addonGroup || undefined,
        });
        toast.success('Addon updated');
      } else {
        await menusService.createAddon(currentMenuItem.id, {
          name: addonName,
          price: Number(addonPrice),
          groupName: addonGroup || undefined,
        });
        toast.success('Addon added');
      }
      setAddonDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save addon', error);
      toast.error('Failed to save addon');
    }
  };

  const handleDeleteAddon = async (menuId: string, addonId: string) => {
    if (confirm('Delete this addon?')) {
      try {
        await menusService.deleteAddon(menuId, addonId);
        toast.success('Addon deleted');
        fetchData();
      } catch (error) {
        console.error('Failed to delete addon', error);
        toast.error('Failed to delete addon');
      }
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Menu Items</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="flex items-center gap-2"
              onClick={handleOpenCreate}
            >
              <Icon icon="solar:add-circle-bold" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Item Name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">Description</Label>
                <Input
                  id="desc"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Description"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Base Price</Label>
                <Input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select onValueChange={setCategoryId} value={categoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Photo</Label>
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                {uploading && (
                  <span className="text-sm text-gray-500">Uploading...</span>
                )}
                {photoId && (
                  <span className="text-sm text-green-600">
                    Image attached!
                  </span>
                )}
              </div>
              {error && (
                <div className="text-red-500 text-sm font-bold">{error}</div>
              )}
              <Button onClick={handleSubmit} disabled={uploading}>
                {editingItem ? 'Update Item' : 'Create Item'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <CardBox>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Variants</TableHead>
                <TableHead>Addons</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menus.map((item) => (
                <React.Fragment key={item.id}>
                  <TableRow
                    className={!item.isAvailable ? 'opacity-60' : ''}
                  >
                    <TableCell>
                      {item.photo?.path ? (
                        <div className="relative w-10 h-10 rounded overflow-hidden">
                          <img
                            src={item.photo.path}
                            alt={item.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs">
                          No Img
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category?.name || '-'}</TableCell>
                    <TableCell>₹{Number(item.price).toFixed(0)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setExpandedItem(
                            expandedItem === item.id ? null : item.id,
                          )
                        }
                      >
                        {item.variants?.length || 0}{' '}
                        <Icon
                          icon={
                            expandedItem === item.id
                              ? 'solar:alt-arrow-up-linear'
                              : 'solar:alt-arrow-down-linear'
                          }
                          className="ml-1"
                        />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setExpandedItem(
                            expandedItem === item.id ? null : item.id,
                          )
                        }
                      >
                        {item.addons?.length || 0}{' '}
                        <Icon
                          icon={
                            expandedItem === item.id
                              ? 'solar:alt-arrow-up-linear'
                              : 'solar:alt-arrow-down-linear'
                          }
                          className="ml-1"
                        />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={item.isAvailable}
                        onCheckedChange={() => handleToggleAvailability(item)}
                      />
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(item)}
                      >
                        <Icon icon="solar:pen-bold" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Icon icon="solar:trash-bin-trash-bold" />
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedItem === item.id && (
                    <TableRow className="bg-gray-50 dark:bg-gray-800/30">
                      <TableCell colSpan={8}>
                        <div className="p-4 grid md:grid-cols-2 gap-6">
                          {/* Variants Section */}
                          <div className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-semibold">
                                Variants (Sizes)
                              </h4>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenVariantDialog(item)}
                              >
                                <Icon
                                  icon="solar:add-circle-linear"
                                  className="mr-1"
                                />
                                Add
                              </Button>
                            </div>
                            {item.variants && item.variants.length > 0 ? (
                              <div className="space-y-2">
                                {item.variants.map((variant) => (
                                  <div
                                    key={variant.id}
                                    className="flex justify-between items-center p-2 bg-white dark:bg-gray-700 rounded border"
                                  >
                                    <div>
                                      <span className="font-medium">
                                        {variant.name}
                                      </span>
                                      <span className="text-gray-500 ml-2">
                                        ₹{Number(variant.price).toFixed(0)}
                                      </span>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleOpenVariantDialog(item, variant)
                                        }
                                      >
                                        <Icon icon="solar:pen-linear" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500"
                                        onClick={() =>
                                          handleDeleteVariant(
                                            item.id,
                                            variant.id!,
                                          )
                                        }
                                      >
                                        <Icon icon="solar:trash-bin-trash-linear" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">
                                No variants added
                              </p>
                            )}
                          </div>

                          {/* Addons Section */}
                          <div className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-semibold">
                                Addons (Extras)
                              </h4>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenAddonDialog(item)}
                              >
                                <Icon
                                  icon="solar:add-circle-linear"
                                  className="mr-1"
                                />
                                Add
                              </Button>
                            </div>
                            {item.addons && item.addons.length > 0 ? (
                              <div className="space-y-2">
                                {item.addons.map((addon) => (
                                  <div
                                    key={addon.id}
                                    className="flex justify-between items-center p-2 bg-white dark:bg-gray-700 rounded border"
                                  >
                                    <div>
                                      <span className="font-medium">
                                        {addon.name}
                                      </span>
                                      <span className="text-gray-500 ml-2">
                                        +₹{Number(addon.price).toFixed(0)}
                                      </span>
                                      {addon.groupName && (
                                        <span className="text-xs bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded ml-2">
                                          {addon.groupName}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleOpenAddonDialog(item, addon)
                                        }
                                      >
                                        <Icon icon="solar:pen-linear" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500"
                                        onClick={() =>
                                          handleDeleteAddon(item.id, addon.id!)
                                        }
                                      >
                                        <Icon icon="solar:trash-bin-trash-linear" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">
                                No addons added
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        )}
      </CardBox>

      {/* Variant Dialog */}
      <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingVariant ? 'Edit Variant' : 'Add Variant'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="variantName">Variant Name</Label>
              <Input
                id="variantName"
                value={variantName}
                onChange={(e) => setVariantName(e.target.value)}
                placeholder="e.g., Small, Medium, Large"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="variantPrice">Price</Label>
              <Input
                type="number"
                id="variantPrice"
                value={variantPrice}
                onChange={(e) => setVariantPrice(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <Button onClick={handleSaveVariant}>
              {editingVariant ? 'Update' : 'Add'} Variant
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Addon Dialog */}
      <Dialog open={addonDialogOpen} onOpenChange={setAddonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAddon ? 'Edit Addon' : 'Add Addon'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="addonName">Addon Name</Label>
              <Input
                id="addonName"
                value={addonName}
                onChange={(e) => setAddonName(e.target.value)}
                placeholder="e.g., Extra Cheese, Bacon"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="addonPrice">Additional Price</Label>
              <Input
                type="number"
                id="addonPrice"
                value={addonPrice}
                onChange={(e) => setAddonPrice(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="addonGroup">Group (optional)</Label>
              <Input
                id="addonGroup"
                value={addonGroup}
                onChange={(e) => setAddonGroup(e.target.value)}
                placeholder="e.g., Toppings, Sides"
              />
            </div>
            <Button onClick={handleSaveAddon}>
              {editingAddon ? 'Update' : 'Add'} Addon
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
