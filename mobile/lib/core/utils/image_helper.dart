import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../constants/api_constants.dart';
import '../constants/app_colors.dart';

class ImageHelper {
  /// Converts any image URL into a fully qualified URL
  static String resolveUrl(String? rawUrl) {
    if (rawUrl == null || rawUrl.trim().isEmpty) {
      return '';
    }
    final trimmed = rawUrl.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    final host = ApiConstants.hostUrl;
    if (trimmed.startsWith('/')) {
      return '$host$trimmed';
    }
    return '$host/$trimmed';
  }

  /// Builds a cached network image with placeholder and error fallback
  static Widget buildCachedImage({
    required String? imageUrl,
    double? width,
    double? height,
    BoxFit fit = BoxFit.cover,
    BorderRadius? borderRadius,
  }) {
    final fullUrl = resolveUrl(imageUrl);

    Widget imageWidget;
    if (fullUrl.isEmpty) {
      imageWidget = Container(
        width: width,
        height: height,
        color: AppColors.surfaceLight,
        child: const Center(
          child: Icon(Icons.cake_outlined, color: AppColors.primaryLight, size: 28),
        ),
      );
    } else {
      imageWidget = CachedNetworkImage(
        imageUrl: fullUrl,
        width: width,
        height: height,
        fit: fit,
        placeholder: (context, url) => Container(
          width: width,
          height: height,
          color: AppColors.surfaceLight.withOpacity(0.5),
          child: const Center(
            child: SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
            ),
          ),
        ),
        errorWidget: (context, url, error) => Container(
          width: width,
          height: height,
          color: AppColors.surfaceLight,
          child: const Center(
            child: Icon(Icons.broken_image_outlined, color: Colors.grey, size: 28),
          ),
        ),
      );
    }

    if (borderRadius != null) {
      return ClipRRect(
        borderRadius: borderRadius,
        child: imageWidget,
      );
    }
    return imageWidget;
  }
}
