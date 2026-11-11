<!DOCTYPE html>
<html lang="vi">

<head>
    <link rel="stylesheet" href="/assets/admin/components.chunk.css?v={{$version}}">
    <link rel="stylesheet" href="/assets/admin/umi.css?v={{$version}}">
    <link rel="stylesheet" href="/assets/admin/custom.css?v={{$version}}-ms1">
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no">
    <meta name="theme-color" content="#6657e8">
    <meta name="description" content="MutilSpace - Nền tảng quản lý dịch vụ kết nối an toàn">
    <link rel="icon" type="image/svg+xml" href="/brand/favicon.svg">
    <title>{{$title}}</title>
    <!-- <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Nunito+Sans:300,400,400i,600,700"> -->
    <script>window.routerBase = "/";</script>
    <script>
        window.localStorage.setItem('umi_locale', 'vi-VN');
        window.settings = {
            title: '{{$title}}',
            theme: {
                sidebar: '{{$theme_sidebar}}',
                header: '{{$theme_header}}',
                color: '{{$theme_color}}',
            },
            version: '{{$version}}',
            background_url: '{{$background_url}}',
            logo: '{{$logo}}',
            secure_path: '{{$secure_path}}'
        }
    </script>
</head>

<body>
<div id="root"></div>
<script src="/assets/admin/vi.js?v={{$version}}-ms10"></script>
<script src="/assets/admin/vendors.async.js?v={{$version}}-ms10"></script>
<script src="/assets/admin/components.async.js?v={{$version}}-ms10"></script>
<script src="/assets/admin/umi.js?v={{$version}}-ms10"></script>
<script src="/assets/admin/custom.js?v={{$version}}-ms12"></script>
</body>

</html>
