import 'package:flutter/material.dart';
import 'package:customer_app/features/products/screens/products_screen.dart';
import 'package:customer_app/features/products/screens/product_detail_screen.dart';
import 'package:customer_app/features/cart/screens/checkout_screen.dart';
import 'package:customer_app/features/home/home_screen.dart';
import 'package:customer_app/features/profile/screens/profile_screen.dart';
import 'package:customer_app/features/profile/screens/edit_profile_screen.dart';
import 'package:customer_app/features/profile/screens/addresses_screen.dart';
import 'package:customer_app/features/profile/screens/add_address_screen.dart';
import 'package:customer_app/features/profile/screens/favorites_screen.dart';
import 'package:customer_app/features/orders/screens/orders_screen.dart';
import 'package:customer_app/features/orders/screens/order_detail_screen.dart';
import 'package:customer_app/models/product_model.dart';
import 'package:customer_app/models/order_model.dart';
import 'package:customer_app/features/cart/screens/address_schedule_screen.dart';
import 'package:customer_app/features/cart/screens/order_confirmation_screen.dart';
import 'package:customer_app/features/orders/screens/order_tracking_screen.dart';
import 'package:customer_app/features/support/screens/support_screen.dart';

Route<dynamic>? mainRouteGenerator(RouteSettings settings) {
  switch (settings.name) {
    case '/':
      return MaterialPageRoute(builder: (_) => const HomeScreen());
    case '/products':
      return MaterialPageRoute(builder: (_) => const ProductsScreen());
    case '/product-detail':
      final product = settings.arguments as Product;
      return MaterialPageRoute(builder: (_) => ProductDetailScreen(product: product));
    case '/cart':
      return MaterialPageRoute(builder: (_) => const CheckoutScreen());
    case '/checkout':
      return MaterialPageRoute(builder: (_) => const CheckoutScreen());
     case '/address-schedule':
      return MaterialPageRoute(builder: (_) => const AddressScheduleScreen());
    case '/order-confirmation':
      return MaterialPageRoute(
        builder: (_) => const OrderConfirmationScreen(),
        settings: settings, // giữ settings để truyền arguments
      );
    case '/order-tracking':
      return MaterialPageRoute(
        builder: (_) => const OrderTrackingScreen(),
        settings: settings, // giữ settings để truyền arguments
      );
    case '/orders':
      return MaterialPageRoute(builder: (_) => const OrdersScreen());
    case '/order-detail':
      final order = settings.arguments as Order;
      return MaterialPageRoute(builder: (_) => OrderDetailScreen(orderData: order));
    case '/edit-profile':
      return MaterialPageRoute(builder: (_) => const EditProfileScreen());
    case '/addresses':
      return MaterialPageRoute(builder: (_) => const AddressesScreen());
    case '/add-address':
      return MaterialPageRoute(builder: (_) => const AddAddressScreen());
    case '/favorites':
      return MaterialPageRoute(builder: (_) => const FavoritesScreen());
    case '/profile':
      return MaterialPageRoute(builder: (_) => const ProfileScreen());
    case '/support':
      return MaterialPageRoute(builder: (_) => const SupportScreen());
    default:
      return null;
  }
}
