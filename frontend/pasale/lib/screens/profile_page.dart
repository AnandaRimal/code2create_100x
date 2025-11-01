import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../shop.dart'; // Import SaleRecord from shop.dart

class ProfilePage extends StatefulWidget {
  final List<SaleRecord> sales;
  
  const ProfilePage({Key? key, required this.sales}) : super(key: key);

  @override
  _ProfilePageState createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  int totalPoints = 0;
  int saleTransactions = 0;
  int purchaseTransactions = 0;
  int dailyBonuses = 0;
  int streakBonuses = 0;
  
  @override
  void initState() {
    super.initState();
    _calculateRewards();
  }

  void _calculateRewards() {
    // Reset counters
    saleTransactions = 0;
    purchaseTransactions = 0;
    dailyBonuses = 0;
    streakBonuses = 0;
    
    // Calculate sale and purchase transactions
    for (var sale in widget.sales) {
      if (sale.type == 'sell') {
        saleTransactions++;
      } else if (sale.type == 'buy') {
        purchaseTransactions++;
      }
    }
    
    // Calculate daily bonuses (10+ transactions in a day)
    Map<String, int> transactionsByDay = {};
    for (var sale in widget.sales) {
      String dateKey = '${sale.time.year}-${sale.time.month}-${sale.time.day}';
      transactionsByDay[dateKey] = (transactionsByDay[dateKey] ?? 0) + 1;
    }
    
    for (var count in transactionsByDay.values) {
      if (count >= 10) {
        dailyBonuses++;
      }
    }
    
    // Calculate streak bonuses (7-day streak with 5+ transactions daily)
    streakBonuses = _calculateStreakBonus(transactionsByDay);
    
    // Calculate total points
    totalPoints = (saleTransactions * 2) + 
                  (purchaseTransactions * 1) + 
                  (dailyBonuses * 10) + 
                  (streakBonuses * 50);
    
    setState(() {});
  }

  int _calculateStreakBonus(Map<String, int> transactionsByDay) {
    if (transactionsByDay.isEmpty) return 0;
    
    // Sort dates
    List<DateTime> dates = transactionsByDay.keys.map((key) {
      List<String> parts = key.split('-');
      return DateTime(int.parse(parts[0]), int.parse(parts[1]), int.parse(parts[2]));
    }).toList();
    dates.sort();
    
    int streakCount = 0;
    int currentStreak = 0;
    DateTime? lastDate;
    
    for (var date in dates) {
      String dateKey = '${date.year}-${date.month}-${date.day}';
      int txnCount = transactionsByDay[dateKey] ?? 0;
      
      if (txnCount >= 5) {
        if (lastDate == null || date.difference(lastDate).inDays == 1) {
          currentStreak++;
          if (currentStreak >= 7) {
            streakCount++;
            currentStreak = 0; // Reset for next potential streak
          }
        } else {
          currentStreak = 1; // Start new streak
        }
        lastDate = date;
      } else {
        currentStreak = 0;
        lastDate = null;
      }
    }
    
    return streakCount;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('प्रोफाइल र पुरस्कार'),
        backgroundColor: Color(0xFF1E88E5),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Header Section with Profile Info
            Container(
              width: double.infinity,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF1E88E5), Color(0xFF1565C0)],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
              padding: EdgeInsets.all(20),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: Colors.white,
                    child: Icon(Icons.person, size: 50, color: Color(0xFF1E88E5)),
                  ),
                  SizedBox(height: 12),
                  Text(
                    'Ram Bahadur',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 6),
                  Text(
                    'rambahadur@gmail.com',
                    style: TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                  SizedBox(height: 12),
                  Divider(color: Colors.white30, height: 1),
                  SizedBox(height: 12),
                  Row(
                    children: [
                      Icon(Icons.store, color: Colors.white70, size: 18),
                      SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'सबित्रा किराना तथा चिया पसल',
                          style: TextStyle(color: Colors.white, fontSize: 14),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.phone, color: Colors.white70, size: 18),
                      SizedBox(width: 8),
                      Text(
                        '९८४५६७८९०१',
                        style: TextStyle(color: Colors.white, fontSize: 14),
                      ),
                    ],
                  ),
                  SizedBox(height: 8),
                  Row(
                    children: [
                      Icon(Icons.location_on, color: Colors.white70, size: 18),
                      SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'काठमाडौं, नेपाल',
                          style: TextStyle(color: Colors.white, fontSize: 14),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            
            // Total Points Card - Smaller and compact
            Container(
              margin: EdgeInsets.all(16),
              padding: EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFFFFD700), Color(0xFFFFA000)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.orange.withOpacity(0.3),
                    blurRadius: 8,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(Icons.emoji_events, size: 36, color: Colors.white),
                      SizedBox(width: 12),
                      Text(
                        'कुल पुरस्कार अंक',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    '$totalPoints',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            
            // Rewards Breakdown
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'पुरस्कार विवरण',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1E88E5),
                    ),
                  ),
                  SizedBox(height: 16),
                  
                  // Sale Transactions
                  _buildRewardCard(
                    icon: Icons.sell,
                    title: 'बिक्री कारोबार',
                    subtitle: '$saleTransactions कारोबार × 2 अंक',
                    points: saleTransactions * 2,
                    color: Colors.green,
                  ),
                  
                  // Purchase Transactions
                  _buildRewardCard(
                    icon: Icons.shopping_cart,
                    title: 'खरिद कारोबार',
                    subtitle: '$purchaseTransactions कारोबार × 1 अंक',
                    points: purchaseTransactions * 1,
                    color: Colors.blue,
                  ),
                  
                  // Daily Bonus
                  _buildRewardCard(
                    icon: Icons.calendar_today,
                    title: 'दैनिक बोनस',
                    subtitle: '$dailyBonuses दिन (10+ कारोबार) × 10 अंक',
                    points: dailyBonuses * 10,
                    color: Colors.orange,
                  ),
                  
                  // Streak Bonus
                  _buildRewardCard(
                    icon: Icons.local_fire_department,
                    title: 'स्ट्रीक बोनस',
                    subtitle: '$streakBonuses सप्ताह (7-दिन, 5+ दैनिक) × 50 अंक',
                    points: streakBonuses * 50,
                    color: Colors.red,
                  ),
                  
                  SizedBox(height: 24),
                  
                  // Info Card
                  Container(
                    padding: EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.blue.shade50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.blue.shade200),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.info_outline, color: Color(0xFF1E88E5)),
                            SizedBox(width: 8),
                            Text(
                              'पुरस्कार नियम',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                                color: Color(0xFF1E88E5),
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 12),
                        _buildInfoRow('• बिक्री कारोबार: 2 अंक'),
                        _buildInfoRow('• खरिद कारोबार: 1 अंक'),
                        _buildInfoRow('• दैनिक बोनस: 10 अंक (10+ कारोबार)'),
                        _buildInfoRow('• स्ट्रीक बोनस: 50 अंक (7-दिन, 5+ दैनिक)'),
                      ],
                    ),
                  ),
                  
                  SizedBox(height: 24),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRewardCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required int points,
    required Color color,
  }) {
    return Card(
      margin: EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: Container(
          padding: EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: color, size: 28),
        ),
        title: Text(
          title,
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        subtitle: Text(subtitle, style: TextStyle(fontSize: 13)),
        trailing: Container(
          padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            '+$points',
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(String text) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 4),
      child: Text(
        text,
        style: TextStyle(fontSize: 14, color: Colors.grey[800]),
      ),
    );
  }
}
