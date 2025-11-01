class Product {
  final String productId;
  final String name;
  final String category;
  final double price;
  final String unit;
  final int quantity;
  final bool isActive;
  final DateTime createdAt;
  final DateTime? updatedAt;

  Product({
    required this.productId,
    required this.name,
    required this.category,
    required this.price,
    required this.unit,
    required this.quantity,
    this.isActive = true,
    required this.createdAt,
    this.updatedAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      productId: json['product_id'] as String,
      name: json['product_name'] as String, // Changed from 'name' to 'product_name'
      category: json['category'] as String,
      price: (json['price'] as num).toDouble(),
      unit: json['unit'] as String,
      quantity: json['quantity'] as int,
      isActive: json['is_active'] as bool? ?? true,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] != null 
          ? DateTime.parse(json['updated_at'] as String) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'product_id': productId,
      'product_name': name, // Changed from 'name' to 'product_name'
      'category': category,
      'price': price,
      'unit': unit,
      'quantity': quantity,
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt?.toIso8601String(),
    };
  }

  // For compatibility with existing shop.dart code
  Product copyWith({
    String? productId,
    String? name,
    String? category,
    double? price,
    String? unit,
    int? quantity,
    bool? isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Product(
      productId: productId ?? this.productId,
      name: name ?? this.name,
      category: category ?? this.category,
      price: price ?? this.price,
      unit: unit ?? this.unit,
      quantity: quantity ?? this.quantity,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

class SaleRecord {
  final String productName;
  final DateTime time;
  final int quantity;
  final double totalAmount;
  final String type; // 'buy' or 'sell'

  SaleRecord({
    required this.productName,
    required this.time,
    required this.quantity,
    required this.totalAmount,
    required this.type,
  });
}