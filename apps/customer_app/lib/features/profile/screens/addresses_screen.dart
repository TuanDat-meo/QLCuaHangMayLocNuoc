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
      ),
      body: Consumer<AuthController>(
        builder: (context, auth, _) {
          final addresses = auth.customerUser?.addresses ?? [];

          if (addresses.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.location_off_outlined, size: 64, color: Colors.grey.shade300),
                  const SizedBox(height: 16),
                  const Text('Bạn chưa lưu địa chỉ nào', style: TextStyle(color: Colors.grey)),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: addresses.length,
            itemBuilder: (context, index) {
              final addr = addresses[index];
              return Container(
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xfff1f5f9)),
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.all(16),
                  leading: const CircleAvatar(
                    backgroundColor: Color(0xffeff6ff),
                    child: Icon(Icons.location_on, color: Color(0xff00459a)),
                  ),
                  title: Text(addr.street, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(addr.fullAddress, style: const TextStyle(fontSize: 12)),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: const Color(0xff00459a),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}
