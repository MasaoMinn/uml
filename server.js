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

// 模拟发件箱邮件数据
const mockSentMails = Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    senderId: 1001,
    receiverId: 2000 + index,
    theme: `发件箱测试邮件主题 ${index + 1}`,
    content: `这是发件箱第 ${index + 1} 封测试邮件的内容，包含一些测试信息。`,
    sendTime: new Date(Date.now() - index * 3600000).toISOString(),
    star: Math.floor(Math.random() * 2),
    isread: Math.floor(Math.random() * 2),
    draft: 0,
    junk: Math.floor(Math.random() * 2)
}));

// 模拟草稿箱邮件数据
const mockDraftMails = Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    receiverId: 3000 + index,
    theme: `草稿箱测试邮件主题 ${index + 1}`,
    content: `这是草稿箱第 ${index + 1} 封测试邮件的内容，包含一些测试信息。`,
    saveTime: new Date(Date.now() - index * 3600000).toISOString(),
    recaddress: `user${index + 1}@test.com`
}));

// 模拟收藏箱邮件数据
const mockStarMails = Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    senderId: 4000 + index,
    receiverId: 1001,
    theme: `收藏箱测试邮件主题 ${index + 1}`,
    content: `这是收藏箱第 ${index + 1} 封测试邮件的内容，包含一些测试信息。`,
    sendTime: new Date(Date.now() - index * 3600000).toISOString(),
    star: 1,
    isread: Math.floor(Math.random() * 2),
    draft: 0,
    junk: Math.floor(Math.random() * 2)
}));

// 模拟垃圾邮件数据
const mockJunkMails = Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    senderId: 6000 + index,
    receiverId: 2000,
    theme: `垃圾邮件主题 ${index + 1}`,
    content: `这是第 ${index + 1} 封垃圾邮件的内容，可能包含一些广告信息。`,
    sendTime: new Date(Date.now() - index * 3600000).toISOString(),
    star: 0,
    isread: Math.floor(Math.random() * 2),
    draft: 0,
    junk: 1
}));

// 模拟折叠邮件数据
const mockFoldedMails = Array.from({ length: 100 }, (_, index) => ({
    id: index + 1,
    receiverId: 5000 + index,
    theme: `折叠测试邮件主题 ${index + 1}`,
    content: `这是折叠第 ${index + 1} 封测试邮件的内容，包含一些测试信息。`,
    saveTime: new Date(Date.now() - index * 3600000).toISOString(),
    recaddress: `user${index + 1}@fold.com`
}));

// 统一邮件列表接口
app.post('/mail/view', (req, res) => {
    const { type, page = 1, size = 10 } = req.body;

    // 验证 type 参数
    if (typeof type!== 'number') {
        return res.status(400).json({
            code: 400,
            message: '无效的邮件类型，type 必须为数字'
        });
    }

    // 验证 page 和 size 参数
    const parsedPage = parseInt(page, 10);
    const parsedSize = parseInt(size, 10);

    if (isNaN(parsedPage) || isNaN(parsedSize) || parsedPage < 1 || parsedSize < 1) {
        return res.status(400).json({
            code: 400,
            message: '请求参数错误，page 和 size 必须为大于 0 的整数'
        });
    }

    const startIndex = (parsedPage - 1) * parsedSize;
    const endIndex = startIndex + parsedSize;

    let paginatedMails;
    let total;

    switch (type) {
        case 1:
            paginatedMails = mockInboxMails.slice(startIndex, endIndex);
            total = mockInboxMails.length;
            break;
        case 2:
            paginatedMails = mockSentMails.slice(startIndex, endIndex);
            total = mockSentMails.length;
            break;
        case 3:
            paginatedMails = mockDraftMails.slice(startIndex, endIndex);
            total = mockDraftMails.length;
            break;
        case 4:
            paginatedMails = mockJunkMails.slice(startIndex, endIndex);
            total = mockJunkMails.length;
            break;
        case 5:
            paginatedMails = mockStarMails.slice(startIndex, endIndex);
            total = mockStarMails.length;
            break;
        case 6:
            paginatedMails = mockFoldedMails.slice(startIndex, endIndex);
            total = mockFoldedMails.length;
            break;
        default:
            return res.status(400).json({
                code: 400,
                message: '无效的邮件类型'
            });
    }

    res.json({
        code: 0,
        message: 'success',
        data: {
            records: paginatedMails,
            total,
            size: parsedSize,
            current: parsedPage,
            pages: Math.ceil(total / parsedSize)
        }
    });
});

// 通用邮件详情接口
app.get('/mail/:id', (req, res) => {
    const mailId = parseInt(req.params.id, 10);
    const mailDetail = {
        code: 0,
        message: 'success',
        data: {
            mailid: mailId,
            sendaddress: `sender${mailId}@example.com`,
            sendname: `发件人 ${mailId}`,
            receaddress: `receiver${mailId}@example.com`,
            recename: `收件人 ${mailId}`,
            theme: `测试邮件 ${mailId}`,
            content: `这是第 ${mailId} 封邮件的详细内容。此处包含邮件正文，用于测试邮件详情展示功能。`,
            sendtime: new Date().toISOString(),
            attachments: Math.random() > 0.5 ? [
                {
                    id: 1,
                    fileName: `附件_${mailId}.pdf`,
                    downloadUrl: `/api/attachments/${mailId}`,
                    createTime: new Date().toISOString(),
                    fileSize: `${Math.floor(Math.random() * 1000)} KB`,
                    mailId: mailId
                }
            ] : null
        }
    };

    res.json(mailDetail);
});

// 实现 /mail/folded 接口
app.post('/mail/folded', (req, res) => {
    const { pagenumber = 1, pagesize = 10 } = req.body;

    // 验证参数
    const parsedPage = parseInt(pagenumber, 10);
    const parsedSize = parseInt(pagesize, 10);

    if (isNaN(parsedPage) || isNaN(parsedSize) || parsedPage < 1 || parsedSize < 1) {
        return res.status(400).json({
            code: 400,
            message: '请求参数错误，pagenumber 和 pagesize 必须为大于 0 的整数'
        });
    }

    const startIndex = (parsedPage - 1) * parsedSize;
    const endIndex = startIndex + parsedSize;

    const paginatedMails = mockFoldedMails.slice(startIndex, endIndex);
    const total = mockFoldedMails.length;

    res.json({
        code: 0,
        message: 'success',
        data: {
            records: paginatedMails,
            total,
            size: parsedSize,
            current: parsedPage,
            pages: Math.ceil(total / parsedSize)
        }
    });
});

// 实现 /mail/mailopera 接口
app.post('/mail/mailopera', (req, res) => {
    const { status, type, change, ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
            code: 400,
            message: '请求参数错误，ids 必须为非空数组'
        });
    }

    if (status === 6 && type === 6 && change === 1) {
        // 删除邮件
        const newFoldedMails = mockFoldedMails.filter(mail => !ids.includes(mail.id));
        mockFoldedMails.length = 0;
        mockFoldedMails.push(...newFoldedMails);
        res.json({
            code: 0,
            message: '邮件删除成功'
        });
    } else if (status === 6 && change === 0 && type === 5) {
        // 展开邮件
        const newFoldedMails = mockFoldedMails.filter(mail => !ids.includes(mail.id));
        mockFoldedMails.length = 0;
        mockFoldedMails.push(...newFoldedMails);
        // 这里可以将展开的邮件添加到其他模拟数据数组中，例如收藏箱
        ids.forEach(id => {
            const mail = mockFoldedMails.find(m => m.id === id);
            if (mail) {
                mockStarMails.push({ ...mail, star: 1 });
            }
        });
        res.json({
            code: 0,
            message: '邮件展开成功'
        });
    } else {
        res.status(400).json({
            code: 400,
            message: '不支持的操作类型'
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
