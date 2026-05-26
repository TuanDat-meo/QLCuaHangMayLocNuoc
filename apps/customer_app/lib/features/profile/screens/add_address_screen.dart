import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:customer_app/controllers/auth_controller.dart';
import 'package:customer_app/models/order_model.dart';

class AddAddressScreen extends StatefulWidget {
  const AddAddressScreen({super.key});

  @override
  State<AddAddressScreen> createState() => _AddAddressScreenState();
}

class _AddAddressScreenState extends State<AddAddressScreen> {
  final _formKey = GlobalKey<FormState>();
  final _streetController = TextEditingController();
  final _wardController = TextEditingController();
  final _districtController = TextEditingController();
  final _cityController = TextEditingController();
  bool _isDefault = false;

  @override
  void dispose() {
    _streetController.dispose();
    _wardController.dispose();
    _districtController.dispose();
    _cityController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      appBar: AppBar(title: const Text('Thêm địa chỉ mới'), backgroundColor: Colors.white),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(30), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20)]),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildTextField('Số nhà, tên đường', _streetController),
                const SizedBox(height: 16),
                _buildTextField('Phường/Xã', _wardController),
                const SizedBox(height: 16),
                _buildTextField('Quận/Huyện', _districtController),
                const SizedBox(height: 16),
                _buildTextField('Tỉnh/Thành phố', _cityController),
                const SizedBox(height: 24),
                SwitchListTile(
                  title: const Text('Đặt làm địa chỉ mặc định', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                  value: _isDefault,
                  onChanged: (val) => setState(() => _isDefault = val),
                  activeColor: const Color(0xff00459a),
                ),
                const SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      if (_formKey.currentState!.validate()) {
                        // Logic thêm địa chỉ vào Firestore sẽ được xử lý ở đây
                        Navigator.pop(context);
                      }
                    },
                    child: const Text('THÊM ĐỊA CHỈ'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(String label, TextEditingController controller) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xff1e293b))),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          decoration: InputDecoration(
            filled: true, fillColor: const Color(0xfff8fafc),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
          ),
          validator: (value) => value == null || value.isEmpty ? 'Không được để trống' : null,
        ),
      ],
    );
  }
}
