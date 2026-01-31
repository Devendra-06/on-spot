class DeliveryZone {
  final String id;
  final String name;
  final String? description;
  final double deliveryFee;
  final double? minimumOrder;
  final int? estimatedDeliveryMinutes;
  final bool isActive;

  DeliveryZone({
    required this.id,
    required this.name,
    this.description,
    required this.deliveryFee,
    this.minimumOrder,
    this.estimatedDeliveryMinutes,
    this.isActive = true,
  });

  factory DeliveryZone.fromJson(Map<String, dynamic> json) {
    return DeliveryZone(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      deliveryFee: double.parse(json['deliveryFee'].toString()),
      minimumOrder: json['minimumOrder'] != null
          ? double.parse(json['minimumOrder'].toString())
          : null,
      estimatedDeliveryMinutes: json['estimatedDeliveryMinutes'],
      isActive: json['isActive'] ?? true,
    );
  }
}

class Address {
  final String id;
  final String label;
  final String addressLine1;
  final String? addressLine2;
  final String city;
  final String? state;
  final String postalCode;
  final String? country;
  final double? latitude;
  final double? longitude;
  final String? instructions;
  final bool isDefault;
  final DeliveryZone? deliveryZone;

  Address({
    required this.id,
    required this.label,
    required this.addressLine1,
    this.addressLine2,
    required this.city,
    this.state,
    required this.postalCode,
    this.country,
    this.latitude,
    this.longitude,
    this.instructions,
    this.isDefault = false,
    this.deliveryZone,
  });

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      id: json['id'],
      label: json['label'],
      addressLine1: json['addressLine1'],
      addressLine2: json['addressLine2'],
      city: json['city'],
      state: json['state'],
      postalCode: json['postalCode'],
      country: json['country'],
      latitude: json['latitude'] != null
          ? double.parse(json['latitude'].toString())
          : null,
      longitude: json['longitude'] != null
          ? double.parse(json['longitude'].toString())
          : null,
      instructions: json['instructions'],
      isDefault: json['isDefault'] ?? false,
      deliveryZone: json['deliveryZone'] != null
          ? DeliveryZone.fromJson(json['deliveryZone'])
          : null,
    );
  }

  factory Address.empty() {
    return Address(
      id: '',
      label: '',
      addressLine1: '',
      city: '',
      postalCode: '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'label': label,
      'addressLine1': addressLine1,
      'addressLine2': addressLine2,
      'city': city,
      'state': state,
      'postalCode': postalCode,
      'country': country,
      'latitude': latitude,
      'longitude': longitude,
      'instructions': instructions,
      'isDefault': isDefault,
    };
  }

  String get fullAddress {
    final parts = [addressLine1];
    if (addressLine2 != null && addressLine2!.isNotEmpty) {
      parts.add(addressLine2!);
    }
    parts.add(city);
    if (state != null && state!.isNotEmpty) {
      parts.add(state!);
    }
    parts.add(postalCode);
    return parts.join(', ');
  }
}
