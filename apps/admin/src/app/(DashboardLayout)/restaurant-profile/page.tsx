'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import CardBox from '@/app/components/shared/CardBox';
import {
  restaurantProfileService,
  RestaurantProfile,
  OpeningHour,
  HolidayClosure,
  SpecialHour,
} from '@/app/services/restaurant-profile.service';
import { filesService } from '@/app/services/files.service';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import { useRestaurantProfile } from '@/app/context/RestaurantProfileContext';
import { INDIAN_STATES, DEFAULT_COUNTRY } from '@/app/constants/india';

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export default function RestaurantProfilePage() {
  const { refresh: refreshGlobalProfile } = useRestaurantProfile();
  const [profile, setProfile] = useState<RestaurantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('');
  const [openingHours, setOpeningHours] = useState<Record<string, OpeningHour>>(
    {},
  );
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    website: '',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoId, setLogoId] = useState<string | null>(null);

  // Holiday closures and special hours
  const [holidayClosures, setHolidayClosures] = useState<HolidayClosure[]>([]);
  const [specialHours, setSpecialHours] = useState<SpecialHour[]>([]);
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayReason, setNewHolidayReason] = useState('');
  const [newSpecialDate, setNewSpecialDate] = useState('');
  const [newSpecialOpen, setNewSpecialOpen] = useState('09:00');
  const [newSpecialClose, setNewSpecialClose] = useState('18:00');
  const [newSpecialReason, setNewSpecialReason] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await restaurantProfileService.get();
      setProfile(data);
      setName(data.name || '');
      setDescription(data.description || '');
      setPhone(data.phone || '');
      setEmail(data.email || '');
      setAddress(data.address || '');
      setCity(data.city || '');
      setState(data.state || '');
      setZipCode(data.zipCode || '');
      setCountry(data.country || DEFAULT_COUNTRY);
      setOpeningHours(data.openingHours || {});
      setSocialLinks({
        facebook: data.socialLinks?.facebook || '',
        instagram: data.socialLinks?.instagram || '',
        twitter: data.socialLinks?.twitter || '',
        website: data.socialLinks?.website || '',
      });
      setHolidayClosures(data.holidayClosures || []);
      setSpecialHours(data.specialHours || []);
      if (data.logo?.path) {
        setLogoPreview(data.logo.path);
        setLogoId(data.logo.id);
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
      toast.error('Failed to load restaurant profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const result = await filesService.upload(file);
      setLogoPreview(result.file.path);
      setLogoId(result.file.id);
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Failed to upload logo', error);
      toast.error('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleOpeningHourChange = (
    day: string,
    field: 'open' | 'close' | 'closed',
    value: string | boolean,
  ) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleAddHolidayClosure = () => {
    if (!newHolidayDate) {
      toast.error('Please select a date');
      return;
    }
    setHolidayClosures([
      ...holidayClosures,
      { date: newHolidayDate, reason: newHolidayReason || undefined },
    ]);
    setNewHolidayDate('');
    setNewHolidayReason('');
  };

  const handleRemoveHolidayClosure = (index: number) => {
    setHolidayClosures(holidayClosures.filter((_, i) => i !== index));
  };

  const handleAddSpecialHour = () => {
    if (!newSpecialDate) {
      toast.error('Please select a date');
      return;
    }
    setSpecialHours([
      ...specialHours,
      {
        date: newSpecialDate,
        open: newSpecialOpen,
        close: newSpecialClose,
        reason: newSpecialReason || undefined,
      },
    ]);
    setNewSpecialDate('');
    setNewSpecialOpen('09:00');
    setNewSpecialClose('18:00');
    setNewSpecialReason('');
  };

  const handleRemoveSpecialHour = (index: number) => {
    setSpecialHours(specialHours.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updatedProfile = await restaurantProfileService.update({
        name,
        description,
        phone,
        email,
        address,
        city,
        state,
        zipCode,
        country,
        openingHours,
        socialLinks,
        holidayClosures,
        specialHours,
        logo: logoId ? { id: logoId } : null,
      });
      setProfile(updatedProfile);
      // Refresh global profile context to update header logo/name
      await refreshGlobalProfile();
      toast.success('Restaurant profile saved successfully');
    } catch (error) {
      console.error('Failed to save profile', error);
      toast.error('Failed to save profile');
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
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <CardBox>
              <h2 className="text-xl font-bold mb-6">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2.5 dark:bg-gray-800 dark:border-gray-700"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Restaurant Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full border rounded-lg p-2.5 dark:bg-gray-800 dark:border-gray-700"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell customers about your restaurant..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      className="w-full border rounded-lg p-2.5 dark:bg-gray-800 dark:border-gray-700"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full border rounded-lg p-2.5 dark:bg-gray-800 dark:border-gray-700"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@restaurant.com"
                    />
                  </div>
                </div>
              </div>
            </CardBox>

            <CardBox>
              <h2 className="text-xl font-bold mb-6">Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    className="w-full border rounded-lg p-2.5 dark:bg-gray-800 dark:border-gray-700"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded-lg p-2.5 dark:bg-gray-800 dark:border-gray-700"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Mumbai"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      State
                    </label>
                    <select
                      className="w-full border rounded-lg p-2.5 dark:bg-gray-800 dark:border-gray-700"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s.code} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded-lg p-2.5 dark:bg-gray-800 dark:border-gray-700"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="400001"
                      maxLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded-lg p-2.5 dark:bg-gray-800 dark:border-gray-700 bg-gray-50"
                      value={country}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </CardBox>

            <CardBox>
              <h2 className="text-xl font-bold mb-6">Opening Hours</h2>
              <div className="space-y-3">
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="w-28 capitalize font-medium">{day}</div>
                    <input
                      type="checkbox"
                      checked={!openingHours[day]?.closed}
                      onChange={(e) =>
                        handleOpeningHourChange(day, 'closed', !e.target.checked)
                      }
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-gray-500 w-12">
                      {openingHours[day]?.closed ? 'Closed' : 'Open'}
                    </span>
                    {!openingHours[day]?.closed && (
                      <>
                        <input
                          type="time"
                          className="border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600"
                          value={openingHours[day]?.open || '09:00'}
                          onChange={(e) =>
                            handleOpeningHourChange(day, 'open', e.target.value)
                          }
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          className="border rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600"
                          value={openingHours[day]?.close || '22:00'}
                          onChange={(e) =>
                            handleOpeningHourChange(day, 'close', e.target.value)
                          }
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardBox>

            {/* Holiday Closures */}
            <CardBox>
              <h2 className="text-xl font-bold mb-6">Holiday Closures</h2>
              <p className="text-sm text-gray-500 mb-4">
                Add dates when your restaurant will be closed
              </p>
              <div className="space-y-4">
                <div className="flex gap-3 items-end flex-wrap">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      className="border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700"
                      value={newHolidayDate}
                      onChange={(e) => setNewHolidayDate(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium mb-1">
                      Reason (optional)
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700"
                      value={newHolidayReason}
                      onChange={(e) => setNewHolidayReason(e.target.value)}
                      placeholder="e.g., Christmas Day"
                    />
                  </div>
                  <Button type="button" onClick={handleAddHolidayClosure}>
                    <Icon icon="solar:add-circle-linear" className="mr-1" /> Add
                  </Button>
                </div>

                {holidayClosures.length > 0 ? (
                  <div className="space-y-2">
                    {holidayClosures.map((closure, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                      >
                        <div>
                          <span className="font-medium">{closure.date}</span>
                          {closure.reason && (
                            <span className="text-gray-600 dark:text-gray-400 ml-3">
                              - {closure.reason}
                            </span>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() => handleRemoveHolidayClosure(index)}
                        >
                          <Icon icon="solar:trash-bin-trash-linear" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    No holiday closures configured
                  </p>
                )}
              </div>
            </CardBox>

            {/* Special Hours */}
            <CardBox>
              <h2 className="text-xl font-bold mb-6">Special Hours</h2>
              <p className="text-sm text-gray-500 mb-4">
                Set modified operating hours for specific dates
              </p>
              <div className="space-y-4">
                <div className="flex gap-3 items-end flex-wrap">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      className="border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700"
                      value={newSpecialDate}
                      onChange={(e) => setNewSpecialDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Open
                    </label>
                    <input
                      type="time"
                      className="border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700"
                      value={newSpecialOpen}
                      onChange={(e) => setNewSpecialOpen(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Close
                    </label>
                    <input
                      type="time"
                      className="border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700"
                      value={newSpecialClose}
                      onChange={(e) => setNewSpecialClose(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className="block text-sm font-medium mb-1">
                      Reason
                    </label>
                    <input
                      type="text"
                      className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-700"
                      value={newSpecialReason}
                      onChange={(e) => setNewSpecialReason(e.target.value)}
                      placeholder="e.g., Christmas Eve"
                    />
                  </div>
                  <Button type="button" onClick={handleAddSpecialHour}>
                    <Icon icon="solar:add-circle-linear" className="mr-1" /> Add
                  </Button>
                </div>

                {specialHours.length > 0 ? (
                  <div className="space-y-2">
                    {specialHours.map((special, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                      >
                        <div>
                          <span className="font-medium">{special.date}</span>
                          <span className="text-gray-600 dark:text-gray-400 ml-3">
                            {special.open} - {special.close}
                          </span>
                          {special.reason && (
                            <span className="text-gray-500 ml-3">
                              ({special.reason})
                            </span>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() => handleRemoveSpecialHour(index)}
                        >
                          <Icon icon="solar:trash-bin-trash-linear" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    No special hours configured
                  </p>
                )}
              </div>
            </CardBox>
          </div>

          <div className="space-y-6">
            <CardBox>
              <h2 className="text-xl font-bold mb-6">Logo</h2>
              <div className="space-y-4">
                <div className="flex justify-center">
                  {logoPreview ? (
                    <div className="relative w-40 h-40 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                      <Image
                        src={
                          logoPreview.startsWith('http')
                            ? logoPreview
                            : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${logoPreview}`
                        }
                        alt="Restaurant Logo"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-40 h-40 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                      <Icon icon="solar:gallery-bold" className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={uploadingLogo}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={uploadingLogo}
                      onClick={() =>
                        document
                          .querySelector<HTMLInputElement>('input[type="file"]')
                          ?.click()
                      }
                    >
                      {uploadingLogo ? (
                        <>
                          <Icon
                            icon="svg-spinners:ring-resize"
                            className="w-4 h-4 mr-2"
                          />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Icon
                            icon="solar:upload-bold"
                            className="w-4 h-4 mr-2"
                          />
                          Upload Logo
                        </>
                      )}
                    </Button>
                  </label>
                </div>
              </div>
            </CardBox>

            <CardBox>
              <h2 className="text-xl font-bold mb-6">Social Links</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Icon
                      icon="logos:facebook"
                      className="inline w-4 h-4 mr-2"
                    />
                    Facebook
                  </label>
                  <input
                    type="url"
                    className="w-full border rounded-lg p-2.5 dark:bg-gray-800 dark:border-gray-700"
                    value={socialLinks.facebook}
                    onChange={(e) =>
                      setSocialLinks({ ...socialLinks, facebook: e.target.value })
                    }
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Icon
                      icon="skill-icons:instagram"
                      className="inline w-4 h-4 mr-2"
                    />
                    Instagram
                  </label>
                  <input
                    type="url"
                    className="w-full border rounded-lg p-2.5 dark:bg-gray-800 dark:border-gray-700"
                    value={socialLinks.instagram}
                    onChange={(e) =>
                      setSocialLinks({
                        ...socialLinks,
                        instagram: e.target.value,
                      })
                    }
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Icon
                      icon="pajamas:twitter"
                      className="inline w-4 h-4 mr-2"
                    />
                    Twitter / X
                  </label>
                  <input
                    type="url"
                    className="w-full border rounded-lg p-2.5 dark:bg-gray-800 dark:border-gray-700"
                    value={socialLinks.twitter}
                    onChange={(e) =>
                      setSocialLinks({ ...socialLinks, twitter: e.target.value })
                    }
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Icon
                      icon="solar:globe-bold"
                      className="inline w-4 h-4 mr-2"
                    />
                    Website
                  </label>
                  <input
                    type="url"
                    className="w-full border rounded-lg p-2.5 dark:bg-gray-800 dark:border-gray-700"
                    value={socialLinks.website}
                    onChange={(e) =>
                      setSocialLinks({ ...socialLinks, website: e.target.value })
                    }
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </CardBox>

            <div className="flex gap-3">
              <Button type="submit" disabled={saving} className="flex-1">
                {saving ? (
                  <>
                    <Icon
                      icon="svg-spinners:ring-resize"
                      className="w-4 h-4 mr-2"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Icon
                      icon="solar:diskette-bold"
                      className="w-4 h-4 mr-2"
                    />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
