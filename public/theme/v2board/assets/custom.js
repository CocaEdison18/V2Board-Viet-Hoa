(function () {
    'use strict';

    const BRAND = 'MutilSpace';
    const API_ROOT = '/api/v1';
    const VIETNAMESE_TEXT_FALLBACKS = {
        '发放时间': 'Thời gian chi trả',
        '即将售罄': 'Sắp hết lượt',
        '支付宝': 'Alipay',
        '发送成功': 'Gửi thành công',
        '下载文件': 'Tải tệp xuống',
        '流量重置包': 'Gói đặt lại dung lượng',
        '请稍等，我们正在验证该笔支付': 'Vui lòng chờ, chúng tôi đang xác minh khoản thanh toán.',
        '如果没有收到验证码请检查垃圾箱。': 'Nếu chưa nhận được mã xác minh, hãy kiểm tra thư mục thư rác.',
        '修改成功，请重新登陆': 'Cập nhật thành công, vui lòng đăng nhập lại.',
        '正在前往收银台': 'Đang chuyển đến trang thanh toán',
        '知道了': 'Đã hiểu',
        '重 置': 'Đặt lại',
        '当你的订阅地址或账户发生泄漏被他人滥用时，可以在此重置订阅信息。避免带来不必要的损失。': 'Khi liên kết dịch vụ hoặc tài khoản bị lộ và bị người khác sử dụng trái phép, bạn có thể đặt lại thông tin tại đây để tránh thiệt hại không cần thiết.',
        '当你的订阅地址或账户发生泄露被他人滥用时，可以在此重置订阅信息。避免带来不必要的损失。': 'Khi liên kết dịch vụ hoặc tài khoản bị lộ và bị người khác sử dụng trái phép, bạn có thể đặt lại thông tin tại đây để tránh thiệt hại không cần thiết.'
    };
    let scheduled = false;
    let currentRoute = '';
    let dashboardData = null;
    let dashboardRequest = null;
    let dashboardGeneration = 0;

    const ICONS = {
        link: '<path d="M10.6 13.4a4.8 4.8 0 0 0 6.8 0l2-2a4.8 4.8 0 0 0-6.8-6.8l-1.1 1.1"/><path d="M13.4 10.6a4.8 4.8 0 0 0-6.8 0l-2 2a4.8 4.8 0 0 0 6.8 6.8l1.1-1.1"/>',
        compass: '<circle cx="12" cy="12" r="9"/><path d="m15.2 8.8-2 4.4-4.4 2 2-4.4 4.4-2Z"/>',
        bag: '<path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
        book: '<path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22V5.5Z"/><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22V5.5Z"/>',
        support: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 2v1Zm16 0a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2v1Z"/><path d="M17 19c-1 1-2.7 1.5-5 1.5"/>',
        arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
        shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>'
    };

    const CUSTOMER_PAGE_INTROS = {
        plan: ['Khám phá gói dịch vụ', 'Chọn gói và chu kỳ phù hợp với nhu cầu kết nối của bạn.'],
        node: ['Hành trình kết nối', 'Theo dõi các máy chủ và trạng thái hoạt động.'],
        order: ['Đơn hàng của tôi', 'Theo dõi lịch sử mua hàng và trạng thái thanh toán.'],
        invite: ['Lời mời của tôi', 'Quản lý mã mời và theo dõi hoa hồng.'],
        profile: ['Tài khoản cá nhân', 'Quản lý ví, bảo mật và tùy chọn thông báo.'],
        ticket: ['Trung tâm hỗ trợ', 'Gửi yêu cầu và theo dõi phản hồi từ đội ngũ hỗ trợ.'],
        knowledge: ['Tài liệu sử dụng', 'Tìm hướng dẫn cài đặt và kết nối trên thiết bị của bạn.'],
        traffic: ['Chi tiết dung lượng', 'Xem mức sử dụng dữ liệu theo thời gian.']
    };

    function icon(name) {
        return '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            (ICONS[name] || ICONS.arrow) + '</svg>';
    }

    function routePath() {
        return (window.location.hash || '#/').replace(/^#/, '').split('?')[0] || '/';
    }

    function syncCustomerPage() {
        const key = routePath().split('/')[1] || '';
        document.body.dataset.msRoute = key;
        const main = document.querySelector('#main-container');
        const content = main && main.querySelector('.content.content-full');
        if (!content || !document.querySelector('#sidebar')) return;

        const intro = content.querySelector(':scope > .ms-page-intro');
        const details = CUSTOMER_PAGE_INTROS[key];
        if (!details || key === 'dashboard') {
            if (intro) intro.remove();
            content.classList.remove('ms-page-content');
            return;
        }

        content.classList.add('ms-page-content');
        if (intro && intro.dataset.msPage === key) return;
        if (intro) intro.remove();
        const banner = document.createElement('section');
        banner.className = 'ms-page-intro';
        banner.dataset.msPage = key;
        banner.setAttribute('aria-labelledby', 'ms-page-intro-title');
        banner.innerHTML = '<div class="ms-page-intro-copy"><span class="ms-page-intro-kicker">MUTILSPACE · KHÔNG GIAN CỦA BẠN</span>' +
            '<h1 id="ms-page-intro-title">' + escapeHtml(details[0]) + '</h1>' +
            '<p>' + escapeHtml(details[1]) + '</p></div>' +
            '<span class="ms-page-intro-emblem" aria-hidden="true">' + icon('compass') + '</span>';
        content.insertBefore(banner, content.firstChild);
    }

    function escapeHtml(value) {
        return String(value === null || value === undefined ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function stripHtml(value) {
        const element = document.createElement('div');
        element.innerHTML = String(value || '');
        return (element.textContent || element.innerText || '').replace(/\s+/g, ' ').trim();
    }

    function formatBytes(value) {
        let bytes = Number(value) || 0;
        if (bytes < 0) bytes = 0;
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        if (!bytes) return '0 B';
        const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
        const amount = bytes / Math.pow(1024, index);
        return (amount >= 100 || index === 0 ? amount.toFixed(0) : amount.toFixed(2)) + ' ' + units[index];
    }

    function formatDate(timestamp) {
        if (timestamp === null || timestamp === undefined || timestamp === '') return 'Không giới hạn';
        const date = new Date(Number(timestamp) * 1000);
        if (Number.isNaN(date.getTime())) return 'Chưa xác định';
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    }

    function daysUntil(timestamp) {
        if (!timestamp) return null;
        return Math.ceil((Number(timestamp) * 1000 - Date.now()) / 86400000);
    }

    function formatMoney(value) {
        const symbol = window.settings && window.settings.currency_symbol ? window.settings.currency_symbol : '₫';
        const amount = (Number(value) || 0) / 100;
        return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(amount) + ' ' + symbol;
    }

    function memberDays(timestamp) {
        if (!timestamp) return 0;
        return Math.max(0, Math.floor((Date.now() - Number(timestamp) * 1000) / 86400000));
    }

    function safeImageUrl(value) {
        const url = String(value || '');
        return /^(https?:\/\/|\/)/i.test(url) ? url : '/brand/favicon.svg';
    }

    function navigate(path) {
        window.location.hash = '#' + path;
    }

    function showToast(message, type) {
        document.querySelectorAll('.ms-toast').forEach(element => element.remove());
        const toast = document.createElement('div');
        toast.className = 'ms-toast' + (type === 'error' ? ' ms-toast-error' : '');
        toast.setAttribute('role', 'status');
        toast.textContent = message;
        document.body.appendChild(toast);
        window.setTimeout(() => toast.remove(), 2600);
    }

    function copyText(value) {
        if (!value) {
            showToast('Bạn chưa có liên kết đăng ký. Hãy chọn một gói dịch vụ trước.', 'error');
            return Promise.resolve(false);
        }
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(value).then(() => true).catch(() => fallbackCopy(value));
        }
        return Promise.resolve(fallbackCopy(value));
    }

    function fallbackCopy(value) {
        const input = document.createElement('textarea');
        input.value = value;
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.focus();
        input.select();
        let copied = false;
        try {
            copied = document.execCommand('copy');
        } catch (error) {
            copied = false;
        }
        input.remove();
        return copied;
    }

    function apiGet(path) {
        let authorization = null;
        try {
            authorization = window.localStorage.getItem('authorization');
        } catch (error) {
            authorization = null;
        }
        const headers = { 'Content-Language': 'vi-VN' };
        if (authorization) headers.authorization = authorization;
        return window.fetch(API_ROOT + path, {
            method: 'GET',
            credentials: 'include',
            headers: headers
        }).then(response => response.json().then(payload => ({ response: response, payload: payload })))
            .then(result => {
                if (!result.response.ok) throw new Error(result.payload.message || 'Không thể tải dữ liệu');
                return result.payload.data;
            });
    }

    function uploadAvatar(file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!file || !allowedTypes.includes(file.type)) {
            return Promise.reject(new Error('Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.'));
        }
        if (file.size > 2 * 1024 * 1024) {
            return Promise.reject(new Error('Ảnh đại diện không được lớn hơn 2 MB.'));
        }

        let authorization = null;
        try {
            authorization = window.localStorage.getItem('authorization');
        } catch (error) {
            authorization = null;
        }
        const headers = { 'Content-Language': 'vi-VN' };
        if (authorization) headers.authorization = authorization;
        const form = new FormData();
        form.append('avatar', file, file.name);

        return window.fetch(API_ROOT + '/user/avatar', {
            method: 'POST',
            credentials: 'include',
            headers: headers,
            body: form
        }).then(response => response.json().then(payload => ({ response: response, payload: payload })))
            .then(result => {
                if (!result.response.ok) {
                    const errors = result.payload && result.payload.errors;
                    const message = errors && errors.avatar ? errors.avatar[0] : result.payload.message;
                    throw new Error(message || 'Không thể cập nhật ảnh đại diện.');
                }
                return result.payload.data;
            });
    }

    function applyBrand() {
        document.documentElement.lang = 'vi';
        document.title = BRAND;
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
            link.innerHTML = '<img class="ms-brand-mark" src="/brand/favicon.svg" alt=""><span>' + BRAND + '</span>';
            link.setAttribute('aria-label', BRAND);
        });
    }

    function applyVietnameseFallbacks() {
        if (!document.body) return;
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: node => {
                const parent = node.parentElement;
                if (!parent || parent.closest('script, style, noscript, textarea, [contenteditable="true"]')) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        });
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        nodes.forEach(node => {
            const raw = node.nodeValue || '';
            const key = raw.replace(/\s+/g, ' ').trim();
            let replacement = VIETNAMESE_TEXT_FALLBACKS[key];
            if (!replacement) {
                const peopleMatch = key.match(/^(\d+(?:[.,]\d+)?)人$/);
                if (peopleMatch) replacement = peopleMatch[1] + ' người';
            }
            if (!replacement) return;
            const leading = (raw.match(/^\s*/) || [''])[0];
            const trailing = (raw.match(/\s*$/) || [''])[0];
            node.nodeValue = leading + replacement + trailing;
        });
    }

    function enableCustomerProtection() {
        if (document.documentElement.dataset.msContextGuard === '1') return;
        document.documentElement.dataset.msContextGuard = '1';

        document.addEventListener('contextmenu', event => {
            const target = event.target;
            if (target && target.closest && target.closest('input, textarea, [contenteditable="true"]')) return;
            event.preventDefault();
            showToast('Menu chuột phải đã được tắt trên trang khách hàng.');
        }, true);

        document.addEventListener('dragstart', event => {
            const target = event.target;
            if (target && target.closest && target.closest('img')) event.preventDefault();
        }, true);
    }

    function dashboardHost() {
        return document.querySelector('#main-container > .content.content-full') ||
            document.querySelector('#main-container .content.content-full');
    }

    function loadingMarkup() {
        return '<div class="ms-dashboard ms-dashboard-loading" aria-busy="true" aria-label="Đang tải dashboard">' +
            '<div class="ms-skeleton"></div>' +
            '<div class="ms-summary-grid"><div class="ms-skeleton"></div><div class="ms-skeleton"></div></div>' +
            '</div>';
    }

    function statusDetails(subscribe) {
        if (!subscribe.plan_id || !subscribe.plan) {
            return { label: 'Chưa có gói', className: 'ms-status-empty', description: 'Chọn một gói phù hợp để bắt đầu hành trình kết nối của bạn.' };
        }
        const remainingDays = daysUntil(subscribe.expired_at);
        if (remainingDays !== null && remainingDays < 0) {
            return { label: 'Đã hết hạn', className: 'ms-status-expired', description: 'Gói đã hết hạn. Gia hạn để tiếp tục sử dụng dịch vụ.' };
        }
        if (remainingDays === null) {
            return { label: 'Đang hoạt động', className: '', description: 'Gói của bạn có thời hạn sử dụng không giới hạn.' };
        }
        return {
            label: 'Đang hoạt động',
            className: '',
            description: remainingDays === 0 ? 'Gói sẽ hết hạn trong hôm nay.' : 'Còn ' + remainingDays + ' ngày trước khi gói hết hạn.'
        };
    }

    function resetLabel(resetDay) {
        if (resetDay === null || resetDay === undefined) return 'Theo chu kỳ gói';
        if (Number(resetDay) === 0) return 'Hôm nay';
        return Number(resetDay) + ' ngày nữa';
    }

    function noticeMarkup(notices) {
        if (!Array.isArray(notices) || !notices.length) {
            return '<div class="ms-notice-empty"><div><strong>Hải trình đang yên ả</strong><span>Hiện chưa có thông báo mới.</span></div></div>';
        }
        return '<div class="ms-notice-list">' + notices.slice(0, 2).map(notice => {
            const description = stripHtml(notice.content || 'Nhấn vào thông báo trên hệ thống để xem nội dung chi tiết.');
            return '<article class="ms-notice-item">' +
                '<span class="ms-notice-date">' + escapeHtml(formatDate(notice.created_at)) + '</span>' +
                '<h3>' + escapeHtml(notice.title || 'Thông báo từ MutilSpace') + '</h3>' +
                '<p>' + escapeHtml(description) + '</p>' +
                '</article>';
        }).join('') + '</div>';
    }

    function actionCard(action, iconName, title, description) {
        return '<button type="button" class="ms-action-card" data-action="' + action + '">' +
            '<span class="ms-action-icon">' + icon(iconName) + '</span>' +
            '<strong>' + escapeHtml(title) + '</strong>' +
            '<span>' + escapeHtml(description) + '</span>' +
            '</button>';
    }

    function menuItem(action, iconName, title, description) {
        return '<button type="button" class="ms-aiko-menu-item" data-action="' + action + '">' +
            '<span class="ms-aiko-menu-icon">' + icon(iconName) + '</span>' +
            '<span class="ms-aiko-menu-copy"><strong>' + escapeHtml(title) + '</strong><small>' + escapeHtml(description) + '</small></span>' +
            '<span class="ms-aiko-menu-arrow">' + icon('arrow') + '</span>' +
            '</button>';
    }

    function legacyDashboardMarkup(data) {
        const subscribe = data.subscribe || {};
        const stats = Array.isArray(data.stats) ? data.stats : [];
        const used = Math.max(0, Number(subscribe.u || 0) + Number(subscribe.d || 0));
        const total = Math.max(0, Number(subscribe.transfer_enable || 0));
        const remaining = Math.max(0, total - used);
        const percent = total > 0 ? Math.min(100, Math.max(0, used / total * 100)) : 0;
        const displayPercent = percent >= 10 ? percent.toFixed(0) : percent.toFixed(1);
        const status = statusDetails(subscribe);
        const planName = subscribe.plan && subscribe.plan.name ? subscribe.plan.name : 'Chưa chọn gói dịch vụ';
        const pendingOrders = Number(stats[0]) || 0;
        const pendingTickets = Number(stats[1]) || 0;
        const referrals = Number(stats[2]) || 0;
        const hasSubscription = Boolean(subscribe.plan_id && subscribe.plan);
        const primaryAction = hasSubscription ? 'copy-subscription' : 'plan';
        const primaryLabel = hasSubscription ? 'Kết nối nhanh' : 'Chọn gói ngay';
        const expiryLabel = subscribe.expired_at ? formatDate(subscribe.expired_at) : (hasSubscription ? 'Không giới hạn' : 'Chưa kích hoạt');

        return '<div class="ms-dashboard" data-ms-dashboard="ready">' +
            '<section class="ms-hero" aria-labelledby="ms-dashboard-title">' +
                '<div class="ms-hero-copy">' +
                    '<div class="ms-eyebrow"><span class="ms-eyebrow-dot"></span>MUTILSPACE · HẢI TRÌNH SỐ</div>' +
                    '<h1 id="ms-dashboard-title">Chào mừng trở lại, thuyền trưởng!</h1>' +
                    '<p>Quản lý gói dịch vụ, dung lượng và mọi điểm đến kết nối của bạn tại một nơi.</p>' +
                    '<div class="ms-hero-actions">' +
                        '<button type="button" class="ms-btn ms-btn-primary" data-action="' + primaryAction + '">' + icon('compass') + primaryLabel + '</button>' +
                        '<button type="button" class="ms-btn ms-btn-secondary" data-action="plan">' + icon('bag') + (hasSubscription ? 'Gia hạn gói' : 'Khám phá các gói') + '</button>' +
                    '</div>' +
                    '<div class="ms-hero-meta">' +
                        '<span>' + icon('shield') + 'Trạng thái: <strong>' + escapeHtml(status.label) + '</strong></span>' +
                        '<span>Đơn chờ: <strong>' + pendingOrders + '</strong></span>' +
                        '<span>Hỗ trợ: <strong>' + pendingTickets + '</strong></span>' +
                        '<span>Giới thiệu: <strong>' + referrals + '</strong></span>' +
                    '</div>' +
                '</div>' +
                '<div class="ms-hero-visual" aria-hidden="true"><div class="ms-sun"></div><div class="ms-hat"><div class="ms-hat-brim"></div><div class="ms-hat-crown"></div></div><div class="ms-wave"></div></div>' +
            '</section>' +
            '<section class="ms-summary-grid" aria-label="Tổng quan gói dịch vụ">' +
                '<article class="ms-panel ms-plan-card">' +
                    '<div class="ms-card-topline"><span class="ms-kicker">Gói hiện tại</span><span class="ms-status ' + status.className + '">' + escapeHtml(status.label) + '</span></div>' +
                    '<h2 class="ms-plan-name">' + escapeHtml(planName) + '</h2>' +
                    '<p class="ms-plan-description">' + escapeHtml(status.description) + '</p>' +
                    '<div class="ms-plan-footer"><div class="ms-plan-expiry"><span>Ngày hết hạn</span><strong>' + escapeHtml(expiryLabel) + '</strong></div><button type="button" class="ms-text-link" data-action="plan">' + (hasSubscription ? 'Quản lý gói' : 'Chọn gói') + ' →</button></div>' +
                '</article>' +
                '<article class="ms-panel ms-usage-card">' +
                    '<div class="ms-progress-wrap"><div class="ms-progress-ring" style="--progress:' + (percent * 3.6).toFixed(2) + 'deg"><div class="ms-progress-value"><strong>' + displayPercent + '%</strong><span>ĐÃ SỬ DỤNG</span></div></div></div>' +
                    '<div class="ms-usage-details"><h2>Dung lượng hành trình</h2><p>Theo dõi mức sử dụng để kết nối luôn liền mạch.</p>' +
                        '<div class="ms-metrics">' +
                            '<div class="ms-metric"><span>Đã sử dụng</span><strong>' + escapeHtml(formatBytes(used)) + '</strong></div>' +
                            '<div class="ms-metric"><span>Còn lại</span><strong>' + escapeHtml(formatBytes(remaining)) + '</strong></div>' +
                            '<div class="ms-metric"><span>Tổng dung lượng</span><strong>' + escapeHtml(formatBytes(total)) + '</strong></div>' +
                            '<div class="ms-metric"><span>Đặt lại sau</span><strong>' + escapeHtml(resetLabel(subscribe.reset_day)) + '</strong></div>' +
                        '</div>' +
                    '</div>' +
                '</article>' +
            '</section>' +
            '<section class="ms-dashboard-lower">' +
                '<article class="ms-panel ms-actions-panel">' +
                    '<div class="ms-panel-heading"><div><h2>Lối tắt hành trình</h2><p>Những thao tác bạn thường dùng nhất.</p></div></div>' +
                    '<div class="ms-actions-grid">' +
                        actionCard(hasSubscription ? 'copy-subscription' : 'plan', 'link', 'Sao chép đăng ký', hasSubscription ? 'Dùng liên kết để nhập vào ứng dụng.' : 'Chọn gói để tạo liên kết đăng ký.') +
                        actionCard('plan', 'bag', hasSubscription ? 'Gia hạn dịch vụ' : 'Mua gói dịch vụ', 'Chọn chu kỳ và gói phù hợp với bạn.') +
                        actionCard('knowledge', 'book', 'Hướng dẫn kết nối', 'Cài đặt nhanh trên mọi thiết bị.') +
                        actionCard('ticket', 'support', 'Trung tâm hỗ trợ', 'Gửi yêu cầu khi bạn cần trợ giúp.') +
                    '</div>' +
                '</article>' +
                '<aside class="ms-panel ms-notice-panel"><div class="ms-panel-heading"><div><h2>Thông báo mới</h2><p>Cập nhật mới nhất từ MutilSpace.</p></div></div>' + noticeMarkup(data.notices) + '</aside>' +
            '</section>' +
        '</div>';
    }

    function dashboardMarkup(data) {
        const subscribe = data.subscribe || {};
        const userInfo = data.userInfo || {};
        const stats = Array.isArray(data.stats) ? data.stats : [];
        const used = Math.max(0, Number(subscribe.u || 0) + Number(subscribe.d || 0));
        const total = Math.max(0, Number(subscribe.transfer_enable || 0));
        const remaining = Math.max(0, total - used);
        const percent = total > 0 ? Math.min(100, Math.max(0, used / total * 100)) : 0;
        const status = statusDetails(subscribe);
        const hasSubscription = Boolean(subscribe.plan_id && subscribe.plan);
        const planName = hasSubscription ? subscribe.plan.name : 'Chưa có gói dịch vụ';
        const expiryDays = daysUntil(subscribe.expired_at);
        const expiryDate = hasSubscription ? formatDate(subscribe.expired_at) : 'Chưa kích hoạt';
        const expirySummary = expiryDays === null ? 'Thời hạn không giới hạn' :
            (expiryDays < 0 ? 'Gói đã hết hạn' : (expiryDays === 0 ? 'Hết hạn trong hôm nay' : 'Còn ' + expiryDays + ' ngày sử dụng'));
        const primaryAction = hasSubscription ? 'copy-subscription' : 'plan';
        const email = userInfo.email || subscribe.email || 'Thành viên MutilSpace';
        const avatar = safeImageUrl(userInfo.avatar_url);
        const joinedDays = memberDays(userInfo.created_at);
        const pendingOrders = Number(stats[0]) || 0;
        const pendingTickets = Number(stats[1]) || 0;

        return '<div class="ms-dashboard ms-aiko-dashboard" data-ms-dashboard="ready">' +
            '<section class="ms-panel ms-aiko-profile">' +
                '<div class="ms-aiko-profile-main">' +
                    '<button type="button" class="ms-aiko-avatar" data-action="avatar" aria-label="Thay đổi ảnh đại diện" title="Thay đổi ảnh đại diện"><img src="' + escapeHtml(avatar) + '" alt="Ảnh đại diện"><span class="ms-aiko-avatar-online"></span><span class="ms-aiko-avatar-edit">+</span></button>' +
                    '<input class="ms-avatar-input" type="file" accept="image/jpeg,image/png,image/webp" hidden>' +
                    '<div class="ms-aiko-identity">' +
                        '<span class="ms-aiko-overline">MUTILSPACE MEMBER</span>' +
                        '<h1>' + escapeHtml(email) + '</h1>' +
                        '<div class="ms-aiko-badges"><span class="ms-aiko-verified ' + (hasSubscription ? '' : 'is-muted') + '">' + icon('shield') + (hasSubscription ? 'Đã xác minh' : 'Chưa xác minh') + '</span><span>Thành viên ' + joinedDays + ' ngày</span></div>' +
                    '</div>' +
                '</div>' +
                '<div class="ms-aiko-profile-stats">' +
                    '<div><span>Số dư ví</span><strong>' + escapeHtml(formatMoney(userInfo.balance)) + '</strong></div>' +
                    '<div><span>Gói hiện tại</span><strong>' + escapeHtml(planName) + '</strong></div>' +
                    '<div><span>Trạng thái</span><strong class="ms-aiko-status-text">' + escapeHtml(status.label) + '</strong></div>' +
                '</div>' +
                '<button type="button" class="ms-aiko-profile-button" data-action="profile">Tài khoản ' + icon('arrow') + '</button>' +
            '</section>' +

            '<div class="ms-aiko-main-grid">' +
                '<section class="ms-panel ms-aiko-subscription">' +
                    '<div class="ms-aiko-section-head">' +
                        '<div><span class="ms-aiko-overline">THÔNG TIN GÓI</span><h2>' + escapeHtml(planName) + '</h2></div>' +
                        '<span class="ms-status ' + status.className + '">' + escapeHtml(status.label) + '</span>' +
                    '</div>' +
                    '<div class="ms-aiko-expiry-row">' +
                        '<div><span>Hạn sử dụng</span><strong>' + escapeHtml(expiryDate) + '</strong><small>' + escapeHtml(expirySummary) + '</small></div>' +
                        '<button type="button" class="ms-btn ms-aiko-plan-button" data-action="plan">' + icon('bag') + (hasSubscription ? 'Gia hạn gói' : 'Mua gói dịch vụ') + '</button>' +
                    '</div>' +
                    '<div class="ms-aiko-traffic">' +
                        '<div class="ms-aiko-traffic-title"><div><strong>Thống kê sử dụng</strong><span>Dữ liệu của chu kỳ hiện tại</span></div><b>' + percent.toFixed(1) + '%</b></div>' +
                        '<div class="ms-aiko-progress"><span style="width:' + percent.toFixed(2) + '%"></span></div>' +
                        '<div class="ms-aiko-metrics">' +
                            '<div><span>Đã sử dụng</span><strong>' + escapeHtml(formatBytes(used)) + '</strong></div>' +
                            '<div><span>Còn lại</span><strong>' + escapeHtml(formatBytes(remaining)) + '</strong></div>' +
                            '<div><span>Tổng dung lượng</span><strong>' + escapeHtml(formatBytes(total)) + '</strong></div>' +
                            '<div><span>Đặt lại sau</span><strong>' + escapeHtml(resetLabel(subscribe.reset_day)) + '</strong></div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="ms-aiko-sync">' +
                        '<div class="ms-aiko-sync-copy"><span class="ms-aiko-sync-icon">' + icon('compass') + '</span><div><strong>Đồng bộ máy chủ về ứng dụng</strong><small>Windows · macOS · Android · iOS</small></div></div>' +
                        '<div class="ms-aiko-os"><span>WIN</span><span>MAC</span><span>AND</span><span>IOS</span></div>' +
                        '<button type="button" class="ms-btn ms-btn-primary" data-action="' + primaryAction + '">' + icon('link') + (hasSubscription ? 'Sao chép đăng ký' : 'Chọn gói trước') + '</button>' +
                    '</div>' +
                    '<div class="ms-aiko-action-strip">' +
                        '<button type="button" data-action="knowledge">' + icon('book') + '<span>Hướng dẫn</span></button>' +
                        '<button type="button" data-action="order">' + icon('bag') + '<span>Đơn hàng <b>' + pendingOrders + '</b></span></button>' +
                        '<button type="button" data-action="node">' + icon('compass') + '<span>Máy chủ</span></button>' +
                        '<button type="button" data-action="ticket">' + icon('support') + '<span>Hỗ trợ <b>' + pendingTickets + '</b></span></button>' +
                    '</div>' +
                '</section>' +

                '<aside class="ms-panel ms-aiko-notices">' +
                    '<div class="ms-aiko-section-head"><div><span class="ms-aiko-overline">CẬP NHẬT</span><h2>Thông báo mới</h2></div></div>' +
                    noticeMarkup(data.notices) +
                '</aside>' +
            '</div>' +

            '<section class="ms-panel ms-aiko-menu">' +
                '<div class="ms-aiko-section-head"><div><span class="ms-aiko-overline">ĐIỀU HƯỚNG NHANH</span><h2>Danh sách menu</h2></div><small>Các chức năng thường dùng</small></div>' +
                '<div class="ms-aiko-menu-grid">' +
                    menuItem('knowledge', 'book', 'Hướng dẫn sử dụng', 'Cài đặt và kết nối trên mọi thiết bị') +
                    menuItem('order', 'bag', 'Lịch sử mua hàng', 'Theo dõi trạng thái các đơn hàng') +
                    menuItem('node', 'compass', 'Trạng thái máy chủ', 'Kiểm tra các điểm kết nối đang hoạt động') +
                    menuItem('profile', 'shield', 'Bảo mật tài khoản', 'Đổi mật khẩu và thiết lập nhắc nhở') +
                    menuItem('plan', 'bag', hasSubscription ? 'Gia hạn dịch vụ' : 'Mua gói dịch vụ', 'Chọn gói và chu kỳ phù hợp') +
                    menuItem('ticket', 'support', 'Trung tâm hỗ trợ', 'Trao đổi trực tiếp với đội ngũ MutilSpace') +
                '</div>' +
            '</section>' +
        '</div>';
    }

    function bindDashboard(root, data) {
        if (!root || root.dataset.msBound === '1') return;
        root.dataset.msBound = '1';
        const subscribe = data.subscribe || {};
        const avatarInput = root.querySelector('.ms-avatar-input');
        if (avatarInput) {
            avatarInput.addEventListener('change', () => {
                const file = avatarInput.files && avatarInput.files[0];
                if (!file) return;
                showToast('Đang cập nhật ảnh đại diện...');
                uploadAvatar(file).then(result => {
                    if (!result || !result.avatar_url) throw new Error('Máy chủ không trả về ảnh đại diện mới.');
                    data.userInfo = data.userInfo || {};
                    data.userInfo.avatar_url = result.avatar_url;
                    const image = root.querySelector('.ms-aiko-avatar img');
                    if (image) image.src = result.avatar_url;
                    showToast('Đã cập nhật ảnh đại diện.');
                }).catch(error => {
                    showToast(error.message || 'Không thể cập nhật ảnh đại diện.', 'error');
                }).finally(() => {
                    avatarInput.value = '';
                });
            });
        }
        root.addEventListener('click', event => {
            const target = event.target.closest('[data-action]');
            if (!target) return;
            const action = target.getAttribute('data-action');
            if (action === 'copy-subscription') {
                copyText(subscribe.subscribe_url).then(copied => {
                    if (copied) showToast('Đã sao chép liên kết đăng ký. Sẵn sàng kết nối!');
                    else showToast('Không thể sao chép tự động. Vui lòng thử lại.', 'error');
                });
                return;
            }
            if (action === 'plan') {
                navigate(subscribe.plan_id ? '/plan/' + subscribe.plan_id : '/plan');
                return;
            }
            if (action === 'knowledge') {
                navigate('/knowledge');
                return;
            }
            if (action === 'ticket') {
                navigate('/ticket');
                return;
            }
            if (action === 'order') {
                navigate('/order');
                return;
            }
            if (action === 'node') {
                navigate('/node');
                return;
            }
            if (action === 'profile') {
                navigate('/profile');
                return;
            }
            if (action === 'avatar') {
                if (avatarInput) avatarInput.click();
                return;
            }
            if (action === 'reload') {
                dashboardData = null;
                dashboardRequest = null;
                const host = dashboardHost();
                if (host) {
                    delete host.dataset.msDashboardBound;
                    const dashboard = host.querySelector('.ms-dashboard');
                    if (dashboard) dashboard.remove();
                }
                refresh();
            }
        });
    }

    function renderDashboard(host, data) {
        if (!host || routePath() !== '/dashboard') return;
        const root = host.querySelector('.ms-dashboard');
        const wrapper = document.createElement('div');
        wrapper.innerHTML = dashboardMarkup(data);
        const nextRoot = wrapper.firstElementChild;
        if (root) root.replaceWith(nextRoot);
        else host.insertBefore(nextRoot, host.firstChild);
        host.classList.add('ms-dashboard-host');
        host.dataset.msDashboardState = 'ready';
        bindDashboard(nextRoot, data);
    }

    function renderDashboardError(host, error) {
        if (!host || routePath() !== '/dashboard') return;
        const message = error && error.message ? error.message : 'Không thể tải dữ liệu dashboard.';
        const existing = host.querySelector('.ms-dashboard');
        const markup = '<div class="ms-dashboard"><section class="ms-panel ms-notice-panel"><div class="ms-notice-empty"><div><strong>Chưa thể tải dashboard</strong><span>' + escapeHtml(message) + '</span><br><br><button type="button" class="ms-btn ms-btn-primary" data-action="reload">Thử lại</button></div></div></section></div>';
        const wrapper = document.createElement('div');
        wrapper.innerHTML = markup;
        const nextRoot = wrapper.firstElementChild;
        if (existing) existing.replaceWith(nextRoot);
        else host.insertBefore(nextRoot, host.firstChild);
        host.classList.add('ms-dashboard-host');
        host.dataset.msDashboardState = 'error';
        bindDashboard(nextRoot, { subscribe: {} });
    }

    function loadDashboard() {
        if (!dashboardRequest) {
            const generation = dashboardGeneration;
            dashboardRequest = Promise.all([
                apiGet('/user/getSubscribe'),
                apiGet('/user/getStat').catch(() => []),
                apiGet('/user/notice/fetch').catch(() => []),
                apiGet('/user/info').catch(() => ({}))
            ]).then(results => {
                if (generation !== dashboardGeneration) return null;
                dashboardData = {
                    subscribe: results[0] || {},
                    stats: results[1] || [],
                    notices: results[2] || [],
                    userInfo: results[3] || {}
                };
                return dashboardData;
            });
        }
        return dashboardRequest;
    }

    function ensureDashboard() {
        const route = routePath();
        if (route !== currentRoute) {
            if (currentRoute === '/dashboard') {
                dashboardGeneration += 1;
                dashboardData = null;
                dashboardRequest = null;
            }
            currentRoute = route;
        }
        if (route !== '/dashboard') {
            document.querySelectorAll('.ms-dashboard-host').forEach(host => {
                host.classList.remove('ms-dashboard-host');
                delete host.dataset.msDashboardState;
                delete host.dataset.msDashboardBound;
                host.querySelectorAll('.ms-dashboard').forEach(element => element.remove());
            });
            return;
        }
        const host = dashboardHost();
        if (!host) return;
        host.classList.add('ms-dashboard-host');
        if (dashboardData) {
            if (!host.querySelector('.ms-dashboard[data-ms-dashboard="ready"]')) renderDashboard(host, dashboardData);
            return;
        }
        if (!host.querySelector('.ms-dashboard')) host.insertAdjacentHTML('afterbegin', loadingMarkup());
        if (host.dataset.msDashboardBound === '1') return;
        host.dataset.msDashboardBound = '1';
        loadDashboard().then(data => {
            const activeHost = dashboardHost();
            if (data && activeHost && routePath() === '/dashboard') renderDashboard(activeHost, data);
        }).catch(error => {
            const activeHost = dashboardHost();
            if (activeHost && routePath() === '/dashboard') renderDashboardError(activeHost, error);
        });
    }

    function refresh() {
        if (scheduled) return;
        scheduled = true;
        window.requestAnimationFrame(() => {
            applyBrand();
            applyVietnameseFallbacks();
            syncCustomerPage();
            ensureDashboard();
            scheduled = false;
        });
    }

    const start = () => {
        enableCustomerProtection();
        refresh();
        window.addEventListener('hashchange', refresh);
        new MutationObserver(refresh).observe(document.body, { childList: true, subtree: true, characterData: true });
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
})();
