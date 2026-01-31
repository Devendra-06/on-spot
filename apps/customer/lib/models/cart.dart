import 'menu.dart';

class SelectedAddon {
  final String id;
  final String name;
  final double price;

  SelectedAddon({
    required this.id,
    required this.name,
    required this.price,
  });

  factory SelectedAddon.fromAddon(MenuAddon addon) {
    return SelectedAddon(
      id: addon.id,
      name: addon.name,
      price: addon.price,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'price': price,
    };
  }
}

class CartItem {
  final String id; // Unique cart item ID
  final MenuItem menuItem;
  final MenuVariant? selectedVariant;
  final List<SelectedAddon> selectedAddons;
  int quantity;
  final String? notes;

  CartItem({
    required this.id,
    required this.menuItem,
    this.selectedVariant,
    this.selectedAddons = const [],
    this.quantity = 1,
    this.notes,
  });

  // Calculate item price (variant price or base price)
  double get unitPrice {
    return selectedVariant?.price ?? menuItem.price;
  }

  // Calculate addons total
  double get addonsTotal {
    return selectedAddons.fold(0, (sum, addon) => sum + addon.price);
  }

  // Calculate total for this cart item (unit price + addons) * quantity
  double get itemTotal {
    return (unitPrice + addonsTotal) * quantity;
  }

  // Create a unique key for grouping similar items
  String get uniqueKey {
    final variantKey = selectedVariant?.id ?? 'no-variant';
    final addonKeys = selectedAddons.map((a) => a.id).toList()..sort();
    return '${menuItem.id}-$variantKey-${addonKeys.join(",")}';
  }

  // For order creation
  Map<String, dynamic> toOrderItem() {
    return {
      'menuItemId': menuItem.id,
      'quantity': quantity,
      'price': unitPrice,
      'variantId': selectedVariant?.id,
      'variantName': selectedVariant?.name,
      'variantPrice': selectedVariant?.price,
      'selectedAddons': selectedAddons.map((a) => a.toJson()).toList(),
      'addonsTotal': addonsTotal,
      'itemTotal': itemTotal,
      'itemNotes': notes,
    };
  }

  // Create a copy with updated quantity
  CartItem copyWith({int? quantity, String? notes}) {
    return CartItem(
      id: id,
      menuItem: menuItem,
      selectedVariant: selectedVariant,
      selectedAddons: selectedAddons,
      quantity: quantity ?? this.quantity,
      notes: notes ?? this.notes,
    );
  }
}
