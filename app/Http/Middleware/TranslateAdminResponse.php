<?php

namespace App\Http\Middleware;

use App\Support\AdminLocale;
use Closure;

class TranslateAdminResponse
{
    public function handle($request, Closure $next)
    {
        return AdminLocale::translateResponse($next($request));
    }
}
