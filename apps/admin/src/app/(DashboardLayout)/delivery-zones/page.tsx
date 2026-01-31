'use client';
import { useEffect, useState } from 'react';
import CardBox from '@/app/components/shared/CardBox';
import { Button } from '@/components/ui/button';
import {
  deliveryZonesService,
  DeliveryZone,
} from '@/app/services/delivery-zones.service';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function DeliveryZonesPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [minimumOrder, setMinimumOrder] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');
  const [postalCodes, setPostalCodes] = useState('');
  const [areaNames, setAreaNames] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await deliveryZonesService.findAll();
      setZones(data);
    } catch (error) {
      console.error('Failed to fetch delivery zones', error);
      toast.error('Failed to load delivery zones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setDeliveryFee('');
    setMinimumOrder('');
    setEstimatedMinutes('');
    setPostalCodes('');
    setAreaNames('');
    setIsActive(true);
  };

  const handleOpenCreate = () => {
    setEditingZone(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setName(zone.name);
    setDescription(zone.description || '');
    setDeliveryFee(String(zone.deliveryFee));
    setMinimumOrder(zone.minimumOrder ? String(zone.minimumOrder) : '');
    setEstimatedMinutes(
      zone.estimatedDeliveryMinutes
        ? String(zone.estimatedDeliveryMinutes)
        : '',
    );
    setPostalCodes(zone.postalCodes || '');
    setAreaNames(zone.areaNames || '');
    setIsActive(zone.isActive);
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!name || !deliveryFee) {
      toast.error('Please fill in Name and Delivery Fee');
      return;
    }

    try {
      const payload = {
        name,
        description: description || undefined,
        deliveryFee: Number(deliveryFee),
        minimumOrder: minimumOrder ? Number(minimumOrder) : null,
        estimatedDeliveryMinutes: estimatedMinutes
          ? Number(estimatedMinutes)
          : null,
        postalCodes: postalCodes || undefined,
        areaNames: areaNames || undefined,
        isActive,
      };

      if (editingZone) {
        await deliveryZonesService.update(editingZone.id, payload);
        toast.success('Delivery zone updated');
      } else {
        await deliveryZonesService.create(payload);
        toast.success('Delivery zone created');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Failed to save delivery zone', error);
      toast.error('Failed to save delivery zone');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this delivery zone?')) {
      try {
        await deliveryZonesService.delete(id);
        toast.success('Delivery zone deleted');
        fetchData();
      } catch (error) {
        console.error('Failed to delete delivery zone', error);
        toast.error('Failed to delete delivery zone');
      }
    }
  };

  const handleToggleActive = async (zone: DeliveryZone) => {
    try {
      await deliveryZonesService.update(zone.id, { isActive: !zone.isActive });
      toast.success(
        zone.isActive ? 'Zone deactivated' : 'Zone activated',
      );
      fetchData();
    } catch (error) {
      console.error('Failed to toggle zone status', error);
      toast.error('Failed to update zone');
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Delivery Zones</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="flex items-center gap-2"
              onClick={handleOpenCreate}
            >
              <Icon icon="solar:add-circle-bold" /> Add Zone
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingZone ? 'Edit Delivery Zone' : 'Add Delivery Zone'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Zone Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., City Center, Old Town"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="deliveryFee">Delivery Fee (₹) *</Label>
                  <Input
                    type="number"
                    id="deliveryFee"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    placeholder="50"
                    min="0"
                    step="1"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="minimumOrder">Minimum Order (₹)</Label>
                  <Input
                    type="number"
                    id="minimumOrder"
                    value={minimumOrder}
                    onChange={(e) => setMinimumOrder(e.target.value)}
                    placeholder="200"
                    min="0"
                    step="1"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="estimatedMinutes">
                  Estimated Delivery Time (minutes)
                </Label>
                <Input
                  type="number"
                  id="estimatedMinutes"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(e.target.value)}
                  placeholder="30"
                  min="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="postalCodes">
                  PIN Codes (comma-separated)
                </Label>
                <Textarea
                  id="postalCodes"
                  value={postalCodes}
                  onChange={(e) => setPostalCodes(e.target.value)}
                  placeholder="400001, 400002, 400003"
                  rows={2}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="areaNames">Area Names (comma-separated)</Label>
                <Textarea
                  id="areaNames"
                  value={areaNames}
                  onChange={(e) => setAreaNames(e.target.value)}
                  placeholder="Andheri, Bandra, Colaba"
                  rows={2}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active</Label>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
              <Button onClick={handleSubmit}>
                {editingZone ? 'Update Zone' : 'Create Zone'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <CardBox>
        {loading ? (
          <div className="text-center py-10">
            <Icon
              icon="svg-spinners:ring-resize"
              className="w-8 h-8 mx-auto"
            />
            <p className="mt-2 text-gray-500">Loading delivery zones...</p>
          </div>
        ) : zones.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <Icon
              icon="solar:delivery-bold"
              className="w-12 h-12 mx-auto mb-2 opacity-50"
            />
            <p>No delivery zones configured yet.</p>
            <p className="text-sm mt-1">
              Click "Add Zone" to create your first delivery zone.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zone Name</TableHead>
                <TableHead>Delivery Fee</TableHead>
                <TableHead>Min. Order</TableHead>
                <TableHead>Est. Time</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium">{zone.name}</TableCell>
                  <TableCell>₹{Number(zone.deliveryFee).toFixed(0)}</TableCell>
                  <TableCell>
                    {zone.minimumOrder
                      ? `₹${Number(zone.minimumOrder).toFixed(0)}`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {zone.estimatedDeliveryMinutes
                      ? `${zone.estimatedDeliveryMinutes} min`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      {zone.postalCodes && (
                        <div className="text-gray-600">
                          {zone.postalCodes.split(',').length} PIN codes
                        </div>
                      )}
                      {zone.areaNames && (
                        <div className="text-gray-600">
                          {zone.areaNames.split(',').length} areas
                        </div>
                      )}
                      {!zone.postalCodes && !zone.areaNames && (
                        <span className="text-gray-400">Not configured</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleActive(zone)}
                      className={`px-2 py-1 text-xs rounded-full ${
                        zone.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {zone.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(zone)}
                      >
                        <Icon icon="solar:pen-bold" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(zone.id)}
                      >
                        <Icon icon="solar:trash-bin-trash-bold" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardBox>
    </div>
  );
}
