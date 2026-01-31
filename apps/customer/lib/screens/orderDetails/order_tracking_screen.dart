import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../core/services/order_service.dart';
import '../../constants.dart';

class OrderTrackingScreen extends StatefulWidget {
  final String orderId;

  const OrderTrackingScreen({Key? key, required this.orderId}) : super(key: key);

  @override
  State<OrderTrackingScreen> createState() => _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends State<OrderTrackingScreen> {
  bool _isLoading = true;
  Order? _order;
  Timer? _refreshTimer;

  final List<Map<String, dynamic>> _orderSteps = [
    {'status': 'PENDING', 'title': 'Order Placed', 'icon': Icons.receipt_long},
    {'status': 'ACCEPTED', 'title': 'Order Accepted', 'icon': Icons.thumb_up},
    {'status': 'COOKING', 'title': 'Preparing', 'icon': Icons.restaurant},
    {'status': 'READY', 'title': 'Ready for Pickup', 'icon': Icons.check_circle},
    {'status': 'OUT_FOR_DELIVERY', 'title': 'Out for Delivery', 'icon': Icons.delivery_dining},
    {'status': 'COMPLETED', 'title': 'Delivered', 'icon': Icons.home},
  ];

  @override
  void initState() {
    super.initState();
    _loadOrder();
    // Auto-refresh every 30 seconds
    _refreshTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      _loadOrder(silent: true);
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadOrder({bool silent = false}) async {
    if (!silent) setState(() => _isLoading = true);
    try {
      final order = await OrderService.getOrder(widget.orderId);
      setState(() {
        _order = order;
        _isLoading = false;
      });
    } catch (e) {
      if (mounted && !silent) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  int _getCurrentStep() {
    if (_order == null) return 0;
    if (_order!.status == 'CANCELLED') return -1;
    for (int i = 0; i < _orderSteps.length; i++) {
      if (_orderSteps[i]['status'] == _order!.status) {
        return i;
      }
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Order Status'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => _loadOrder(),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _order == null
              ? const Center(child: Text('Order not found'))
              : RefreshIndicator(
                  onRefresh: _loadOrder,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(defaultPadding),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Order ID and Date
                        _buildOrderHeader(),
                        const SizedBox(height: 24),

                        // Cancelled banner
                        if (_order!.status == 'CANCELLED') _buildCancelledBanner(),

                        // Progress tracker
                        if (_order!.status != 'CANCELLED') ...[
                          _buildProgressTracker(),
                          const SizedBox(height: 24),
                        ],

                        // Delivery address
                        if (_order!.deliveryAddressSnapshot != null) ...[
                          _buildSectionTitle('Delivery Address'),
                          _buildDeliveryAddress(),
                          const SizedBox(height: 24),
                        ],

                        // Order items
                        _buildSectionTitle('Order Items'),
                        _buildOrderItems(),
                        const SizedBox(height: 24),

                        // Price breakdown
                        _buildSectionTitle('Price Details'),
                        _buildPriceBreakdown(),

                        // Special instructions
                        if (_order!.specialInstructions != null &&
                            _order!.specialInstructions!.isNotEmpty) ...[
                          const SizedBox(height: 24),
                          _buildSectionTitle('Special Instructions'),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.grey[100],
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.note, color: bodyTextColor, size: 18),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    _order!.specialInstructions!,
                                    style: const TextStyle(
                                      color: bodyTextColor,
                                      fontStyle: FontStyle.italic,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildOrderHeader() {
    final dateFormat = DateFormat('MMM dd, yyyy • hh:mm a');
    DateTime? orderDate;
    try {
      orderDate = DateTime.parse(_order!.createdAt);
    } catch (_) {}

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: primaryColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: primaryColor,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.receipt, color: Colors.white),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Order #${_order!.id.substring(0, 8).toUpperCase()}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 4),
                if (orderDate != null)
                  Text(
                    dateFormat.format(orderDate.toLocal()),
                    style: const TextStyle(
                      color: bodyTextColor,
                      fontSize: 13,
                    ),
                  ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: _getStatusColor(_order!.status),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              _order!.statusDisplay,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCancelledBanner() {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 24),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.red[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.red[200]!),
      ),
      child: Row(
        children: [
          Icon(Icons.cancel, color: Colors.red[700], size: 32),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Order Cancelled',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.red[700],
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'This order has been cancelled.',
                  style: TextStyle(color: Colors.red[700], fontSize: 13),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgressTracker() {
    final currentStep = _getCurrentStep();

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
        children: List.generate(_orderSteps.length, (index) {
          final step = _orderSteps[index];
          final isCompleted = index <= currentStep;
          final isCurrent = index == currentStep;

          return Column(
            children: [
              Row(
                children: [
                  // Icon
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: isCompleted ? primaryColor : Colors.grey[200],
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      step['icon'],
                      color: isCompleted ? Colors.white : Colors.grey,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 16),
                  // Title
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          step['title'],
                          style: TextStyle(
                            fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                            color: isCompleted ? titleColor : bodyTextColor,
                          ),
                        ),
                        if (isCurrent)
                          Text(
                            'Current Status',
                            style: TextStyle(
                              fontSize: 12,
                              color: primaryColor,
                            ),
                          ),
                      ],
                    ),
                  ),
                  // Check mark
                  if (isCompleted && !isCurrent)
                    Icon(
                      Icons.check_circle,
                      color: Colors.green[600],
                      size: 20,
                    ),
                ],
              ),
              // Connector line
              if (index < _orderSteps.length - 1)
                Padding(
                  padding: const EdgeInsets.only(left: 19),
                  child: Row(
                    children: [
                      Container(
                        width: 2,
                        height: 30,
                        color: index < currentStep ? primaryColor : Colors.grey[300],
                      ),
                    ],
                  ),
                ),
            ],
          );
        }),
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

  Widget _buildDeliveryAddress() {
    final addr = _order!.deliveryAddressSnapshot!;
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
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: primaryColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.location_on, color: primaryColor),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  addr['label'] ?? 'Delivery Address',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  [
                    addr['addressLine1'],
                    addr['addressLine2'],
                    addr['city'],
                    addr['state'],
                    addr['postalCode'],
                  ].where((e) => e != null && e.toString().isNotEmpty).join(', '),
                  style: const TextStyle(color: bodyTextColor, fontSize: 13),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderItems() {
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
          if (_order!.items != null)
            ..._order!.items!.map((item) => Padding(
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
                              item.menuItemName ?? 'Item',
                              style: const TextStyle(fontWeight: FontWeight.w500),
                            ),
                            if (item.variantName != null)
                              Text(
                                item.variantName!,
                                style: const TextStyle(
                                  color: bodyTextColor,
                                  fontSize: 12,
                                ),
                              ),
                            if (item.selectedAddons != null &&
                                (item.selectedAddons as List).isNotEmpty)
                              Text(
                                (item.selectedAddons as List)
                                    .map((a) => a['name'])
                                    .join(', '),
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
        ],
      ),
    );
  }

  Widget _buildPriceBreakdown() {
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
          _buildPriceRow('Subtotal', _order!.subtotal),
          const SizedBox(height: 8),
          _buildPriceRow('Delivery Fee', _order!.deliveryFee),
          const SizedBox(height: 8),
          _buildPriceRow('GST', _order!.taxAmount),
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
                '₹${_order!.totalAmount.toStringAsFixed(2)}',
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

  Color _getStatusColor(String status) {
    switch (status) {
      case 'PENDING':
        return Colors.orange;
      case 'ACCEPTED':
        return Colors.blue;
      case 'COOKING':
        return Colors.deepOrange;
      case 'READY':
        return Colors.teal;
      case 'OUT_FOR_DELIVERY':
        return Colors.purple;
      case 'COMPLETED':
        return Colors.green;
      case 'CANCELLED':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}
