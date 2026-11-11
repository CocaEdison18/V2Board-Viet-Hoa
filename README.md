# MutilSpace

MutilSpace là bản phát triển dựa trên [V2Board](https://github.com/v2board/v2board), gồm giao diện, thương hiệu và bản địa hóa tiếng Việt. Mã nguồn được phân phối theo giấy phép MIT; xem [LICENSE](LICENSE) và [NOTICE.md](NOTICE.md).

## Cài đặt

Xem [HUONG_DAN_CAI_DAT.md](HUONG_DAN_CAI_DAT.md) để chuẩn bị máy chủ, tạo cơ sở dữ liệu mới, cài đặt và cấu hình tác vụ nền.

Yêu cầu chính theo `composer.json`: PHP 8.4, Composer, MySQL và Redis. Thư mục web gốc phải là `public/`.

## Phạm vi bản phát hành

- Bao gồm mã PHP, SQL khởi tạo, bản dịch, giao diện đã biên dịch và tài nguyên thương hiệu.
- Không bao gồm cơ sở dữ liệu hoặc dữ liệu người dùng, `.env`, khóa bí mật, thư viện `vendor/`, bản sao lưu và nhật ký.
- Giao diện JavaScript gốc được phân phối ở dạng đã biên dịch như bản V2Board nền; kho này chưa có dự án nguồn để biên dịch lại toàn bộ giao diện.
- Bản dịch tiếng Việt vẫn đang được hoàn thiện; phản hồi về chuỗi chưa dịch được hoan nghênh.

Đây là bản mã nguồn thử nghiệm. Hãy kiểm tra trên một máy chủ riêng trước khi đưa vào phục vụ người dùng.
