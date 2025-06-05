import React, { useState } from 'react';
import { ListGroup, Card, Button } from 'react-bootstrap';
import styled from 'styled-components';

// 定义折叠邮件项类型
type FoldedMailItem = {
  id: number;
  senderId: number;
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

// 定义折叠邮件列表容器样式
const FoldedListContainer = styled.div`
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

// 定义整个折叠邮件容器样式
const FoldedContainer = styled.div`
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
`;

const Folded = () => {
  const [foldedMails, setFoldedMails] = useState<FoldedMailItem[]>([]);
  const [selectedMailDetail, setSelectedMailDetail] = useState<FoldedMailItem | null>(null);

  return (
    <FoldedContainer>
      <h2>折叠邮件</h2>
      {foldedMails.length === 0 ? (
        <p>暂无折叠邮件</p>
      ) : (
        <FoldedListContainer>
          <ListGroup>
            {foldedMails.map((mail) => (
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
        </FoldedListContainer>
      )}

      {selectedMailDetail && (
        <MailDetailCard className="mt-3">
          <Card.Header>{selectedMailDetail.theme}</Card.Header>
          <Card.Body>
            <p>发件人 ID: {selectedMailDetail.senderId}</p>
            <p>发送时间: {selectedMailDetail.sendTime}</p>
            <Card.Text>{selectedMailDetail.content}</Card.Text>
            <Button variant="secondary" onClick={() => setSelectedMailDetail(null)}>
              关闭
            </Button>
          </Card.Body>
        </MailDetailCard>
      )}
    </FoldedContainer>
  );
};

export default Folded;
