import { NextResponse } from 'next/server';

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

// 收件箱邮件列表接口
export async function POST(request: Request) {
    const { type, page = 1, size = 10 } = await request.json();
    if (type!== 1) {
        return NextResponse.json(
            { code: 400, message: '无效的邮件类型，收件箱类型应为 1' },
            { status: 400 }
        );
    }

    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedMails = mockInboxMails.slice(startIndex, endIndex);

    return NextResponse.json({
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
}
