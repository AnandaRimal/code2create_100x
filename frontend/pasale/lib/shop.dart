import 'package:flutter/material.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:permission_handler/permission_handler.dart';
import 'screens/dashboard_page.dart';
import 'screens/add_product_screen.dart';
import 'services/api_service.dart';
import 'models/product.dart';

void main() {
  runApp(NepalShopApp());
}

class NepalShopApp extends StatelessWidget {
  const NepalShopApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'पसले',
      theme: ThemeData(
        primarySwatch: Colors.green,
        primaryColor: Color(0xFF1E88E5),
        fontFamily: 'Roboto',
      ),
      home: ShopHomePage(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class ShopHomePage extends StatefulWidget {
  const ShopHomePage({super.key});

  @override
  _ShopHomePageState createState() => _ShopHomePageState();
}

class _ShopHomePageState extends State<ShopHomePage> with TickerProviderStateMixin {
  final TextEditingController _searchController = TextEditingController();
  String _selectedCategory = 'सबै';
  List<Product> _filteredProducts = [];
  List<Product> _products = [];
  List<String> _categories = ['सबै'];
  bool _isLoadingProducts = true;
  bool _isLoadingCategories = true;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  final List<SaleRecord> _sales = [];

  // Voice recognition fields
  late stt.SpeechToText _speech;
  bool _isListening = false;

  // Bottom Navbar index
  int _selectedNavbarIndex = 0;

  @override
  void initState() {
    super.initState();
    
    _animationController = AnimationController(
      duration: Duration(milliseconds: 300),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(_animationController);
    _animationController.forward();

    _speech = stt.SpeechToText();
    
    // Load data from API
    _loadProducts();
    _loadCategories();
  }

  Future<void> _loadProducts() async {
    setState(() => _isLoadingProducts = true);
    
    try {
      final result = await ApiService.getProducts(pageSize: 1000);
      
      if (result['success']) {
        final productsList = result['data']['products'] as List;
        setState(() {
          _products = productsList.map((p) => Product.fromJson(p)).toList();
          _filterProducts();
          _isLoadingProducts = false;
        });
      } else {
        // Handle error - maybe show a snackbar
        setState(() => _isLoadingProducts = false);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('त्रुटि: ${result['error']}')),
          );
        }
      }
    } catch (e) {
      setState(() => _isLoadingProducts = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('त्रुटि: $e')),
        );
      }
    }
  }

  Future<void> _loadCategories() async {
    setState(() => _isLoadingCategories = true);
    
    try {
      final result = await ApiService.getCategories();
      if (result['success']) {
        final categoriesList = result['data'] as List;
        setState(() {
          _categories = ['सबै', ...categoriesList.cast<String>()];
          _isLoadingCategories = false;
        });
      } else {
        setState(() => _isLoadingCategories = false);
      }
    } catch (e) {
      setState(() => _isLoadingCategories = false);
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  void _filterProducts() {
    setState(() {
      _filteredProducts = _products.where((product) {
        bool matchesCategory = _selectedCategory == 'सबै' || product.category == _selectedCategory;
        bool matchesSearch = _searchController.text.isEmpty ||
            product.name.toLowerCase().contains(_searchController.text.toLowerCase());
        return matchesCategory && matchesSearch;
      }).toList();
    });
  }

  void _updateProductQuantity(Product product, int change) {
    setState(() {
      // Create a new product with updated quantity since quantity is final
      final updatedProduct = product.copyWith(quantity: product.quantity + change);
      final index = _products.indexWhere((p) => p.productId == product.productId);
      if (index != -1) {
        _products[index] = updatedProduct;
        _filterProducts();
      }
      
      if (change > 0) {
        _sales.add(SaleRecord(
          productName: product.name,
          time: DateTime.now(),
          quantity: change,
          totalAmount: product.price * change,
          type: 'buy',
        ));
      } else if (change < 0) {
        _sales.add(SaleRecord(
          productName: product.name,
          time: DateTime.now(),
          quantity: -change,
          totalAmount: product.price * (-change),
          type: 'sell',
        ));
      }
    });
  }

  void _sellProduct(Product product) {
    if (product.quantity > 0) {
      _updateProductQuantity(product, -1);
    }
  }

  void _buyProduct(Product product) {
    _updateProductQuantity(product, 1);
  }

  Future<void> _openAddProductForm() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const AddProductScreen(),
      ),
    );
    
    // If a product was successfully added, refresh the product list
    if (result == true) {
      _loadProducts();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: Text('🏪 पसले'),
        backgroundColor: Color(0xFF1E88E5),
        foregroundColor: Colors.white,
        elevation: 2,
        actions: [
          IconButton(
            icon: Icon(Icons.dashboard),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => DashboardPage(sales: _sales, products: _products)),
              );
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Search and Filter Section
          Container(
            padding: EdgeInsets.all(16.0),
            color: Colors.white,
            child: Column(
              children: [
                // Search Bar
                Container(
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey[300]!),
                  ),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (value) => _filterProducts(),
                    decoration: InputDecoration(
                      hintText: 'सामान खोज्नुहोस्...',
                      prefixIcon: Icon(Icons.search, color: Colors.grey[600]),
                      suffixIcon: _searchController.text.isNotEmpty
                          ? IconButton(
                              icon: Icon(Icons.clear, color: Colors.grey[600]),
                              onPressed: () {
                                _searchController.clear();
                                _filterProducts();
                              },
                            )
                          : IconButton(
                              icon: Icon(Icons.mic, color: Colors.blue),
                              onPressed: _listen,
                            ),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                  ),
                ),
                SizedBox(height: 12),
                // Category Filter
                Container(
                  height: 40,
                  child: _isLoadingCategories
                      ? Center(child: CircularProgressIndicator())
                      : ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: _categories.length,
                          itemBuilder: (context, index) {
                            final category = _categories[index];
                            final isSelected = category == _selectedCategory;
                            return Container(
                              margin: EdgeInsets.only(right: 8),
                              child: FilterChip(
                                label: Text(category),
                                selected: isSelected,
                                onSelected: (selected) {
                                  setState(() {
                                    _selectedCategory = category;
                                    _filterProducts();
                                  });
                                },
                                backgroundColor: Colors.grey[200],
                                selectedColor: Color(0xFF1E88E5),
                                labelStyle: TextStyle(
                                  color: isSelected ? Colors.white : Colors.black87,
                                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                ),
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
          ),
          // Products Grid
          Expanded(
            child: _isLoadingProducts
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(),
                        SizedBox(height: 16),
                        Text('सामानहरू लोड गर्दै...'),
                      ],
                    ),
                  )
                : _filteredProducts.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.inbox_outlined, size: 64, color: Colors.grey),
                            SizedBox(height: 16),
                            Text(
                              'कुनै सामान फेला परेन',
                              style: TextStyle(fontSize: 18, color: Colors.grey[600]),
                            ),
                          ],
                        ),
                      )
                    : AnimatedBuilder(
                        animation: _fadeAnimation,
                        builder: (context, child) {
                          return Opacity(
                            opacity: _fadeAnimation.value,
                            child: GridView.builder(
                              padding: EdgeInsets.all(16),
                              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                childAspectRatio: 0.75,
                                crossAxisSpacing: 12,
                                mainAxisSpacing: 12,
                              ),
                              itemCount: _filteredProducts.length,
                              itemBuilder: (context, index) {
                                final product = _filteredProducts[index];
                                return _buildProductCard(product);
                              },
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedNavbarIndex,
        onTap: (index) {
          setState(() {
            _selectedNavbarIndex = index;
          });
          if (index == 1) {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => DashboardPage(sales: _sales, products: _products)),
            );
          }
        },
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.store),
            label: 'पसल',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.dashboard),
            label: 'ड्यासबोर्ड',
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _openAddProductForm,
        backgroundColor: Colors.green,
        child: Icon(Icons.add, color: Colors.white),
        tooltip: 'नयाँ उत्पादन थप्नुहोस्',
      ),
    );
  }

  Widget _buildProductCard(Product product) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with quantity
          Container(
            padding: EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Color(0xFF1E88E5),
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(12),
                topRight: Radius.circular(12),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    product.name,
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${product.quantity}',
                    style: TextStyle(
                      color: Color(0xFF1E88E5),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Content
          Expanded(
            child: Padding(
              padding: EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.category,
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 12,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'रु. ${product.price.toStringAsFixed(0)}/${product.unit}',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.green[700],
                    ),
                  ),
                  Spacer(),
                  // Action buttons
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _buyProduct(product),
                          icon: Icon(Icons.add, size: 16),
                          label: Text('किन्नुहोस्', style: TextStyle(fontSize: 12)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green,
                            foregroundColor: Colors.white,
                            padding: EdgeInsets.symmetric(vertical: 8),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                        ),
                      ),
                      SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: product.quantity > 0 ? () => _sellProduct(product) : null,
                          icon: Icon(Icons.remove, size: 16),
                          label: Text('बेच्नुहोस्', style: TextStyle(fontSize: 12)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: product.quantity > 0 ? Colors.orange : Colors.grey,
                            foregroundColor: Colors.white,
                            padding: EdgeInsets.symmetric(vertical: 8),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _listen() async {
    if (!_isListening) {
      var status = await Permission.microphone.request();
      if (status == PermissionStatus.granted) {
        bool available = await _speech.initialize(
          onStatus: (val) => print('onStatus: $val'),
          onError: (val) => print('onError: $val'),
        );
        if (available) {
          setState(() => _isListening = true);
          _speech.listen(
            onResult: (val) => setState(() {
              _searchController.text = val.recognizedWords;
              _filterProducts();
            }),
          );
        }
      }
    } else {
      setState(() => _isListening = false);
      _speech.stop();
    }
  }
}