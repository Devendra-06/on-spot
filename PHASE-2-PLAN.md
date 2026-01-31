# Phase 2: Operations Features

## Implementation Status: COMPLETED

**Date Completed:** January 29, 2026

---

## Features Implemented

### 1. Menu Enhancements
- [x] Menu Variants (sizes) with different prices per variant
- [x] Menu Add-ons (extras/toppings) with additional prices and grouping
- [x] Availability toggle per menu item
- [x] Stock quantity tracking per menu item
- [x] Low stock threshold and alerts
- [x] Auto-disable on stockout feature
- [x] Sort order for menu items

### 2. Inventory Management
- [x] Stock quantity tracking per item
- [x] Low stock alerts on inventory page
- [x] Stock update functionality
- [x] Unlimited stock option (null = unlimited)

### 3. Operating Hours Enhancement
- [x] Holiday closures - define specific dates when restaurant is closed
- [x] Special hours - modified hours for specific dates
- [x] Is-open endpoint that considers holidays and special hours

### 4. Delivery Zones
- [x] Create delivery zones with names and descriptions
- [x] Zone-based delivery fees
- [x] Minimum order per zone
- [x] Estimated delivery time per zone
- [x] Postal codes matching
- [x] Area names matching
- [x] Deliverability check endpoint

### 5. User Addresses
- [x] Store customer delivery addresses
- [x] Default address support
- [x] Auto-link addresses to delivery zones
- [x] Delivery instructions

### 6. Order Enhancements
- [x] Delivery address on orders
- [x] Delivery zone on orders
- [x] Delivery fee, subtotal, tax amount fields
- [x] Order item variant snapshot
- [x] Order item addons snapshot
- [x] Special instructions

---

## Files Created/Modified

### Backend (NestJS)

**Menu Enhancements:**
- `apps/backend/src/menus/entities/menu-variant.entity.ts` - CREATED
- `apps/backend/src/menus/entities/menu-addon.entity.ts` - CREATED
- `apps/backend/src/menus/entities/menu.entity.ts` - MODIFIED (added isAvailable, stockQuantity, lowStockThreshold, autoDisableOnStockout, sortOrder, variants, addons)
- `apps/backend/src/menus/dto/create-variant.dto.ts` - CREATED
- `apps/backend/src/menus/dto/create-addon.dto.ts` - CREATED
- `apps/backend/src/menus/dto/create-menu.dto.ts` - MODIFIED
- `apps/backend/src/menus/menus.service.ts` - MODIFIED (added variant/addon/stock CRUD)
- `apps/backend/src/menus/menus.controller.ts` - MODIFIED (added new endpoints)
- `apps/backend/src/menus/menus.module.ts` - MODIFIED (registered new entities)

**Delivery Zones Module:**
- `apps/backend/src/delivery-zones/entities/delivery-zone.entity.ts` - CREATED
- `apps/backend/src/delivery-zones/dto/create-delivery-zone.dto.ts` - CREATED
- `apps/backend/src/delivery-zones/dto/update-delivery-zone.dto.ts` - CREATED
- `apps/backend/src/delivery-zones/delivery-zones.service.ts` - CREATED
- `apps/backend/src/delivery-zones/delivery-zones.controller.ts` - CREATED
- `apps/backend/src/delivery-zones/delivery-zones.module.ts` - CREATED

**User Addresses Module:**
- `apps/backend/src/user-addresses/entities/user-address.entity.ts` - CREATED
- `apps/backend/src/user-addresses/dto/create-user-address.dto.ts` - CREATED
- `apps/backend/src/user-addresses/dto/update-user-address.dto.ts` - CREATED
- `apps/backend/src/user-addresses/user-addresses.service.ts` - CREATED
- `apps/backend/src/user-addresses/user-addresses.controller.ts` - CREATED
- `apps/backend/src/user-addresses/user-addresses.module.ts` - CREATED

**Restaurant Profile Enhancement:**
- `apps/backend/src/restaurant-profile/entities/restaurant-profile.entity.ts` - MODIFIED (added holidayClosures, specialHours)
- `apps/backend/src/restaurant-profile/restaurant-profile.service.ts` - MODIFIED (added holiday/special hours methods, isOpen)
- `apps/backend/src/restaurant-profile/restaurant-profile.controller.ts` - MODIFIED (added new endpoints)
- `apps/backend/src/restaurant-profile/dto/update-restaurant-profile.dto.ts` - MODIFIED

**Order Enhancements:**
- `apps/backend/src/orders/entities/order.entity.ts` - MODIFIED (added delivery fields)
- `apps/backend/src/orders/entities/order-item.entity.ts` - MODIFIED (added variant/addon snapshots)

**App Module:**
- `apps/backend/src/app.module.ts` - MODIFIED (registered DeliveryZonesModule, UserAddressesModule)

**Database:**
- `apps/backend/src/database/migrations/1738250000000-Phase2OperationsFeatures.ts` - CREATED

### Frontend (Next.js)

**Services:**
- `apps/admin/src/app/services/menus.service.ts` - MODIFIED (added variant/addon/stock methods)
- `apps/admin/src/app/services/delivery-zones.service.ts` - CREATED
- `apps/admin/src/app/services/restaurant-profile.service.ts` - MODIFIED (added holiday/special hours types and methods)

**Pages:**
- `apps/admin/src/app/(DashboardLayout)/menu/items/page.tsx` - MODIFIED (added variants/addons UI, availability toggle)
- `apps/admin/src/app/(DashboardLayout)/menu/inventory/page.tsx` - CREATED
- `apps/admin/src/app/(DashboardLayout)/delivery-zones/page.tsx` - CREATED
- `apps/admin/src/app/(DashboardLayout)/restaurant-profile/page.tsx` - MODIFIED (added holiday closures and special hours editors)

**Navigation:**
- `apps/admin/src/app/(DashboardLayout)/layout/sidebar/Sidebaritems.ts` - MODIFIED (reorganized, added new menu items)

---

## API Endpoints

### Menu Enhancements
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/menus` | Get all menu items with variants and addons |
| GET | `/menus/available` | Get only available items |
| GET | `/menus/low-stock` | Get low stock items |
| PATCH | `/menus/:id/availability` | Toggle availability |
| PATCH | `/menus/:id/stock` | Update stock quantity |
| PATCH | `/menus/reorder` | Update sort order |
| GET | `/menus/:id/variants` | Get variants |
| POST | `/menus/:id/variants` | Create variant |
| PATCH | `/menus/:id/variants/:vid` | Update variant |
| DELETE | `/menus/:id/variants/:vid` | Delete variant |
| GET | `/menus/:id/addons` | Get addons |
| POST | `/menus/:id/addons` | Create addon |
| PATCH | `/menus/:id/addons/:aid` | Update addon |
| DELETE | `/menus/:id/addons/:aid` | Delete addon |

### Delivery Zones
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/delivery-zones` | List all zones |
| GET | `/delivery-zones/active` | List active zones |
| POST | `/delivery-zones` | Create zone |
| PATCH | `/delivery-zones/:id` | Update zone |
| DELETE | `/delivery-zones/:id` | Delete zone |
| GET | `/delivery-zones/check/:postalCode` | Check if postal code is deliverable |
| GET | `/delivery-zones/check-area?area=name` | Check if area is deliverable |

### User Addresses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/addresses` | Get user's addresses |
| GET | `/addresses/default` | Get default address |
| POST | `/addresses` | Create address |
| PATCH | `/addresses/:id` | Update address |
| DELETE | `/addresses/:id` | Delete address |
| PATCH | `/addresses/:id/default` | Set as default |

### Restaurant Profile (New)
| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/restaurant-profile/holiday-closures` | Update holiday closures |
| PATCH | `/restaurant-profile/special-hours` | Update special hours |
| GET | `/restaurant-profile/is-open` | Check if restaurant is currently open |

---

## Database Schema

### menu_variant Table
```sql
CREATE TABLE "menu_variant" (
  "id" uuid PRIMARY KEY,
  "name" varchar NOT NULL,
  "price" decimal(10,2) NOT NULL,
  "stockQuantity" integer,
  "isAvailable" boolean DEFAULT true,
  "sortOrder" integer DEFAULT 0,
  "menuId" uuid REFERENCES menu(id) ON DELETE CASCADE,
  "createdAt" timestamp, "updatedAt" timestamp
);
```

### menu_addon Table
```sql
CREATE TABLE "menu_addon" (
  "id" uuid PRIMARY KEY,
  "name" varchar NOT NULL,
  "price" decimal(10,2) NOT NULL,
  "stockQuantity" integer,
  "isAvailable" boolean DEFAULT true,
  "sortOrder" integer DEFAULT 0,
  "isRequired" boolean DEFAULT false,
  "groupName" varchar,
  "menuId" uuid REFERENCES menu(id) ON DELETE CASCADE,
  "createdAt" timestamp, "updatedAt" timestamp
);
```

### delivery_zone Table
```sql
CREATE TABLE "delivery_zone" (
  "id" uuid PRIMARY KEY,
  "name" varchar NOT NULL,
  "description" text,
  "deliveryFee" decimal(10,2) NOT NULL,
  "minimumOrder" decimal(10,2),
  "estimatedDeliveryMinutes" integer,
  "postalCodes" text,
  "areaNames" text,
  "isActive" boolean DEFAULT true,
  "sortOrder" integer DEFAULT 0,
  "createdAt" timestamp, "updatedAt" timestamp, "deletedAt" timestamp
);
```

### user_address Table
```sql
CREATE TABLE "user_address" (
  "id" uuid PRIMARY KEY,
  "label" varchar NOT NULL,
  "addressLine1" varchar NOT NULL,
  "addressLine2" varchar,
  "city" varchar NOT NULL,
  "state" varchar,
  "postalCode" varchar NOT NULL,
  "country" varchar,
  "latitude" decimal(10,7),
  "longitude" decimal(10,7),
  "instructions" varchar,
  "isDefault" boolean DEFAULT false,
  "userId" integer REFERENCES "user"(id) ON DELETE CASCADE,
  "deliveryZoneId" uuid REFERENCES delivery_zone(id),
  "createdAt" timestamp, "updatedAt" timestamp
);
```

---

## How to Run

### 1. Run Database Migration
```bash
cd apps/backend
npm run migration:run
```

### 2. Start Backend
```bash
cd apps/backend
npm run start:dev
```

### 3. Start Frontend
```bash
cd apps/admin
npm run dev
```

---

## Verification Checklist

### Backend
- [ ] GET /menus returns items with variants and addons
- [ ] Can create/update/delete variants
- [ ] Can create/update/delete addons
- [ ] Stock updates work correctly
- [ ] Auto-disable on stockout works
- [ ] Availability toggle works
- [ ] Low stock endpoint returns correct items
- [ ] Delivery zones CRUD works
- [ ] Deliverability check by postal code works
- [ ] User addresses CRUD works
- [ ] Holiday closures save correctly
- [ ] Special hours save correctly
- [ ] is-open endpoint considers holidays and special hours

### Frontend
- [ ] Menu items page shows variants/addons count
- [ ] Can expand item to see/edit variants and addons
- [ ] Can add/edit/delete variants inline
- [ ] Can add/edit/delete addons inline
- [ ] Availability toggle works
- [ ] Inventory page shows stock levels
- [ ] Low stock alerts appear on inventory page
- [ ] Delivery zones page works (create/edit/delete)
- [ ] Zone activation toggle works
- [ ] Restaurant profile holiday closures editor works
- [ ] Restaurant profile special hours editor works

---

## Next Steps (Phase 3)

Phase 3 will focus on Customer App Features:
- Mobile app menu browsing with variants and addons selection
- Cart functionality with variant/addon support
- Address management in mobile app
- Order placement with delivery zone validation
- Order tracking
- Push notifications
