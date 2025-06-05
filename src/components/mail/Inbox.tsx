import React, { useState, useEffect, useCallback } from 'react';
import { useUserInfo } from '@/context/user';
import axios from 'axios';
import { ListGroup, Card, Button } from 'react-bootstrap';
import styled from 'styled-components';

// 定义请求参数类型
type RequestParams = {
  userid: number;
  type: number;
  read: number;
  pagenumber: number;
  pagesize: number;
};

// 定义收件箱邮件项类型
type InboxMailItem = {
  id: number;
  senderId: number;
  receiverId: number;
  theme: string;
  content: string;
  sendTime: string;
  star: number;
  isread: number;
  draft: number;
  junk: number;
};

// 定义收件箱响应数据类型
type InboxResponse = {
  code: number;
  message: string;
  data: {
    records: InboxMailItem[];
    total: number;
    size: number;
    current: number;
    pages: number;
  };
};

// 定义邮件详细信息类型
type MailDetail = {
  code: number;
  message: string;
  data: {
    mailid: number;
    sendaddress: string;
    sendname: string;
    receaddress: string;
    recename: string;
    theme: string;
    content: string;
    sendtime: string;
  };
};

// 定义邮件列表项样式
const MailListItem = styled(ListGroup.Item)`
  cursor: pointer;
  &:hover {
    background-color: #f8f9fa;
  }
`;

// 定义收件箱列表容器样式
const InboxListContainer = styled.div`
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
`;

// 定义邮件详情卡片样式
const MailDetailCard = styled(Card)`
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 16px;
`;

// 定义整个收件箱容器样式
const InboxContainer = styled.div`
  border: 1px solid #ccc; // 设置边框，颜色为浅灰色
  border-radius: 8px; // 设置边框圆角
  padding: 20px; // 设置内边距
  margin-top: 20px; // 设置顶部外边距
`;

const Inbox = () => {
  const { userInfo } = useUserInfo();
  const [inboxMails, setInboxMails] = useState<InboxMailItem[]>([]);
  const [selectedMailDetail, setSelectedMailDetail] = useState<MailDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取收件箱邮件列表
  const fetchInboxMails = useCallback(async () => {
    if (!userInfo) {
      setError('用户信息未找到');
      setLoading(false);
      return;
    }

    const params: RequestParams = {
      userid: userInfo.data.id,
      type: 1,
      read: 0,
      pagenumber: 1,
      pagesize: 5
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      setError('加载超时，请重试');
      setLoading(false);
    }, 5000); // 设置 5 秒超时

    try {
      const response = await axios.post<InboxResponse>('/api/mail/view', params, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        },
        signal: controller.signal
      });
      if (response.data.code === 0) {
        setInboxMails(response.data.data.records);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      if (axios.isCancel(err)) {
        // 请求被取消，由超时触发
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('获取收件箱邮件失败');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [userInfo]);

  // 获取邮件详细信息
  const fetchMailDetail = useCallback(async (mailId: number) => {
    if (!userInfo) {
      setError('用户信息未找到');
      return;
    }

    try {
      const response = await axios.get<MailDetail>(`/api/mail/${mailId}`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        }
      });
      if (response.data.code === 0) {
        setSelectedMailDetail(response.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('获取邮件详细信息失败');
      }
    }
  }, [userInfo]);

  useEffect(() => {
    fetchInboxMails();
  }, [fetchInboxMails]);

  return (
    <InboxContainer>
      <h2>收件箱</h2>
      {loading && <p>加载中...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <InboxListContainer>
          {inboxMails.length === 0 ? (
            <p>暂无邮件</p>
          ) : (
            <ListGroup>
              {inboxMails.map((mail) => (
                <MailListItem
                  key={mail.id}
                  onClick={() => fetchMailDetail(mail.id)}
                >
                  <h5>{mail.theme}</h5>
                  <p>发送时间: {mail.sendTime}</p>
                  <p>内容摘要: {mail.content.substring(0, 50)}...</p>
                </MailListItem>
              ))}
            </ListGroup>
          )}
        </InboxListContainer>
      )}

      {selectedMailDetail && (
        <MailDetailCard className="mt-3">
          <Card.Header>{selectedMailDetail.data.theme}</Card.Header>
          <Card.Body>
            <p>发件人: {selectedMailDetail.data.sendname} ({selectedMailDetail.data.sendaddress})</p>
            <p>收件人: {selectedMailDetail.data.recename} ({selectedMailDetail.data.receaddress})</p>
            <p>发送时间: {selectedMailDetail.data.sendtime}</p>
            <Card.Text>{selectedMailDetail.data.content}</Card.Text>
            <Button variant="secondary" onClick={() => setSelectedMailDetail(null)}>
              关闭
            </Button>
          </Card.Body>
        </MailDetailCard>
      )}
    </InboxContainer>
  );
};

export default Inbox;
