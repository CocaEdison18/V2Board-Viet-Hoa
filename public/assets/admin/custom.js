(function () {
    'use strict';

    const BRAND = 'MutilSpace';
    const exact = {
        '仪表盘': 'Tổng quan',
        '系统配置': 'Cấu hình hệ thống',
        '支付配置': 'Cấu hình thanh toán',
        '主题配置': 'Cấu hình giao diện',
        '节点管理': 'Quản lý máy chủ',
        '权限组管理': 'Nhóm quyền',
        '路由管理': 'Quản lý định tuyến',
        '订阅管理': 'Quản lý gói dịch vụ',
        '订单管理': 'Quản lý đơn hàng',
        '优惠券管理': 'Quản lý mã giảm giá',
        '用户管理': 'Quản lý người dùng',
        '公告管理': 'Quản lý thông báo',
        '工单管理': 'Quản lý hỗ trợ',
        '知识库管理': 'Kho hướng dẫn',
        '队列监控': 'Giám sát hàng đợi',
        '设置': 'Cài đặt',
        '服务器': 'Máy chủ',
        '财务': 'Tài chính',
        '用户': 'Người dùng',
        '指标': 'Giám sát',
        '搜索': 'Tìm kiếm',
        '登出': 'Đăng xuất',
        '站点': 'Trang web',
        '站点名称': 'Tên trang web',
        '站点描述': 'Mô tả trang web',
        '站点网址': 'Địa chỉ trang web',
        '货币单位': 'Đơn vị tiền tệ',
        '货币符号': 'Ký hiệu tiền tệ',
        '安全': 'Bảo mật',
        '邮箱验证': 'Xác minh email',
        '安全模式': 'Chế độ an toàn',
        '后台路径': 'Đường dẫn quản trị',
        '邮箱后缀白名单': 'Danh sách miền email cho phép',
        '防机器人': 'Chống robot',
        '注册限制': 'Giới hạn đăng ký',
        '防爆破限制': 'Chống dò mật khẩu',
        '订阅': 'Gói dịch vụ',
        '邀请': 'Giới thiệu',
        '佣金': 'Hoa hồng',
        '个性化': 'Cá nhân hóa',
        '边栏风格': 'Kiểu thanh bên',
        '头部风格': 'Kiểu thanh trên',
        '主题色': 'Màu chủ đạo',
        '背景': 'Hình nền',
        '默认': 'Mặc định',
        '黑色': 'Đen',
        '暗蓝色': 'Xanh đậm',
        '奶绿色': 'Xanh lá',
        '节点': 'Máy chủ',
        '通讯密钥': 'Khóa giao tiếp',
        '邮件': 'Email',
        '服务器地址': 'Địa chỉ máy chủ',
        '服务端口': 'Cổng dịch vụ',
        '加密方式': 'Phương thức mã hóa',
        '账号': 'Tài khoản',
        '密码': 'Mật khẩu',
        '发件地址': 'Địa chỉ gửi',
        '邮件模板': 'Mẫu email',
        '发送测试邮件': 'Gửi email thử',
        '机器人': 'Bot thông báo',
        '开启机器人通知': 'Bật thông báo bot',
        '群组地址': 'Liên kết nhóm',
        '操作': 'Thao tác',
        '编辑': 'Chỉnh sửa',
        '删除': 'Xóa',
        '添加': 'Thêm',
        '新建': 'Tạo mới',
        '取消': 'Hủy',
        '提交': 'Xác nhận',
        '保存': 'Lưu',
        '保存成功': 'Đã lưu',
        '设置成功': 'Cập nhật thành công',
        '发送成功': 'Gửi thành công',
        '发送失败': 'Gửi thất bại',
        '请求失败': 'Yêu cầu thất bại',
        '确定': 'Xác nhận',
        '警告': 'Cảnh báo',
        '状态': 'Trạng thái',
        '显示': 'Hiển thị',
        '标题': 'Tiêu đề',
        '内容': 'Nội dung',
        '创建时间': 'Thời gian tạo',
        '更新时间': 'Thời gian cập nhật',
        '运行中': 'Đang chạy',
        '未启动': 'Chưa khởi động',
        '队列名称': 'Tên hàng đợi',
        '作业量': 'Số tác vụ',
        '任务量': 'Số nhiệm vụ',
        '占用时间': 'Thời gian xử lý',
        '今天': 'Hôm nay',
        '日期': 'Ngày',
        '上一页': 'Trang trước',
        '下一页': 'Trang sau',
        '名称': 'Tên',
        '类型': 'Loại',
        '金额': 'Số tiền',
        '比例': 'Tỷ lệ',
        '剩余次数': 'Lượt còn lại',
        '无限': 'Không giới hạn',
        '有效期': 'Thời hạn',
        '邮箱': 'Email',
        '余额': 'Số dư',
        '流量': 'Dung lượng',
        '到期时间': 'Ngày hết hạn',
        '长期有效': 'Không hết hạn',
        '订阅计划': 'Gói dịch vụ',
        '账户状态': 'Trạng thái tài khoản',
        '封禁': 'Khóa',
        '正常': 'Hoạt động',
        '是否管理员': 'Quyền quản trị',
        '是否员工': 'Nhân viên',
        '备注': 'Ghi chú',
        '查看': 'Xem',
        '已开启': 'Đã bật',
        '启用': 'Bật',
        '禁用': 'Tắt',
        '登录到管理中心': 'Đăng nhập trang quản trị',
        '登入': 'Đăng nhập',
        '忘记密码': 'Quên mật khẩu',
        '管理员邮箱': 'Email quản trị',
        '我知道了': 'Đã hiểu',
        '最后在线': 'Truy cập gần nhất',
        '从未在线': 'Chưa từng trực tuyến',
        '已用': 'Đã dùng',
        '加入时间': 'Ngày tham gia',
        '管理员': 'Quản trị viên',
        '过滤器': 'Bộ lọc',
        '导出': 'Xuất dữ liệu',
        '发送邮件': 'Gửi email',
        '批量封禁': 'Khóa hàng loạt',
        '发送中': 'Đang gửi',
        '显示名称': 'Tên hiển thị',
        '图标': 'Biểu tượng',
        '选填': 'Không bắt buộc',
        '通知地址': 'Địa chỉ webhook',
        '条件': 'Điều kiện',
        '字段名': 'Trường',
        '检索': 'Tìm kiếm',
        '编辑订阅': 'Sửa gói dịch vụ',
        '新建订阅': 'Tạo gói dịch vụ',
        '套餐名称': 'Tên gói',
        '套餐描述': 'Mô tả gói',
        '售价设置': 'Giá bán',
        '月付': '1 tháng',
        '季付': '3 tháng',
        '半年付': '6 tháng',
        '年付': '1 năm',
        '两年付': '2 năm',
        '三年付': '3 năm',
        '一次性': 'Vĩnh viễn',
        '套餐流量': 'Dung lượng gói',
        '排序': 'Thứ tự',
        '销售状态': 'Trạng thái bán',
        '续费': 'Gia hạn',
        '订单信息': 'Thông tin đơn hàng',
        '订单号': 'Mã đơn',
        '订单周期': 'Chu kỳ',
        '订单状态': 'Trạng thái đơn',
        '待支付': 'Chờ thanh toán',
        '已取消': 'Đã hủy',
        '已完成': 'Hoàn tất',
        '待确认': 'Chờ xác nhận',
        '无效': 'Không hợp lệ',
        '系统设置': 'Cài đặt hệ thống',
        '今日收入': 'Doanh thu hôm nay',
        '本月收入': 'Doanh thu tháng này',
        '上月收入': 'Doanh thu tháng trước',
        '上月佣金支出': 'Hoa hồng tháng trước',
        '本月新增用户': 'Người dùng mới tháng này',
        '昨日节点流量排行': 'Lưu lượng máy chủ hôm qua',
        '简体中文': 'Tiếng Trung giản thể',
        '繁體中文': 'Tiếng Trung phồn thể',
        '日本語': 'Tiếng Nhật'
    };

    const partial = {
        '佣金笔数': 'Số lượt hoa hồng',
        '佣金金额': 'Số tiền hoa hồng',
        '收款笔数': 'Số giao dịch nhận tiền',
        '收款金额': 'Số tiền đã thu',
        '重置UUID及': 'Đặt lại UUID và ',
        '自定义优惠券码': 'Mã giảm giá tùy chỉnh',
        '留空随机生成': 'để trống để tạo ngẫu nhiên',
        '套餐名称': 'tên gói',
        '套餐描述': 'mô tả gói',
        '套餐流量': 'dung lượng gói',
        '用户邮箱': 'email người dùng',
        '公告内容': 'nội dung thông báo',
        '图片URL': 'URL hình ảnh',
        '添加订阅': 'Thêm gói dịch vụ',
        '添加条件': 'Thêm điều kiện',
        '流量记录': 'Lịch sử dung lượng',
        '已发放': 'đã chi trả',
        '已用': 'Đã dùng',
        '流量': 'Dung lượng',
        '订阅': 'gói dịch vụ',
        '复制': 'Sao chép ',
        '取消': 'Hủy',
        '提交': 'Xác nhận',
        '检索': 'Tìm kiếm',
        '重置': 'Đặt lại',
        '请输入': 'Vui lòng nhập ',
        '请选择': 'Vui lòng chọn ',
        '开启后': 'Sau khi bật, ',
        '不限制': 'không giới hạn',
        '为空则': 'nếu để trống sẽ ',
        '不使用请留空': 'Để trống nếu không sử dụng',
        '添加权限组': 'Thêm nhóm quyền',
        '新建节点': 'Tạo máy chủ',
        '编辑节点': 'Sửa máy chủ',
        '节点名称': 'Tên máy chủ',
        '节点地址': 'Địa chỉ máy chủ',
        '连接端口': 'Cổng kết nối',
        '传输协议': 'Giao thức truyền',
        '路由组': 'Nhóm định tuyến',
        '复制成功': 'Đã sao chép',
        '当前队列服务运行异常': 'Dịch vụ hàng đợi đang bất thường',
        '立即处理': 'Xử lý ngay',
        '条工单等待处理': ' yêu cầu hỗ trợ đang chờ',
        '笔佣金等待确认': ' hoa hồng đang chờ xác nhận',
        '确定要删除': 'Bạn có chắc muốn xóa ',
        '吗？': ' không?'
    };

    Object.assign(exact, window.MUTILSPACE_ADMIN_I18N || {});
    Object.assign(partial, window.MUTILSPACE_ADMIN_PARTIAL || {});

    const partialEntries = Object.entries(partial).sort((a, b) => b[0].length - a[0].length);
    const composableEntries = Object.entries(exact)
        .filter(([from]) => Array.from(from).length >= 2)
        .sort((a, b) => b[0].length - a[0].length);
    const isChinese = value => /[\u3400-\u9fff]/.test(value || '');

    function translate(value) {
        if (!value) return value;
        const leading = value.match(/^\s*/)[0];
        const trailing = value.match(/\s*$/)[0];
        const core = value.trim();
        if (exact[core]) return leading + exact[core] + trailing;
        const compactCore = core.replace(/\s+/g, '');
        if (compactCore !== core && exact[compactCore]) {
            return leading + exact[compactCore] + trailing;
        }
        if (!isChinese(value)) return value;

        let result = value;
        partialEntries.forEach(([from, to]) => {
            if (result.includes(from)) result = result.split(from).join(to);
        });
        composableEntries.forEach(([from, to]) => {
            if (result.includes(from)) result = result.split(from).join(to);
        });
        return result;
    }

    function translateElement(root) {
        if (!root || root.nodeType !== Node.ELEMENT_NODE) return;
        const tag = root.tagName && root.tagName.toLowerCase();
        if (['script', 'style', 'noscript'].includes(tag)) return;

        const elements = [
            root,
            ...root.querySelectorAll('[placeholder], [title], [aria-label], [data-placeholder], [alt]')
        ];
        elements.forEach(element => {
            ['placeholder', 'title', 'aria-label', 'data-placeholder', 'alt'].forEach(attribute => {
                if (!element.hasAttribute(attribute)) return;
                const current = element.getAttribute(attribute);
                const translated = translate(current);
                if (translated !== current) element.setAttribute(attribute, translated);
            });

            if (['BUTTON', 'INPUT'].includes(element.tagName) && element.hasAttribute('value')) {
                const current = element.getAttribute('value');
                const translated = translate(current);
                if (translated !== current) element.setAttribute('value', translated);
            }
        });

        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                const parentTag = node.parentElement && node.parentElement.tagName.toLowerCase();
                return ['script', 'style', 'noscript', 'textarea'].includes(parentTag)
                    ? NodeFilter.FILTER_REJECT
                    : NodeFilter.FILTER_ACCEPT;
            }
        });
        const textNodes = [];
        while (walker.nextNode()) textNodes.push(walker.currentNode);
        textNodes.forEach(node => {
            const translated = translate(node.nodeValue);
            if (translated !== node.nodeValue) node.nodeValue = translated;
        });
    }

    function applyBrand() {
        document.documentElement.lang = 'vi';
        document.title = BRAND + ' - Quản trị';

        document.querySelectorAll('.v2board-copyright').forEach(element => {
            element.textContent = BRAND + ' v1.0';
        });

        document.querySelectorAll('#sidebar, .sidebar').forEach(sidebar => {
            const walker = document.createTreeWalker(sidebar, NodeFilter.SHOW_TEXT);
            const nodes = [];
            while (walker.nextNode()) nodes.push(walker.currentNode);
            nodes.forEach(node => {
                if (/^V2Board\s+v[\d.]+$/i.test(node.nodeValue.trim())) {
                    node.nodeValue = node.nodeValue.replace(/V2Board\s+v[\d.]+/i, BRAND + ' v1.0');
                }
            });
        });

        document.querySelectorAll('a').forEach(link => {
            const text = link.textContent.trim();
            if (!['V2Board', BRAND].includes(text)) return;
            if (link.querySelector('.ms-brand-mark')) return;
            link.innerHTML = '<img class="ms-brand-mark" src="/brand/favicon.svg" alt="">' +
                '<span>' + BRAND + '</span>';
            link.setAttribute('aria-label', BRAND);
        });
    }

    let scheduled = false;
    function refresh() {
        if (scheduled) return;
        scheduled = true;
        window.requestAnimationFrame(() => {
            translateElement(document.body);
            applyBrand();
            scheduled = false;
        });
    }

    const start = () => {
        refresh();
        new MutationObserver(refresh).observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ['placeholder', 'title', 'aria-label', 'data-placeholder', 'alt', 'value']
        });
        document.addEventListener('click', () => {
            [0, 60, 250, 750].forEach(delay => window.setTimeout(refresh, delay));
        }, true);
        window.addEventListener('hashchange', () => {
            [0, 100, 500].forEach(delay => window.setTimeout(refresh, delay));
        });
        window.setInterval(refresh, 2000);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
})();
