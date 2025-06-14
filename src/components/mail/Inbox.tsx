"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useUserInfo } from '@/context/user';
import axios from 'axios';
import { ListGroup, Card, Button, Pagination, Form } from 'react-bootstrap';
import styled from 'styled-components';
import { useTheme,darkTheme,lightTheme } from '@/context/theme';
import Star from './Star';
import path from 'path';

// 定义收件箱邮件项类型
type InboxMailItem = {
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
    attachments: attachment[] | null
  };
};

// 定义邮件列表项样式
const MailListItem = styled(ListGroup.Item)`
  cursor: pointer;
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
  const [selectedMailDetail, setSelectedMailDetail] = useState<MailDetail | null>(null);
  const [detailed,setDetailed] =useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedMails, setSelectedMails] = useState<number[]>([]); // 新增：选中的邮件 ID 数组

  // 获取收件箱邮件列表
  const fetchInboxMails = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    if (!userInfo?.data) {
      setError('Please log in to view your inbox.');
      setLoading(false);
      return;
    }
    try {
      console.log()
      const response = await axios.post<InboxResponse>('http://localhost:8080/mail/view', {
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
  }, [userInfo]);

  // 获取邮件详细信息
  const fetchMailDetail = useCallback(async (mailId: number) => {
    if (!userInfo ) {
      setError('用户信息未找到');
      return;
    }
    try {
      console.log(userInfo.token);
      const response = await axios.post<MailDetail>(`http://localhost:8080/mail/`+mailId, {

      },{
        headers: {
          Authorization: userInfo?.token,
        },
      });
      if (response.data.code === 0) {
        console.log(response.data);
        setDetailed(true);
        setSelectedMailDetail(response.data);
        setLoading(false);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error('Error details:', err); // 打印错误详情
        setError(err.message);
      } else {
        setError('获取邮件详细信息失败');
      }
    }
  }, [inboxMails,userInfo]);

  // 处理分页变化
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchInboxMails(page);
  };
  useEffect(() => {
    setSelectedMailDetail(null);
  }, [inboxMails]); // 添加 inboxMails 作为依赖项

  useEffect(() => {
    fetchInboxMails(currentPage);
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
      await axios.post('http://localhost:8080/mail/mailopera', {
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
      fetchInboxMails(currentPage);
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
      fetchInboxMails(currentPage);
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
      fetchInboxMails(currentPage);
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
  const download = (url:string) => {
      axios.get(url, {
      // 关键：设置响应类型为 blob，用于处理二进制文件
      responseType: 'blob', 
      headers: {
          // 若需要携带 token 等认证信息，添加到请求头
          'Authorization': 'Bearer ' + localStorage.getItem('token') 
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
          a.download = '默认文件名'; 
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
        <MailDetailCard className="mt-3">
          <Card.Header>{selectedMailDetail?.data.theme}</Card.Header>
          <Card.Body>
            <div>发件人: {selectedMailDetail?.data.sendname} ({selectedMailDetail?.data.sendaddress})</div>
            <div>收件人: {selectedMailDetail?.data.recename} ({selectedMailDetail?.data.receaddress})</div>
            <div>发送时间: {selectedMailDetail?.data.sendtime}</div>
            <Card.Text>{selectedMailDetail?.data.content}</Card.Text>
            {selectedMailDetail?.data.attachments && selectedMailDetail?.data.attachments.length > 0 && (
              <div>
                <h5>附件</h5>
                <AttachmentList>
                  {selectedMailDetail?.data.attachments.map((attachment) => (
                    <AttachmentItem key={attachment.id}>
                      <Button onClick={()=>download(attachment.downloadUrl)}>
                        {attachment.fileName} ({attachment.fileSize})
                      </Button>
                      <a href={'file:///'+attachment.downloadUrl} >{attachment.fileName}</a>
                    </AttachmentItem>
                  ))}
                </AttachmentList>
              </div>
            )}
            <Button variant={theme} onClick={() => {setSelectedMailDetail(null);setDetailed(false);}}>
              关闭
            </Button>
          </Card.Body>
        </MailDetailCard>
      )}
      </>
    )
  }
  const InputList = ()=> {
    if(selectedMailDetail) return (<></>);
    return (
      <>
      {selectedMails.length>0 && (
        <div className="mb-3">
          <Button variant="danger" onClick={handleDelete}>Move to Trash</Button>
          <Button variant="warning" className="ms-2" onClick={handleStar}>Star</Button>
          <Button variant="info" className="ms-2" onClick={handleUnstar}>Unstar</Button>
        </div>
      )}
      {loading && <p>加载中...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <InboxListContainer>
          {inboxMails.length === 0 ? (
            <h2>暂无邮件</h2>
          ) : (
            <>
              <ListGroup >
                {inboxMails.map((mail) => (
                  <MailListItem  style={theme==='dark'?darkTheme:lightTheme}
                    key={mail.id}
                    
                    isread={mail.isread === 1}
                  >
                    <Form.Check
                      type="checkbox"
                      checked={selectedMails.includes(mail.id)}
                      onChange={() => handleCheckboxChange(mail.id)}
                      className="me-2"
                    />
                    <div onClick={() => fetchMailDetail(mail.id)}>
                      <h5>{mail.theme}</h5>
                      <div>发送时间: {mail.sendTime}</div>
                      <div>内容摘要: {mail.content.substring(0, 50)}...</div>
                    </div>
                  </MailListItem>
                ))}
              </ListGroup>
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
