<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminLocale
{
    private static $exact;
    private static $composable;
    private static $partial;

    public static function isAdminRequest(Request $request): bool
    {
        $route = $request->route();
        if ($route && method_exists($route, 'gatherMiddleware')) {
            foreach ($route->gatherMiddleware() as $middleware) {
                if ($middleware === 'admin' || $middleware === \App\Http\Middleware\Admin::class) {
                    return true;
                }
            }
        }

        $securePath = trim((string) config(
            'v2board.secure_path',
            config('v2board.frontend_admin_path', 'admin123')
        ), '/');

        return $securePath !== ''
            && strpos(trim($request->path(), '/'), 'api/v1/' . $securePath . '/') === 0;
    }

    public static function translateResponse(Response $response, bool $allowComposition = false): Response
    {
        if ($response instanceof JsonResponse) {
            $response->setData(self::translateValue($response->getData(true), $allowComposition));
            return $response;
        }

        $contentType = (string) $response->headers->get('Content-Type');
        if (stripos($contentType, 'application/json') === false) {
            return $response;
        }

        $decoded = json_decode($response->getContent(), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return $response;
        }

        $response->setContent(json_encode(
            self::translateValue($decoded, $allowComposition),
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        ));

        return $response;
    }

    public static function translateValue($value, bool $allowComposition = false)
    {
        if (is_string($value)) {
            return self::translateString($value, $allowComposition);
        }

        if (is_array($value)) {
            foreach ($value as $key => $item) {
                $value[$key] = self::translateValue($item, $allowComposition);
            }
        }

        return $value;
    }

    public static function translateString(string $value, bool $allowComposition = true): string
    {
        self::boot();

        $trimmed = trim($value);
        if (isset(self::$exact[$trimmed])) {
            $leadingLength = strlen($value) - strlen(ltrim($value));
            $trailingStart = strlen(rtrim($value));

            return substr($value, 0, $leadingLength)
                . self::$exact[$trimmed]
                . substr($value, $trailingStart);
        }

        if (!preg_match('/[\x{3400}-\x{9fff}]/u', $value)) {
            return $value;
        }

        if (!$allowComposition) {
            return $value;
        }

        $translated = strtr($value, self::$partial);
        return strtr($translated, self::$composable);
    }

    private static function boot(): void
    {
        if (self::$exact !== null) {
            return;
        }

        $path = resource_path('lang/vi/admin.json');
        $dictionary = json_decode((string) @file_get_contents($path), true);
        $apiDictionary = json_decode((string) @file_get_contents(resource_path('lang/vi/admin-api.json')), true);
        self::$exact = is_array($dictionary['exact'] ?? null) ? $dictionary['exact'] : [];
        if (is_array($apiDictionary)) {
            self::$exact = array_merge(self::$exact, $apiDictionary);
        }
        $partial = is_array($dictionary['partial'] ?? null) ? $dictionary['partial'] : [];

        self::$partial = self::sortLongestFirst($partial);
        self::$composable = self::sortLongestFirst(array_filter(
            self::$exact,
            function ($translation, $source) {
                return mb_strlen((string) $source, 'UTF-8') >= 2;
            },
            ARRAY_FILTER_USE_BOTH
        ));
    }

    private static function sortLongestFirst(array $dictionary): array
    {
        uksort($dictionary, function ($left, $right) {
            return mb_strlen((string) $right, 'UTF-8') <=> mb_strlen((string) $left, 'UTF-8');
        });
        return $dictionary;
    }
}
