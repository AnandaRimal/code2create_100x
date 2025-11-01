import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:8000/api/v1';
  
  // Store authentication token
  static Future<void> storeToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }
  
  // Get stored token
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }
  
  // Clear stored token
  static Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }
  
  // Register new shopkeeper
  static Future<Map<String, dynamic>> register({
    required String shopName,
    required String shopAddress,
    required String contact,
    required String password,
    String? email,
    String? pan,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/shopkeepers/register'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'shop_name': shopName,
          'shop_address': shopAddress,
          'contact': contact,
          'password': password,
          if (email != null && email.isNotEmpty) 'email': email,
          if (pan != null && pan.isNotEmpty) 'pan': pan,
        }),
      );
      
      final data = json.decode(response.body);
      
      if (response.statusCode == 201) {
        return {'success': true, 'data': data};
      } else {
        return {
          'success': false, 
          'error': data['detail'] ?? 'Registration failed'
        };
      }
    } catch (e) {
      return {
        'success': false, 
        'error': 'Network error: ${e.toString()}'
      };
    }
  }
  
  // Login shopkeeper
  static Future<Map<String, dynamic>> login({
    required String identifier, // email or contact
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/shopkeepers/login'),
        headers: {
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'identifier': identifier,
          'password': password,
        }),
      );
      
      final data = json.decode(response.body);
      
      if (response.statusCode == 200) {
        // Store the token
        await storeToken(data['access_token']);
        return {'success': true, 'data': data};
      } else {
        return {
          'success': false, 
          'error': data['detail'] ?? 'Login failed'
        };
      }
    } catch (e) {
      return {
        'success': false, 
        'error': 'Network error: ${e.toString()}'
      };
    }
  }
  
  // Get current user profile
  static Future<Map<String, dynamic>> getProfile() async {
    try {
      final token = await getToken();
      if (token == null) {
        return {'success': false, 'error': 'No token found'};
      }
      
      final response = await http.get(
        Uri.parse('$baseUrl/shopkeepers/me'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      
      final data = json.decode(response.body);
      
      if (response.statusCode == 200) {
        return {'success': true, 'data': data};
      } else {
        return {
          'success': false, 
          'error': data['detail'] ?? 'Failed to get profile'
        };
      }
    } catch (e) {
      return {
        'success': false, 
        'error': 'Network error: ${e.toString()}'
      };
    }
  }
}