<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\UserTransfer;
use App\Http\Requests\User\UserUpdate;
use App\Http\Requests\User\UserChangePassword;
use App\Services\AuthService;
use App\Services\UserService;
use App\Utils\CacheKey;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Plan;
use App\Models\Ticket;
use App\Utils\Helper;
use App\Models\Order;
use Illuminate\Support\Facades\Cache;

class UserController extends Controller
{
    private const AVATAR_EXTENSIONS = ['webp', 'png', 'jpg'];

    private function avatarBaseName(int $userId): string
    {
        $key = (string)config('app.key', 'mutilspace-avatar');
        return hash_hmac('sha256', (string)$userId, $key);
    }

    private function avatarDirectory(): string
    {
        return public_path('uploads/avatars');
    }

    private function avatarUrl(int $userId, string $email): string
    {
        $baseName = $this->avatarBaseName($userId);
        $directory = $this->avatarDirectory();
        foreach (self::AVATAR_EXTENSIONS as $extension) {
            $path = $directory . DIRECTORY_SEPARATOR . $baseName . '.' . $extension;
            if (is_file($path)) {
                return '/uploads/avatars/' . $baseName . '.' . $extension . '?v=' . filemtime($path);
            }
        }

        return 'https://cdn.v2ex.com/gravatar/' . md5($email) . '?s=128&d=identicon';
    }

    public function getActiveSession(Request $request)
    {
        $user = User::find($request->user['id']);
        if (!$user) {
            abort(500, __('The user does not exist'));
        }
        $authService = new AuthService($user);
        return response([
            'data' => $authService->getSessions()
        ]);
    }

    public function removeActiveSession(Request $request)
    {
        $user = User::find($request->user['id']);
        if (!$user) {
            abort(500, __('The user does not exist'));
        }
        $authService = new AuthService($user);
        return response([
            'data' => $authService->removeSession($request->input('session_id'))
        ]);
    }

    public function checkLogin(Request $request)
    {
        $data = [
            'is_login' => $request->user['id'] ? true : false
        ];
        if ($request->user['is_admin']) {
            $data['is_admin'] = true;
        }
        return response([
            'data' => $data
        ]);
    }

    public function changePassword(UserChangePassword $request)
    {
        $user = User::find($request->user['id']);
        if (!$user) {
            abort(500, __('The user does not exist'));
        }
        if (!Helper::multiPasswordVerify(
            $user->password_algo,
            $user->password_salt,
            $request->input('old_password'),
            $user->password)
        ) {
            abort(500, __('The old password is wrong'));
        }
        $user->password = password_hash($request->input('new_password'), PASSWORD_DEFAULT);
        $user->password_algo = NULL;
        $user->password_salt = NULL;
        if (!$user->save()) {
            abort(500, __('Save failed'));
        }
        return response([
            'data' => true
        ]);
    }

    public function info(Request $request)
    {
        $user = User::where('id', $request->user['id'])
            ->select([
                'email',
                'transfer_enable',
                'last_login_at',
                'created_at',
                'banned',
                'remind_expire',
                'remind_traffic',
                'expired_at',
                'balance',
                'commission_balance',
                'plan_id',
                'discount',
                'commission_rate',
                'telegram_id',
                'uuid'
            ])
            ->first();
        if (!$user) {
            abort(500, __('The user does not exist'));
        }
        $user['avatar_url'] = $this->avatarUrl((int)$request->user['id'], $user->email);
        return response([
            'data' => $user
        ]);
    }

    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048']
        ], [
            'avatar.required' => 'Vui lòng chọn ảnh đại diện.',
            'avatar.file' => 'Tệp ảnh đại diện không hợp lệ.',
            'avatar.mimes' => 'Ảnh đại diện chỉ hỗ trợ JPG, PNG hoặc WebP.',
            'avatar.max' => 'Ảnh đại diện không được lớn hơn 2 MB.'
        ]);

        $user = User::find($request->user['id']);
        if (!$user) {
            abort(500, __('The user does not exist'));
        }

        $file = $request->file('avatar');
        if (!$file || !$file->isValid()) {
            abort(422, 'Tệp ảnh đại diện không hợp lệ.');
        }

        $mime = $file->getMimeType();
        $extension = match ($mime) {
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            default => null
        };
        $imageInfo = @getimagesize($file->getRealPath());
        if (!$extension || !$imageInfo || $imageInfo[0] > 4096 || $imageInfo[1] > 4096) {
            abort(422, 'Ảnh đại diện không hợp lệ hoặc có kích thước điểm ảnh quá lớn.');
        }

        $directory = $this->avatarDirectory();
        if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) {
            abort(500, 'Không thể tạo thư mục lưu ảnh đại diện.');
        }

        $baseName = $this->avatarBaseName((int)$user->id);
        $temporaryName = $baseName . '.upload-' . bin2hex(random_bytes(6)) . '.' . $extension;
        $file->move($directory, $temporaryName);
        $temporaryPath = $directory . DIRECTORY_SEPARATOR . $temporaryName;

        foreach (self::AVATAR_EXTENSIONS as $oldExtension) {
            $oldPath = $directory . DIRECTORY_SEPARATOR . $baseName . '.' . $oldExtension;
            if (is_file($oldPath)) {
                @unlink($oldPath);
            }
        }

        $targetPath = $directory . DIRECTORY_SEPARATOR . $baseName . '.' . $extension;
        if (!rename($temporaryPath, $targetPath)) {
            @unlink($temporaryPath);
            abort(500, 'Không thể lưu ảnh đại diện.');
        }
        @chmod($targetPath, 0644);

        return response([
            'data' => [
                'avatar_url' => $this->avatarUrl((int)$user->id, $user->email)
            ]
        ]);
    }

    public function getStat(Request $request)
    {
        $stat = [
            Order::where('status', 0)
                ->where('user_id', $request->user['id'])
                ->count(),
            Ticket::where('status', 0)
                ->where('user_id', $request->user['id'])
                ->count(),
            User::where('invite_user_id', $request->user['id'])
                ->count()
        ];
        return response([
            'data' => $stat
        ]);
    }

    public function getSubscribe(Request $request)
    {
        $user = User::where('id', $request->user['id'])
            ->select([
                'plan_id',
                'token',
                'expired_at',
                'u',
                'd',
                'transfer_enable',
                'email',
                'uuid'
            ])
            ->first();
        if (!$user) {
            abort(500, __('The user does not exist'));
        }
        if ($user->plan_id) {
            $user['plan'] = Plan::find($user->plan_id);
            if (!$user['plan']) {
                abort(500, __('Subscription plan does not exist'));
            }
        }
        $user['subscribe_url'] = Helper::getSubscribeUrl("/api/v1/client/subscribe?token={$user['token']}");
        $userService = new UserService();
        $user['reset_day'] = $userService->getResetDay($user);
        return response([
            'data' => $user
        ]);
    }

    public function resetSecurity(Request $request)
    {
        $user = User::find($request->user['id']);
        if (!$user) {
            abort(500, __('The user does not exist'));
        }
        $user->uuid = Helper::guid(true);
        $user->token = Helper::guid();
        if (!$user->save()) {
            abort(500, __('Reset failed'));
        }
        return response([
            'data' => Helper::getSubscribeUrl('/api/v1/client/subscribe?token=' . $user->token)
        ]);
    }

    public function update(UserUpdate $request)
    {
        $updateData = $request->only([
            'remind_expire',
            'remind_traffic'
        ]);

        $user = User::find($request->user['id']);
        if (!$user) {
            abort(500, __('The user does not exist'));
        }
        try {
            $user->update($updateData);
        } catch (\Exception $e) {
            abort(500, __('Save failed'));
        }

        return response([
            'data' => true
        ]);
    }

    public function transfer(UserTransfer $request)
    {
        $user = User::find($request->user['id']);
        if (!$user) {
            abort(500, __('The user does not exist'));
        }
        if ($request->input('transfer_amount') > $user->commission_balance) {
            abort(500, __('Insufficient commission balance'));
        }
        $user->commission_balance = $user->commission_balance - $request->input('transfer_amount');
        $user->balance = $user->balance + $request->input('transfer_amount');
        if (!$user->save()) {
            abort(500, __('Transfer failed'));
        }
        return response([
            'data' => true
        ]);
    }

    public function getQuickLoginUrl(Request $request)
    {
        $user = User::find($request->user['id']);
        if (!$user) {
            abort(500, __('The user does not exist'));
        }

        $code = Helper::guid();
        $key = CacheKey::get('TEMP_TOKEN', $code);
        Cache::put($key, $user->id, 60);
        $redirect = '/#/login?verify=' . $code . '&redirect=' . ($request->input('redirect') ? $request->input('redirect') : 'dashboard');
        if (config('v2board.app_url')) {
            $url = config('v2board.app_url') . $redirect;
        } else {
            $url = url($redirect);
        }
        return response([
            'data' => $url
        ]);
    }
}
