"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useUserInfo } from '@/context/user';
import axios from 'axios';
import { ListGroup, Card, Button, Pagination, Form, Accordion } from 'react-bootstrap';
import styled from 'styled-components';
import { useTheme } from '@/context/theme';

// 定义折叠邮件项类型
type FoldedMailItem = {
  id: number;
  receiverId: number;
  theme: string;
  content: string;
  saveTime: string;
  recaddress: string;
};

// 定义响应数据类型
type FoldedResponse = {
  code: number;
  message: string;
  data: {
    records: FoldedMailItem[];
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
  const { userInfo } = useUserInfo();
  const [foldedMails, setFoldedMails] = useState<FoldedMailItem[]>([]);
  const [selectedMailDetail, setSelectedMailDetail] = useState<FoldedMailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedMails, setSelectedMails] = useState<number[]>([]); 

  // 获取折叠邮件列表
  const fetchFoldedMails = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    if (!userInfo?.data) {
      setError('请先登录以查看折叠邮件。');
      setLoading(false);
      return;
    }
    try {
      // 请替换为实际的折叠邮件接口
      const response = await axios.post<FoldedResponse>('http://localhost:8080/mail/view', {
        type: 4, 
        pagenumber: p,
        pagesize: pageSize,
      }, {
        headers: {
          Authorization: userInfo?.token,
          'Content-Type': 'application/json'
        }
      });
      if (response.data.code === 0) {
        setFoldedMails(response.data.data.records);
        setTotal(response.data.data.total);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('获取折叠邮件失败');
      }
    } finally {
      setLoading(false);
    }
  }, [userInfo, pageSize]);

  // 处理多选框变化
  const handleCheckboxChange = (mailId: number) => {
    if (selectedMails.includes(mailId)) {
      setSelectedMails(selectedMails.filter(id => id!== mailId));
    } else {
      setSelectedMails([...selectedMails, mailId]);
    }
  };

  // 删除选中邮件
  const handleDelete = async () => {
    if (selectedMails.length === 0) return;
    try {
      await axios.post('http://localhost:8080/mail/mailopera', {
        status: 4, 
        type: 3, 
        change: 1,
        ids: selectedMails
      }, {
        headers: {
          Authorization: userInfo?.token,
          'Content-Type': 'application/json'
        }
      });
      setSelectedMails([]);
      fetchFoldedMails(currentPage);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('删除邮件失败');
      }
    }
  };

  // 恢复选中邮件
  const handleRestore = async () => {
    if (selectedMails.length === 0) return;
    try {
      await axios.post('http://localhost:8080/mail/mailopera', {
        status: 4, 
        type: 2, 
        change: 0,
        ids: selectedMails
      }, {
        headers: {
          Authorization: userInfo?.token,
          'Content-Type': 'application/json'
        }
      });
      setSelectedMails([]);
      fetchFoldedMails(currentPage);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('恢复邮件失败');
      }
    }
  };

  // 处理分页变化
  const handlePageChange = (page: number) => {
    if (page < 1 || page > Math.ceil(total / pageSize)) return;
    setCurrentPage(page);
    fetchFoldedMails(page);
  };

  useEffect(() => {
    fetchFoldedMails(currentPage);
  }, [fetchFoldedMails, currentPage]);

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
  const { theme }= useTheme();

  return (
    <FoldedContainer>
      <h2>折叠邮件</h2>
      {selectedMails.length > 0 && (
        <div className="mb-3">
          <Button variant={theme} onClick={handleDelete}>
            <i className={`bi ${theme === 'dark' ? 'bi-trash' : 'bi-trash-fill'}`}></i> 删除
          </Button>
          <Button variant="success" className="ms-2" onClick={handleRestore}>
            <i className="bi bi-arrow-return-left"></i> Recover
          </Button>
        </div>
      )}
      {loading && <p>加载中...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <FoldedListContainer>
          {foldedMails.length === 0 ? (
            <h2>暂无折叠邮件</h2>
          ) : (
            <>
              <Accordion>
                {foldedMails.map((mail) => (
                  <Accordion.Item key={mail.id} eventKey={mail.id.toString()}>
                    <Accordion.Header>
                      <Form.Check
                        type="checkbox"
                        checked={selectedMails.includes(mail.id)}
                        onChange={() => handleCheckboxChange(mail.id)}
                        className="me-2"
                      />
                      <div>
                        To: {mail.receiverId} - {mail.theme}  {mail.saveTime}
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      <div>{mail.content}</div>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
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
            </>
          )}
        </FoldedListContainer>
      )}

      {selectedMailDetail && (
        <MailDetailCard className="mt-3">
          <Card.Header>{selectedMailDetail.theme}</Card.Header>
          <Card.Body>
            <div>收件人 ID: {selectedMailDetail.receiverId}</div>
            <div>保存时间: {selectedMailDetail.saveTime}</div>
            <Card.Text>{selectedMailDetail.content}</Card.Text>
            <Button variant="secondary" onClick={() => setSelectedMailDetail(null)}>
              Close
            </Button>
          </Card.Body>
        </MailDetailCard>
      )}
    </FoldedContainer>
  );
};

export default Folded;
