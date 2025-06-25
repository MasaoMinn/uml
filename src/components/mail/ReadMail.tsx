"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useUserInfo } from '@/context/user';
import axios from 'axios';
import { Card, Button, Pagination, Form, Container, Row, Col, FormControl } from 'react-bootstrap';
import styled from 'styled-components';
import { useTheme, lightTheme, darkTheme } from '@/context/theme';

type attachment = {
  id: number;
  fileName: string;
  downloadUrl: string;
  createTime: string;
  fileSize: string;
  mailId: number;
};

type MailItem = {
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

type MailResponse = {
  code: number;
  message: string;
  data: {
    records: MailItem[];
    total: number;
    size: number;
    current: number;
    pages: number;
  };
};

// 定义邮件列表项样式
const MailListItem = styled.div`
  cursor: pointer;
  // 定义未读邮件的样式
  &.unread {
    font-weight: bold;
  }
  border-bottom: 1px solid #dee2e6;
  padding: 8px 0;
`;

// 定义邮件列表容器样式
const MailListContainer = styled.div`
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

// 定义整个邮件容器样式
const MailContainer = styled.div`
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

interface ReadMailProps {
  mailType: number;
  onEditDraft: (draft: MailItem) => void;
  // 修改 onReply 回调函数，添加主题参数
  onReply: (recipient: string, theme: string) => void; 
}

const ReadMail: React.FC<ReadMailProps> = ({ mailType, onEditDraft, onReply }) => {
  const { userInfo } = useUserInfo();
  const [mails, setMails] = useState<MailItem[]>([]);
  const [selectedMailDetail, setSelectedMailDetail] = useState<MailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedMails, setSelectedMails] = useState<number[]>([]);
  useEffect(()=>{
    setSelectedMailDetail(null);
    setSelectedMails([]);
  },[mailType]);

  // 获取邮件列表
  const fetchMails = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    if (!userInfo?.data) {
      setError('Please log in to view mails.');
      setLoading(false);
      return;
    }
    try {
      const response = await axios.post<MailResponse>(`${process.env.NEXT_PUBLIC_API_URL}/mail/view`, {
        type: mailType,
        pagenumber: p,
        pagesize: pageSize,
      }, {
        headers: {
          Authorization: userInfo?.token,
          'Content-Type': 'application/json'
        }
      });
      console.log(response.data);
      if (response.data.code === 0) {
        setMails(response.data.data.records);
        setTotal(response.data.data.total);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('获取邮件失败');
      }
    } finally {
      setLoading(false);
    }
  }, [userInfo, pageSize, mailType]);

  // 处理分页变化
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchMails(page);
  };

  useEffect(() => {
    fetchMails(currentPage);
  }, [fetchMails, currentPage]);

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

  // 通用处理函数
  const handleMailOperation = async (type: number, change: number) => {
    if (selectedMails.length === 0) return;
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/mail/mailopera`, {
        status: mailType === 3 ? 5 : mailType === 5 ? 3 : mailType,
        type: mailType === 4 && type === 2 ? 3 : type,
        change,
        ids: selectedMails
      }, {
        headers: {
          Authorization: userInfo?.token,
          'Content-Type': 'application/json'
        }
      });

      if (type === 2) {
        alert(response.data.message);
      } else if (type === 1 && change === 1) {
        alert('收藏成功');
      } else if (type === 1 && change === 0) {
        alert('取消收藏成功');
      }

      setSelectedMails([]);
      fetchMails(currentPage);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        if (type === 2) {
          setError('删除邮件失败');
        } else if (type === 1 && change === 1) {
          setError('收藏邮件失败');
        } else if (type === 1 && change === 0) {
          setError('取消收藏邮件失败');
        }
      }
    }
  };

  // 删除选中邮件
  const handleDelete = () => handleMailOperation(2, 1);

  // 收藏选中邮件
  const handleStar = () => handleMailOperation(1, 1);

  // 取消收藏选中邮件
  const handleUnstar = () => handleMailOperation(1, 0);

  const { theme } = useTheme();

  const download = (id: number, fileName: string) => {
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
  };

  // 更新邮件已读状态
  const markMailAsRead = useCallback(async (mailIds: number[]) => {
    if (!userInfo?.token) return;
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/mail/isread`, { ids: mailIds }, {
        headers: {
          Authorization: userInfo.token,
          'Content-Type': 'application/json'
        }
      });
      // 更新本地状态
      setMails(prevMails => prevMails.map(mail => 
        mailIds.includes(mail.id) ? { ...mail, isread: 1 } : mail
      ));
    } catch (err) {
      console.error('更新邮件已读状态失败:', err);
    }
  }, [userInfo]);

  // 一键已读功能
  const markAllMailsAsRead = useCallback(() => {
    const allMailIds = mails.map(mail => mail.id);
    if (allMailIds.length > 0) {
      markMailAsRead(allMailIds);
    }
    alert('Marked!');
  }, [mails, markMailAsRead]);

  const ModifyButtons = () => {
    return (
        <div className="mb-3">
          <Button variant={theme} onClick={handleDelete}>
            <i className={`bi ${theme === 'dark' ? 'bi-trash' : 'bi-trash-fill'}`}></i> {mailType===4?'彻底删除':'移入折叠箱'}
          </Button>
          {mailType!=4&&<Button variant="warning" className="ms-2" onClick={handleStar}>
            <i className="bi bi-star"></i> 收藏
          </Button>}
          {mailType!=4&&<Button variant="info" className="ms-2" onClick={handleUnstar}>
            <i className="bi bi-star-fill"></i> 取消收藏
          </Button>}
        </div>
    )
  }

  return (
    <MailContainer style={theme === 'dark' ? darkTheme : lightTheme}>
      {selectedMails.length > 0&&<ModifyButtons />}
      {loading && <p>loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && !selectedMailDetail && (
        <MailListContainer>
          {mails.length === 0 ? (
            <h2>No mail</h2>
          ) : (
            <>
              <Container fluid className='text-center' style={{ border: '1px solid black'}}>
                <Row>
                  <Col>
                  {(mailType===1||mailType===5)&&<Button variant={theme} onClick={markAllMailsAsRead}>
                    <i className={`bi ${theme === 'dark' ? 'bi-eye' : 'bi-eye-fill'}`}></i> 全部已读
                  </Button>}
                  </Col>
                </Row>
                <Row>
                  <Col lg={1}>Select</Col>
                  <Col lg={1}>Status</Col>
                  <Col lg={1}>Sender</Col>
                  <Col lg={2}>Send Addr</Col>
                  <Col lg={1}>Theme</Col>
                  <Col lg={1}>Send Time</Col>
                  <Col>Content</Col>
                  <Col lg={1}>Operation</Col>
                </Row>
                {mails.map((mail) => (
                  <MailListItem
                    key={mail.id}
                    className={!mail.isread&&mail.sendaddress!=userInfo?.data.emailAddress ? 'unread' : ''}
                  >
                    <Row className="align-items-center " style={{ flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                      <Col lg={1}>
                        <Form.Check
                          type="checkbox"
                          checked={selectedMails.includes(mail.id)}
                          onChange={() => handleCheckboxChange(mail.id)}
                          className="me-2"
                        />
                      </Col>
                      <Col lg={1}>
                        {((mail.recaddress===userInfo?.data.emailAddress&&mail.recstatus === 1)||(mail.sendaddress===userInfo?.data.emailAddress&&mail.sedstatus===1)) && ' ⭐'}
                        {mail.isread||mail.sendaddress===userInfo?.data.emailAddress ? <i className="bi bi-envelope-open"></i> : <i className="bi bi-envelope"></i>}
                      </Col>
                      <Col lg={1}>{mail.sendername}</Col>
                      <Col lg={2} style={{overflow:'auto'}}>[{mail.sendaddress}]</Col>
                      <Col lg={1}>{mail.theme}</Col>
                      <Col lg={1}>{mail.sendtime}</Col>
                      <Col 
                        style={{
                          overflowY: 'auto',
                          whiteSpace: 'pre-wrap',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {mailType===3?mail.content:mail.summary}
                      </Col>
                      <Col lg={1}>
                        <Button variant={theme} onClick={()=>{setSelectedMailDetail(mail);
                          if(mail.isread===0&&mail.recaddress===userInfo?.data.emailAddress) {
                            markMailAsRead([mail.id]);
                          }
                          }}>
                          Enter
                        </Button>
                        {mailType === 3 && ( // 草稿箱状态
                          <Button variant="info" className="ms-2" onClick={() => onEditDraft(mail as MailItem)}>
                            Edit
                          </Button>
                        )}
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
        </MailListContainer>
      )}
      {selectedMailDetail && (
        <MailDetailCard className="mt-3" style={theme === 'dark' ? darkTheme : lightTheme}>
          <Card.Header>
            <h3>{selectedMailDetail.theme}</h3>
          </Card.Header>
          <Card.Body>
            <Container fluid>
              <Row xs='auto'>
                <Col>发件人: {selectedMailDetail.sendername} </Col>
                <Col style={{ color: 'gray' }}>({selectedMailDetail.sendaddress})</Col>
              </Row>
              <Row xs='auto'>
                <Col>收件人: {selectedMailDetail.receivername} </Col>
                <Col style={{ color: 'gray' }}>({selectedMailDetail.recaddress})</Col>
              </Row>
              <Row xs='auto'>
                <Col>发送时间: </Col>
                <Col>{selectedMailDetail.sendtime}</Col>
              </Row>
              <br />
              <Row>Body:</Row>
              <Row className="mt-3">
                <Col>
                  <FormControl
                    as="textarea"
                    value={selectedMailDetail.content || ''}
                    readOnly
                    rows={20}
                  />
                </Col>
              </Row>
              <br />
              <br />
              {selectedMailDetail.attachments && selectedMailDetail.attachments.length > 0 && (
                <div>
                  <p>attachments</p>
                  <AttachmentList>
                    {selectedMailDetail.attachments.map((attachment) => (
                      <AttachmentItem key={attachment.id}>
                        <Button variant={theme} onClick={() => download(attachment.id, attachment.fileName)}>
                          {attachment.fileName} ({attachment.fileSize + 'B'})
                        </Button>
                      </AttachmentItem>
                    ))}
                  </AttachmentList>
                </div>
              )}
{mailType===1&&<Button variant="primary" onClick={() => onReply(selectedMailDetail.sendaddress, selectedMailDetail.theme)}>
                回复
              </Button>}
              <Button variant={theme} onClick={() => setSelectedMailDetail(null)}>
                Close
              </Button>
            </Container>
          </Card.Body>
        </MailDetailCard>
      )}
    </MailContainer>
  );
};

export default ReadMail;
