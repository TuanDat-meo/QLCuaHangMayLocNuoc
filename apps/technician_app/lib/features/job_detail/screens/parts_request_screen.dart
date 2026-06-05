import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
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
  int? _selectedAvailableStock;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _qtyCtrl.dispose();
    _priceCtrl.dispose();
    _noteCtrl.dispose();
    super.dispose();
  }

  Future<void> _showCatalogDialog() async {
    final ctrl = context.read<JobController>();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return _CatalogSelectorSheet(
          onSelect: (name, price, tonKho) {
            setState(() {
              _nameCtrl.text = name;
              _priceCtrl.text = price.toInt().toString();
              _selectedAvailableStock = tonKho;
            });
          },
          fetchProducts: ctrl.fetchStandardProducts,
          fetchCategories: ctrl.fetchCategories,
        );
      },
    );
  }

  void _startEdit(int index, Map<String, dynamic> item) {
    setState(() {
      _editingIndex = index;
      _nameCtrl.text = item['tenVatTu'] ?? '';
      _qtyCtrl.text = (item['soLuong'] ?? 1).toString();
      _priceCtrl.text = (item['donGia'] ?? 0).toInt().toString();
      _noteCtrl.text = item['ghiChu'] ?? '';
      _selectedAvailableStock = null; // Reset when editing existing
    });
  }

  void _cancelEdit() {
    setState(() {
      _editingIndex = null;
      _nameCtrl.clear();
      _qtyCtrl.text = '1';
      _priceCtrl.text = '0';
      _noteCtrl.clear();
      _selectedAvailableStock = null;
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
            donGia:
                double.tryParse(
                  _priceCtrl.text
                      .trim()
                      .replaceAll('.', '')
                      .replaceAll(',', ''),
                ) ??
                0,
            ghiChu: _noteCtrl.text.trim(),
          )
        : await ctrl.addVatTuPhatSinh(
            jobId: widget.jobId,
            tenVatTu: _nameCtrl.text.trim(),
            soLuong: int.tryParse(_qtyCtrl.text.trim()) ?? 1,
            donGia:
                double.tryParse(
                  _priceCtrl.text
                      .trim()
                      .replaceAll('.', '')
                      .replaceAll(',', ''),
                ) ??
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
    final vatTuList = job?.vatTuPhatSinh ?? <Map<String, dynamic>>[];

    // Tính tổng chi phí vật tư phát sinh
    final tongVatTu = vatTuList.fold<double>(
      0,
      (sum, item) => sum + ((item['thanhTien'] as num?)?.toDouble() ?? 0),
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
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Row(
                children: [
                  const Icon(
                    Icons.warning_amber_rounded,
                    color: Color(0xffea580c),
                    size: 20,
                  ),
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
                  // Nút chọn từ danh mục chuẩn
                  Card(
                    color: AppColors.primary.withValues(alpha: 0.06),
                    margin: const EdgeInsets.only(bottom: 14),
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                      side: BorderSide(
                        color: AppColors.primary.withValues(alpha: 0.2),
                      ),
                    ),
                    child: ListTile(
                      dense: true,
                      leading: const Icon(
                        Icons.inventory_2_outlined,
                        color: AppColors.primary,
                      ),
                      title: const Text(
                        'Chọn từ danh mục chuẩn',
                        style: TextStyle(
                          fontWeight: FontWeight.w800,
                          color: AppColors.primary,
                          fontSize: 13,
                        ),
                      ),
                      subtitle: const Text(
                        'Đồng bộ giá & thông số trực tiếp từ kho',
                      ),
                      trailing: const Icon(
                        Icons.arrow_forward_ios,
                        size: 12,
                        color: AppColors.primary,
                      ),
                      onTap: _showCatalogDialog,
                    ),
                  ),
                  // Tên vật tư
                  TextFormField(
                    controller: _nameCtrl,
                    enableSuggestions: false,
                    autocorrect: false,
                    decoration: const InputDecoration(
                      labelText: 'Tên vật tư / linh kiện *',
                      hintText: 'VD: Lõi lọc RO, Đầu nối chữ T...',
                      prefixIcon: Icon(Icons.build_outlined),
                    ),
                    onChanged: (val) {
                      if (_selectedAvailableStock != null) {
                        setState(() {
                          _selectedAvailableStock = null;
                        });
                      }
                    },
                    validator: (v) => (v == null || v.trim().isEmpty)
                        ? 'Vui lòng nhập tên vật tư'
                        : null,
                  ),
                  if (_selectedAvailableStock != null) ...[
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: _selectedAvailableStock! > 0
                            ? const Color(0xff10b981).withValues(alpha: 0.08)
                            : const Color(0xffef4444).withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            _selectedAvailableStock! > 0
                                ? Icons.info_outline
                                : Icons.error_outline,
                            color: _selectedAvailableStock! > 0
                                ? const Color(0xff10b981)
                                : const Color(0xffef4444),
                            size: 16,
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              _selectedAvailableStock! > 0
                                  ? 'Sản phẩm tiêu chuẩn. Số lượng tồn kho: $_selectedAvailableStock sản phẩm'
                                  : '⚠️ Sản phẩm này hiện đã HẾT HÀNG trong kho!',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: _selectedAvailableStock! > 0
                                    ? const Color(0xff10b981)
                                    : const Color(0xffef4444),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
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
                            FilteringTextInputFormatter.digitsOnly,
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
                            if (_selectedAvailableStock != null) {
                              if (_selectedAvailableStock! <= 0) {
                                return 'Hết hàng!';
                              }
                              if (n > _selectedAvailableStock!) {
                                return 'Kho chỉ còn $_selectedAvailableStock sp';
                              }
                            }
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
                            FilteringTextInputFormatter.digitsOnly,
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
                    enableSuggestions: false,
                    autocorrect: false,
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
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : Icon(
                              _editingIndex != null
                                  ? Icons.check_circle_outline
                                  : Icons.add_circle_outline,
                            ),
                      label: Text(
                        _isSaving
                            ? 'Đang lưu...'
                            : (_editingIndex != null
                                  ? 'CẬP NHẬT VẬT TƯ'
                                  : 'THÊM VẬT TƯ'),
                      ),
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
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
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
                        Icon(
                          Icons.inventory_2_outlined,
                          size: 56,
                          color: Colors.grey.shade300,
                        ),
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
                      final donGia = (item['donGia'] as num?)?.toDouble() ?? 0;
                      final thanhTien =
                          (item['thanhTien'] as num?)?.toDouble() ??
                          soLuong * donGia;
                      return Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: const Color(0xffe2e8f0)),
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
                              child: const Icon(
                                Icons.build,
                                color: AppColors.primary,
                                size: 18,
                              ),
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
                                      _badge(
                                        'x$soLuong',
                                        const Color(0xffea580c),
                                      ),
                                      if (donGia > 0) ...[
                                        const SizedBox(width: 6),
                                        _badge(
                                          '${_formatCurrency(donGia)}/cái',
                                          const Color(0xff0284c7),
                                        ),
                                      ],
                                    ],
                                  ),
                                  if ((item['ghiChu'] as String?)?.isNotEmpty ==
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
                                            color: const Color(
                                              0xff0284c7,
                                            ).withValues(alpha: 0.1),
                                            shape: BoxShape.circle,
                                          ),
                                          child: const Icon(
                                            Icons.edit_outlined,
                                            size: 15,
                                            color: Color(0xff0284c7),
                                          ),
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
                                            color: Colors.red.withValues(
                                              alpha: 0.1,
                                            ),
                                            shape: BoxShape.circle,
                                          ),
                                          child: const Icon(
                                            Icons.delete_outline,
                                            size: 15,
                                            color: Colors.red,
                                          ),
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
                        borderRadius: BorderRadius.circular(16),
                      ),
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

class _CatalogSelectorSheet extends StatefulWidget {
  final void Function(String name, double price, int tonKho) onSelect;
  final Future<List<Map<String, dynamic>>> Function() fetchProducts;
  final Future<List<Map<String, dynamic>>> Function() fetchCategories;

  const _CatalogSelectorSheet({
    required this.onSelect,
    required this.fetchProducts,
    required this.fetchCategories,
  });

  @override
  State<_CatalogSelectorSheet> createState() => _CatalogSelectorSheetState();
}

class _CatalogSelectorSheetState extends State<_CatalogSelectorSheet> {
  bool _loading = true;
  List<Map<String, dynamic>> _products = [];
  final List<Map<String, dynamic>> _categories = const [
    {'id': 'Máy lọc RO', 'name': 'Máy lọc RO', 'icon': '🚰'},
    {'id': 'Máy Nano', 'name': 'Máy Nano', 'icon': '🔬'},
    {'id': 'Máy Ion Kiềm', 'name': 'Máy Ion Kiềm', 'icon': '🧪'},
    {'id': 'Linh kiện', 'name': 'Linh kiện', 'icon': '⚙️'},
    {'id': 'Lõi lọc', 'name': 'Lõi lọc', 'icon': '🌀'},
    {'id': 'Khác', 'name': 'Khác', 'icon': '📦'},
  ];
  String _searchQuery = '';
  String _selectedCategoryId = '';
  late final TextEditingController _searchCtrl;

  @override
  void initState() {
    super.initState();
    _searchCtrl = TextEditingController();
    _loadData();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    try {
      final res = await widget.fetchProducts();
      if (mounted) {
        setState(() {
          _products = res;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _formatCurrency(double value) {
    final formatter = NumberFormat.currency(
      locale: 'vi_VN',
      symbol: 'đ',
      decimalDigits: 0,
    );
    return formatter.format(value);
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _products.where((p) {
      final matchesSearch =
          p['name'].toString().toLowerCase().contains(
            _searchQuery.toLowerCase(),
          ) ||
          p['brand'].toString().toLowerCase().contains(
            _searchQuery.toLowerCase(),
          ) ||
          p['sku'].toString().toLowerCase().contains(
            _searchQuery.toLowerCase(),
          );

      if (_selectedCategoryId.isEmpty) {
        return matchesSearch;
      }

      final prodCat = p['category'].toString().toLowerCase().trim();
      final selCat = _selectedCategoryId.toLowerCase().trim();

      if (selCat == 'khác') {
        final knownCats = [
          'máy lọc ro',
          'máy nano',
          'máy ion kiềm',
          'linh kiện',
          'lõi lọc',
        ];
        return matchesSearch && !knownCats.contains(prodCat);
      }

      return matchesSearch && prodCat == selCat;
    }).toList();

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 16,
      ),
      height: MediaQuery.of(context).size.height * 0.75,
      child: Column(
        children: [
          const SizedBox(height: 12),
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Danh mục vật tư chuẩn',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: AppColors.onSurface,
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchCtrl,
              enableSuggestions: false,
              autocorrect: false,
              onChanged: (val) => setState(() => _searchQuery = val),
              decoration: InputDecoration(
                hintText: 'Tìm kiếm vật tư, linh kiện...',
                prefixIcon: const Icon(Icons.search),
                contentPadding: const EdgeInsets.symmetric(
                  vertical: 0,
                  horizontal: 16,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
                fillColor: Colors.grey[50],
              ),
            ),
          ),
          if (_categories.isNotEmpty) ...[
            SizedBox(
              height: 38,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _categories.length + 1,
                itemBuilder: (context, idx) {
                  final isAll = idx == 0;
                  final cat = isAll ? null : _categories[idx - 1];
                  final isSelected = isAll
                      ? _selectedCategoryId.isEmpty
                      : _selectedCategoryId == cat!['id'];

                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      selected: isSelected,
                      label: Text(
                        isAll ? 'Tất cả' : '${cat!['icon']} ${cat['name']}',
                        style: TextStyle(
                          fontWeight: isSelected
                              ? FontWeight.w800
                              : FontWeight.normal,
                          color: isSelected ? Colors.white : Colors.black87,
                        ),
                      ),
                      selectedColor: AppColors.primary,
                      backgroundColor: Colors.grey[100],
                      onSelected: (val) {
                        setState(() {
                          _selectedCategoryId = isAll ? '' : cat!['id'];
                        });
                      },
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 12),
          ],
          const Divider(height: 1),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.inventory_2_outlined,
                          size: 48,
                          color: Colors.grey[300],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Không tìm thấy vật tư phù hợp',
                          style: TextStyle(color: Colors.grey[500]),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    itemCount: filtered.length,
                    separatorBuilder: (context, idx) =>
                        const Divider(height: 1),
                    itemBuilder: (context, idx) {
                      final prod = filtered[idx];
                      return ListTile(
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 8,
                        ),
                        title: Text(
                          prod['name'],
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
                            color: AppColors.onSurface,
                          ),
                        ),
                        subtitle: Row(
                          children: [
                            if (prod['brand'].toString().isNotEmpty) ...[
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 1,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.blue[50],
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  prod['brand'],
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: Colors.blue[800],
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 6),
                            ],
                            Text(
                              'SKU: ${prod['sku']}',
                              style: TextStyle(
                                fontSize: 11,
                                color: Colors.grey[500],
                              ),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 1,
                              ),
                              decoration: BoxDecoration(
                                color: (prod['tonKho'] ?? 0) > 0
                                    ? const Color(0xffecfdf5)
                                    : const Color(0xfffff1f2),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                (prod['tonKho'] ?? 0) > 0
                                    ? 'Kho: ${prod['tonKho']}'
                                    : 'Hết hàng',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: (prod['tonKho'] ?? 0) > 0
                                      ? const Color(0xff065f46)
                                      : const Color(0xff9f1239),
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ],
                        ),
                        trailing: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              _formatCurrency(prod['price']),
                              style: const TextStyle(
                                fontWeight: FontWeight.w900,
                                fontSize: 14,
                                color: AppColors.primary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Chọn ➜',
                              style: TextStyle(
                                fontSize: 11,
                                color: AppColors.primary.withValues(alpha: 0.8),
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                        onTap: () {
                          widget.onSelect(
                            prod['name'],
                            prod['price'],
                            prod['tonKho'] ?? 0,
                          );
                          Navigator.pop(context);
                        },
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
