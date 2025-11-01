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
  
  // Get all products for current shopkeeper
  static Future<Map<String, dynamic>> getProducts({
    int page = 1,
    int pageSize = 50,
    String? search,
    String? category,
    bool includeInactive = false,
  }) async {
    try {
      final token = await getToken();
      
      if (token == null) {
        return {'success': false, 'error': 'No token found'};
      }
      
      // Build query parameters
      Map<String, String> queryParams = {
        'page': page.toString(),
        'page_size': pageSize.toString(),
        'include_inactive': includeInactive.toString(),
      };
      
      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }
      
      if (category != null && category.isNotEmpty) {
        queryParams['category'] = category;
      }
      
      final uri = Uri.parse('$baseUrl/products/').replace(
        queryParameters: queryParams,
      );
      
      final response = await http.get(
        uri,
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
          'error': data['detail'] ?? 'Failed to get products'
        };
      }
    } catch (e) {
      return {
        'success': false, 
        'error': 'Network error: ${e.toString()}'
      };
    }
  }
  
  // Get unique categories from products
  static Future<Map<String, dynamic>> getCategories() async {
    try {
      final token = await getToken();
      if (token == null) {
        return {'success': false, 'error': 'No token found'};
      }
      
      final response = await http.get(
        Uri.parse('$baseUrl/products/categories'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      
      final data = json.decode(response.body);
      
      if (response.statusCode == 200) {
        return {'success': true, 'data': data};
      } else {
        // If categories endpoint doesn't exist, fallback to getting products and extracting categories
        final productsResult = await getProducts(pageSize: 1000);
        if (productsResult['success']) {
          final products = productsResult['data']['products'] as List;
          final categories = products
              .map((p) => p['category'] as String)
              .toSet()
              .toList();
          return {'success': true, 'data': categories};
        }
        return {
          'success': false, 
          'error': data['detail'] ?? 'Failed to get categories'
        };
      }
    } catch (e) {
      return {
        'success': false, 
        'error': 'Network error: ${e.toString()}'
      };
    }
  }

  // Create a new product
  static Future<Map<String, dynamic>> createProduct({
    required String productName,
    required String category,
    required double price,
    required String unit,
    required int quantity,
    int openingStock = 0,
    int reorderLevel = 10,
  }) async {
    try {
      final token = await getToken();
      if (token == null) {
        return {'success': false, 'error': 'No token found'};
      }
      
      final response = await http.post(
        Uri.parse('$baseUrl/products/'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode({
          'product_name': productName,
          'category': category,
          'price': price,
          'unit': unit,
          'quantity': quantity,
          'opening_stock': openingStock,
          'reorder_level': reorderLevel,
        }),
      );
      
      final data = json.decode(response.body);
      
      if (response.statusCode == 201) {
        return {'success': true, 'data': data};
      } else {
        return {
          'success': false, 
          'error': data['detail'] ?? 'Failed to create product'
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