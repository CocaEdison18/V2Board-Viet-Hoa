<?php

/**
 * Alipay face-to-face payment gateway.
 */
namespace App\Payments;

class AlipayF2F {
    public function __construct($config)
    {
        $this->config = $config;
    }

    public function form()
    {
        return [
            'app_id' => [
                'label' => 'APP ID Alipay',
                'description' => '',
                'type' => 'input',
            ],
            'private_key' => [
                'label' => 'Khóa riêng Alipay',
                'description' => '',
                'type' => 'input',
            ],
            'public_key' => [
                'label' => 'Khóa công khai Alipay',
                'description' => '',
                'type' => 'input',
            ],
            'product_name' => [
                'label' => 'Tên sản phẩm tùy chỉnh',
                'description' => 'Tên này sẽ hiển thị trên hóa đơn Alipay',
                'type' => 'input'
            ]
        ];
    }

    public function pay($order)
    {
        try {
            $gateway = new \Library\AlipayF2F();
            $gateway->setMethod('alipay.trade.precreate');
            $gateway->setAppId($this->config['app_id']);
            $gateway->setPrivateKey($this->config['private_key']); // Accepts either a file path or key contents.
            $gateway->setAlipayPublicKey($this->config['public_key']); // Accepts either a file path or key contents.
            $gateway->setNotifyUrl($order['notify_url']);
            $gateway->setBizContent([
                'subject' => $this->config['product_name'] ?? (config('v2board.app_name', 'V2Board') . ' - Gói dịch vụ'),
                'out_trade_no' => $order['trade_no'],
                'total_amount' => $order['total_amount'] / 100
            ]);
            $gateway->send();
            return [
                'type' => 0, // 0:qrcode 1:url
                'data' => $gateway->getQrCodeUrl()
            ];
        } catch (\Exception $e) {
            abort(500, $e->getMessage());
        }
    }

    public function notify($params)
    {
        if ($params['trade_status'] !== 'TRADE_SUCCESS') return false;
        $gateway = new \Library\AlipayF2F();
        $gateway->setAppId($this->config['app_id']);
        $gateway->setPrivateKey($this->config['private_key']); // Accepts either a file path or key contents.
        $gateway->setAlipayPublicKey($this->config['public_key']); // Accepts either a file path or key contents.
        try {
            if ($gateway->verify($params)) {
                /**
                 * Payment is successful
                 */
                return [
                    'trade_no' => $params['out_trade_no'],
                    'callback_no' => $params['trade_no']
                ];
            } else {
                /**
                 * Payment is not successful
                 */
                return false;
            }
        } catch (\Exception $e) {
            /**
             * Payment is not successful
             */
            return false;
        }
    }
}
