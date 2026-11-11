<?php
namespace App\Services;


use App\Jobs\SendEmailJob;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class TicketService {
    public function reply($ticket, $message, $userId)
    {
        DB::beginTransaction();
        $ticketMessage = TicketMessage::create([
            'user_id' => $userId,
            'ticket_id' => $ticket->id,
            'message' => $message
        ]);
        if ($userId !== $ticket->user_id) {
            $ticket->reply_status = 0;
        } else {
            $ticket->reply_status = 1;
        }
        if (!$ticketMessage || !$ticket->save()) {
            DB::rollback();
            return false;
        }
        DB::commit();
        return $ticketMessage;
    }

    public function replyByAdmin($ticketId, $message, $userId):void
    {
        $ticket = Ticket::where('id', $ticketId)
            ->first();
        if (!$ticket) {
            abort(500, __('Ticket does not exist'));
        }
        $ticket->status = 0;
        DB::beginTransaction();
        $ticketMessage = TicketMessage::create([
            'user_id' => $userId,
            'ticket_id' => $ticket->id,
            'message' => $message
        ]);
        if ($userId !== $ticket->user_id) {
            $ticket->reply_status = 0;
        } else {
            $ticket->reply_status = 1;
        }
        if (!$ticketMessage || !$ticket->save()) {
            DB::rollback();
            abort(500, __('Ticket reply failed'));
        }
        DB::commit();
        $this->sendEmailNotify($ticket, $ticketMessage);
    }

    // Avoid sending duplicate notifications within 30 minutes.
    private function sendEmailNotify(Ticket $ticket, TicketMessage $ticketMessage)
    {
        $user = User::find($ticket->user_id);
        $cacheKey = 'ticket_sendEmailNotify_' . $ticket->user_id;
        if (!Cache::get($cacheKey)) {
            Cache::put($cacheKey, 1, 1800);
            SendEmailJob::dispatch([
                'email' => $user->email,
                'subject' => 'Yêu cầu hỗ trợ của bạn trên ' . config('v2board.app_name', 'V2Board') . ' đã có phản hồi',
                'template_name' => 'notify',
                'template_value' => [
                    'name' => config('v2board.app_name', 'V2Board'),
                    'url' => config('v2board.app_url'),
                    'content' => "Chủ đề: {$ticket->subject}\r\nNội dung phản hồi: {$ticketMessage->message}"
                ]
            ]);
        }
    }
}
