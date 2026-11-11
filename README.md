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
# Hướng dẫn cài đặt MutilSpace từ mã nguồn

## 1. Chuẩn bị

- Máy chủ Linux với PHP CLI và PHP-FPM **8.4**; `composer.json` yêu cầu PHP `^8.4`. Cài các extension PHP mà Composer báo thiếu, đặc biệt PDO MySQL và Redis.
- MySQL (đã dùng với MySQL 8), Redis, Composer, Nginx hoặc Apache, HTTPS và quyền quản trị máy chủ.
- Tên miền trỏ đến máy chủ. Đặt thư mục web gốc của site tới `public/`, không đặt tới gốc dự án.
- Tạo **một cơ sở dữ liệu MySQL mới, trống** và một tài khoản chỉ có quyền trên cơ sở dữ liệu đó. Bộ cài sẽ nhập `database/install.sql`; không dùng cơ sở dữ liệu đang chứa dữ liệu cần giữ.

## 2. Giải nén và cài đặt

Giải nén gói mã nguồn vào thư mục riêng, ví dụ `/www/wwwroot/mutilspace.example`. Trên aaPanel, chọn PHP 8.4 cho site và đặt Website Directory/Running Directory tới `public`. Mở terminal tại thư mục gốc dự án, nơi có `artisan` và `init.sh`:

```bash
cd /www/wwwroot/mutilspace.example
sh init.sh
```

Bộ cài hỏi host, tên cơ sở dữ liệu, người dùng, mật khẩu MySQL, email và mật khẩu quản trị. Mật khẩu quản trị được **hiển thị khi gõ** theo thiết kế hiện tại; chỉ nhập trong terminal riêng đáng tin cậy và không chia sẻ ảnh màn hình hoặc lịch sử terminal. Lệnh cài đặt yêu cầu terminal tương tác.

Nếu dùng `php` mặc định khác PHP 8.4, hãy cấu hình PHP 8.4 làm `php` CLI trước khi chạy. `init.sh` tải Composer rồi cài thư viện qua Internet. Khi có lỗi SQL, bộ cài dừng với mã lỗi. Giữ lại `.env` để chẩn đoán; sau khi xử lý lỗi, tạo cơ sở dữ liệu mới, trống và dùng bản giải nén mới để cài lại. Không chạy lại bộ cài trên cơ sở dữ liệu đã nhập một phần hoặc đang có dữ liệu.

## 3. Cấu hình sau cài đặt

Mở `.env` trên máy chủ và đặt `APP_URL` thành URL HTTPS thực tế. Giữ `APP_DEBUG=false` và `APP_ENV=production`. Lưu các giá trị `APP_KEY`, `DB_PASSWORD`, mật khẩu mail và khóa thanh toán bên ngoài kho Git. Sau khi sửa `.env`, chạy:

```bash
php artisan config:clear
php artisan config:cache
```

Trang quản trị mặc định ở `https://ten-mien-cua-ban/admin123`. Hãy đổi đường dẫn quản trị trong phần cấu hình hệ thống sau khi đăng nhập. Đừng nhầm đường dẫn quản trị web này với đường dẫn đăng nhập aaPanel.

Đảm bảo tài khoản chạy PHP-FPM có quyền ghi vào `storage/` và `bootstrap/cache/`. Với Nginx, chuyển các URL không trùng tệp thật về `index.php` theo cấu hình Laravel (`try_files $uri $uri/ /index.php?$query_string;`).

## 4. Tác vụ nền

Redis phải hoạt động vì `.env.example` dùng Redis cho hàng đợi và phiên đăng nhập. Chạy Laravel Horizon bằng systemd, Supervisor hoặc trình quản lý tiến trình tương đương và tự khởi động lại khi lỗi. Thêm cron cho Laravel scheduler:

```cron
* * * * * cd /www/wwwroot/mutilspace.example && /duong/dan/php84 artisan schedule:run >> /dev/null 2>&1
```

Thay đường dẫn dự án và PHP bằng giá trị thực tế trên máy chủ. Chạy Horizon bằng cùng phiên bản PHP và cùng người dùng vận hành site.

## 5. Kiểm tra

Kiểm tra trang khách hàng, đăng nhập quản trị, tạo gói thử nghiệm và trang trạng thái hàng đợi. Nếu lỗi, xem `storage/logs/` và log PHP-FPM/Nginx. Không đăng log chứa thông tin đăng nhập lên kho công khai.

## 6. Phát hành và nâng cấp

Gói mã nguồn không có dữ liệu hoạt động, thư viện `vendor/`, `.env` hoặc `composer.lock`. `composer install` sẽ giải quyết phiên bản phụ thuộc tại thời điểm cài và tạo lock riêng trên máy của bạn. Khi vận hành chính thức, hãy lưu lock trong kho triển khai riêng để các lần triển khai dùng cùng phiên bản thư viện.

Không chạy `update.sh` hoặc `update_dev.sh` từ V2Board gốc trên bản fork này: các lệnh đó có thể đưa mã về upstream và ghi đè thay đổi của MutilSpace. Trước mỗi lần nâng cấp, sao lưu cơ sở dữ liệu và `.env`, rồi thử trên bản sao trước khi cập nhật site thật.

Phần JavaScript giao diện nền hiện chỉ có bundle đã biên dịch, chưa có dự án frontend đầy đủ để xây dựng lại. Bản dịch tiếng Việt vẫn có thể còn chuỗi chưa hoàn thiện; đây là bản thử nghiệm, chưa được kiểm thử đầy đủ trên mọi cấu hình máy chủ.
