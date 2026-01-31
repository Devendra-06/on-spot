import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../constants.dart';
import '../../models/menu.dart';
import '../../core/services/cart_service.dart';
import '../../api_config.dart';

class DetailsScreen extends StatefulWidget {
  final MenuItem item;

  const DetailsScreen({Key? key, required this.item}) : super(key: key);

  @override
  State<DetailsScreen> createState() => _DetailsScreenState();
}

class _DetailsScreenState extends State<DetailsScreen> {
  MenuVariant? _selectedVariant;
  final Set<MenuAddon> _selectedAddons = {};
  int _quantity = 1;

  @override
  void initState() {
    super.initState();
    // Auto-select first available variant if variants exist
    if (widget.item.hasVariants) {
      final availableVariants = widget.item.variants.where((v) => v.isAvailable && v.inStock);
      if (availableVariants.isNotEmpty) {
        _selectedVariant = availableVariants.first;
      }
    }
  }

  double get _unitPrice {
    return _selectedVariant?.price ?? widget.item.price;
  }

  double get _addonsTotal {
    return _selectedAddons.fold(0, (sum, addon) => sum + addon.price);
  }

  double get _itemTotal {
    return (_unitPrice + _addonsTotal) * _quantity;
  }

  String _getImageUrl(String? path) {
    if (path == null) return '';
    if (path.startsWith('http')) return path;
    return '${ApiConfig.baseUrl.replaceAll('/api/v1', '')}$path';
  }

  void _addToCart() {
    // Validate variant selection if variants exist
    if (widget.item.hasVariants && _selectedVariant == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a size/variant')),
      );
      return;
    }

    // Check for required addons
    final requiredAddons = widget.item.addons.where((a) => a.isRequired && a.isAvailable);
    for (var addon in requiredAddons) {
      if (!_selectedAddons.contains(addon)) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Please select ${addon.name} (required)')),
        );
        return;
      }
    }

    final cartService = Provider.of<CartService>(context, listen: false);
    cartService.addItem(
      menuItem: widget.item,
      variant: _selectedVariant,
      addons: _selectedAddons.toList(),
      quantity: _quantity,
    );

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('${widget.item.name} added to cart'),
        action: SnackBarAction(
          label: 'View Cart',
          onPressed: () {
            Navigator.pushNamed(context, '/cart');
          },
        ),
      ),
    );
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // App Bar with Image
          SliverAppBar(
            expandedHeight: 250,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: widget.item.imageUrl != null
                  ? CachedNetworkImage(
                      imageUrl: _getImageUrl(widget.item.imageUrl),
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(
                        color: Colors.grey[200],
                        child: const Center(child: CircularProgressIndicator()),
                      ),
                      errorWidget: (context, url, error) => Container(
                        color: Colors.grey[200],
                        child: const Icon(Icons.restaurant, size: 50, color: Colors.grey),
                      ),
                    )
                  : Container(
                      color: Colors.grey[200],
                      child: const Icon(Icons.restaurant, size: 50, color: Colors.grey),
                    ),
            ),
          ),

          // Content
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(defaultPadding),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Name and availability
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          widget.item.name,
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                      ),
                      if (!widget.item.inStock)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.red[100],
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text(
                            'Out of Stock',
                            style: TextStyle(color: Colors.red, fontSize: 12),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Base price
                  if (!widget.item.hasVariants)
                    Text(
                      '₹${widget.item.price.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: primaryColor,
                      ),
                    ),
                  const SizedBox(height: 12),

                  // Description
                  if (widget.item.description.isNotEmpty)
                    Text(
                      widget.item.description,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: bodyTextColor,
                          ),
                    ),
                  const SizedBox(height: 24),

                  // Variants Section
                  if (widget.item.hasVariants) ...[
                    Text(
                      'Select Size',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 12),
                    _buildVariantSelector(),
                    const SizedBox(height: 24),
                  ],

                  // Addons Section
                  if (widget.item.hasAddons) ...[
                    _buildAddonsSection(),
                    const SizedBox(height: 24),
                  ],

                  // Quantity Selector
                  _buildQuantitySelector(),
                  const SizedBox(height: 100), // Space for bottom button
                ],
              ),
            ),
          ),
        ],
      ),

      // Bottom Add to Cart Button
      bottomSheet: Container(
        padding: const EdgeInsets.all(defaultPadding),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: SafeArea(
          child: Row(
            children: [
              // Price display
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Total',
                      style: TextStyle(color: bodyTextColor, fontSize: 12),
                    ),
                    Text(
                      '₹${_itemTotal.toStringAsFixed(2)}',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: titleColor,
                      ),
                    ),
                  ],
                ),
              ),
              // Add to Cart button
              Expanded(
                flex: 2,
                child: ElevatedButton(
                  onPressed: widget.item.inStock ? _addToCart : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryColor,
                    disabledBackgroundColor: Colors.grey[300],
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    widget.item.inStock ? 'Add to Cart' : 'Out of Stock',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildVariantSelector() {
    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: widget.item.variants.map((variant) {
        final isSelected = _selectedVariant?.id == variant.id;
        final isAvailable = variant.isAvailable && variant.inStock;

        return GestureDetector(
          onTap: isAvailable
              ? () {
                  setState(() {
                    _selectedVariant = variant;
                  });
                }
              : null,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: isSelected ? primaryColor : Colors.white,
              border: Border.all(
                color: isSelected ? primaryColor : (isAvailable ? Colors.grey[300]! : Colors.grey[200]!),
                width: isSelected ? 2 : 1,
              ),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Column(
              children: [
                Text(
                  variant.name,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: isAvailable
                        ? (isSelected ? Colors.white : titleColor)
                        : Colors.grey,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '₹${variant.price.toStringAsFixed(2)}',
                  style: TextStyle(
                    fontSize: 13,
                    color: isAvailable
                        ? (isSelected ? Colors.white70 : bodyTextColor)
                        : Colors.grey,
                  ),
                ),
                if (!isAvailable)
                  const Text(
                    'Unavailable',
                    style: TextStyle(fontSize: 10, color: Colors.red),
                  ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildAddonsSection() {
    final groupedAddons = widget.item.groupedAddons;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: groupedAddons.entries.map((entry) {
        final groupName = entry.key;
        final addons = entry.value;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  groupName,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                if (addons.any((a) => a.isRequired))
                  Container(
                    margin: const EdgeInsets.only(left: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.red[50],
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'Required',
                      style: TextStyle(fontSize: 10, color: Colors.red),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            ...addons.map((addon) => _buildAddonItem(addon)),
            const SizedBox(height: 16),
          ],
        );
      }).toList(),
    );
  }

  Widget _buildAddonItem(MenuAddon addon) {
    final isSelected = _selectedAddons.contains(addon);
    final isAvailable = addon.isAvailable;

    return InkWell(
      onTap: isAvailable
          ? () {
              setState(() {
                if (isSelected) {
                  _selectedAddons.remove(addon);
                } else {
                  _selectedAddons.add(addon);
                }
              });
            }
          : null,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: [
            // Checkbox
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: isSelected ? primaryColor : Colors.white,
                border: Border.all(
                  color: isSelected ? primaryColor : (isAvailable ? Colors.grey[400]! : Colors.grey[300]!),
                  width: 2,
                ),
                borderRadius: BorderRadius.circular(6),
              ),
              child: isSelected
                  ? const Icon(Icons.check, size: 16, color: Colors.white)
                  : null,
            ),
            const SizedBox(width: 12),
            // Name
            Expanded(
              child: Text(
                addon.name,
                style: TextStyle(
                  fontSize: 15,
                  color: isAvailable ? titleColor : Colors.grey,
                ),
              ),
            ),
            // Price
            Text(
              '+₹${addon.price.toStringAsFixed(2)}',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: isAvailable ? primaryColor : Colors.grey,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuantitySelector() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            'Quantity',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          Row(
            children: [
              // Decrease button
              IconButton(
                onPressed: _quantity > 1
                    ? () {
                        setState(() {
                          _quantity--;
                        });
                      }
                    : null,
                icon: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: _quantity > 1 ? primaryColor : Colors.grey[300],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    Icons.remove,
                    color: _quantity > 1 ? Colors.white : Colors.grey,
                    size: 20,
                  ),
                ),
              ),
              // Quantity display
              Container(
                width: 50,
                alignment: Alignment.center,
                child: Text(
                  '$_quantity',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              // Increase button
              IconButton(
                onPressed: () {
                  setState(() {
                    _quantity++;
                  });
                },
                icon: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: primaryColor,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.add,
                    color: Colors.white,
                    size: 20,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
