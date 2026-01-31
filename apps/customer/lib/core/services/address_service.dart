import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../api_config.dart';
import '../../models/address.dart';

class AddressService {
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

  // Get all addresses for current user
  static Future<List<Address>> getAddresses() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/addresses'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Address.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load addresses: ${response.body}');
    }
  }

  // Get default address
  static Future<Address?> getDefaultAddress() async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/addresses/default'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return Address.fromJson(data);
    } else if (response.statusCode == 404) {
      return null;
    } else {
      throw Exception('Failed to load default address: ${response.body}');
    }
  }

  // Create new address
  static Future<Address> createAddress(Address address) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('${ApiConfig.baseUrl}/addresses'),
      headers: headers,
      body: jsonEncode(address.toJson()),
    );

    if (response.statusCode == 201) {
      return Address.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to create address: ${response.body}');
    }
  }

  // Update address
  static Future<Address> updateAddress(String id, Address address) async {
    final headers = await _getHeaders();
    final response = await http.patch(
      Uri.parse('${ApiConfig.baseUrl}/addresses/$id'),
      headers: headers,
      body: jsonEncode(address.toJson()),
    );

    if (response.statusCode == 200) {
      return Address.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to update address: ${response.body}');
    }
  }

  // Delete address
  static Future<void> deleteAddress(String id) async {
    final headers = await _getHeaders();
    final response = await http.delete(
      Uri.parse('${ApiConfig.baseUrl}/addresses/$id'),
      headers: headers,
    );

    if (response.statusCode != 200 && response.statusCode != 204) {
      throw Exception('Failed to delete address: ${response.body}');
    }
  }

  // Set address as default
  static Future<Address> setDefault(String id) async {
    final headers = await _getHeaders();
    final response = await http.patch(
      Uri.parse('${ApiConfig.baseUrl}/addresses/$id/default'),
      headers: headers,
    );

    if (response.statusCode == 200) {
      return Address.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to set default address: ${response.body}');
    }
  }

  // Check deliverability by postal code
  static Future<DeliveryZone?> checkDeliverability(String postalCode) async {
    final response = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/delivery-zones/check/$postalCode'),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['deliverable'] == true && data['zone'] != null) {
        return DeliveryZone.fromJson(data['zone']);
      }
      return null;
    } else {
      return null;
    }
  }
}
