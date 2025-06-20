"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useUserInfo } from '@/context/user';
import axios from 'axios';
import { ListGroup, Card, Button, Pagination, Form } from 'react-bootstrap';
import styled from 'styled-components';
import { useTheme ,lightTheme,darkTheme } from '@/context/theme';

// 定义已发送邮件项类型
type SentMailItem = {
  id: number;
  senderId: number;
  receiverId: number;
  theme: string;
  content: string;
  sendTime: string;
  star: number;
  isread: boolean;
  draft: number;
  junk: number;
};

// 定义已发送邮件响应数据类型
type SentResponse = {
  code: number;
  message: string;
  data: {
    records: SentMailItem[];
    total: number;
    size: number;
    current: number;
    pages: number;
  };
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
  const { userInfo } = useUserInfo();
  const [sentMails, setSentMails] = useState<SentMailItem[]>([]);
  const [selectedMailDetail, setSelectedMailDetail] = useState<SentMailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedMails, setSelectedMails] = useState<number[]>([]); // 新增选中邮件 ID 数组

  // 获取已发送邮件列表
  const fetchSentMails = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    if (!userInfo?.data) {
      setError('Please log in to view sent mails.');
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post<SentResponse>('http://localhost:8080/mail/view', {
        type:2,
        pagenumber: p,
        pagesize: pageSize,
      }, {
        headers: {
          Authorization: userInfo?.token,
          'Content-Type': 'application/json'
        }
      });
      if (response.data.code === 0) {
        console.log(response.data.data);
        setSentMails(response.data.data.records);
        setTotal(response.data.data.total);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('获取已发送邮件失败');
      }
    } finally {
      setLoading(false);
    }
  }, [userInfo, pageSize]);

  // 处理分页变化
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchSentMails(page);
  };

  useEffect(() => {
    fetchSentMails(currentPage);
  }, [fetchSentMails, currentPage]);

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

  // 处理多选框变化
  const handleCheckboxChange = (mailId: number) => {
    if (selectedMails.includes(mailId)) {
      setSelectedMails(selectedMails.filter(id => id !== mailId));
    } else {
      setSelectedMails([...selectedMails, mailId]);
    }
  };

  // 删除选中邮件
  const handleDelete = async () => {
    if (selectedMails.length === 0) return;
    try {
      await axios.post('http://localhost:8080/mail/mailopera', {
        status:2,
        type:2,
        change:1,
        ids: selectedMails
      }, {
        headers: {
          Authorization: userInfo?.token,
          'Content-Type': 'application/json'
        }
      });
      setSelectedMails([]);
      fetchSentMails(currentPage);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('删除邮件失败');
      }
    }
  };

  // 收藏选中邮件
  const handleStar = async () => {
    if (selectedMails.length === 0) return;
    try {
      await axios.post('http://localhost:8080/mail/mailopera', {
        status:2,
        change: 1,
        type: 1,
        ids: selectedMails
      }, {
        headers: {
          Authorization: userInfo?.token,
          'Content-Type': 'application/json'
        }
      });
      setSelectedMails([]);
      fetchSentMails(currentPage);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('收藏邮件失败');
      }
    }
  };

  // 取消收藏选中邮件
  const handleUnstar = async () => {
    if (selectedMails.length === 0) return;
    try {
      await axios.post('http://localhost:8080/mail/mailopera', {
        status:2,
        change: 0,
        type: 1,
        ids: selectedMails
      }, {
        headers: {
          Authorization: userInfo?.token,
          'Content-Type': 'application/json'
        }
      });
      setSelectedMails([]);
      fetchSentMails(currentPage);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('取消收藏邮件失败');
      }
    }
  };
  const {theme} =useTheme();

  return (
    <SentContainer>
      <h2>已发送</h2>
      {selectedMails.length > 0 && (
        <div className="mb-3">
          <Button variant={theme} onClick={handleDelete}>
            <i className={`bi ${theme === 'dark' ? 'bi-trash' : 'bi-trash-fill'}`}></i> 删除
          </Button>
          <Button variant="warning" className="ms-2" onClick={handleStar}>
            <i className="bi bi-star"></i> 收藏
          </Button>
          <Button variant="info" className="ms-2" onClick={handleUnstar}>
            <i className="bi bi-star-fill"></i> 取消收藏
          </Button>
        </div>
      )}
      {loading && <p>加载中...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error &&!selectedMailDetail&& (
        <SentListContainer>
          {sentMails.length === 0 ? (
            <h2>暂无已发送邮件</h2>
          ) : (
            <ListGroup>
              {sentMails.map((mail) => (
                <MailListItem
                  key={mail.id}
                  style={theme === 'dark' ? darkTheme : lightTheme}
                >
                  <Form.Check
                    type="checkbox"
                    checked={selectedMails.includes(mail.id)}
                    onChange={() => handleCheckboxChange(mail.id)}
                    className="me-2"
                  />
                  <div onClick={() => setSelectedMailDetail(mail)}>
                    <p>
                      To: {mail.receiverId} - {mail.theme}  {mail.sendTime}
                      {mail.star === 1 && ' ⭐'}
                    </p>
                    <div>内容摘要: {mail.content.substring(0, 50)}...</div>
                  </div>
                </MailListItem>
              ))}
            </ListGroup>
          )}
          {totalPages > 1 && (
            <Pagination className="mt-3">
              <Pagination.First onClick={() => handlePageChange(1)} />
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              />
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
              {pageNumbers[pageNumbers.length - 1] < totalPages && <Pagination.Ellipsis disabled />}
              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              />
              <Pagination.Last onClick={() => handlePageChange(totalPages)} />
            </Pagination>
          )}
        </SentListContainer>
      )}

      {selectedMailDetail && (
        <MailDetailCard className="mt-3" style={theme === 'dark' ? darkTheme : lightTheme}>
          <Card.Header>{selectedMailDetail.theme}</Card.Header>
          <Card.Body>
            <div>收件人 ID: {selectedMailDetail.receiverId}</div>
            <div>发送时间: {selectedMailDetail.sendTime}</div>
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
