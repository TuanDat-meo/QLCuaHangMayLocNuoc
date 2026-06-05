import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
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
  final _recipientNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _streetController = TextEditingController();
  
  String? _selectedProvince;
  String? _selectedDistrict;
  String? _selectedWard;

  String? _selectedProvinceCode;
  String? _selectedDistrictCode;
  String? _selectedWardCode;

  List<dynamic> _provinces = [];
  List<dynamic> _districts = [];
  List<dynamic> _wards = [];

  bool _isDefault = false;
  bool _isLoading = false;
  bool _isFetchingProvinces = false;
  bool _isFetchingDistricts = false;
  bool _isFetchingWards = false;

  @override
  void initState() {
    super.initState();
    _fetchProvinces();
  }

  Future<void> _fetchProvinces() async {
    if (_isFetchingProvinces) return;
    setState(() => _isFetchingProvinces = true);
    try {
      final response = await http.get(Uri.parse('https://provinces.open-api.vn/api/p/'));
      if (response.statusCode == 200) {
        setState(() {
          _provinces = json.decode(utf8.decode(response.bodyBytes));
        });
      }
    } catch (e) {
      _showError('Lỗi kết nối API địa chính');
    } finally {
      if (mounted) setState(() => _isFetchingProvinces = false);
    }
  }

  Future<void> _fetchDistricts(String provinceCode) async {
    setState(() {
      _isFetchingDistricts = true;
      _districts = [];
      _wards = [];
      _selectedDistrict = null;
      _selectedDistrictCode = null;
      _selectedWard = null;
      _selectedWardCode = null;
    });
    try {
      final response = await http.get(Uri.parse('https://provinces.open-api.vn/api/p/$provinceCode?depth=2'));
      if (response.statusCode == 200) {
        final data = json.decode(utf8.decode(response.bodyBytes));
        setState(() {
          _districts = data['districts'] ?? [];
        });
      }
    } catch (e) {
      _showError('Lỗi tải quận huyện');
    } finally {
      if (mounted) setState(() => _isFetchingDistricts = false);
    }
  }

  Future<void> _fetchWards(String districtCode) async {
    setState(() {
      _isFetchingWards = true;
      _wards = [];
      _selectedWard = null;
      _selectedWardCode = null;
    });
    try {
      final response = await http.get(Uri.parse('https://provinces.open-api.vn/api/d/$districtCode?depth=2'));
      if (response.statusCode == 200) {
        final data = json.decode(utf8.decode(response.bodyBytes));
        setState(() {
          _wards = data['wards'] ?? [];
        });
      }
    } catch (e) {
      _showError('Lỗi tải phường xã');
    } finally {
      if (mounted) setState(() => _isFetchingWards = false);
    }
  }

  void _showError(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  void dispose() {
    _recipientNameController.dispose();
    _phoneController.dispose();
    _streetController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    
    if (_selectedProvince == null || _selectedDistrict == null || _selectedWard == null) {
      _showError('Vui lòng chọn đầy đủ thông tin địa chỉ');
      return;
    }

    setState(() => _isLoading = true);

    final address = Address(
      id: '',
      recipientName: _recipientNameController.text.trim(),
      phoneNumber: _phoneController.text.trim(),
      street: _streetController.text.trim(),
      ward: _selectedWard!,
      district: _selectedDistrict!,
      city: _selectedProvince!,
      provinceCode: int.tryParse(_selectedProvinceCode ?? ''),
      districtCode: int.tryParse(_selectedDistrictCode ?? ''),
      wardCode: int.tryParse(_selectedWardCode ?? ''),
    );

    final success = await context.read<AuthController>().addAddress(address, _isDefault);

    if (mounted) {
      setState(() => _isLoading = false);
      if (success) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Thêm địa chỉ thành công')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(context.read<AuthController>().error ?? 'Lỗi khi thêm địa chỉ')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      appBar: AppBar(
        title: const Text('Thêm địa chỉ mới'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildCard([
                _buildTextField(
                  label: 'Tên người nhận', 
                  controller: _recipientNameController,
                  hint: 'Nhập họ tên',
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Vui lòng nhập tên' : null,
                ),
                const SizedBox(height: 16),
                _buildTextField(
                  label: 'Số điện thoại', 
                  controller: _phoneController, 
                  keyboardType: TextInputType.phone,
                  hint: 'Nhập số điện thoại',
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Vui lòng nhập SĐT';
                    if (!RegExp(r'^(0|84|\+84)(3|5|7|8|9)[0-9]{8}$').hasMatch(v.replaceAll(' ', ''))) return 'SĐT không hợp lệ';
                    return null;
                  },
                ),
              ]),

              const SizedBox(height: 20),
              _buildCard([
                _buildLabel('Tỉnh / Thành phố'),
                const SizedBox(height: 8),
                _buildDropdown(
                  hint: _isFetchingProvinces ? 'Đang tải...' : 'Chọn Tỉnh / Thành phố',
                  value: _selectedProvinceCode,
                  isLoading: _isFetchingProvinces,
                  items: _provinces.map((p) => DropdownMenuItem<String>(
                    value: p['code'].toString(),
                    child: Text(p['name'], style: const TextStyle(fontSize: 14)),
                  )).toList(),
                  onChanged: (val) {
                    if (val != null) {
                      setState(() {
                        _selectedProvinceCode = val;
                        _selectedProvince = _provinces.firstWhere((p) => p['code'].toString() == val)['name'];
                      });
                      _fetchDistricts(val);
                    }
                  },
                ),
                const SizedBox(height: 16),

                _buildLabel('Quận / Huyện'),
                const SizedBox(height: 8),
                _buildDropdown(
                  hint: _isFetchingDistricts ? 'Đang tải...' : 'Chọn Quận / Huyện',
                  value: _selectedDistrictCode,
                  isLoading: _isFetchingDistricts,
                  items: _districts.map((d) => DropdownMenuItem<String>(
                    value: d['code'].toString(),
                    child: Text(d['name'], style: const TextStyle(fontSize: 14)),
                  )).toList(),
                  onChanged: _selectedProvinceCode == null ? null : (val) {
                    if (val != null) {
                      setState(() {
                        _selectedDistrictCode = val;
                        _selectedDistrict = _districts.firstWhere((d) => d['code'].toString() == val)['name'];
                      });
                      _fetchWards(val);
                    }
                  },
                ),
                const SizedBox(height: 16),

                _buildLabel('Phường / Xã'),
                const SizedBox(height: 8),
                _buildDropdown(
                  hint: _isFetchingWards ? 'Đang tải...' : 'Chọn Phường / Xã',
                  value: _selectedWardCode,
                  isLoading: _isFetchingWards,
                  items: _wards.map((w) => DropdownMenuItem<String>(
                    value: w['code'].toString(),
                    child: Text(w['name'], style: const TextStyle(fontSize: 14)),
                  )).toList(),
                  onChanged: _selectedDistrictCode == null ? null : (val) {
                    if (val != null) {
                      setState(() {
                        _selectedWardCode = val;
                        _selectedWard = _wards.firstWhere((w) => w['code'].toString() == val)['name'];
                      });
                    }
                  },
                ),
                const SizedBox(height: 16),
                
                _buildTextField(
                  label: 'Số nhà, tên đường', 
                  controller: _streetController,
                  hint: 'Ví dụ: 123 Đường ABC',
                  validator: (v) => (v == null || v.trim().isEmpty) ? 'Vui lòng nhập địa chỉ' : null,
                ),
              ]),

              const SizedBox(height: 20),
              SwitchListTile(
                title: const Text('Đặt làm địa chỉ mặc định', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                value: _isDefault,
                onChanged: (val) => setState(() => _isDefault = val),
                activeColor: const Color(0xff00459a),
              ),

              const SizedBox(height: 30),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _submit,
                  child: _isLoading 
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('LƯU ĐỊA CHỈ', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCard(List<Widget> children) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10)],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: children),
    );
  }

  Widget _buildLabel(String label) {
    return Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xff64748b)));
  }

  Widget _buildDropdown({
    required String hint,
    required String? value,
    required List<DropdownMenuItem<String>> items,
    required void Function(String?)? onChanged,
    bool isLoading = false,
  }) {
    return DropdownButtonFormField<String>(
      value: value,
      isExpanded: true,
      icon: isLoading ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.expand_more),
      decoration: InputDecoration(
        filled: true, fillColor: const Color(0xfff8fafc),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
      ),
      hint: Text(hint, style: const TextStyle(fontSize: 14, color: Colors.grey)),
      items: items,
      onChanged: isLoading ? null : onChanged,
      validator: (v) => v == null ? 'Vui lòng chọn' : null,
    );
  }

  Widget _buildTextField({required String label, required TextEditingController controller, TextInputType? keyboardType, String? hint, String? Function(String?)? validator}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildLabel(label),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          decoration: InputDecoration(
            hintText: hint,
            filled: true, fillColor: const Color(0xfff8fafc),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
          ),
          validator: validator,
        ),
      ],
    );
  }
}
