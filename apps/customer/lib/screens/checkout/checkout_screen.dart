import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/services/cart_service.dart';
import '../../core/services/address_service.dart';
import '../../core/services/order_service.dart';
import '../../core/services/restaurant_service.dart';
import '../../models/address.dart';
import '../../constants.dart';
import '../addresses/address_list_screen.dart';
import '../orderDetails/order_tracking_screen.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({Key? key}) : super(key: key);

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  bool _isLoading = true;
  bool _isPlacingOrder = false;
  List<Address> _addresses = [];
  Address? _selectedAddress;
  IsOpenResponse? _restaurantStatus;
  final TextEditingController _instructionsController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _instructionsController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    try {
      final addresses = await AddressService.getAddresses();
      final status = await RestaurantService.isOpen();

      setState(() {
        _addresses = addresses;
        _restaurantStatus = status;
        // Select default address if available
        _selectedAddress = addresses.firstWhere(
          (a) => a.isDefault,
          orElse: () => addresses.isNotEmpty ? addresses.first : Address.empty(),
        );
        if (_selectedAddress?.id == null) _selectedAddress = null;
        _isLoading = false;
      });

      // Update cart with selected address
      if (_selectedAddress != null) {
        final cart = Provider.of<CartService>(context, listen: false);
        cart.setAddress(_selectedAddress);
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading data: $e')),
        );
      }
    }
  }

  Future<void> _selectAddress() async {
    final result = await Navigator.push<Address>(
      context,
      MaterialPageRoute(
        builder: (_) => AddressListScreen(selectionMode: true),
      ),
    );

    if (result != null) {
      setState(() => _selectedAddress = result);
      final cart = Provider.of<CartService>(context, listen: false);
      cart.setAddress(result);
    }
  }

  Future<void> _placeOrder() async {
    final cart = Provider.of<CartService>(context, listen: false);

    // Validation
    if (_selectedAddress == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a delivery address')),
      );
      return;
    }

    if (!cart.meetsMinimumOrder) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Minimum order amount is ₹${cart.minimumOrderAmount.toStringAsFixed(2)}',
          ),
        ),
      );
      return;
    }

    if (_restaurantStatus != null && !_restaurantStatus!.isOpen) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_restaurantStatus!.reason ?? 'Restaurant is currently closed')),
      );
      return;
    }

    setState(() => _isPlacingOrder = true);

    try {
      // Set special instructions
      cart.setSpecialInstructions(
        _instructionsController.text.isNotEmpty ? _instructionsController.text : null,
      );

      // Create order
      final order = await OrderService.createOrder(cart.toOrderData());

      // Clear cart
      cart.clear();

      if (mounted) {
        // Navigate to order tracking
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(
            builder: (_) => OrderTrackingScreen(orderId: order.id),
          ),
          (route) => route.isFirst,
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to place order: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isPlacingOrder = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Checkout'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Consumer<CartService>(
              builder: (context, cart, _) {
                return SingleChildScrollView(
                  padding: const EdgeInsets.all(defaultPadding),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Restaurant status banner
                      if (_restaurantStatus != null && !_restaurantStatus!.isOpen)
                        _buildClosedBanner(),

                      // Delivery address section
                      _buildSectionTitle('Delivery Address'),
                      _buildAddressCard(),
                      const SizedBox(height: 24),

                      // Order summary section
                      _buildSectionTitle('Order Summary'),
                      _buildOrderSummary(cart),
                      const SizedBox(height: 24),

                      // Special instructions
                      _buildSectionTitle('Special Instructions'),
                      _buildInstructionsField(),
                      const SizedBox(height: 24),

                      // Price breakdown
                      _buildSectionTitle('Price Details'),
                      _buildPriceBreakdown(cart),
                      const SizedBox(height: 100), // Space for bottom button
                    ],
                  ),
                );
              },
            ),
      bottomSheet: _isLoading ? null : _buildBottomButton(),
    );
  }

  Widget _buildClosedBanner() {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.red[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.red[200]!),
      ),
      child: Row(
        children: [
          const Icon(Icons.access_time, color: Colors.red),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Restaurant Closed',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.red,
                  ),
                ),
                if (_restaurantStatus?.reason != null)
                  Text(
                    _restaurantStatus!.reason!,
                    style: const TextStyle(color: Colors.red, fontSize: 12),
                  ),
                if (_restaurantStatus?.openTime != null)
                  Text(
                    'Opens at ${_restaurantStatus!.openTime}',
                    style: const TextStyle(color: Colors.red, fontSize: 12),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildAddressCard() {
    if (_selectedAddress == null) {
      return GestureDetector(
        onTap: _selectAddress,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey[300]!, style: BorderStyle.solid),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Icon(Icons.add_location_alt, color: primaryColor, size: 32),
              const SizedBox(width: 12),
              const Expanded(
                child: Text(
                  'Add Delivery Address',
                  style: TextStyle(
                    fontSize: 16,
                    color: primaryColor,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              const Icon(Icons.chevron_right, color: bodyTextColor),
            ],
          ),
        ),
      );
    }

    return GestureDetector(
      onTap: _selectAddress,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                _selectedAddress!.label.toLowerCase() == 'home'
                    ? Icons.home
                    : _selectedAddress!.label.toLowerCase() == 'work'
                        ? Icons.work
                        : Icons.location_on,
                color: primaryColor,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _selectedAddress!.label,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _selectedAddress!.fullAddress,
                    style: const TextStyle(
                      color: bodyTextColor,
                      fontSize: 13,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (_selectedAddress!.deliveryZone != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      'Delivery: ₹${_selectedAddress!.deliveryZone!.deliveryFee.toStringAsFixed(2)}',
                      style: TextStyle(
                        color: Colors.green[700],
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: bodyTextColor),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderSummary(CartService cart) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
          ),
        ],
      ),
      child: Column(
        children: [
          ...cart.items.map((item) => Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 24,
                      height: 24,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: primaryColor.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        '${item.quantity}x',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                          color: primaryColor,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.menuItem.name,
                            style: const TextStyle(fontWeight: FontWeight.w500),
                          ),
                          if (item.selectedVariant != null)
                            Text(
                              item.selectedVariant!.name,
                              style: const TextStyle(
                                color: bodyTextColor,
                                fontSize: 12,
                              ),
                            ),
                          if (item.selectedAddons.isNotEmpty)
                            Text(
                              item.selectedAddons.map((a) => a.name).join(', '),
                              style: const TextStyle(
                                color: bodyTextColor,
                                fontSize: 12,
                              ),
                            ),
                        ],
                      ),
                    ),
                    Text(
                      '₹${item.itemTotal.toStringAsFixed(2)}',
                      style: const TextStyle(fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
              )),
          const Divider(),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Total Items'),
              Text('${cart.itemCount}'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInstructionsField() {
    return TextField(
      controller: _instructionsController,
      maxLines: 3,
      decoration: InputDecoration(
        hintText: 'Add any special instructions for your order...',
        hintStyle: const TextStyle(color: bodyTextColor),
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey[300]!),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey[300]!),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryColor),
        ),
      ),
    );
  }

  Widget _buildPriceBreakdown(CartService cart) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
          ),
        ],
      ),
      child: Column(
        children: [
          _buildPriceRow('Subtotal', cart.subtotal),
          const SizedBox(height: 8),
          _buildPriceRow('Delivery Fee', cart.deliveryFee),
          const SizedBox(height: 8),
          _buildPriceRow('GST (${(cart.taxRate * 100).toStringAsFixed(0)}%)', cart.taxAmount),
          if (!cart.meetsMinimumOrder) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.orange[50],
                borderRadius: BorderRadius.circular(4),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline, color: Colors.orange, size: 16),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Minimum order: ₹${cart.minimumOrderAmount.toStringAsFixed(2)}',
                      style: const TextStyle(
                        color: Colors.orange,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
          const Divider(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Total',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 18,
                ),
              ),
              Text(
                '₹${cart.totalAmount.toStringAsFixed(2)}',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 20,
                  color: primaryColor,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPriceRow(String label, double amount) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: bodyTextColor)),
        Text(
          '₹${amount.toStringAsFixed(2)}',
          style: const TextStyle(fontWeight: FontWeight.w500),
        ),
      ],
    );
  }

  Widget _buildBottomButton() {
    return Consumer<CartService>(
      builder: (context, cart, _) {
        final canOrder = _selectedAddress != null &&
            cart.meetsMinimumOrder &&
            (_restaurantStatus?.isOpen ?? true);

        return Container(
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
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: canOrder && !_isPlacingOrder ? _placeOrder : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: primaryColor,
                  disabledBackgroundColor: Colors.grey[300],
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isPlacingOrder
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : Text(
                        'Place Order • ₹${cart.totalAmount.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),
          ),
        );
      },
    );
  }
}
