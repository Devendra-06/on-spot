import 'dart:io';
import 'package:flutter/foundation.dart';

class ApiConfig {
  // Production API URL
  static const String baseUrl = 'https://onspot-2k6d.onrender.com/api/v1';

  // Uncomment below for local development
  // static String get baseUrl {
  //   if (kIsWeb) return 'http://localhost:3000/api/v1';
  //   if (Platform.isAndroid) return 'http://10.0.2.2:3000/api/v1';
  //   return 'http://localhost:3000/api/v1';
  // }
}
