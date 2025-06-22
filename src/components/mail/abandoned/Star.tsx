"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useUserInfo } from '@/context/user';
import axios from 'axios';
import { Card, Button, Pagination, Form, Container, Row, Col, FormControl } from 'react-bootstrap';
import styled from 'styled-components';
import { useTheme, lightTheme, darkTheme } from '@/context/theme';

// 定义收藏邮件项类型
type StarMailItem = {
  id: number;
  sendername: number;
  sendaddress: string;
  receivername: string;
  recaddress: string;
  theme: string;
  content: string;
  summary: string;
  sendtime: string;
  isread: number;
  sedstatus: number;
  recstatus: number;
  attachments: attachment[];
};

// 定义收藏响应数据类型
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
type attachment = {
  id: number;
  fileName: string;
  downloadUrl: string;
  createTime: string;
  fileSize: string;
  mailId:number;
}

// 定义邮件列表项样式
const MailListItem = styled.div`
  cursor: pointer;
  // 定义未读邮件的样式
  &.unread {
    font-weight: bold;
    background-color: #f8f9fa;
  }
  border-bottom: 1px solid #dee2e6;
  padding: 8px 0;
`;

// 定义收藏列表容器样式
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

// 定义附件列表样式
const AttachmentList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

// 定义附件项样式
const AttachmentItem = styled.li`
  margin: 8px 0;
`;
// 定义整个收藏容器样式
const StarContainer = styled.div`
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
`;

const Star = () => {
  const { userInfo } = useUserInfo();
  const [starMails, setStarMails] = useState<StarMailItem[]>([]);
  const [selectedMailDetail, setSelectedMailDetail] = useState<StarMailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedMails, setSelectedMails] = useState<number[]>([]);

  // 获取收藏邮件列表
  const fetchStarMails = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    if (!userInfo?.data) {
      setError('Please log in to view your starred mails.');
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post<StarResponse>(`${process.env.NEXT_PUBLIC_API_URL}/mail/view`, {
        type: 1,
        pagenumber: p,
        pagesize: pageSize,
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
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/mail/mailopera`, {
        status: 4,
        type: 3,
        change: 1,
        id: selectedMails
      }, {
        headers: {
          Authorization: userInfo?.token,
          'Content-Type': 'application/json'
        }
      });
      setSelectedMails([]);
      fetchStarMails(currentPage);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('删除邮件失败');
      }
    }
  };

  // 取消收藏选中邮件
  const handleUnstar = async () => {
    if (selectedMails.length === 0) return;
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/mail/mailopera`, {
        status: 1,
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
      fetchStarMails(currentPage);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('取消收藏邮件失败');
      }
    }
  };
const download = (id: number, fileName: string) => {
      const token = localStorage.getItem('token');
  axios.get(`${process.env.NEXT_PUBLIC_API_URL}/mail/download?id=${id}`, {
    responseType: 'blob',
    headers: {
      'Authorization': userInfo?.token
    }
  })
  .then(response => {
      const blob = response.data;
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      const contentDisposition = response.headers['content-disposition']; 
      if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename=(.*)/);
          if (fileNameMatch && fileNameMatch[1]) {
              a.download = decodeURIComponent(fileNameMatch[1]);
          }
      } else {
          // 后端未设置则自定义
          a.download = fileName || `attachment-${id}.bin`; 
      }
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(objectUrl);
      document.body.removeChild(a);
  })
  .catch(error => {
      console.error('下载失败:', error);
  });
  }

  const { theme } = useTheme();

  return (
    <StarContainer style={theme === 'dark' ? darkTheme : lightTheme}>
      <h2>收藏邮件</h2>
      {selectedMails.length > 0 && (
        <div className="mb-3">
          <Button variant={theme} onClick={handleDelete}>
            <i className={`bi ${theme === 'dark' ? 'bi-trash' : 'bi-trash-fill'}`}></i> 删除
          </Button>
          <Button variant="info" className="ms-2" onClick={handleUnstar}>
            <i className="bi bi-star-fill"></i> 取消收藏
          </Button>
        </div>
      )}
      {loading && <p>加载中...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && !selectedMailDetail && (
        <StarListContainer>
          {starMails.length === 0 ? (
            <h2>暂无收藏邮件</h2>
          ) : (
            <>
              <Container fluid className='text-center' style={{ border: '1px solid black' }}>
                <Row className="align-items-center">
                  <Col lg={1}>Select</Col>
                  <Col lg={1}>状态</Col>
                  <Col lg={2}>发件人</Col>
                  <Col lg={2}>发件地址</Col>
                  <Col lg={2}>主题</Col>
                  <Col lg={2}>发送时间</Col>
                  <Col lg={1}>内容</Col>
                  <Col lg={1}>操作</Col>
                </Row>
                {starMails.map((mail) => (
                  <MailListItem
                    key={mail.id}
                    style={theme === 'dark' ? darkTheme : lightTheme}
                    className={!mail.isread ? 'unread' : ''}
                  >
                    <Row className="align-items-center">
                      <Col lg={1}>
                        <Form.Check
                          type="checkbox"
                          checked={selectedMails.includes(mail.id)}
                          onChange={() => handleCheckboxChange(mail.id)}
                          className="me-2"
                        />
                      </Col>
                      <Col lg={1}>{mail.recstatus === 1 && ' ⭐'} {mail.isread ? <i className="bi bi-envelope-open"></i> : <i className="bi bi-envelope"></i>}</Col>
                      <Col lg={2}>{mail.sendername}</Col>
                      <Col lg={2}>[{mail.sendaddress}]</Col>
                      <Col lg={2}>{mail.theme}</Col>
                      <Col lg={2}>{mail.sendtime}</Col>
                      <Col lg={1}>{mail.content.substring(0, 50)}...</Col>
                      <Col lg={1}>
                        <Button variant={theme} onClick={() => setSelectedMailDetail(mail)}>
                          Enter
                        </Button>
                      </Col>
                    </Row>
                  </MailListItem>
                ))}
              </Container>
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
        </StarListContainer>
      )}

      {selectedMailDetail && (
        <MailDetailCard className="mt-3" style={theme === 'dark' ? darkTheme : lightTheme}>
          <Card.Header><h3>{selectedMailDetail.theme}{'⭐'}</h3></Card.Header>
          <Card.Body>
            <div>发件人: {selectedMailDetail.sendername} ({selectedMailDetail.sendaddress})</div>
            <div>收件人: {selectedMailDetail.receivername} ({selectedMailDetail.recaddress})</div>
            <div>发送时间: {selectedMailDetail.sendtime}</div>
            <br />
            Body:
            <FormControl
              as="textarea"
              value={selectedMailDetail.content || ''}
              readOnly
              rows={5}
              style={{ resize: 'none' }}
            />
            <br />
            <br />
            {selectedMailDetail?.attachments && selectedMailDetail?.attachments.length > 0 && (
              <div>
                <p>attachments</p>
                <AttachmentList>
                  {selectedMailDetail?.attachments.map((attachment) => (
                    <AttachmentItem key={attachment.id}>
                      <Button variant={theme} onClick={()=>download(attachment.id,attachment.fileName)}>
                        {attachment.fileName} ({attachment.fileSize +'B'})
                      </Button>
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
