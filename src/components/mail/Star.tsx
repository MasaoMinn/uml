"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useUserInfo } from '@/context/user';
import axios from 'axios';
import { ListGroup, Card, Button, Pagination } from 'react-bootstrap';
import styled from 'styled-components';

// 定义收藏邮件项类型
type StarMailItem = {
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

// 定义收藏邮件响应数据类型
type StarResponse = {
  code: number;
  message: string;
  data: {
    records: StarMailItem[];
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
    attachments: {
      id: number;
      fileName: string;
      downloadUrl: string;
      createTime: string;
      fileSize: string;
    }[] | null;
  };
};

// 定义邮件列表项样式
const MailListItem = styled(ListGroup.Item)`
  cursor: pointer;
  &:hover {
    background-color: #f8f9fa;
  }
`;

// 定义收藏邮件列表容器样式
const StarListContainer = styled.div`
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

// 定义整个收藏邮件容器样式
const StarContainer = styled.div`
  border: 1px solid #ccc; 
  border-radius: 8px; 
  padding: 20px; 
  margin-top: 20px; 
`;

// 定义附件列表样式
const AttachmentList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

// 定义附件项样式
const AttachmentItem = styled.li`
  margin: 8px 0;
`;

const Star = () => {
  const { userInfo } = useUserInfo();
  const [starMails, setStarMails] = useState<StarMailItem[]>([]);
  const [selectedMailDetail, setSelectedMailDetail] = useState<MailDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // 获取收藏邮件列表
  const fetchStarMails = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    if (userInfo?.data.username === 'Data Not Found') {
      setError('用户信息未找到');
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post<StarResponse>('http://localhost:8080/mail/star', {
        page: p,
        size: pageSize,
      }, {
        headers: {
          Authorization: userInfo?.token,
          'Content-Type': 'application/json'
        }
      });
      if (response.data.code === 0) {
        setStarMails(response.data.data.records);
        setTotal(response.data.data.total);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('获取收藏邮件失败');
      }
    } finally {
      setLoading(false);
    }
  }, [userInfo, pageSize]);

  // 获取邮件详细信息
  const fetchMailDetail = useCallback(async (mailId: number) => {
    setError(null);
    if (userInfo?.data.username === 'Data Not Found') {
      setError('用户信息未找到');
      return;
    }
    try {
      const response = await axios.get<MailDetail>(`/api/mail`, {
        params: {
          id: mailId
        },
        headers: {
          Authorization: userInfo?.token,
          'Content-Type': 'application/json'
        },
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

  // 处理分页变化
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchStarMails(page);
  };

  useEffect(() => {
    fetchStarMails(currentPage);
  }, [fetchStarMails, currentPage]);

  const totalPages = Math.ceil(total / pageSize);

  // 定义显示的最大页码数
  const MAX_PAGE_NUMBERS = 5;

  // 生成要显示的页码数组
  const getPageNumbers = () => {
    if (totalPages <= MAX_PAGE_NUMBERS) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
    let startPage = Math.max(1, currentPage - Math.floor(MAX_PAGE_NUMBERS / 2));
    let endPage = startPage + MAX_PAGE_NUMBERS - 1;
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - MAX_PAGE_NUMBERS + 1);
    }
    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  };

  const pageNumbers = getPageNumbers();

  return (
    <StarContainer>
      <h2>收藏邮件</h2>
      {loading && <p>加载中...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <StarListContainer>
          {starMails.length === 0 ? (
            <h2>暂无收藏邮件</h2>
          ) : (
            <>
              <ListGroup>
                {starMails.map((mail) => (
                  <MailListItem
                    key={mail.id}
                    onClick={() => fetchMailDetail(mail.id)}
                    isread={mail.isread === 1}
                  >
                    <h5>{mail.theme}</h5>
                    <div>发送时间: {mail.sendTime}</div>
                    <div>内容摘要: {mail.content.substring(0, 50)}...</div>
                  </MailListItem>
                ))}
              </ListGroup>
              {totalPages > 1 && (
                <Pagination className="mt-3">
                  {/* 跳转至第一页 */}
                  <Pagination.First onClick={() => handlePageChange(1)} />
                  <Pagination.Prev
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  />
                  {/* 显示省略号，当当前页不是第一页且起始页码大于 1 时 */}
                  {pageNumbers[0] > 1 && <Pagination.Ellipsis disabled />}
                  {pageNumbers.map((page) => (
                    <Pagination.Item
                      key={page}
                      active={page === currentPage}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Pagination.Item>
                  ))}
                  {/* 显示省略号，当当前页不是最后一页且结束页码小于总页数时 */}
                  {pageNumbers[pageNumbers.length - 1] < totalPages && <Pagination.Ellipsis disabled />}
                  <Pagination.Next
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  />
                  {/* 跳转至最后一页 */}
                  <Pagination.Last onClick={() => handlePageChange(totalPages)} />
                </Pagination>
              )}
            </>
          )}
        </StarListContainer>
      )}

      {selectedMailDetail && (
        <MailDetailCard className="mt-3">
          <Card.Header>{selectedMailDetail.data.theme}</Card.Header>
          <Card.Body>
            <div>发件人: {selectedMailDetail.data.sendname} ({selectedMailDetail.data.sendaddress})</div>
            <div>收件人: {selectedMailDetail.data.recename} ({selectedMailDetail.data.receaddress})</div>
            <div>发送时间: {selectedMailDetail.data.sendtime}</div>
            <Card.Text>{selectedMailDetail.data.content}</Card.Text>
            {selectedMailDetail.data.attachments && selectedMailDetail.data.attachments.length > 0 && (
              <div>
                <h5>附件</h5>
                <AttachmentList>
                  {selectedMailDetail.data.attachments.map((attachment) => (
                    <AttachmentItem key={attachment.id}>
                      <a href={attachment.downloadUrl} download={attachment.fileName}>
                        {attachment.fileName} ({attachment.fileSize})
                      </a>
                    </AttachmentItem>
                  ))}
                </AttachmentList>
              </div>
            )}
            <Button variant="secondary" onClick={() => setSelectedMailDetail(null)}>
              关闭
            </Button>
          </Card.Body>
        </MailDetailCard>
      )}
    </StarContainer>
  );
};

export default Star;
