"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useUserInfo } from '@/context/user';
import axios from 'axios';
import { ListGroup, Card, Button, Pagination, Form, Container, Row, Col } from 'react-bootstrap';
import styled from 'styled-components';
import { useTheme,darkTheme,lightTheme } from '@/context/theme';
import Star from './Star';

// 定义收件箱邮件项类型
type InboxMailItem = {
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

// 定义附件列表样式
const AttachmentList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

// 定义附件项样式
const AttachmentItem = styled.li`
  margin: 8px 0;
`;

const Inbox = () => {
  const { userInfo } = useUserInfo();
  const [inboxMails, setInboxMails] = useState<InboxMailItem[]>([]);
  const [selectedMailDetail, setSelectedMailDetail] = useState<InboxMailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedMails, setSelectedMails] = useState<number[]>([]); // 新增：选中的邮件 ID 数组

  // 获取收件箱邮件列表
  const fetchInboxMails = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!userInfo?.data) {
      setError('Please log in to view your inbox.');
      setLoading(false);
      return;
    }
    try {
      console.log()
      const response = await axios.post<InboxResponse>(`${process.env.NEXT_PUBLIC_API_URL}/mail/view`, {
        type: 1,
        pagenumber: currentPage,
        pagesize: pageSize,
      }, {
        headers: {
          Authorization: userInfo?.token,
          'Content-Type': 'application/json'
        }
      });
      if (response.data.code === 0) {
        console.log(response.data.data.records);
        setInboxMails(response.data.data.records);
        setTotal(response.data.data.total);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('获取收件箱邮件失败');
      }
    } finally {
      setLoading(false);
    }
  }, [userInfo,currentPage]);

  // 处理分页变化
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchInboxMails();
  };
  useEffect(() => {
    setSelectedMailDetail(null);
  }, [inboxMails]); // 添加 inboxMails 作为依赖项

  useEffect(() => {
    fetchInboxMails();
  }, [fetchInboxMails, currentPage]);

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
        ids: selectedMails,
        change:1,
        type:2,
        status:1
      }, {
        headers: {
          Authorization: userInfo?.token,
          'Content-Type': 'application/json'
        }
      });
      setSelectedMails([]);
      fetchInboxMails();
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
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/mail/mailopera`, {
        status:1,
        change:1,
        type:1,
        ids: selectedMails
      }, {
        headers: {
          Authorization: userInfo?.token,
          'Content-Type': 'application/json'
        }
      });
      setSelectedMails([]);
      fetchInboxMails();
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
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/mail/mailopera`, {
        status:1,
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
      fetchInboxMails();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('取消收藏邮件失败');
      }
    }
  };

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
  const {theme} = useTheme();
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
      // 从响应头解析文件名（若后端设置了 Content-Disposition）
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
  const MailDetail =() =>{
    return (
            <>
      {selectedMailDetail && (
        <MailDetailCard className="mt-3"  style={theme==='dark'?darkTheme:lightTheme}>
          <Card.Header><h3>{selectedMailDetail?.theme}</h3></Card.Header>
          <Card.Body>
            <Container fluid>
            <Row xs='auto'><Col>发件人: {selectedMailDetail?.sendername} </Col><Col style={{color:'gray'}}>({selectedMailDetail?.sendaddress})</Col></Row>
            <Row xs='auto'><Col>收件人: {selectedMailDetail?.receivername} </Col><Col style={{color:'gray'}}>({selectedMailDetail?.recaddress})</Col></Row>
            <Row xs='auto'><Col>发送时间: </Col><Col>{selectedMailDetail?.sendtime}</Col></Row>
            <br />
            <Row>Body:</Row>
            <Row className="mt-3">
              <Col>
                <Form.Control
                  as="textarea"
                  value={selectedMailDetail?.content || ''}
                  readOnly
                  rows={5}
                  style={{ resize: 'none' }}
                />
              </Col>
            </Row>
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
            <Button variant={theme} onClick={() => {setSelectedMailDetail(null);}}>
              关闭
            </Button>
            </Container>
          </Card.Body>
        </MailDetailCard>
      )}
      </>
    )
  }
  const InputList = () => {
    const { theme } = useTheme(); // 获取主题状态
    if (selectedMailDetail) return <></>;
    return (
      <>
      {selectedMails.length > 0 && (
        <div className="mb-3">
          <Button variant={theme} onClick={handleDelete}>
            <i className={`bi ${theme === 'dark' ? 'bi-trash' : 'bi-trash-fill'}`}></i>
          </Button>
          <Button variant="warning" className="ms-2" onClick={handleStar}>
            <i className="bi bi-star"></i>Star
          </Button>
          <Button variant="info" className="ms-2" onClick={handleUnstar}>
            <i className="bi bi-star-fill"></i>UnStar
          </Button>
        </div>
      )}
      {loading && <p>加载中...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error &&!selectedMailDetail&& (
        <InboxListContainer>
          {inboxMails.length === 0 ? (
            <h2>暂无邮件</h2>
          ) : (
            <>
              <Container fluid className='text-center' style={{border: '1px solid black'}}>
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
                {inboxMails.map((mail) => (
                  <Row 
                    style={theme==='dark'?darkTheme:lightTheme}
                    key={mail.id}
                    className={`border border-black ${!mail.isread ? 'unread' : ''} align-items-center`}
                  >
                    <Col lg={1}>
                      <Form.Check
                        type="checkbox"
                        checked={selectedMails.includes(mail.id)}
                        onChange={() => handleCheckboxChange(mail.id)}
                        className="me-2"
                      />
                    </Col>
                    <Col lg={1}>{mail.recstatus === 1 && ' ⭐'} {mail.isread?<i className="bi bi-envelope-open"></i>:<i className="bi bi-envelope"></i>}</Col>
                    <Col lg={2}>{mail.sendername}</Col>
                    <Col lg={2}>[{mail.sendaddress}]</Col>
                    <Col lg={2}>{mail.theme}</Col>
                    <Col lg={2}>{mail.sendtime}</Col>
                    <Col lg={1}>{mail.summary}</Col>
                    <Col lg={1}><Button variant={theme} onClick={() => setSelectedMailDetail(mail)}>Enter</Button></Col>
                  </Row>
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
        </InboxListContainer>
      )}
      </>
    )
  }
  useEffect(()=>{if(selectedMailDetail) {MailDetail}});
  useEffect(()=>{if(selectedMailDetail===null) {InputList}});

  return (
    <>
    <InboxContainer style={theme==='dark'?darkTheme:lightTheme}>
      <h2>收件箱</h2>
      <InputList />
      <MailDetail />
    </InboxContainer>
    </>
  );
};

export default Inbox;
