import React, { useState } from 'react';
import { ListGroup, Card, Button } from 'react-bootstrap';
import styled from 'styled-components';

// 定义已发送邮件项类型
type SentMailItem = {
  id: number;
  receiverId: number;
  theme: string;
  content: string;
  sendTime: string;
};

// 定义邮件列表项样式
const MailListItem = styled(ListGroup.Item)`
  cursor: pointer;
  &:hover {
    background-color: #f8f9fa;
  }
`;

// 定义已发送邮件列表容器样式
const SentListContainer = styled.div`
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

// 定义整个已发送邮件容器样式
const SentContainer = styled.div`
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
`;

const Sent = () => {
  const [sentMails, setSentMails] = useState<SentMailItem[]>([]);
  const [selectedMailDetail, setSelectedMailDetail] = useState<SentMailItem | null>(null);

  return (
    <SentContainer>
      <h2>已发送</h2>
      {sentMails.length === 0 ? (
        <p>暂无已发送邮件</p>
      ) : (
        <SentListContainer>
          <ListGroup>
            {sentMails.map((mail) => (
              <MailListItem
                key={mail.id}
                onClick={() => setSelectedMailDetail(mail)}
              >
                <h5>{mail.theme}</h5>
                <p>发送时间: {mail.sendTime}</p>
                <p>内容摘要: {mail.content.substring(0, 50)}...</p>
              </MailListItem>
            ))}
          </ListGroup>
        </SentListContainer>
      )}

      {selectedMailDetail && (
        <MailDetailCard className="mt-3">
          <Card.Header>{selectedMailDetail.theme}</Card.Header>
          <Card.Body>
            <p>收件人 ID: {selectedMailDetail.receiverId}</p>
            <p>发送时间: {selectedMailDetail.sendTime}</p>
            <Card.Text>{selectedMailDetail.content}</Card.Text>
            <Button variant="secondary" onClick={() => setSelectedMailDetail(null)}>
              关闭
            </Button>
          </Card.Body>
        </MailDetailCard>
      )}
    </SentContainer>
  );
};

export default Sent;
