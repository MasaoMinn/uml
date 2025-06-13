"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useUserInfo } from '@/context/user';
import axios from 'axios';
import { ListGroup, Card, Button, Pagination, Form } from 'react-bootstrap';
import styled from 'styled-components';

// 定义草稿邮件项类型
type DraftMailItem = {
  id: number;
  receiverId: number;
  theme: string;
  content: string;
  saveTime: string;
};

// 定义草稿邮件响应数据类型
type DraftResponse = {
  code: number;
  message: string;
  data: {
    records: DraftMailItem[];
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
  const { userInfo } = useUserInfo();
  const [draftMails, setDraftMails] = useState<DraftMailItem[]>([]);
  const [selectedMailDetail, setSelectedMailDetail] = useState<DraftMailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedMails, setSelectedMails] = useState<number[]>([]); // 新增选中邮件 ID 数组

  // 获取草稿邮件列表
  const fetchDraftMails = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    if (!userInfo?.data) {
      setError('Please log in to view your drafts.');
      setLoading(false);
      return;
    }
    try {
      // 请替换为实际的草稿邮件接口
      const response = await axios.post<DraftResponse>('http://localhost:8080/mail/view', {
        type:3,
        page: p,
        size: pageSize,
      }, {
        headers: {
          Authorization: userInfo?.token,
          'Content-Type': 'application/json'
        }
      });
      if (response.data.code === 0) {
        setDraftMails(response.data.data.records);
        setTotal(response.data.data.total);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('获取草稿邮件失败');
      }
    } finally {
      setLoading(false);
    }
  }, [userInfo, pageSize]);

  // 处理分页变化
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchDraftMails(page);
  };

  useEffect(() => {
    fetchDraftMails(currentPage);
  }, [fetchDraftMails, currentPage]);

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
      await axios.post('http://localhost:8080/mail/delete', {
        id: selectedMails
      }, {
        headers: {
          Authorization: userInfo?.token,
          'Content-Type': 'application/json'
        }
      });
      setSelectedMails([]);
      fetchDraftMails(currentPage);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('删除邮件失败');
      }
    }
  };

  return (
    <DraftsContainer>
      <h2>草稿箱</h2>
      {selectedMails.length > 0 && (
        <div className="mb-3">
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      )}
      {loading && <p>加载中...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <DraftListContainer>
          {draftMails.length === 0 ? (
            <h2>暂无草稿</h2>
          ) : (
            <>
              <ListGroup>
                {draftMails.map((mail) => (
                  <MailListItem
                    key={mail.id}
                  >
                    {/* 应用 Inbox 多选框样式 */}
                    <Form.Check
                      type="checkbox"
                      checked={selectedMails.includes(mail.id)}
                      onChange={() => handleCheckboxChange(mail.id)}
                      className="me-2"
                    />
                    <div onClick={() => setSelectedMailDetail(mail)}>
                      <h5>{mail.theme}</h5>
                      <div>保存时间: {mail.saveTime}</div>
                      <div>内容摘要: {mail.content.substring(0, 50)}...</div>
                    </div>
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
        </DraftListContainer>
      )}

      {selectedMailDetail && (
        <MailDetailCard className="mt-3">
          <Card.Header>{selectedMailDetail.theme}</Card.Header>
          <Card.Body>
            <div>收件人 ID: {selectedMailDetail.receiverId}</div>
            <div>保存时间: {selectedMailDetail.saveTime}</div>
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
