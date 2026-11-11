<?php

namespace App\Payments;

use Stripe\Stripe;
use Stripe\Checkout\Session;

class StripeCheckout {
    public function __construct($config)
    {
        $this->config = $config;
    }

    public function form()
    {
        return [
            'currency' => [
                'label' => 'Đơn vị tiền tệ',
                'description' => '',
                'type' => 'input',
            ],
            'stripe_sk_live' => [
                'label' => 'SK_LIVE',
                'description' => 'Khóa bí mật API',
                'type' => 'input',
            ],
            'stripe_pk_live' => [
                'label' => 'PK_LIVE',
                'description' => 'Khóa công khai API',
                'type' => 'input',
            ],
            'stripe_webhook_key' => [
                'label' => 'Chữ ký bí mật Webhook',
                'description' => '',
                'type' => 'input',
            ],
            'stripe_custom_field_name' => [
                'label' => 'Tên trường tùy chỉnh',
                'description' => 'Ví dụ: Thông tin liên hệ, để có thể liên hệ khách hàng kịp thời',
                'type' => 'input',
            ]
        ];
    }

    public function pay($order)
    {
        $currency = $this->config['currency'];
        $exchange = $this->exchange('CNY', strtoupper($currency));
        if (!$exchange) {
            abort(500, __('Currency conversion has timed out, please try again later'));
        }
        $customFieldName = isset($this->config['stripe_custom_field_name']) ? $this->config['stripe_custom_field_name'] : 'Contact Infomation';

        $params = [
            'success_url' => $order['return_url'],
            'cancel_url' => $order['return_url'],
            'client_reference_id' => $order['trade_no'],
            'line_items' => [
                [
                    'price_data' => [
                        'currency' => $currency,
                        'product_data' => [
                            'name' => $order['trade_no']
                        ],
                        'unit_amount' => floor($order['total_amount'] * $exchange)
                    ],
                    'quantity' => 1
                ]
            ],
            'mode' => 'payment',
            'invoice_creation' => ['enabled' => true],
            'phone_number_collection' => ['enabled' => true],
            'custom_fields' => [
                [
                    'key' => 'contactinfo',
                    'label' => ['type' => 'custom', 'custom' => $customFieldName],
                    'type' => 'text',
                ],
            ],
            // 'customer_email' => $user['email'] not support

        ];

        Stripe::setApiKey($this->config['stripe_sk_live']);
        try {
            $session = Session::create($params);
        } catch (\Exception $e) {
            info($e);
            abort(500, "Failed to create order. Error: {$e->getMessage}");
        }
        return [
            'type' => 1, // 0:qrcode 1:url
            'data' => $session->url
        ];
    }

    public function notify($params)
    {
        \Stripe\Stripe::setApiKey($this->config['stripe_sk_live']);
        try {
            $event = \Stripe\Webhook::constructEvent(
                file_get_contents('php://input'),
                $_SERVER['HTTP_STRIPE_SIGNATURE'],
                $this->config['stripe_webhook_key']
            );
        } catch (\Stripe\Error\SignatureVerification $e) {
            abort(400);
        }

        switch ($event->type) {
            case 'checkout.session.completed':
                $object = $event->data->object;
                if ($object->payment_status === 'paid') {
                    return [
                        'trade_no' => $object->client_reference_id,
                        'callback_no' => $object->payment_intent
                    ];
                }
                break;
            case 'checkout.session.async_payment_succeeded':
                $object = $event->data->object;
                return [
                    'trade_no' => $object->client_reference_id,
                    'callback_no' => $object->payment_intent
                ];
                break;
            default:
                abort(500, 'event is not support');
        }
        die('success');
    }

    private function exchange($from, $to)
    {
        $result = file_get_contents('https://api.exchangerate.host/latest?symbols=' . $to . '&base=' . $from);
        $result = json_decode($result, true);
        return $result['rates'][$to];
    }
}
