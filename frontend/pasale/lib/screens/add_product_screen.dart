import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/api_service.dart';

class AddProductScreen extends StatefulWidget {
  const AddProductScreen({Key? key}) : super(key: key);

  @override
  State<AddProductScreen> createState() => _AddProductScreenState();
}

class _AddProductScreenState extends State<AddProductScreen> {
  final _formKey = GlobalKey<FormState>();
  final _productNameController = TextEditingController();
  final _priceController = TextEditingController();
  final _quantityController = TextEditingController();
  final _reorderLevelController = TextEditingController();
  
  String _selectedCategory = 'खानेकुरा';
  String _selectedUnit = 'वटा';
  bool _isLoading = false;
  
  // Predefined categories in Nepali
  final List<String> _categories = [
    'खानेकुरा',
    'मसला',
    'नास्ता / स्न्याक्स',
    'पेय पदार्थ',
    'घरेलु सामान',
    'खाना पकाउने सामग्री',
    'बच्चाको सामग्री',
    'अन्य',
  ];
  
  // Common units in Nepali
  final List<String> _units = [
    'वटा',
    'केजी',
    'ग्राम',
    'लिटर',
    'मिलिलिटर',
    'प्याकेट',
    'बोतल',
    'डब्बा',
    'रोल',
    'पिस',
  ];

  @override
  void initState() {
    super.initState();
    _reorderLevelController.text = '10'; // Set default reorder level
  }

  @override
  void dispose() {
    _productNameController.dispose();
    _priceController.dispose();
    _quantityController.dispose();
    _reorderLevelController.dispose();
    super.dispose();
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() => _isLoading = true);

    try {
      final result = await ApiService.createProduct(
        productName: _productNameController.text.trim(),
        category: _selectedCategory,
        price: double.parse(_priceController.text.trim()),
        unit: _selectedUnit,
        quantity: int.parse(_quantityController.text.trim()),
        reorderLevel: int.parse(_reorderLevelController.text.trim()),
      );

      if (result['success']) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('उत्पादन सफलतापूर्वक थपियो!'),
              backgroundColor: Colors.green,
            ),
          );
          Navigator.of(context).pop(true); // Return true to indicate success
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('त्रुटि: ${result['error']}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('त्रुटि: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('नयाँ उत्पादन थप्नुहोस्'),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Product Name
              TextFormField(
                controller: _productNameController,
                decoration: const InputDecoration(
                  labelText: 'उत्पादनको नाम *',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.inventory),
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'उत्पादनको नाम आवश्यक छ';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Category Dropdown
              DropdownButtonFormField<String>(
                value: _selectedCategory,
                decoration: const InputDecoration(
                  labelText: 'श्रेणी',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.category),
                ),
                items: _categories.map((category) {
                  return DropdownMenuItem(
                    value: category,
                    child: Text(category),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    _selectedCategory = value!;
                  });
                },
              ),
              const SizedBox(height: 16),

              // Price
              TextFormField(
                controller: _priceController,
                decoration: const InputDecoration(
                  labelText: 'मूल्य *',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.currency_rupee),
                  suffixText: 'रु.',
                ),
                keyboardType: TextInputType.number,
                inputFormatters: [
                  FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d{0,2}'))
                ],
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'मूल्य आवश्यक छ';
                  }
                  final price = double.tryParse(value.trim());
                  if (price == null || price <= 0) {
                    return 'वैध मूल्य प्रविष्ट गर्नुहोस्';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Unit Dropdown
              DropdownButtonFormField<String>(
                value: _selectedUnit,
                decoration: const InputDecoration(
                  labelText: 'एकाइ',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.straighten),
                ),
                items: _units.map((unit) {
                  return DropdownMenuItem(
                    value: unit,
                    child: Text(unit),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() {
                    _selectedUnit = value!;
                  });
                },
              ),
              const SizedBox(height: 16),

              // Initial Quantity
              TextFormField(
                controller: _quantityController,
                decoration: const InputDecoration(
                  labelText: 'प्रारम्भिक मात्रा *',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.inventory_2),
                  helperText: 'स्टकमा कति मात्रा छ?',
                ),
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'मात्रा आवश्यक छ';
                  }
                  final quantity = int.tryParse(value.trim());
                  if (quantity == null || quantity < 0) {
                    return 'वैध मात्रा प्रविष्ट गर्नुहोस्';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),

              // Reorder Level
              TextFormField(
                controller: _reorderLevelController,
                decoration: const InputDecoration(
                  labelText: 'न्यूनतम स्टक स्तर',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.warning),
                  helperText: 'यो संख्या भन्दा कम हुँदा चेतावनी दिने',
                ),
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                validator: (value) {
                  if (value != null && value.trim().isNotEmpty) {
                    final reorderLevel = int.tryParse(value.trim());
                    if (reorderLevel == null || reorderLevel < 0) {
                      return 'वैध संख्या प्रविष्ट गर्नुहोस्';
                    }
                  }
                  return null;
                },
              ),
              const SizedBox(height: 32),

              // Submit Button
              ElevatedButton(
                onPressed: _isLoading ? null : _submitForm,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : const Text(
                        'उत्पादन थप्नुहोस्',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}