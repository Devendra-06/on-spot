import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../api_config.dart';

class RestaurantInfo {
  final String name;
  final String? logoPath;

  RestaurantInfo({required this.name, this.logoPath});

  factory RestaurantInfo.fromJson(Map<String, dynamic> json) {
    return RestaurantInfo(
      name: json['name'] ?? 'Restaurant',
      logoPath: json['logo']?['path'],
    );
  }

  String? get logoUrl {
    if (logoPath == null) return null;
    if (logoPath!.startsWith('http')) return logoPath;
    return '${ApiConfig.baseUrl.replaceAll('/api/v1', '')}$logoPath';
  }
}

class OpeningHour {
  final String open;
  final String close;
  final bool closed;

  OpeningHour({required this.open, required this.close, this.closed = false});

  factory OpeningHour.fromJson(Map<String, dynamic> json) {
    return OpeningHour(
      open: json['open'] ?? '09:00',
      close: json['close'] ?? '22:00',
      closed: json['closed'] ?? false,
    );
  }
}

class RestaurantProfile {
  final String name;
  final String? description;
  final String? phone;
  final String? email;
  final String? address;
  final String? city;
  final String? state;
  final String? zipCode;
  final String? logoPath;
  final Map<String, OpeningHour> openingHours;

  RestaurantProfile({
    required this.name,
    this.description,
    this.phone,
    this.email,
    this.address,
    this.city,
    this.state,
    this.zipCode,
    this.logoPath,
    this.openingHours = const {},
  });

  factory RestaurantProfile.fromJson(Map<String, dynamic> json) {
    final hours = <String, OpeningHour>{};
    if (json['openingHours'] != null) {
      (json['openingHours'] as Map<String, dynamic>).forEach((key, value) {
        hours[key] = OpeningHour.fromJson(value);
      });
    }

    return RestaurantProfile(
      name: json['name'] ?? 'Restaurant',
      description: json['description'],
      phone: json['phone'],
      email: json['email'],
      address: json['address'],
      city: json['city'],
      state: json['state'],
      zipCode: json['zipCode'],
      logoPath: json['logo']?['path'],
      openingHours: hours,
    );
  }

  String? get logoUrl {
    if (logoPath == null) return null;
    if (logoPath!.startsWith('http')) return logoPath;
    return '${ApiConfig.baseUrl.replaceAll('/api/v1', '')}$logoPath';
  }

  String get fullAddress {
    final parts = <String>[];
    if (address != null) parts.add(address!);
    if (city != null) parts.add(city!);
    if (state != null) parts.add(state!);
    if (zipCode != null) parts.add(zipCode!);
    return parts.join(', ');
  }
}

class IsOpenResponse {
  final bool isOpen;
  final String? reason;
  final String? openTime;
  final String? closeTime;

  IsOpenResponse({
    required this.isOpen,
    this.reason,
    this.openTime,
    this.closeTime,
  });

  factory IsOpenResponse.fromJson(Map<String, dynamic> json) {
    return IsOpenResponse(
      isOpen: json['isOpen'] ?? false,
      reason: json['reason'],
      openTime: json['currentHours']?['open'],
      closeTime: json['currentHours']?['close'],
    );
  }
}

class RestaurantService {
  // Get public restaurant info (no auth required)
  static Future<RestaurantInfo> getPublicInfo() async {
    final response = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/restaurant-profile/public'),
    );

    if (response.statusCode == 200) {
      return RestaurantInfo.fromJson(jsonDecode(response.body));
    } else {
      // Return default if not found
      return RestaurantInfo(name: 'Restaurant');
    }
  }

  // Check if restaurant is open
  static Future<IsOpenResponse> isOpen() async {
    final response = await http.get(
      Uri.parse('${ApiConfig.baseUrl}/restaurant-profile/is-open'),
    );

    if (response.statusCode == 200) {
      return IsOpenResponse.fromJson(jsonDecode(response.body));
    } else {
      return IsOpenResponse(isOpen: true);
    }
  }
}
