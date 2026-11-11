<?php

namespace App\Providers;

use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Laravel\Horizon\Horizon;
use Laravel\Horizon\HorizonApplicationServiceProvider;

class HorizonServiceProvider extends HorizonApplicationServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        parent::boot();

        // V2Board authenticates API requests with its own JWT instead of
        // Laravel's session guard. Horizon's default authorization callback
        // only checks $request->user(), so it would reject a valid V2Board
        // administrator and cause the admin UI to clear the login token.
        Horizon::auth(function (Request $request) {
            $authorization = $request->input('auth_data')
                ?? $request->header('authorization');
            $user = $authorization
                ? AuthService::decryptAuthData($authorization)
                : false;

            return $user && !empty($user['is_admin']);
        });

        // Horizon::routeSmsNotificationsTo('15556667777');
        // Horizon::routeMailNotificationsTo('example@example.com');
        // Horizon::routeSlackNotificationsTo('slack-webhook-url', '#channel');

        // Horizon::night();
    }

    /**
     * Register the Horizon gate.
     *
     * This gate determines who can access Horizon in non-local environments.
     *
     * @return void
     */
    protected function gate()
    {
        Gate::define('viewHorizon', function ($user) {
            return in_array($user->email, [
                //
            ]);
        });
    }
}
