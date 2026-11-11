<?php
namespace App\Logging;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Monolog\Handler\AbstractProcessingHandler;
use Monolog\LogRecord;
use Monolog\Logger;
use App\Models\Log as LogModel;

class MysqlLoggerHandler extends AbstractProcessingHandler
{
    public function __construct($level = Logger::DEBUG, bool $bubble = true)
    {
        parent::__construct($level, $bubble);
    }

    protected function write(LogRecord $record): void
    {
        try{
            $context = $record->context;
            if(isset($context['exception']) && is_object($context['exception'])){
                $context['exception'] = (array)$context['exception'];
            }
            $isConsole = app()->runningInConsole();
            $requestData = $isConsole ? [] : (request()->all() ?? []);
            $log = [
                'title' => $record->message,
                'level' => $record->level->getName(),
                'host' => $record->extra['request_host'] ?? ($isConsole ? '' : request()->getSchemeAndHttpHost()),
                'uri' => $record->extra['request_uri'] ?? ($isConsole ? '' : request()->getRequestUri()),
                'method' => $record->extra['request_method'] ?? ($isConsole ? 'CLI' : request()->getMethod()),
                'ip' => $isConsole ? '127.0.0.1' : request()->getClientIp(),
                'data' => json_encode($requestData),
                'context' => json_encode($context),
                'created_at' => $record->datetime->getTimestamp(),
                'updated_at' => $record->datetime->getTimestamp(),
            ];

            LogModel::insert(
                $log
            );
        }catch (\Exception $e){
            Log::channel('daily')->error($e->getMessage().$e->getFile().$e->getTraceAsString());
        }
    }
}
