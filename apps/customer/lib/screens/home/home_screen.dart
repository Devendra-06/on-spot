import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../constants.dart';
import '../../models/menu.dart';
import '../../core/services/menu_service.dart';
import '../../core/services/restaurant_service.dart';
import '../../core/services/cart_service.dart';
import '../../api_config.dart';
import '../cart/cart_screen.dart';
import '../orderDetails/my_orders_screen.dart';
import '../details/details_screen.dart';
import '../addresses/address_list_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<MenuItem> _menuItems = [];
  List<Category> _categories = [];
  RestaurantInfo? _restaurantInfo;
  String? _selectedCategoryId;
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Load menu items first (most important)
      final items = await MenuService.fetchMenuItems().timeout(
        const Duration(seconds: 10),
        onTimeout: () => <MenuItem>[],
      );

      if (mounted) {
        setState(() {
          _menuItems = items;
          _isLoading = false;
        });
      }

      // Load restaurant info and categories in background
      _loadExtras();
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _error = e.toString();
        });
      }
    }
  }

  Future<void> _loadExtras() async {
    try {
      final info = await RestaurantService.getPublicInfo().timeout(
        const Duration(seconds: 5),
        onTimeout: () => RestaurantInfo(name: 'Restaurant'),
      );
      if (mounted) setState(() => _restaurantInfo = info);
    } catch (_) {}

    try {
      final categories = await MenuService.fetchCategories().timeout(
        const Duration(seconds: 5),
        onTimeout: () => <Category>[],
      );
      if (mounted) setState(() => _categories = categories);
    } catch (_) {}
  }

  Future<void> _filterByCategory(String? categoryId) async {
    setState(() {
      _selectedCategoryId = categoryId;
      _isLoading = true;
    });

    try {
      List<MenuItem> items;
      if (categoryId == null) {
        items = await MenuService.fetchMenuItems();
      } else {
        items = await MenuService.fetchMenuItemsByCategory(categoryId);
      }
      if (mounted) {
        setState(() {
          _menuItems = items;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _error = e.toString();
        });
      }
    }
  }

  String _getImageUrl(String? path) {
    if (path == null) return '';
    if (path.startsWith('http')) return path;
    return '${ApiConfig.baseUrl.replaceAll('/api/v1', '')}$path';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          children: [
            Text(
              _restaurantInfo?.name ?? 'Restaurant',
              style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
            ),
            const Text(
              'Delicious Food',
              style: TextStyle(color: bodyTextColor, fontSize: 12),
            )
          ],
        ),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.person, color: Colors.black),
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const MyOrdersScreen()),
            );
          },
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.location_on_outlined, color: Colors.black),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const AddressListScreen()),
              );
            },
          ),
          // Cart with badge
          Consumer<CartService>(
            builder: (context, cart, _) {
              return Stack(
                alignment: Alignment.center,
                children: [
                  IconButton(
                    icon: const Icon(Icons.shopping_cart, color: Colors.black),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => const CartScreen()),
                      );
                    },
                  ),
                  if (cart.itemCount > 0)
                    Positioned(
                      right: 6,
                      top: 6,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: primaryColor,
                          shape: BoxShape.circle,
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 18,
                          minHeight: 18,
                        ),
                        child: Text(
                          '${cart.itemCount}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadData,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: defaultPadding),

                // Categories
                if (_categories.isNotEmpty) ...[
                  SizedBox(
                    height: 40,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: defaultPadding),
                      itemCount: _categories.length + 1,
                      itemBuilder: (context, index) {
                        if (index == 0) {
                          return _buildCategoryChip('All', null);
                        }
                        final category = _categories[index - 1];
                        return _buildCategoryChip(category.name, category.id);
                      },
                    ),
                  ),
                  const SizedBox(height: defaultPadding),
                ],

                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: defaultPadding),
                  child: Text(
                    'Our Menu',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(height: defaultPadding),

                // Content
                if (_isLoading)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(40),
                      child: CircularProgressIndicator(),
                    ),
                  )
                else if (_error != null)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.all(40),
                      child: Column(
                        children: [
                          Icon(Icons.error_outline, size: 48, color: Colors.grey[400]),
                          const SizedBox(height: 16),
                          const Text('Failed to load menu'),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: _loadData,
                            child: const Text('Retry'),
                          ),
                        ],
                      ),
                    ),
                  )
                else if (_menuItems.isEmpty)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.all(40),
                      child: Column(
                        children: [
                          Icon(Icons.restaurant_menu, size: 64, color: Colors.grey[300]),
                          const SizedBox(height: 16),
                          const Text(
                            'No menu items available',
                            style: TextStyle(color: bodyTextColor),
                          ),
                        ],
                      ),
                    ),
                  )
                else
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _menuItems.length,
                    itemBuilder: (context, index) {
                      final item = _menuItems[index];
                      return Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: defaultPadding,
                          vertical: 8,
                        ),
                        child: _buildMenuItemCard(item),
                      );
                    },
                  ),
                const SizedBox(height: 100),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryChip(String name, String? categoryId) {
    final isSelected = _selectedCategoryId == categoryId;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(name),
        selected: isSelected,
        selectedColor: primaryColor,
        backgroundColor: Colors.grey[100],
        labelStyle: TextStyle(
          color: isSelected ? Colors.white : titleColor,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
        onSelected: (selected) {
          _filterByCategory(selected ? categoryId : null);
        },
      ),
    );
  }

  Widget _buildMenuItemCard(MenuItem item) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => DetailsScreen(item: item),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            // Image
            ClipRRect(
              borderRadius: const BorderRadius.horizontal(left: Radius.circular(12)),
              child: item.imageUrl != null
                  ? CachedNetworkImage(
                      imageUrl: _getImageUrl(item.imageUrl),
                      width: 100,
                      height: 100,
                      fit: BoxFit.cover,
                      placeholder: (_, __) => Container(
                        width: 100,
                        height: 100,
                        color: Colors.grey[200],
                        child: const Icon(Icons.restaurant, color: Colors.grey),
                      ),
                      errorWidget: (_, __, ___) => Container(
                        width: 100,
                        height: 100,
                        color: Colors.grey[200],
                        child: const Icon(Icons.restaurant, color: Colors.grey),
                      ),
                    )
                  : Container(
                      width: 100,
                      height: 100,
                      color: Colors.grey[200],
                      child: const Icon(Icons.restaurant, color: Colors.grey),
                    ),
            ),
            // Details
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.name,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    if (item.category != null)
                      Text(
                        item.category!.name,
                        style: const TextStyle(
                          color: primaryColor,
                          fontSize: 12,
                        ),
                      ),
                    const SizedBox(height: 4),
                    Text(
                      item.description,
                      style: const TextStyle(
                        color: bodyTextColor,
                        fontSize: 12,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '₹${item.price.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: primaryColor,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: primaryColor,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Icon(
                            Icons.add,
                            color: Colors.white,
                            size: 18,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
