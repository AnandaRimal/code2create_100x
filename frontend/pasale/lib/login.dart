import 'package:flutter/material.dart';
import 'shop.dart';
import 'services/api_service.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});
  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  bool isLogin = true;
  bool _obscure = true;
  bool _obscureConfirm = true;
  bool _isLoading = false;
  final _formKey = GlobalKey<FormState>();
  final _userController = TextEditingController();
  final _passController = TextEditingController();
  final _nameController = TextEditingController(); // This will be shop_name
  final _confirmPassController = TextEditingController();
  
  // Additional controllers for registration
  final _shopAddressController = TextEditingController();
  final _contactController = TextEditingController();
  final _emailController = TextEditingController();
  final _panController = TextEditingController();

  @override
  void dispose() {
    _userController.dispose();
    _passController.dispose();
    _nameController.dispose();
    _confirmPassController.dispose();
    _shopAddressController.dispose();
    _contactController.dispose();
    _emailController.dispose();
    _panController.dispose();
    super.dispose();
  }

  void _showDialog(String title, String message, {bool success = false}) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: Text(title, style: TextStyle(color: success ? Colors.green : Colors.red)),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("ठिक छ"),
          )
        ],
      ),
    );
  }

  void _onLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    
    try {
      final result = await ApiService.login(
        identifier: _userController.text.trim(),
        password: _passController.text,
      );
      
      if (result['success']) {
        final shopkeeperData = result['data']['shopkeeper'];
        _showDialog(
          "सफल", 
          'स्वागत छ, ${shopkeeperData['shop_name']}!',
          success: true
        );
        
        // Navigate to shop page after a brief delay
        Future.delayed(const Duration(seconds: 1), () {
          if (mounted) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) => NepalShopApp()),
            );
          }
        });
      } else {
        _showDialog("लग इन असफल", result['error']);
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _onSignIn() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);
    
    try {
      final result = await ApiService.register(
        shopName: _nameController.text.trim(),
        shopAddress: _shopAddressController.text.trim(),
        contact: _contactController.text.trim(),
        password: _passController.text,
        email: _emailController.text.trim().isEmpty ? null : _emailController.text.trim(),
        pan: _panController.text.trim().isEmpty ? null : _panController.text.trim(),
      );
      
      if (result['success']) {
        final shopkeeperData = result['data'];
        _showDialog(
          "सफल", 
          'दर्ता सफल भयो! स्वागत छ ${shopkeeperData['shop_name']}!',
          success: true
        );
        
        // Clear fields and switch to login
        _userController.text = _contactController.text; // Pre-fill login with contact
        _passController.clear();
        _nameController.clear();
        _confirmPassController.clear();
        _shopAddressController.clear();
        _contactController.clear();
        _emailController.clear();
        _panController.clear();
        
        setState(() {
          isLogin = true; // Switch to login tab
        });
      } else {
        _showDialog("दर्ता असफल", result['error']);
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _onSocial(String name) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text("$name लग इन अहिले उपलब्ध छैन"),
        backgroundColor: Colors.blue,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF57C4DE),
      body: Center(
        child: SingleChildScrollView(
          child: Stack(
            children: [
              // Blue curved header
              Container(
                height: 340,
                decoration: const BoxDecoration(
                  color: Color(0xFF57C4DE),
                  borderRadius: BorderRadius.only(
                    bottomRight: Radius.circular(90),
                  ),
                ),
              ),
              Column(
                children: [
                  const SizedBox(height: 56),
                  // Header text
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 36),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ShaderMask(
                        shaderCallback: (Rect bounds) {
                          return const LinearGradient(
                          colors: [Color(0xFFFFD700), Color(0xFF57C4DE)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          ).createShader(bounds);
                        },
                        child: const Text(
                          "नमस्ते!",
                          style: TextStyle(
                          fontSize: 38,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF2C3E50), // Slightly dark blue-gray
                          letterSpacing: 1.5,
                          shadows: [
                            Shadow(
                            blurRadius: 8,
                            color: Colors.black12, // Lighter shadow
                            offset: Offset(2, 2),
                            ),
                          ],
                          ),
                        ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                        children: const [
                          Icon(Icons.storefront, color: Colors.white, size: 32),
                          SizedBox(width: 8),
                          Text(
                          "पसलेमा स्वागत छ",
                          style: TextStyle(
                            fontSize: 28,
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 1.2,
                            shadows: [
                            Shadow(
                              blurRadius: 6,
                              color: Colors.black26,
                              offset: Offset(1, 2),
                            ),
                            ],
                          ),
                          ),
                        ],
                        ),
                      ],
                      ),
                    ),
                    ),
                  
                  const SizedBox(height: 52),
                  // White card with tabs and form
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 22),
                    padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(36),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.07),
                          blurRadius: 16,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Column(
                      children: [
                        // Tabs
                        Container(
                          decoration: BoxDecoration(
                            color: const Color(0xFFEAF8FB),
                            borderRadius: BorderRadius.circular(30),
                          ),
                          child: Row(
                            children: [
                              Expanded(
                                child: GestureDetector(
                                  onTap: () => setState(() => isLogin = true),
                                  child: Container(
                                    decoration: BoxDecoration(
                                      color: isLogin ? const Color(0xFF57C4DE) : Colors.transparent,
                                      borderRadius: BorderRadius.circular(30),
                                    ),
                                    padding: const EdgeInsets.symmetric(vertical: 14),
                                    child: Center(
                                      child: Text(
                                        "लग इन",
                                        style: TextStyle(
                                          color: isLogin ? Colors.white : const Color(0xFF57C4DE),
                                          fontWeight: FontWeight.bold,
                                          fontSize: 17,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              Expanded(
                                child: GestureDetector(
                                  onTap: () => setState(() => isLogin = false),
                                  child: Container(
                                    decoration: BoxDecoration(
                                      color: !isLogin ? const Color(0xFF57C4DE) : Colors.transparent,
                                      borderRadius: BorderRadius.circular(30),
                                    ),
                                    padding: const EdgeInsets.symmetric(vertical: 14),
                                    child: Center(
                                      child: Text(
                                        "दर्ता गर्नुहोस्",
                                        style: TextStyle(
                                          color: !isLogin ? Colors.white : const Color(0xFF57C4DE),
                                          fontWeight: FontWeight.bold,
                                          fontSize: 17,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 22),
                        // Form
                        Form(
                          key: _formKey,
                          child: Column(
                            children: [
                              if (!isLogin) ...[
                                // Shop Name field for sign up
                                TextFormField(
                                  controller: _nameController,
                                  decoration: InputDecoration(
                                    hintText: "पसलको नाम",
                                    contentPadding: const EdgeInsets.symmetric(vertical: 18, horizontal: 22),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(28),
                                      borderSide: BorderSide.none,
                                    ),
                                    filled: true,
                                    fillColor: const Color(0xFFF5FBFC),
                                  ),
                                  validator: (v) {
                                    if (!isLogin && (v == null || v.trim().length < 2)) {
                                      return "पसलको नाम लेख्नुहोस् (न्यूनतम २ अक्षर)";
                                    }
                                    return null;
                                  },
                                ),
                                const SizedBox(height: 16),
                                // Shop Address field
                                TextFormField(
                                  controller: _shopAddressController,
                                  decoration: InputDecoration(
                                    hintText: "पसलको ठेगाना",
                                    contentPadding: const EdgeInsets.symmetric(vertical: 18, horizontal: 22),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(28),
                                      borderSide: BorderSide.none,
                                    ),
                                    filled: true,
                                    fillColor: const Color(0xFFF5FBFC),
                                  ),
                                  validator: (v) {
                                    if (!isLogin && (v == null || v.trim().length < 5)) {
                                      return "पसलको ठेगाना लेख्नुहोस् (न्यूनतम ५ अक्षर)";
                                    }
                                    return null;
                                  },
                                ),
                                const SizedBox(height: 16),
                                // Contact field
                                TextFormField(
                                  controller: _contactController,
                                  keyboardType: TextInputType.phone,
                                  decoration: InputDecoration(
                                    hintText: "सम्पर्क नम्बर (98xxxxxxxx वा 97xxxxxxxx)",
                                    contentPadding: const EdgeInsets.symmetric(vertical: 18, horizontal: 22),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(28),
                                      borderSide: BorderSide.none,
                                    ),
                                    filled: true,
                                    fillColor: const Color(0xFFF5FBFC),
                                  ),
                                  validator: (v) {
                                    if (!isLogin) {
                                      if (v == null || v.isEmpty) return "सम्पर्क नम्बर आवश्यक छ";
                                      if (!RegExp(r'^(98|97)\d{8}$').hasMatch(v)) {
                                        return "मान्य नेपाली मोबाइल नम्बर लेख्नुहोस् (98xxxxxxxx वा 97xxxxxxxx)";
                                      }
                                    }
                                    return null;
                                  },
                                ),
                                const SizedBox(height: 16),
                                // Email field (optional)
                                TextFormField(
                                  controller: _emailController,
                                  keyboardType: TextInputType.emailAddress,
                                  decoration: InputDecoration(
                                    hintText: "इमेल (वैकल्पिक)",
                                    contentPadding: const EdgeInsets.symmetric(vertical: 18, horizontal: 22),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(28),
                                      borderSide: BorderSide.none,
                                    ),
                                    filled: true,
                                    fillColor: const Color(0xFFF5FBFC),
                                  ),
                                  validator: (v) {
                                    if (!isLogin && v != null && v.isNotEmpty) {
                                      if (!RegExp(r'^[^@]+@[^@]+\.[^@]+$').hasMatch(v)) {
                                        return "मान्य इमेल लेख्नुहोस्";
                                      }
                                    }
                                    return null;
                                  },
                                ),
                                const SizedBox(height: 16),
                                // PAN field (optional)
                                TextFormField(
                                  controller: _panController,
                                  keyboardType: TextInputType.number,
                                  decoration: InputDecoration(
                                    hintText: "प्यान नम्बर (वैकल्पिक, ९ अंक)",
                                    contentPadding: const EdgeInsets.symmetric(vertical: 18, horizontal: 22),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(28),
                                      borderSide: BorderSide.none,
                                    ),
                                    filled: true,
                                    fillColor: const Color(0xFFF5FBFC),
                                  ),
                                  validator: (v) {
                                    if (!isLogin && v != null && v.isNotEmpty) {
                                      if (!RegExp(r'^\d{9}$').hasMatch(v)) {
                                        return "मान्य ९ अंकको प्यान नम्बर लेख्नुहोस्";
                                      }
                                    }
                                    return null;
                                  },
                                ),
                                const SizedBox(height: 16),
                              ],
                              // Username/Email/Contact for login
                              TextFormField(
                                controller: _userController,
                                decoration: InputDecoration(
                                  hintText: isLogin ? "इमेल वा सम्पर्क नम्बर" : "प्रयोगकर्ता नाम वा इमेल",
                                  contentPadding: const EdgeInsets.symmetric(vertical: 18, horizontal: 22),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(28),
                                    borderSide: BorderSide.none,
                                  ),
                                  filled: true,
                                  fillColor: const Color(0xFFF5FBFC),
                                ),
                                validator: (v) => v == null || v.isEmpty ? "आवश्यक" : null,
                              ),
                              const SizedBox(height: 16),
                              // Password
                              TextFormField(
                                controller: _passController,
                                obscureText: _obscure,
                                decoration: InputDecoration(
                                  hintText: "पासवर्ड",
                                  contentPadding: const EdgeInsets.symmetric(vertical: 18, horizontal: 22),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(28),
                                    borderSide: BorderSide.none,
                                  ),
                                  filled: true,
                                  fillColor: const Color(0xFFF5FBFC),
                                  suffixIcon: IconButton(
                                    icon: Icon(_obscure ? Icons.visibility : Icons.visibility_off, color: const Color(0xFF57C4DE)),
                                    onPressed: () => setState(() => _obscure = !_obscure),
                                  ),
                                ),
                                validator: (v) {
                                  if (v == null || v.isEmpty) return "आवश्यक";
                                  if (v.length < 6) return "न्यूनतम ६ अक्षर";
                                  return null;
                                },
                              ),
                              if (!isLogin) ...[
                                const SizedBox(height: 16),
                                // Confirm Password
                                TextFormField(
                                  controller: _confirmPassController,
                                  obscureText: _obscureConfirm,
                                  decoration: InputDecoration(
                                    hintText: "पासवर्ड पुष्टि गर्नुहोस्",
                                    contentPadding: const EdgeInsets.symmetric(vertical: 18, horizontal: 22),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(28),
                                      borderSide: BorderSide.none,
                                    ),
                                    filled: true,
                                    fillColor: const Color(0xFFF5FBFC),
                                    suffixIcon: IconButton(
                                      icon: Icon(_obscureConfirm ? Icons.visibility : Icons.visibility_off, color: const Color(0xFF57C4DE)),
                                      onPressed: () => setState(() => _obscureConfirm = !_obscureConfirm),
                                    ),
                                  ),
                                  validator: (v) {
                                    if (!isLogin && v != _passController.text) {
                                      return "पासवर्ड मेल खाँदैन";
                                    }
                                    return null;
                                  },
                                ),
                              ],
                              const SizedBox(height: 20),
                              SizedBox(
                                width: double.infinity,
                                height: 50,
                                child: ElevatedButton(
                                  onPressed: _isLoading ? null : (isLogin ? _onLogin : _onSignIn),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF57C4DE),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                                  ),
                                  child: _isLoading 
                                    ? const CircularProgressIndicator(
                                        color: Colors.white,
                                        strokeWidth: 2,
                                      )
                                    : Text(
                                        isLogin ? "लग इन" : "दर्ता गर्नुहोस्",
                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.white),
                                      ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 18),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(height: 1, width: 32, color: Colors.grey[300]),
                            const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 8),
                              child: Text("वा", style: TextStyle(fontSize: 14, color: Colors.black54)),
                            ),
                            Container(height: 1, width: 32, color: Colors.grey[300]),
                          ],
                        ),
                        const SizedBox(height: 10),
                        // Social buttons
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.facebook, color: Colors.blue, size: 32),
                              onPressed: () => _onSocial("Facebook"),
                            ),
                            const SizedBox(width: 8),
                            IconButton(
                              icon: const Icon(Icons.alternate_email, color: Colors.lightBlue, size: 30),
                              onPressed: () => _onSocial("Twitter"),
                            ),
                            const SizedBox(width: 8),
                            IconButton(
                              icon: const Icon(Icons.g_mobiledata, color: Colors.redAccent, size: 32),
                              onPressed: () => _onSocial("Google"),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}