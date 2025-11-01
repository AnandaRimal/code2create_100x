import 'dart:convert';
import 'package:http/http.dart' as http;

void main() async {
  print('Testing Flutter API call...');
  
  const baseUrl = 'http://localhost:8000/api/v1';
  
  try {
    final response = await http.post(
      Uri.parse('$baseUrl/shopkeepers/login'),
      headers: {
        'Content-Type': 'application/json',
      },
      body: json.encode({
        'identifier': '9800000001',
        'password': 'password123',
      }),
    );
    
    print('Status Code: ${response.statusCode}');
    print('Response Body: ${response.body}');
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      print('Parsed Data: $data');
      print('Access Token: ${data['access_token']}');
      print('Shop Name: ${data['shopkeeper']['shop_name']}');
    } else {
      print('Login failed with status: ${response.statusCode}');
    }
    
  } catch (e) {
    print('Error: $e');
  }
}