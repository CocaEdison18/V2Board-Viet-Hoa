<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class V2boardUpdate extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'v2board:update';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cập nhật V2Board';

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
        \Artisan::call('config:cache');
        DB::connection()->getPdo();
        $file = \File::get(base_path() . '/database/update.sql');
        if (!$file) {
            abort(500, 'Tệp cơ sở dữ liệu không tồn tại');
        }
        $sql = str_replace("\n", "", $file);
        $sql = preg_split("/;/", $sql);
        if (!is_array($sql)) {
            abort(500, 'Định dạng tệp cơ sở dữ liệu không hợp lệ');
        }
        $this->info('Đang nhập cơ sở dữ liệu, vui lòng chờ...');
        foreach ($sql as $item) {
            if (!$item) continue;
            try {
                DB::unprepared($item);
            } catch (\Exception $e) {
            }
        }
        \Artisan::call('horizon:terminate');
        $this->info('Cập nhật hoàn tất. Dịch vụ hàng đợi đã khởi động lại. Bạn không cần thao tác thêm.');
    }
}
