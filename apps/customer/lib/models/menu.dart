class Category {
  final String id;
  final String name;
  final String? description;

  Category({required this.id, required this.name, this.description});

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'],
      name: json['name'],
      description: json['description'],
    );
  }
}

class MenuVariant {
  final String id;
  final String name;
  final double price;
  final bool isAvailable;
  final int? stockQuantity;

  MenuVariant({
    required this.id,
    required this.name,
    required this.price,
    this.isAvailable = true,
    this.stockQuantity,
  });

  factory MenuVariant.fromJson(Map<String, dynamic> json) {
    return MenuVariant(
      id: json['id'],
      name: json['name'],
      price: double.parse(json['price'].toString()),
      isAvailable: json['isAvailable'] ?? true,
      stockQuantity: json['stockQuantity'],
    );
  }

  bool get inStock => stockQuantity == null || stockQuantity! > 0;
}

class MenuAddon {
  final String id;
  final String name;
  final double price;
  final bool isAvailable;
  final bool isRequired;
  final String? groupName;

  MenuAddon({
    required this.id,
    required this.name,
    required this.price,
    this.isAvailable = true,
    this.isRequired = false,
    this.groupName,
  });

  factory MenuAddon.fromJson(Map<String, dynamic> json) {
    return MenuAddon(
      id: json['id'],
      name: json['name'],
      price: double.parse(json['price'].toString()),
      isAvailable: json['isAvailable'] ?? true,
      isRequired: json['isRequired'] ?? false,
      groupName: json['groupName'],
    );
  }
}

class MenuItem {
  final String id;
  final String name;
  final String description;
  final double price;
  final String? imageUrl;
  final Category? category;
  final bool isAvailable;
  final int? stockQuantity;
  final List<MenuVariant> variants;
  final List<MenuAddon> addons;

  MenuItem({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    this.imageUrl,
    this.category,
    this.isAvailable = true,
    this.stockQuantity,
    this.variants = const [],
    this.addons = const [],
  });

  factory MenuItem.fromJson(Map<String, dynamic> json) {
    return MenuItem(
      id: json['id'],
      name: json['name'],
      description: json['description'] ?? '',
      price: json['price'] != null ? double.parse(json['price'].toString()) : 0.0,
      imageUrl: json['photo'] != null ? json['photo']['path'] : null,
      category: json['category'] != null ? Category.fromJson(json['category']) : null,
      isAvailable: json['isAvailable'] ?? true,
      stockQuantity: json['stockQuantity'],
      variants: json['variants'] != null
          ? (json['variants'] as List).map((v) => MenuVariant.fromJson(v)).toList()
          : [],
      addons: json['addons'] != null
          ? (json['addons'] as List).map((a) => MenuAddon.fromJson(a)).toList()
          : [],
    );
  }

  bool get inStock => isAvailable && (stockQuantity == null || stockQuantity! > 0);

  bool get hasVariants => variants.isNotEmpty;

  bool get hasAddons => addons.isNotEmpty;

  // Group addons by groupName
  Map<String, List<MenuAddon>> get groupedAddons {
    final Map<String, List<MenuAddon>> grouped = {};
    for (var addon in addons) {
      final group = addon.groupName ?? 'Extras';
      grouped.putIfAbsent(group, () => []);
      grouped[group]!.add(addon);
    }
    return grouped;
  }
}
