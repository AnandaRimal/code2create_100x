import 'package:flutter/material.dart';
import 'shop.dart';

void main() {
  runApp(MyRootApp());
}

class MyRootApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'नेपाल पसल प्रबन्धक',
      theme: ThemeData(
        primarySwatch: Colors.green,
        primaryColor: Color(0xFF1E88E5),
        fontFamily: 'Roboto',
      ),
      home: NepalShopApp(),  // Always start at shop
      debugShowCheckedModeBanner: false,
    );
  }
}