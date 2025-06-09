const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 8080;

// Use body-parser middleware to parse JSON request bodies
app.use(bodyParser.json());

// Enable CORS with more robust handling
const corsMiddleware = (req, res, next) => {
    // Allow requests from any origin (for development purposes)
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Allow the following HTTP methods
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    // Allow the following headers
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        // Set status code 204 (No Content) for preflight requests
        res.status(204).send();
        return;
    }
    next();
};

app.use(corsMiddleware);

// Handle login requests
app.post('/user/login', (req, res) => {
    const { username, password } = req.body;

    if (username === 'zsb' && password === '123') {
        // Login successful, return token and user data
        const token = 'mock_token_123456';
        const userData = {
            id: 1,
            username: 'zsb',
            password: '123',
            emailAddress: 'zsb@example.com',
            telephone: '123456789',
            createTime: '2025-06-09',
            updateTime: '2025-06-09'
        };
        res.json({
            code: 0,
            message: 'Login successfully!',
            token,
            data: userData
        });
    } else {
        // Login failed
        res.status(401).json({
            code: 1,
            message: 'Invalid username or password'
        });
    }
});

// 模拟收件箱邮件数据
const mockInboxMails = Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    senderId: 1000 + index,
    receiverId: 2000,
    theme: `测试邮件主题 ${index + 1}`,
    content: `这是第 ${index + 1} 封测试邮件的内容，包含一些测试信息。`,
    sendTime: new Date(Date.now() - index * 3600000).toISOString(),
    star: Math.floor(Math.random() * 2),
    isread: Math.floor(Math.random() * 2),
    draft: 0,
    junk: Math.floor(Math.random() * 2)
}));

// 模拟邮件详情数据
const mockMailDetails = mockInboxMails.map(mail => ({
    code: 0,
    message: 'success',
    data: {
        mailid: mail.id,
        sendaddress: `sender${mail.senderId}@example.com`,
        sendname: `发件人 ${mail.senderId}`,
        receaddress: `receiver${mail.receiverId}@example.com`,
        recename: `收件人 ${mail.receiverId}`,
        theme: mail.theme,
        content: mail.content,
        sendtime: mail.sendTime,
        attachments: Math.random() > 0.5 ? [
            {
                id: 1,
                fileName: `附件_${mail.id}.pdf`,
                downloadUrl: `/api/attachments/${mail.id}`,
                createTime: new Date().toISOString(),
                fileSize: `${Math.floor(Math.random() * 1000)} KB`
            }
        ] : null
    }
}));

// 收件箱邮件列表接口
app.post('/mail/view', (req, res) => {
    const { type, page = 1, size = 10 } = req.body;
    if (type!== 1) {
        return res.status(400).json({
            code: 400,
            message: '无效的邮件类型，收件箱类型应为 1'
        });
    }

    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedMails = mockInboxMails.slice(startIndex, endIndex);

    res.json({
        code: 0,
        message: 'success',
        data: {
            records: paginatedMails,
            total: mockInboxMails.length,
            size,
            current: page,
            pages: Math.ceil(mockInboxMails.length / size)
        }
    });
});

// 邮件详情接口
app.get('/api/mail', (req, res) => {
    const mailId = parseInt(req.query.id, 10);
    const mailDetail = mockMailDetails.find(detail => detail.data.mailid === mailId);

    if (mailDetail) {
        res.json(mailDetail);
    } else {
        res.status(404).json({
            code: 404,
            message: '未找到该邮件详情'
        });
    }
});

// 退出登录接口
app.post('/user/logout', (req, res) => {
    // 模拟退出登录成功，实际中可能需要处理 token 失效等逻辑
    res.json({
        code: 0,
        message: 'Logout successfully!'
    });
});

// 删除用户（对应前端 logout 方法中的请求）
app.post('/user/deleteuser', (req, res) => {
    const token = req.headers.authorization;
    if (token) {
        // 模拟删除用户成功
        res.json({
            code: 0,
            message: 'User deleted and logged out successfully!'
        });
    } else {
        // 缺少 token，返回错误信息
        res.status(401).json({
            code: 401,
            message: 'Missing authorization token'
        });
    }
});

// 忘记密码第一步接口
app.post('/user/forgetps1', (req, res) => {
    const { status, username, emailAddress } = req.body;
    // 简单验证参数
    if (typeof status === 'undefined' || (status!== 0 && status!== 1) || (!username && !emailAddress)) {
        return res.status(400).json({
            code: 2,
            message: '请求参数错误，请检查输入',
            data: null
        });
    }

    // 模拟用户存在情况，这里以用户名 'zsb' 和邮箱 'zsb@example.com' 为例
    const isUserExist = username === 'zsb' || emailAddress === 'zsb@example.com';

    if (isUserExist) {
        return res.json({
            code: 0,
            message: '验证信息已发送到您的邮箱，请查收',
            data: null
        });
    } else {
        return res.status(404).json({
            code: 1,
            message: '用户不存在，请检查用户名或邮箱',
            data: null
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
