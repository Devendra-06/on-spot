'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import CardBox from '@/app/components/shared/CardBox';
import { settingsService, Settings } from '@/app/services/settings.service';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import { CURRENCIES, GST_RATES } from '@/app/constants/india';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [siteName, setSiteName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [minimumOrder, setMinimumOrder] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingsService.get();
      setSettings(data);
      setSiteName(data.siteName);
      setCurrency(data.currency);
      setCurrencySymbol(data.currencySymbol);
      setDeliveryFee(String(data.deliveryFee));
      setTaxRate(String(data.taxRate));
      setMinimumOrder(String(data.minimumOrder));
      setMaintenanceMode(data.maintenanceMode);
    } catch (error) {
      console.error('Failed to fetch settings', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyChange = (currencyCode: string) => {
    const selected = CURRENCIES.find((c) => c.code === currencyCode);
    if (selected) {
      setCurrency(selected.code);
      setCurrencySymbol(selected.symbol);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updatedSettings = await settingsService.update({
        siteName,
        currency,
        currencySymbol,
        deliveryFee: parseFloat(deliveryFee) || 0,
        taxRate: parseFloat(taxRate) || 0,
        minimumOrder: parseFloat(minimumOrder) || 0,
        maintenanceMode,
      });
      setSettings(updatedSettings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icon icon="svg-spinners:ring-resize" className="w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <CardBox>
        <h2 className="text-xl font-bold mb-6">Store Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Store Name</label>
              <input
                type="text"
                className="w-full border rounded-lg p-2.5 dark:bg-gray-800 dark:border-gray-700"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Your Store Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Currency</label>
              <select
                className="w-full border rounded-lg p-2.5 dark:bg-gray-800 dark:border-gray-700"
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} - {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Currency Symbol</label>
              <input
                type="text"
                className="w-full border rounded-lg p-2.5 dark:bg-gray-800 dark:border-gray-700 bg-gray-50"
                value={currencySymbol}
                readOnly
                placeholder="₹"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-filled from currency</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Default Delivery Fee ({currencySymbol})</label>
              <input
                type="number"
                step="0.01"
                className="w-full border rounded-lg p-2.5 dark:bg-gray-800 dark:border-gray-700"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                placeholder="50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tax Rate (GST %)</label>
              <select
                className="w-full border rounded-lg p-2.5 dark:bg-gray-800 dark:border-gray-700"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
              >
                {GST_RATES.map((rate) => (
                  <option key={rate.value} value={rate.value}>
                    {rate.label}
                  </option>
                ))}
                <option value="custom">Custom Rate</option>
              </select>
              {!GST_RATES.some((r) => r.value === parseFloat(taxRate)) && (
                <input
                  type="number"
                  step="0.01"
                  className="w-full border rounded-lg p-2.5 dark:bg-gray-800 dark:border-gray-700 mt-2"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  placeholder="Custom tax rate"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Minimum Order Amount ({currencySymbol})</label>
            <input
              type="number"
              step="0.01"
              className="w-full border rounded-lg p-2.5 dark:bg-gray-800 dark:border-gray-700 md:w-1/3"
              value={minimumOrder}
              onChange={(e) => setMinimumOrder(e.target.value)}
              placeholder="100"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <input
              type="checkbox"
              id="maintenance"
              className="h-5 w-5 rounded"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
            />
            <div>
              <label htmlFor="maintenance" className="font-medium cursor-pointer">
                Maintenance Mode
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                When enabled, customers will see a maintenance message and cannot place orders
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Icon icon="svg-spinners:ring-resize" className="w-4 h-4 mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Icon icon="solar:diskette-bold" className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={fetchSettings}>
              <Icon icon="solar:refresh-bold" className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </form>
      </CardBox>
    </div>
  );
}
