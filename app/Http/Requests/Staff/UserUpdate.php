<?php

namespace App\Http\Requests\Staff;

use Illuminate\Foundation\Http\FormRequest;

class UserUpdate extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'email' => 'required|email:strict',
            'password' => 'nullable',
            'transfer_enable' => 'numeric',
            'expired_at' => 'nullable|integer',
            'banned' => 'required|in:0,1',
            'plan_id' => 'nullable|integer',
            'commission_rate' => 'nullable|integer|min:0|max:100',
            'discount' => 'nullable|integer|min:0|max:100',
            'u' => 'integer',
            'd' => 'integer',
            'balance' => 'integer',
            'commission_balance' => 'integer'
        ];
    }

    public function messages()
    {
        return [
            'email.required' => 'Email không được để trống',
            'email.email' => 'Định dạng email không hợp lệ',
            'transfer_enable.numeric' => 'Định dạng dung lượng không hợp lệ',
            'expired_at.integer' => 'Thời gian hết hạn không hợp lệ',
            'banned.required' => 'Trạng thái khóa không được để trống',
            'banned.in' => 'Trạng thái khóa không hợp lệ',
            'plan_id.integer' => 'Gói dịch vụ không hợp lệ',
            'commission_rate.integer' => 'Tỷ lệ hoa hồng không hợp lệ',
            'commission_rate.nullable' => 'Tỷ lệ hoa hồng không hợp lệ',
            'commission_rate.min' => 'Tỷ lệ hoa hồng tối thiểu là 0',
            'commission_rate.max' => 'Tỷ lệ hoa hồng tối đa là 100',
            'discount.integer' => 'Tỷ lệ giảm giá riêng không hợp lệ',
            'discount.nullable' => 'Tỷ lệ giảm giá riêng không hợp lệ',
            'discount.min' => 'Tỷ lệ giảm giá riêng tối thiểu là 0',
            'discount.max' => 'Tỷ lệ giảm giá riêng tối đa là 100',
            'u.integer' => 'Dung lượng tải lên không hợp lệ',
            'd.integer' => 'Dung lượng tải xuống không hợp lệ',
            'balance.integer' => 'Số dư không hợp lệ',
            'commission_balance.integer' => 'Số dư hoa hồng không hợp lệ'
        ];
    }
}
