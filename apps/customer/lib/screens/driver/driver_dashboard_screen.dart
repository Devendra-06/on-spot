import 'package:flutter/material.dart';
import '../../core/services/order_service.dart';
import '../../constants.dart';

class DriverDashboardScreen extends StatefulWidget {
  const DriverDashboardScreen({Key? key}) : super(key: key);

  @override
  State<DriverDashboardScreen> createState() => _DriverDashboardScreenState();
}

class _DriverDashboardScreenState extends State<DriverDashboardScreen> {
  late Future<List<Order>> _ordersFuture;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _ordersFuture = OrderService.getReadyOrders();
  }

  Future<void> _refresh() async {
    setState(() {
      _ordersFuture = OrderService.getReadyOrders();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Delivery Partner Dashboard")),
      body: FutureBuilder<List<Order>>(
        future: _ordersFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text("Error: ${snapshot.error}"));
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text("No orders ready for delivery"));
          }

          final orders = snapshot.data!;
          return RefreshIndicator(
            onRefresh: _refresh,
            child: ListView.builder(
              itemCount: orders.length,
              itemBuilder: (context, index) {
                final order = orders[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: defaultPadding, vertical: 8),
                  child: ListTile(
                    title: Text("Order #${order.id.substring(0, 8)}"),
                    subtitle: Text("Status: ${order.status}"),
                    trailing: ElevatedButton(
                        onPressed: _isLoading 
                          ? null 
                          : () async {
                           setState(() => _isLoading = true);
                           try {
                             await OrderService.updateOrderStatus(order.id, 'OUT_FOR_DELIVERY');
                             if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Order Claimed!")));
                                _refresh();
                             }
                           } catch (e) {
                             if (mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e")));
                             }
                           } finally {
                             if (mounted) setState(() => _isLoading = false);
                           }
                        },
                        style: ElevatedButton.styleFrom(backgroundColor: primaryColor),
                        child: _isLoading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text("Claim")
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
