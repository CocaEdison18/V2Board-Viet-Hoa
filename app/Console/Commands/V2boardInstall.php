<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Encryption\Encrypter;
use App\Models\User;
use App\Utils\Helper;
use Illuminate\Support\Facades\DB;

class V2boardInstall extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'v2board:install';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cài đặt MutilSpace';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        try {
            $this->info("__     ______  ____                      _  ");
            $this->info("\ \   / /___ \| __ )  ___   __ _ _ __ __| | ");
            $this->info(" \ \ / /  __) |  _ \ / _ \ / _` | '__/ _` | ");
            $this->info("  \ V /  / __/| |_) | (_) | (_| | | | (_| | ");
            $this->info("   \_/  |_____|____/ \___/ \__,_|_|  \__,_| ");
            if (\File::exists(base_path() . '/.env')) {
                $securePath = config('v2board.secure_path', config('v2board.frontend_admin_path', 'admin123'));
                $this->info("Truy cập http(s)://ten-mien-cua-ban/{$securePath} để vào trang quản trị. Bạn có thể đổi mật khẩu trong trung tâm người dùng.");
                abort(500, 'Muốn cài đặt lại, hãy xóa tệp .env trong thư mục dự án');
            }

            if (!$this->input->isInteractive()) {
                abort(500, 'Cài đặt cần terminal tương tác để tự nhập mật khẩu quản trị');
            }

            if (!copy(base_path() . '/.env.example', base_path() . '/.env')) {
                abort(500, 'Không thể sao chép tệp môi trường. Vui lòng kiểm tra quyền thư mục');
            }
            $this->saveToEnv([
                'APP_KEY' => 'base64:' . base64_encode(Encrypter::generateKey('AES-256-CBC')),
                'DB_HOST' => $this->ask('Nhập địa chỉ cơ sở dữ liệu (mặc định: localhost)', 'localhost'),
                'DB_DATABASE' => $this->ask('Nhập tên cơ sở dữ liệu'),
                'DB_USERNAME' => $this->ask('Nhập tên người dùng cơ sở dữ liệu'),
                'DB_PASSWORD' => $this->ask('Nhập mật khẩu cơ sở dữ liệu')
            ]);
            \Artisan::call('config:clear');
            \Artisan::call('config:cache');
            try {
                DB::connection()->getPdo();
            } catch (\Exception $e) {
                abort(500, 'Kết nối cơ sở dữ liệu thất bại');
            }
            if (count(DB::select('SHOW TABLES')) !== 0) {
                abort(500, 'Cơ sở dữ liệu đã có bảng. Hãy dùng cơ sở dữ liệu mới và trống để tránh mất dữ liệu');
            }
            $file = \File::get(base_path() . '/database/install.sql');
            if (!$file) {
                abort(500, 'Tệp cơ sở dữ liệu không tồn tại');
            }
            $sql = str_replace("\n", "", $file);
            $sql = preg_split("/;/", $sql);
            if (!is_array($sql)) {
                abort(500, 'Định dạng tệp cơ sở dữ liệu không hợp lệ');
            }
            $this->info('Đang nhập cơ sở dữ liệu, vui lòng chờ...');
            foreach ($sql as $index => $item) {
                if (!trim($item)) {
                    continue;
                }
                try {
                    DB::unprepared($item);
                } catch (\Exception $e) {
                    $errorCode = $e instanceof \Illuminate\Database\QueryException
                        ? ($e->errorInfo[1] ?? $e->getCode())
                        : $e->getCode();
                    throw new \RuntimeException("Nhập SQL thất bại ở câu lệnh " . ($index + 1) . " (mã lỗi {$errorCode}). Cần sửa lỗi trước khi chạy lại bộ cài", 0, $e);
                }
            }
            $this->info('Nhập cơ sở dữ liệu hoàn tất');
            $email = '';
            while (!$email) {
                $email = $this->ask('Nhập email quản trị viên?');
            }
            do {
                $password = $this->ask('Nhập mật khẩu quản trị (ít nhất 8 ký tự)');
                if (!is_string($password) || strlen($password) < 8) {
                    $this->error('Mật khẩu quản trị phải có ít nhất 8 ký tự');
                    continue;
                }

                $confirmation = $this->ask('Nhập lại mật khẩu quản trị');
                if (!is_string($confirmation) || !hash_equals($password, $confirmation)) {
                    $this->error('Hai lần nhập mật khẩu không khớp, vui lòng thử lại');
                    continue;
                }

                break;
            } while (true);
            if (!$this->registerAdmin($email, $password)) {
                abort(500, 'Tạo tài khoản quản trị thất bại, vui lòng thử lại');
            }

            $this->info('Mọi thứ đã sẵn sàng');
            $this->info("Email quản trị: {$email}");
            $this->info('Mật khẩu quản trị đã được thiết lập theo lựa chọn của bạn.');

            $securePath = config('v2board.secure_path', config('v2board.frontend_admin_path', 'admin123'));
            $this->info("Truy cập http(s)://ten-mien-cua-ban/{$securePath} để vào trang quản trị. Bạn có thể đổi đường dẫn trong phần cấu hình hệ thống.");
            return self::SUCCESS;
        } catch (\Exception $e) {
            $this->error($e->getMessage());
            return self::FAILURE;
        }
    }

    private function registerAdmin($email, $password)
    {
        $user = new User();
        $user->email = $email;
        if (strlen($password) < 8) {
            abort(500, 'Mật khẩu quản trị phải có ít nhất 8 ký tự');
        }
        $user->password = password_hash($password, PASSWORD_DEFAULT);
        $user->uuid = Helper::guid(true);
        $user->token = Helper::guid();
        $user->is_admin = 1;
        return $user->save();
    }

    private function saveToEnv($data = [])
    {
        function set_env_var($key, $value)
        {
            if (! is_bool(strpos($value, ' '))) {
                $value = '"' . $value . '"';
            }
            $key = strtoupper($key);

            $envPath = app()->environmentFilePath();
            $contents = file_get_contents($envPath);

            preg_match("/^{$key}=[^\r\n]*/m", $contents, $matches);

            $oldValue = count($matches) ? $matches[0] : '';

            if ($oldValue) {
                $contents = str_replace("{$oldValue}", "{$key}={$value}", $contents);
            } else {
                $contents = $contents . "\n{$key}={$value}\n";
            }

            $file = fopen($envPath, 'w');
            fwrite($file, $contents);
            return fclose($file);
        }
        foreach($data as $key => $value) {
            set_env_var($key, $value);
        }
        return true;
    }
}
