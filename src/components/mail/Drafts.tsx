import React, { useState } from 'react';
import { ListGroup, Card, Button } from 'react-bootstrap';
import styled from 'styled-components';

// 定义草稿邮件项类型
type DraftMailItem = {
  id: number;
  receiverId: number;
  theme: string;
  content: string;
  saveTime: string;
};

// 定义邮件列表项样式
const MailListItem = styled(ListGroup.Item)`
  cursor: pointer;
  &:hover {
    background-color: #f8f9fa;
  }
`;

// 定义草稿列表容器样式
const DraftListContainer = styled.div`
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

// 定义整个草稿容器样式
const DraftsContainer = styled.div`
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
`;

const Drafts = () => {
  const [draftMails, setDraftMails] = useState<DraftMailItem[]>([]);
  const [selectedMailDetail, setSelectedMailDetail] = useState<DraftMailItem | null>(null);

  return (
    <DraftsContainer>
      <h2>草稿箱</h2>
      {draftMails.length === 0 ? (
        <p>暂无草稿</p>
      ) : (
        <DraftListContainer>
          <ListGroup>
            {draftMails.map((mail) => (
              <MailListItem
                key={mail.id}
                onClick={() => setSelectedMailDetail(mail)}
              >
                <h5>{mail.theme}</h5>
                <p>保存时间: {mail.saveTime}</p>
                <p>内容摘要: {mail.content.substring(0, 50)}...</p>
              </MailListItem>
            ))}
          </ListGroup>
        </DraftListContainer>
      )}

      {selectedMailDetail && (
        <MailDetailCard className="mt-3">
          <Card.Header>{selectedMailDetail.theme}</Card.Header>
          <Card.Body>
            <p>收件人 ID: {selectedMailDetail.receiverId}</p>
            <p>保存时间: {selectedMailDetail.saveTime}</p>
            <Card.Text>{selectedMailDetail.content}</Card.Text>
            <Button variant="secondary" onClick={() => setSelectedMailDetail(null)}>
              关闭
            </Button>
          </Card.Body>
        </MailDetailCard>
      )}
    </DraftsContainer>
  );
};

export default Drafts;
