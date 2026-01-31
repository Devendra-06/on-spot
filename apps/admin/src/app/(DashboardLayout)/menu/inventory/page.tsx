'use client';
import { useEffect, useState } from 'react';
import CardBox from '@/app/components/shared/CardBox';
import { Button } from '@/components/ui/button';
import { menusService, MenuItem } from '@/app/services/menus.service';
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function InventoryPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [lowStockItems, setLowStockItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [stockValue, setStockValue] = useState('');
  const [trackStock, setTrackStock] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [menusData, lowStock] = await Promise.all([
        menusService.findAll(),
        menusService.getLowStock(),
      ]);
      setMenus(menusData);
      setLowStockItems(lowStock);
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await menusService.updateAvailability(item.id, !item.isAvailable);
      toast.success(
        item.isAvailable ? 'Item marked unavailable' : 'Item marked available',
      );
      fetchData();
    } catch (error) {
      console.error('Failed to update availability', error);
      toast.error('Failed to update availability');
    }
  };

  const handleOpenStockEdit = (item: MenuItem) => {
    setEditingItem(item);
    setTrackStock(item.stockQuantity !== null);
    setStockValue(item.stockQuantity !== null ? String(item.stockQuantity) : '');
    setEditDialogOpen(true);
  };

  const handleSaveStock = async () => {
    if (!editingItem) return;

    try {
      const newStock = trackStock ? Number(stockValue) : null;
      await menusService.updateStock(editingItem.id, newStock);
      toast.success('Stock updated');
      setEditDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to update stock', error);
      toast.error('Failed to update stock');
    }
  };

  const getStockBadge = (item: MenuItem) => {
    if (item.stockQuantity === null) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
          Unlimited
        </span>
      );
    }

    if (item.stockQuantity <= 0) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-bold">
          Out of Stock
        </span>
      );
    }

    if (item.stockQuantity <= item.lowStockThreshold) {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-bold">
          Low: {item.stockQuantity}
        </span>
      );
    }

    return (
      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
        {item.stockQuantity} in stock
      </span>
    );
  };

  return (
    <div className="w-full space-y-6">
      <h2 className="text-2xl font-bold">Inventory Management</h2>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <CardBox>
          <div className="flex items-center gap-2 mb-4">
            <Icon
              icon="solar:danger-triangle-bold"
              className="w-5 h-5 text-yellow-500"
            />
            <h3 className="text-lg font-semibold text-yellow-700">
              Low Stock Alerts ({lowStockItems.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-yellow-700">
                    {item.stockQuantity} remaining (threshold:{' '}
                    {item.lowStockThreshold})
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenStockEdit(item)}
                >
                  Restock
                </Button>
              </div>
            ))}
          </div>
        </CardBox>
      )}

      {/* All Items */}
      <CardBox>
        <h3 className="text-lg font-semibold mb-4">All Menu Items</h3>
        {loading ? (
          <div className="text-center py-10">
            <Icon
              icon="svg-spinners:ring-resize"
              className="w-8 h-8 mx-auto"
            />
            <p className="mt-2 text-gray-500">Loading inventory...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menus.map((item) => (
                <TableRow
                  key={item.id}
                  className={!item.isAvailable ? 'opacity-60' : ''}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {item.photo?.path ? (
                        <img
                          src={item.photo.path}
                          alt={item.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs">
                          No Img
                        </div>
                      )}
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.category?.name || '-'}</TableCell>
                  <TableCell>₹{Number(item.price).toFixed(0)}</TableCell>
                  <TableCell>{getStockBadge(item)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={item.isAvailable}
                      onCheckedChange={() => handleToggleAvailability(item)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenStockEdit(item)}
                    >
                      <Icon icon="solar:pen-bold" className="mr-1" />
                      Edit Stock
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardBox>

      {/* Edit Stock Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock - {editingItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="trackStock">Track Inventory</Label>
              <Switch
                id="trackStock"
                checked={trackStock}
                onCheckedChange={setTrackStock}
              />
            </div>
            {trackStock && (
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  type="number"
                  id="stock"
                  value={stockValue}
                  onChange={(e) => setStockValue(e.target.value)}
                  placeholder="Enter stock quantity"
                  min="0"
                />
                <p className="text-xs text-gray-500">
                  Low stock threshold: {editingItem?.lowStockThreshold || 5}
                </p>
              </div>
            )}
            {!trackStock && (
              <p className="text-sm text-gray-500">
                When inventory tracking is disabled, the item is considered to
                have unlimited stock.
              </p>
            )}
            <Button onClick={handleSaveStock}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
