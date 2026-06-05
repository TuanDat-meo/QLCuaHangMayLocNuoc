import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import 'package:customer_app/controllers/auth_controller.dart';
import 'package:customer_app/models/order_model.dart';

class EditAddressScreen extends StatefulWidget {
  final Address address;
  const EditAddressScreen({super.key, required this.address});

  @override
  State<EditAddressScreen> createState() => _EditAddressScreenState();
}

class _EditAddressScreenState extends State<EditAddressScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _recipientNameController;
  late TextEditingController _phoneController;
  late TextEditingController _streetController;
  
  String? _selectedProvince;
  String? _selectedDistrict;
  String? _selectedWard;

  String? _selectedProvinceCode;
  String? _selectedDistrictCode;
  String? _selectedWardCode;

  List<dynamic> _provinces = [];
  List<dynamic> _districts = [];
  List<dynamic> _wards = [];

  bool _isLoading = false;
  bool _isFetchingData = false;

  @override
  void initState() {
    super.initState();
    _recipientNameController = TextEditingController(text: widget.address.recipientName);
    _phoneController = TextEditingController(text: widget.address.phoneNumber);
    _streetController = TextEditingController(text: widget.address.street);
    
    _selectedProvince = widget.address.city;
    _selectedDistrict = widget.address.district;
    _selectedWard = widget.address.ward;
    
    _selectedProvinceCode = widget.address.provinceCode?.toString();
    _selectedDistrictCode = widget.address.districtCode?.toString();
    _selectedWardCode = widget.address.wardCode?.toString();

    _initialFetch();
  }

  Future<void> _initialFetch() async {
    setState(() => _isFetchingData = true);
    await _fetchProvinces();
    if (_selectedProvinceCode != null) {
      await _fetchDistricts(_selectedProvinceCode!, isInitial: true);
      if (_selectedDistrictCode != null) {
        await _fetchWards(_selectedDistrictCode!, isInitial: true);
      }
    }
    setState(() => _isFetchingData = false);
  }

  Future<void> _fetchProvinces() async {
    try {
      final response = await http.get(Uri.parse('https://provinces.open-api.vn/api/p/'));
      if (response.statusCode == 200) {
        setState(() {
          _provinces = json.decode(utf8.decode(response.bodyBytes));
        });
      }
    } catch (e) {
      debugPrint('Error fetching provinces: $e');
    }
  }

  Future<void> _fetchDistricts(String provinceCode, {bool isInitial = false}) async {
    try {
      final response = await http.get(Uri.parse('https://provinces.open-api.vn/api/p/$provinceCode?depth=2'));
      if (response.statusCode == 200) {
        final data = json.decode(utf8.decode(response.bodyBytes));
        setState(() {
          _districts = data['districts'] ?? [];
          if (!isInitial) {
            _wards = [];
            _selectedDistrict = null;
            _selectedDistrictCode = null;
            _selectedWard = null;
            _selectedWardCode = null;
          }
        });
      }
    } catch (e) {
      debugPrint('Error fetching districts: $e');
    }
  }

  Future<void> _fetchWards(String districtCode, {bool isInitial = false}) async {
    try {
      final response = await http.get(Uri.parse('https://provinces.open-api.vn/api/d/$districtCode?depth=2'));
      if (response.statusCode == 200) {
        final data = json.decode(utf8.decode(response.bodyBytes));
        setState(() {
          _wards = data['wards'] ?? [];
          if (!isInitial) {
            _selectedWard = null;
            _selectedWardCode = null;
          }
        });
      }
    } catch (e) {
      debugPrint('Error fetching wards: $e');
    }
  }

  @override
  void dispose() {
    _recipientNameController.dispose();
    _phoneController.dispose();
    _streetController.dispose();
    super.dispose();
  }

  Future<void> _update() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedProvince == null || _selectedDistrict == null || _selectedWard == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Vui lòng chọn đầy đủ địa chỉ')));
      return;
    }

    setState(() => _isLoading = true);

    final updatedAddress = Address(
      id: widget.address.id,
      recipientName: _recipientNameController.text.trim(),
      phoneNumber: _phoneController.text.trim(),
      street: _streetController.text.trim(),
      ward: _selectedWard!,
      district: _selectedDistrict!,
      city: _selectedProvince!,
      provinceCode: int.tryParse(_selectedProvinceCode ?? ''),
      districtCode: int.tryParse(_selectedDistrictCode ?? ''),
      wardCode: int.tryParse(_selectedWardCode ?? ''),
      type: widget.address.type,
    );

    // Lưu ý: Cần thêm method updateAddress vào AuthController
    final success = await context.read<AuthController>().updateAddress(updatedAddress);

    if (mounted) {
      setState(() => _isLoading = false);
      if (success) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Cập nhật địa chỉ thành công')));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(context.read<AuthController>().error ?? 'Lỗi khi cập nhật')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      appBar: AppBar(title: const Text('Chỉnh sửa địa chỉ')),
      body: _isFetchingData 
        ? const Center(child: CircularProgressIndicator())
        : SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              _buildCard([
                _buildTextField('Tên người nhận', _recipientNameController),
                const SizedBox(height: 16),
                _buildTextField('Số điện thoại', _phoneController, keyboardType: TextInputType.phone),
              ]),
              const SizedBox(height: 20),
              _buildCard([
                _buildDropdown(
                  label: 'Tỉnh/Thành phố',
                  value: _selectedProvinceCode,
                  items: _provinces.map((p) => DropdownMenuItem(value: p['code'].toString(), child: Text(p['name']))).toList(),
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
                _buildDropdown(
                  label: 'Quận/Huyện',
                  value: _selectedDistrictCode,
                  items: _districts.map((d) => DropdownMenuItem(value: d['code'].toString(), child: Text(d['name']))).toList(),
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
                _buildDropdown(
                  label: 'Phường/Xã',
                  value: _selectedWardCode,
                  items: _wards.map((w) => DropdownMenuItem(value: w['code'].toString(), child: Text(w['name']))).toList(),
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
                _buildTextField('Số nhà, tên đường', _streetController),
              ]),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _update,
                  child: _isLoading ? const CircularProgressIndicator(color: Colors.white) : const Text('LƯU THAY ĐỔI'),
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
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)]),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: children),
    );
  }

  Widget _buildTextField(String label, TextEditingController controller, {TextInputType? keyboardType}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          decoration: InputDecoration(filled: true, fillColor: const Color(0xfff8fafc), border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none)),
          validator: (v) => v == null || v.isEmpty ? 'Không được để trống' : null,
        ),
      ],
    );
  }

  Widget _buildDropdown({required String label, required String? value, required List<DropdownMenuItem<String>> items, required void Function(String?)? onChanged}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: value,
          isExpanded: true,
          decoration: InputDecoration(filled: true, fillColor: const Color(0xfff8fafc), border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none)),
          items: items,
          onChanged: onChanged,
          validator: (v) => v == null ? 'Vui lòng chọn' : null,
        ),
      ],
    );
  }
}
