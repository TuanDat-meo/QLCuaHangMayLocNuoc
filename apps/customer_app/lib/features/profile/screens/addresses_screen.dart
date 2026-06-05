import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:customer_app/controllers/auth_controller.dart';
import 'package:customer_app/models/order_model.dart';

class AddressesScreen extends StatelessWidget {
  const AddressesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      appBar: AppBar(
        title: const Text('Địa chỉ nhận hàng'),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Consumer<AuthController>(
        builder: (context, auth, _) {
          final addresses = auth.customerUser?.addresses ?? [];
          final defaultAddress = auth.customerUser?.defaultAddress;

          if (addresses.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(32),
                    decoration: BoxDecoration(
                      color: const Color(0xffeff6ff),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.location_off_outlined, size: 64, color: const Color(0xff00459a).withOpacity(0.5)),
                  ),
                  const SizedBox(height: 24),
                  const Text('Bạn chưa lưu địa chỉ nào', 
                    style: TextStyle(color: Color(0xff64748b), fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 8),
                  const Text('Thêm địa chỉ để đặt hàng nhanh hơn', 
                    style: TextStyle(color: Color(0xff94a3b8), fontSize: 14)),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: addresses.length,
            itemBuilder: (context, index) {
              final addr = addresses[index];
              final isDefault = defaultAddress?.id == addr.id;

              return Container(
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.02),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    )
                  ],
                  border: Border.all(
                    color: isDefault ? const Color(0xff00459a).withOpacity(0.1) : const Color(0xfff1f5f9),
                  ),
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.all(16),
                  leading: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isDefault ? const Color(0xff00459a).withOpacity(0.05) : const Color(0xfff8fafc),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      addr.type == 'home' ? Icons.home_outlined : Icons.business_outlined, 
                      color: const Color(0xff00459a),
                    ),
                  ),
                  title: Row(
                    children: [
                      Expanded(
                        child: Text(addr.recipientName, 
                          style: const TextStyle(fontWeight: FontWeight.w900, color: Color(0xff1e293b))),
                      ),
                      if (isDefault)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xff00459a),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text('Mặc định', 
                            style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                    ],
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const SizedBox(height: 4),
                      Text(addr.phoneNumber, style: const TextStyle(color: Color(0xff64748b), fontSize: 13)),
                      const SizedBox(height: 4),
                      Text(addr.fullAddress, style: const TextStyle(color: Color(0xff94a3b8), fontSize: 12)),
                    ],
                  ),
                  trailing: PopupMenuButton<String>(
                    icon: const Icon(Icons.more_vert, color: Color(0xff94a3b8)),
                    onSelected: (value) async {
                      if (value == 'delete') {
                        final confirm = await showDialog<bool>(
                          context: context,
                          builder: (context) => AlertDialog(
                            title: const Text('Xác nhận xóa'),
                            content: const Text('Bạn có chắc chắn muốn xóa địa chỉ này?'),
                            actions: [
                              TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Hủy')),
                              TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Xóa', style: TextStyle(color: Colors.red))),
                            ],
                          ),
                        );
                        if (confirm == true) {
                          await auth.deleteAddress(addr.id);
                        }
                      }
                    },
                    itemBuilder: (context) => [
                      const PopupMenuItem(value: 'edit', child: Text('Chỉnh sửa')),
                      const PopupMenuItem(value: 'delete', child: Text('Xóa', style: TextStyle(color: Colors.red))),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.pushNamed(context, '/add-address'),
        backgroundColor: const Color(0xff00459a),
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('THÊM ĐỊA CHỈ', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }
}
