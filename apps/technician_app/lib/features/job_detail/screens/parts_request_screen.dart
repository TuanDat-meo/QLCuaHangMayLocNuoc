import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:shared/theme/app_colors.dart';
import '../../../controllers/job_controller.dart';

class PartsRequestScreen extends StatefulWidget {
  final String jobId;
  const PartsRequestScreen({super.key, required this.jobId});

  @override
  State<PartsRequestScreen> createState() => _PartsRequestScreenState();
}

class _PartsRequestScreenState extends State<PartsRequestScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _qtyCtrl = TextEditingController(text: '1');
  final _priceCtrl = TextEditingController(text: '0');
  final _noteCtrl = TextEditingController();
  bool _isSaving = false;
  int? _editingIndex;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _qtyCtrl.dispose();
    _priceCtrl.dispose();
    _noteCtrl.dispose();
    super.dispose();
  }

  void _startEdit(int index, Map<String, dynamic> item) {
    setState(() {
      _editingIndex = index;
      _nameCtrl.text = item['tenVatTu'] ?? '';
      _qtyCtrl.text = (item['soLuong'] ?? 1).toString();
      _priceCtrl.text = (item['donGia'] ?? 0).toInt().toString();
      _noteCtrl.text = item['ghiChu'] ?? '';
    });
  }

  void _cancelEdit() {
    setState(() {
      _editingIndex = null;
      _nameCtrl.clear();
      _qtyCtrl.text = '1';
      _priceCtrl.text = '0';
      _noteCtrl.clear();
    });
  }

  Future<void> _saveItem() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);

    final ctrl = context.read<JobController>();
    final ok = _editingIndex != null
        ? await ctrl.updateVatTuPhatSinh(
            jobId: widget.jobId,
            index: _editingIndex!,
            tenVatTu: _nameCtrl.text.trim(),
            soLuong: int.tryParse(_qtyCtrl.text.trim()) ?? 1,
            donGia: double.tryParse(
                    _priceCtrl.text.trim().replaceAll('.', '').replaceAll(',', '')) ??
                0,
            ghiChu: _noteCtrl.text.trim(),
          )
        : await ctrl.addVatTuPhatSinh(
            jobId: widget.jobId,
            tenVatTu: _nameCtrl.text.trim(),
            soLuong: int.tryParse(_qtyCtrl.text.trim()) ?? 1,
            donGia: double.tryParse(
                    _priceCtrl.text.trim().replaceAll('.', '').replaceAll(',', '')) ??
                0,
            ghiChu: _noteCtrl.text.trim(),
          );

    setState(() => _isSaving = false);
    if (ok && mounted) {
      final msg = _editingIndex != null
          ? '✅ Đã cập nhật vật tư'
          : '✅ Đã thêm vật tư phát sinh';
      _cancelEdit();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(msg),
          backgroundColor: const Color(0xff10b981),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  Future<void> _deleteItem(int index) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Xác nhận xóa'),
        content: const Text('Bạn có chắc chắn muốn xóa vật tư này không?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('HỦY'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('XÓA', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirm == true && mounted) {
      setState(() => _isSaving = true);
      final ctrl = context.read<JobController>();
      final ok = await ctrl.deleteVatTuPhatSinh(
        jobId: widget.jobId,
        index: index,
      );
      setState(() => _isSaving = false);
      if (ok && mounted) {
        if (_editingIndex == index) {
          _cancelEdit();
        } else if (_editingIndex != null && _editingIndex! > index) {
          _editingIndex = _editingIndex! - 1;
        }
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Đã xóa vật tư'),
            backgroundColor: Color(0xffef4444),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  /// Format số thành dạng 1.000.000
  String _formatCurrency(double value) {
    if (value == 0) return '0đ';
    final str = value.toInt().toString();
    final result = StringBuffer();
    final len = str.length;
    for (int i = 0; i < len; i++) {
      if (i > 0 && (len - i) % 3 == 0) result.write('.');
      result.write(str[i]);
    }
    return '${result}đ';
  }

  @override
  Widget build(BuildContext context) {
    final ctrl = context.watch<JobController>();
    final idx = ctrl.jobs.indexWhere((j) => j.id == widget.jobId);
    final job = idx != -1 ? ctrl.jobs[idx] : null;
    final vatTuList =
        job?.vatTuPhatSinh ?? <Map<String, dynamic>>[];

    // Tính tổng chi phí vật tư phát sinh
    final tongVatTu = vatTuList.fold<double>(
      0,
      (sum, item) =>
          sum + ((item['thanhTien'] as num?)?.toDouble() ?? 0),
    );

    return Scaffold(
      backgroundColor: const Color(0xfff8fafc),
      appBar: AppBar(
        title: const Text('Vật tư phát sinh'),
        backgroundColor: Colors.white,
        foregroundColor: AppColors.onSurface,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(height: 1, color: const Color(0xffe2e8f0)),
        ),
        actions: [
          if (vatTuList.isNotEmpty)
            TextButton.icon(
              onPressed: () => Navigator.pushNamed(
                context,
                '/invoice',
                arguments: widget.jobId,
              ),
              icon: const Icon(Icons.receipt_long_outlined, size: 18),
              label: const Text('Hóa đơn'),
              style: TextButton.styleFrom(
                foregroundColor: AppColors.primary,
                textStyle: const TextStyle(fontWeight: FontWeight.w700),
              ),
            ),
        ],
      ),
      body: Column(
        children: [
          // ── Tổng chi phí phát sinh ──────────────────────────────────────
          if (tongVatTu > 0)
            Container(
              width: double.infinity,
              color: const Color(0xffea580c).withValues(alpha: 0.08),
              padding:
                  const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Row(
                children: [
                  const Icon(Icons.warning_amber_rounded,
                      color: Color(0xffea580c), size: 20),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'Tổng chi phí vật tư phát sinh',
                      style: TextStyle(
                        color: Color(0xffea580c),
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                      ),
                    ),
                  ),
                  Text(
                    _formatCurrency(tongVatTu),
                    style: const TextStyle(
                      color: Color(0xffea580c),
                      fontWeight: FontWeight.w900,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),

          // ── Form thêm vật tư ────────────────────────────────────────────
          Container(
            color: Colors.white,
            padding: const EdgeInsets.all(20),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _editingIndex != null
                        ? 'Cập nhật vật tư / linh kiện'
                        : 'Thêm vật tư / linh kiện',
                    style: const TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 15,
                      color: AppColors.onSurface,
                    ),
                  ),
                  const SizedBox(height: 14),
                  // Tên vật tư
                  TextFormField(
                    controller: _nameCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Tên vật tư / linh kiện *',
                      hintText: 'VD: Lõi lọc RO, Đầu nối chữ T...',
                      prefixIcon: Icon(Icons.build_outlined),
                    ),
                    validator: (v) => (v == null || v.trim().isEmpty)
                        ? 'Vui lòng nhập tên vật tư'
                        : null,
                  ),
                  const SizedBox(height: 12),
                  // Số lượng + Đơn giá (2 cột)
                  Row(
                    children: [
                      Expanded(
                        flex: 2,
                        child: TextFormField(
                          controller: _qtyCtrl,
                          keyboardType: TextInputType.number,
                          inputFormatters: [
                            FilteringTextInputFormatter.digitsOnly
                          ],
                          onTap: () => _qtyCtrl.selection = TextSelection(
                            baseOffset: 0,
                            extentOffset: _qtyCtrl.text.length,
                          ),
                          decoration: const InputDecoration(
                            labelText: 'Số lượng *',
                            prefixIcon: Icon(Icons.numbers_outlined),
                          ),
                          validator: (v) {
                            final n = int.tryParse(v ?? '');
                            if (n == null || n <= 0) return 'SL >= 1';
                            return null;
                          },
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        flex: 3,
                        child: TextFormField(
                          controller: _priceCtrl,
                          keyboardType: TextInputType.number,
                          inputFormatters: [
                            FilteringTextInputFormatter.digitsOnly
                          ],
                          onTap: () => _priceCtrl.selection = TextSelection(
                            baseOffset: 0,
                            extentOffset: _priceCtrl.text.length,
                          ),
                          decoration: const InputDecoration(
                            labelText: 'Đơn giá (VNĐ)',
                            prefixIcon: Icon(Icons.attach_money_outlined),
                            suffixText: 'đ',
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  // Ghi chú
                  TextFormField(
                    controller: _noteCtrl,
                    maxLines: 2,
                    decoration: const InputDecoration(
                      labelText: 'Ghi chú (tuỳ chọn)',
                      hintText: 'Lý do cần thêm, model cụ thể...',
                      prefixIcon: Icon(Icons.notes_outlined),
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _isSaving ? null : _saveItem,
                      icon: _isSaving
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.white),
                            )
                          : Icon(_editingIndex != null
                              ? Icons.check_circle_outline
                              : Icons.add_circle_outline),
                      label: Text(_isSaving
                          ? 'Đang lưu...'
                          : (_editingIndex != null
                              ? 'CẬP NHẬT VẬT TƯ'
                              : 'THÊM VẬT TƯ')),
                    ),
                  ),
                  if (_editingIndex != null) ...[
                    const SizedBox(height: 8),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        onPressed: _isSaving ? null : _cancelEdit,
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.red,
                          side: const BorderSide(color: Colors.red),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: const Text('HỦY CẬP NHẬT'),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),

          // ── Divider ─────────────────────────────────────────────────────
          Container(
            color: const Color(0xfff1f5f9),
            padding:
                const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            width: double.infinity,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Đã thêm (${vatTuList.length})',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: Color(0xff64748b),
                    letterSpacing: 0.5,
                  ),
                ),
                if (vatTuList.isNotEmpty)
                  Text(
                    'Tổng: ${_formatCurrency(tongVatTu)}',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                      color: Color(0xffea580c),
                    ),
                  ),
              ],
            ),
          ),

          // ── Danh sách vật tư ────────────────────────────────────────────
          Expanded(
            child: vatTuList.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.inventory_2_outlined,
                            size: 56, color: Colors.grey.shade300),
                        const SizedBox(height: 12),
                        Text(
                          'Chưa có vật tư phát sinh',
                          style: TextStyle(color: Colors.grey.shade400),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: vatTuList.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (context, i) {
                      final item = vatTuList[i];
                      final soLuong = (item['soLuong'] as num?)?.toInt() ?? 1;
                      final donGia =
                          (item['donGia'] as num?)?.toDouble() ?? 0;
                      final thanhTien =
                          (item['thanhTien'] as num?)?.toDouble() ??
                              soLuong * donGia;
                      return Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border:
                              Border.all(color: const Color(0xffe2e8f0)),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.04),
                              blurRadius: 8,
                            ),
                          ],
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: AppColors.primary.withValues(alpha: 0.1),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.build,
                                  color: AppColors.primary, size: 18),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item['tenVatTu'] ?? '',
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w800,
                                      fontSize: 14,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Row(
                                    children: [
                                      _badge('x$soLuong',
                                          const Color(0xffea580c)),
                                      if (donGia > 0) ...[
                                        const SizedBox(width: 6),
                                        _badge(
                                            '${_formatCurrency(donGia)}/cái',
                                            const Color(0xff0284c7)),
                                      ],
                                    ],
                                  ),
                                  if ((item['ghiChu'] as String?)
                                          ?.isNotEmpty ==
                                      true) ...[
                                    const SizedBox(height: 4),
                                    Text(
                                      item['ghiChu'] as String,
                                      style: TextStyle(
                                        color: Colors.grey.shade500,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                            const SizedBox(width: 12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                if (thanhTien > 0)
                                  Text(
                                    _formatCurrency(thanhTien),
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w900,
                                      fontSize: 15,
                                      color: Color(0xff10b981),
                                    ),
                                  ),
                                const SizedBox(height: 8),
                                Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Material(
                                      color: Colors.transparent,
                                      child: InkWell(
                                        onTap: () => _startEdit(i, item),
                                        borderRadius: BorderRadius.circular(20),
                                        child: Container(
                                          padding: const EdgeInsets.all(6),
                                          decoration: BoxDecoration(
                                            color: const Color(0xff0284c7).withValues(alpha: 0.1),
                                            shape: BoxShape.circle,
                                          ),
                                          child: const Icon(Icons.edit_outlined,
                                              size: 15, color: Color(0xff0284c7)),
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Material(
                                      color: Colors.transparent,
                                      child: InkWell(
                                        onTap: () => _deleteItem(i),
                                        borderRadius: BorderRadius.circular(20),
                                        child: Container(
                                          padding: const EdgeInsets.all(6),
                                          decoration: BoxDecoration(
                                            color: Colors.red.withValues(alpha: 0.1),
                                            shape: BoxShape.circle,
                                          ),
                                          child: const Icon(Icons.delete_outline,
                                              size: 15, color: Colors.red),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
          ),

          // ── Nút xem hóa đơn ─────────────────────────────────────────────
          if (vatTuList.isNotEmpty)
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                child: SizedBox(
                  width: double.infinity,
                  height: 54,
                  child: ElevatedButton.icon(
                    onPressed: () => Navigator.pushNamed(
                      context,
                      '/invoice',
                      arguments: widget.jobId,
                    ),
                    icon: const Icon(Icons.receipt_long_outlined),
                    label: const Text('XEM HÓA ĐƠN KHÁCH HÀNG'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16)),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _badge(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontWeight: FontWeight.w800,
          fontSize: 12,
        ),
      ),
    );
  }
}
