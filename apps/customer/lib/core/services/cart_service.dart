import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';
import '../../models/menu.dart';
import '../../models/cart.dart';
import '../../models/address.dart';

class CartService extends ChangeNotifier {
  final List<CartItem> _items = [];
  Address? _selectedAddress;
  DeliveryZone? _selectedZone;
  String? _specialInstructions;

  // Getters
  List<CartItem> get items => List.unmodifiable(_items);
  Address? get selectedAddress => _selectedAddress;
  DeliveryZone? get selectedZone => _selectedZone;
  String? get specialInstructions => _specialInstructions;

  int get itemCount => _items.fold(0, (sum, item) => sum + item.quantity);

  bool get isEmpty => _items.isEmpty;

  // Subtotal (items only)
  double get subtotal {
    return _items.fold(0, (sum, item) => sum + item.itemTotal);
  }

  // Delivery fee from selected zone
  double get deliveryFee {
    return _selectedZone?.deliveryFee ?? 0;
  }

  // GST calculation (5% as default for food)
  double get taxRate => 0.05;

  double get taxAmount {
    return subtotal * taxRate;
  }

  // Total amount
  double get totalAmount {
    return subtotal + deliveryFee + taxAmount;
  }

  // Minimum order check
  bool get meetsMinimumOrder {
    if (_selectedZone?.minimumOrder == null) return true;
    return subtotal >= _selectedZone!.minimumOrder!;
  }

  double get minimumOrderAmount => _selectedZone?.minimumOrder ?? 0;

  // Add item to cart
  void addItem({
    required MenuItem menuItem,
    MenuVariant? variant,
    List<MenuAddon> addons = const [],
    int quantity = 1,
    String? notes,
  }) {
    final selectedAddons = addons.map((a) => SelectedAddon.fromAddon(a)).toList();

    // Check if same item with same variant and addons exists
    final existingIndex = _items.indexWhere((item) {
      if (item.menuItem.id != menuItem.id) return false;
      if (item.selectedVariant?.id != variant?.id) return false;

      final existingAddonIds = item.selectedAddons.map((a) => a.id).toSet();
      final newAddonIds = selectedAddons.map((a) => a.id).toSet();
      return existingAddonIds.length == newAddonIds.length &&
          existingAddonIds.containsAll(newAddonIds);
    });

    if (existingIndex != -1) {
      // Update quantity of existing item
      _items[existingIndex].quantity += quantity;
    } else {
      // Add new item
      _items.add(CartItem(
        id: const Uuid().v4(),
        menuItem: menuItem,
        selectedVariant: variant,
        selectedAddons: selectedAddons,
        quantity: quantity,
        notes: notes,
      ));
    }
    notifyListeners();
  }

  // Update item quantity
  void updateQuantity(String cartItemId, int quantity) {
    final index = _items.indexWhere((item) => item.id == cartItemId);
    if (index != -1) {
      if (quantity <= 0) {
        _items.removeAt(index);
      } else {
        _items[index] = _items[index].copyWith(quantity: quantity);
      }
      notifyListeners();
    }
  }

  // Remove item
  void removeItem(String cartItemId) {
    _items.removeWhere((item) => item.id == cartItemId);
    notifyListeners();
  }

  // Set delivery address
  void setAddress(Address? address) {
    _selectedAddress = address;
    _selectedZone = address?.deliveryZone;
    notifyListeners();
  }

  // Set delivery zone manually
  void setDeliveryZone(DeliveryZone? zone) {
    _selectedZone = zone;
    notifyListeners();
  }

  // Set special instructions
  void setSpecialInstructions(String? instructions) {
    _specialInstructions = instructions;
    notifyListeners();
  }

  // Clear cart
  void clear() {
    _items.clear();
    _selectedAddress = null;
    _selectedZone = null;
    _specialInstructions = null;
    notifyListeners();
  }

  // Get order data for API
  Map<String, dynamic> toOrderData() {
    return {
      'items': _items.map((item) => item.toOrderItem()).toList(),
      'subtotal': subtotal,
      'deliveryFee': deliveryFee,
      'taxAmount': taxAmount,
      'totalAmount': totalAmount,
      'deliveryAddressId': _selectedAddress?.id,
      'deliveryZoneId': _selectedZone?.id,
      'specialInstructions': _specialInstructions,
      'deliveryAddressSnapshot': _selectedAddress != null
          ? {
              'label': _selectedAddress!.label,
              'addressLine1': _selectedAddress!.addressLine1,
              'addressLine2': _selectedAddress!.addressLine2,
              'city': _selectedAddress!.city,
              'state': _selectedAddress!.state,
              'postalCode': _selectedAddress!.postalCode,
              'country': _selectedAddress!.country,
            }
          : null,
    };
  }
}
