import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../api_config.dart';
import '../../models/address.dart';

class OrderItem {
  final String id;
  final String? menuItemId;
  final String? menuItemName;
  final int quantity;
  final double price;
  final String? variantName;
  final double? variantPrice;
  final List<dynamic>? selectedAddons;
  final double addonsTotal;
  final double itemTotal;

  OrderItem({
    required this.id,
    this.menuItemId,
    this.menuItemName,
    required this.quantity,
    required this.price,
    this.variantName,
    this.variantPrice,
    this.selectedAddons,
    this.addonsTotal = 0,
    this.itemTotal = 0,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'],
      menuItemId: json['menuItemId'],
      menuItemName: json['menuItem']?['name'],
      quantity: json['quantity'],
      price: double.parse(json['price'].toString()),
      variantName: json['variantName'],
      variantPrice: json['variantPrice'] != null
          ? double.parse(json['variantPrice'].toString())
          : null,
      selectedAddons: json['selectedAddons'],
      addonsTotal: json['addonsTotal'] != null
          ? double.parse(json['addonsTotal'].toString())
          : 0,
      itemTotal: json['itemTotal'] != null
          ? double.parse(json['itemTotal'].toString())
          : 0,
    );
  }
}

class Order {
  final String id;
  final double totalAmount;
  final double subtotal;
  final double deliveryFee;
  final double taxAmount;
  final String status;
  final String createdAt;
  final String? specialInstructions;
  final List<OrderItem>? items;
  final Map<String, dynamic>? deliveryAddressSnapshot;
  final DeliveryZone? deliveryZone;

  Order({
    required this.id,
    required this.totalAmount,
    this.subtotal = 0,
    this.deliveryFee = 0,
    this.taxAmount = 0,
    required this.status,
    required this.createdAt,
    this.specialInstructions,
    this.items,
    this.deliveryAddressSnapshot,
    this.deliveryZone,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'],
      totalAmount: double.parse(json['totalAmount'].toString()),
      subtotal: json['subtotal'] != null
          ? double.parse(json['subtotal'].toString())
          : 0,
      deliveryFee: json['deliveryFee'] != null
          ? double.parse(json['deliveryFee'].toString())
          : 0,
      taxAmount: json['taxAmount'] != null
          ? double.parse(json['taxAmount'].toString())
          : 0,
      status: json['status'],
      createdAt: json['createdAt'],
      specialInstructions: json['specialInstructions'],
      items: json['items'] != null
          ? (json['items'] as List).map((i) => OrderItem.fromJson(i)).toList()
          : null,
      deliveryAddressSnapshot: json['deliveryAddressSnapshot'],
      deliveryZone: json['deliveryZone'] != null
          ? DeliveryZone.fromJson(json['deliveryZone'])
          : null,
    );
  }

  String get statusDisplay {
    switch (status) {
      case 'PENDING':
        return 'Order Placed';
      case 'ACCEPTED':
        return 'Accepted';
      case 'COOKING':
        return 'Preparing';
      case 'READY':
        return 'Ready for Pickup';
      case 'OUT_FOR_DELIVERY':
        return 'Out for Delivery';
      case 'COMPLETED':
        return 'Delivered';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  }
}

class OrderService {
  static Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  static Future<Map<String, String>> _getHeaders() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // Create order with full cart data
  static Future<Order> createOrder(Map<String, dynamic> orderData) async {
    final headers = await _getHeaders();
    final url = Uri.parse('${ApiConfig.baseUrl}/orders');

    final response = await http.post(
      url,
      headers: headers,
      body: jsonEncode(orderData),
    );

    if (response.statusCode == 201) {
      return Order.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to create order: ${response.body}');
    }
  }

  // Get my orders
  static Future<List<Order>> getMyOrders() async {
    final headers = await _getHeaders();
    final url = Uri.parse('${ApiConfig.baseUrl}/orders/me');
    final response = await http.get(url, headers: headers);

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Order.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load orders');
    }
  }

  // Get single order details
  static Future<Order> getOrder(String orderId) async {
    final headers = await _getHeaders();
    final url = Uri.parse('${ApiConfig.baseUrl}/orders/$orderId');
    final response = await http.get(url, headers: headers);

    if (response.statusCode == 200) {
      return Order.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load order');
    }
  }

  // Get ready orders (for driver)
  static Future<List<Order>> getReadyOrders() async {
    final headers = await _getHeaders();
    final url = Uri.parse('${ApiConfig.baseUrl}/orders/ready');
    final response = await http.get(url, headers: headers);

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Order.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load ready orders');
    }
  }

  // Update order status
  static Future<void> updateOrderStatus(String orderId, String status) async {
    final headers = await _getHeaders();
    final url = Uri.parse('${ApiConfig.baseUrl}/orders/$orderId');
    final response = await http.patch(
      url,
      headers: headers,
      body: jsonEncode({'status': status}),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to update order status: ${response.body}');
    }
  }
}
