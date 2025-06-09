import { NextResponse } from 'next/server'

// 通用邮件数据结构生成器
const generateMailData = (type: number, page: number, size: number) => {
  const total = 100 // 总数据量
  const records = Array.from({ length: size }, (_, i) => ({
    id: (page - 1) * size + i + 1,
    senderId: type === 2 ? 1001 : 2000 + i, // 发件箱固定发送者
    receiverId: type === 1 ? 1001 : 3000 + i,
    theme: `${['询问', '报价', '合作'][i % 3]}邮件`,
    content: `这是${['收件箱', '发件箱', '草稿箱'][type - 1]}的第 ${(page - 1) * size + i + 1} 封邮件`,
    sendTime: new Date(Date.now() - i * 3600000).toISOString(),
    star: i % 4 === 0 ? 1 : 0,
    isread: i % 3 === 0 ? 1 : 0,
    draft: type === 3 ? 1 : 0,
    junk: i % 10 === 0 ? 1 : 0
  }))

  return {
    code: 0,
    message: 'success',
    data: {
      records,
      total,
      size,
      current: page,
      pages: Math.ceil(total / size)
    }
  }
}

// 统一邮件接口
export async function POST(request: Request) {
  const { type, page = 1, size = 10 } = await request.json()
  const authHeader = request.headers.get('Authorization')
  
  if (!authHeader?.includes('valid_token')) {
    return NextResponse.json(
      { code: 401, message: '无效的访问令牌' },
      { status: 401 }
    )
  }

  if (![1, 2, 3, 4].includes(type)) {
    return NextResponse.json(
      { code: 400, message: '无效的邮件类型' },
      { status: 400 }
    )
  }

  return NextResponse.json(generateMailData(type, page, size))
}

// 邮件详情接口
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mailId = searchParams.get('id')
  const authHeader = request.headers.get('Authorization')

  if (!authHeader?.includes('valid_token')) {
    return NextResponse.json(
      { code: 401, message: '无效的访问令牌' },
      { status: 401 }
    )
  }

  // 模拟邮件详情数据
  const detail = {
    code: 0,
    message: 'success',
    data: {
      mailid: Number(mailId),
      sendaddress: `user${mailId}@test.com`,
      sendname: `发件人${mailId}`,
      receaddress: `user1001@test.com`,
      recename: "测试用户",
      theme: `测试邮件 ${mailId}`,
      content: `这是第 ${mailId} 封邮件的详细内容。此处包含邮件正文，用于测试邮件详情展示功能。`,
      sendTime: new Date().toISOString(),
      attachments: Number(mailId) % 3 === 0 ? [
        {
          id: 1,
          fileName: `附件${mailId}.pdf`,
          downloadUrl: `/api/attachments/${mailId}`,
          createTime: new Date().toISOString(),
          fileSize: `${Math.round(Math.random() * 1024)} KB`
        }
      ] : null
    }
  }

  return NextResponse.json(detail)
}
