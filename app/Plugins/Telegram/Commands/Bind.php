<?php

namespace App\Plugins\Telegram\Commands;

use App\Models\User;
use App\Plugins\Telegram\Telegram;

class Bind extends Telegram {
    public $command = '/bind';
    public $description = 'Liên kết tài khoản Telegram với trang web';

    public function handle($message, $match = []) {
        if (!$message->is_private) return;
        if (!isset($message->args[0])) {
            abort(500, 'Vui lòng gửi kèm liên kết dịch vụ');
        }
        $subscribeUrl = $message->args[0];
        $subscribeUrl = parse_url($subscribeUrl);
        parse_str($subscribeUrl['query'], $query);
        $token = $query['token'];
        if (!$token) {
            abort(500, 'Liên kết dịch vụ không hợp lệ');
        }
        $user = User::where('token', $token)->first();
        if (!$user) {
            abort(500, 'Người dùng không tồn tại');
        }
        if ($user->telegram_id) {
            abort(500, 'Tài khoản này đã liên kết với Telegram');
        }
        $user->telegram_id = $message->chat_id;
        if (!$user->save()) {
            abort(500, 'Thiết lập thất bại');
        }
        $telegramService = $this->telegramService;
        $telegramService->sendMessage($message->chat_id, 'Liên kết thành công');
    }
}
