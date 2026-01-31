import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../api_config.dart';
import '../../models/menu.dart';

class MenuService {
  static Future<List<Category>> fetchCategories() async {
    final response = await http.get(Uri.parse('${ApiConfig.baseUrl}/categories'));
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Category.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load categories');
    }
  }

  static Future<List<MenuItem>> fetchMenuItems({bool availableOnly = true}) async {
    final endpoint = availableOnly ? '/menus/available' : '/menus';
    final response = await http.get(Uri.parse('${ApiConfig.baseUrl}$endpoint'));
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => MenuItem.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load menu items');
    }
  }

  static Future<List<MenuItem>> fetchMenuItemsByCategory(String categoryId) async {
    final response = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/menus/available?categoryId=$categoryId'),
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => MenuItem.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load menu items');
    }
  }

  static Future<MenuItem> fetchMenuItem(String id) async {
    final response = await http.get(Uri.parse('${ApiConfig.baseUrl}/menus/$id'));
    if (response.statusCode == 200) {
      return MenuItem.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to load menu item');
    }
  }
}
