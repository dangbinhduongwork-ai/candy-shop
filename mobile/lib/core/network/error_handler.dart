import 'package:dio/dio.dart';

class ErrorHandler {
  /// Converts any exception into a friendly Vietnamese error message
  static String getErrorMessage(dynamic error) {
    if (error is DioException) {
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
          return 'Kết nối tới máy chủ quá thời gian. Vui lòng kiểm tra mạng.';
        case DioExceptionType.sendTimeout:
          return 'Gửi dữ liệu quá thời gian. Vui lòng thử lại.';
        case DioExceptionType.receiveTimeout:
          return 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.';
        case DioExceptionType.badResponse:
          return _parseResponseError(error.response);
        case DioExceptionType.cancel:
          return 'Yêu cầu đã bị hủy.';
        case DioExceptionType.connectionError:
          return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc địa chỉ máy chủ.';
        default:
          return 'Đã xảy ra sự cố không xác định. Vui lòng thử lại.';
      }
    }
    return error?.toString() ?? 'Đã xảy ra lỗi.';
  }

  static String _parseResponseError(Response? response) {
    if (response == null) {
      return 'Không nhận được phản hồi từ máy chủ.';
    }

    final data = response.data;
    if (data is Map<String, dynamic>) {
      // Backend may return {"message": "..."} or {"error": "..."}
      if (data.containsKey('message') && data['message'] != null) {
        return data['message'].toString();
      }
      if (data.containsKey('error') && data['error'] != null) {
        return data['error'].toString();
      }
    }

    switch (response.statusCode) {
      case 400:
        return 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
      case 401:
        return 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.';
      case 403:
        return 'Bạn không có quyền thực hiện thao tác này.';
      case 404:
        return 'Không tìm thấy dữ liệu yêu cầu.';
      case 500:
        return 'Máy chủ gặp sự cố nội bộ. Vui lòng thử lại sau.';
      default:
        return 'Lỗi máy chủ (${response.statusCode}).';
    }
  }
}
