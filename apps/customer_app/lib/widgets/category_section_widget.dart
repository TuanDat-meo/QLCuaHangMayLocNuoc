import 'package:flutter/material.dart';

class CategorySectionWidget extends StatelessWidget {
  final String? selectedCategory;
  final Function(String) onCategorySelected;

  const CategorySectionWidget({
    super.key,
    this.selectedCategory,
    required this.onCategorySelected,
  });

  static const List<_CategoryData> _categories = [
    _CategoryData(
      label: 'Máy lọc RO',
      firestoreValue: 'Máy lọc RO',
      icon: Icons.opacity_outlined,
      color: Color(0xff0284c7),
      bgColor: Color(0xffe0f2fe),
    ),
    _CategoryData(
      label: 'Máy Nano',
      firestoreValue: 'Máy Nano',
      icon: Icons.waves_outlined,
      color: Color(0xff0891b2),
      bgColor: Color(0xffcffafe),
    ),
    _CategoryData(
      label: 'Ion Kiềm',
      firestoreValue: 'Ion Kiềm',
      icon: Icons.bolt_outlined,
      color: Color(0xffd97706),
      bgColor: Color(0xfffef3c7),
    ),
    _CategoryData(
      label: 'Linh kiện',
      firestoreValue: 'Linh kiện',
      icon: Icons.settings_suggest_outlined,
      color: Color(0xff0f766e),
      bgColor: Color(0xffccfbf1),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 4,
                height: 20,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xff00459a), Color(0xff0062db)],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(width: 10),
              const Text(
                'Danh mục sản phẩm',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: Color(0xff0b1c30),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 4,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 0.85,
            children: _categories.map((cat) {
              final isSelected = selectedCategory == cat.firestoreValue;
              return _CategoryCard(
                data: cat,
                isSelected: isSelected,
                onTap: () => onCategorySelected(cat.firestoreValue),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class _CategoryCard extends StatelessWidget {
  final _CategoryData data;
  final bool isSelected;
  final VoidCallback onTap;

  const _CategoryCard({
    required this.data,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        curve: Curves.easeOut,
        decoration: BoxDecoration(
          color: isSelected ? data.color : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? data.color : const Color(0xffe2e8f0),
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: data.color.withValues(alpha: 0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ]
              : [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: isSelected
                    ? Colors.white.withValues(alpha: 0.2)
                    : data.bgColor,
                shape: BoxShape.circle,
              ),
              child: Icon(
                data.icon,
                size: 22,
                color: isSelected ? Colors.white : data.color,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              data.label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: isSelected ? Colors.white : const Color(0xff475569),
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

class _CategoryData {
  final String label;
  final String firestoreValue;
  final IconData icon;
  final Color color;
  final Color bgColor;

  const _CategoryData({
    required this.label,
    required this.firestoreValue,
    required this.icon,
    required this.color,
    required this.bgColor,
  });
}