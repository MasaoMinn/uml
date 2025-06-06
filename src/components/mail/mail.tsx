import { useState, useCallback } from "react";
import { Button, Col, Container, Row, ListGroup } from "react-bootstrap";
import styled from "styled-components";
import { useTheme, darkTheme, lightTheme } from "@/context/theme";
import axios from "axios";
import { useUserInfo } from "@/context/user"; // 新增导入
import Inbox from "./Inbox";
import Sent from "./Sent";
import Drafts from "./Drafts";
import Folded from "./Folded";
import Star from "./Star";

// 更新 Mail 类型，支持多个附件
type Mail = {
    to: string;
    subject: string;
    body: string;
    attachments: File[]; // 存储附件文件列表
    date: Date;
}

// 定义附件项样式
const AttachmentItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  margin: 4px 0;
  border-radius: 4px;
  background-color: ${({ theme }) => (theme === 'light'? '#f8f9fa' : '#343a40')};
  color: ${({ theme }) => (theme === 'light'? '#212529' : '#ffffff')};
  cursor: pointer;
  transition: background-color 0.3s ease;
  border: 1px solid ${({ theme }) => (theme === 'light' ? '#dee2e6' : '#495057')};
`;

// 按钮样式
const MailButton = styled(Button)`
  margin-right: 10px;
  margin-bottom: 10px;
  background-color: ${({ theme }) => 
    theme === 'light' ? '#007bff' : '#0056b3'};
  border-color: ${({ theme }) => 
    theme === 'light' ? '#007bff' : '#0056b3'};
  color: white;

  &:hover {
    background-color: ${({ theme }) => 
      theme === 'light' ? '#0056b3' : '#003d82'};
    border-color: ${({ theme }) => 
      theme === 'light' ? '#0056b3' : '#003d82'};
  }
`;

// 表单样式
const MailForm = styled(Container)`
  padding: 20px;
  border-radius: 5px;

  input,
  textarea {
    width: 100%;
    margin-bottom: 10px;
    padding: 5px;
    background-color: #ffffff; 

    &::placeholder {
      color: ${({ theme }) => 
        theme === 'light' ? '#6c757d' : '#a9a9a9'};
    }
  }
`;

// 将 Write 组件提取到外部
const Write = ({
    newMail,
    handleInputChange,
    sendMail,
    saveDraft,
    handleAttachmentChange,
    removeAttachment
}: {
    newMail: Mail;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    sendMail: () => void;
    saveDraft: () => void;
    handleAttachmentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeAttachment: (index: number) => void;
}) => {
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <MailForm fluid>
            <Row>
                <Col>
                    <MailButton onClick={sendMail}>Send</MailButton>
                    <MailButton onClick={saveDraft}>Save Draft</MailButton>
                    <MailButton as="label" htmlFor="attachment-input">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-earmark-plus" viewBox="0 0 16 16">
                            <path d="M8 6.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V9.5H6a.5.5 0 0 1 0-1h1.5V7a.5.5 0 0 1 .5-.5z"/>
                            <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                        </svg>
                        Add Attachments
                    </MailButton>
                    <input
                        type="file"
                        id="attachment-input"
                        hidden
                        onChange={handleAttachmentChange}
                        multiple // 支持多文件上传
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    To: <input type="text" name="to" value={newMail.to} onChange={handleInputChange} />
                </Col>
            </Row>
            <Row>
                <Col>
                    Subject: <input type="text" name="subject" value={newMail.subject} onChange={handleInputChange} />
                </Col>
            </Row>
            <Row>
                <Col>
                    Body: <textarea name="body" value={newMail.body} onChange={handleInputChange} style={{minHeight:'50vh',maxHeight:'120vh',overflow:'auto'}}/>
                </Col>
            </Row>
            {/* 显示附件列表 */}
            {newMail.attachments.length > 0 && (
                <Row>
                    <Col>
                        {newMail.attachments.map((attachment, index) => (
                            <AttachmentItem key={index}>
                                <div>
                                    {attachment.name} ({formatFileSize(attachment.size)})
                                </div>
                                <MailButton
                                    variant="danger"
                                    size="sm"
                                    onClick={() => removeAttachment(index)}
                                >
                                    Remove
                                </MailButton>
                            </AttachmentItem>
                        ))}
                    </Col>
                </Row>
            )}
        </MailForm>
    );
};

export default function MailComponent() {
    const { theme } = useTheme();
    const { userInfo } = useUserInfo(); // 获取用户信息
    const [status, setStatus] = useState<'null'|'write'|'inbox'|'sent'|'drafts'|'folded'|'star'>('null');
    const [newMail, setNewMail] = useState<Mail>({
        to: '',
        subject: '',
        body: '',
        attachments: [], // 初始化附件列表为空
        date: new Date()
    });
    const [inbox, setInbox] = useState<Mail[]>([]);
    const [sent, setSent] = useState<Mail[]>([]);
    const [drafts, setDrafts] = useState<Mail[]>([]);
    const [folded, setFolded] = useState<Mail[]>([]);
    const [isSending, setIsSending] = useState(false); // 发送邮件状态
    const [isSavingDraft, setIsSavingDraft] = useState(false); // 保存草稿状态

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewMail(prev => ({ ...prev, [name]: value, date: new Date() }));
    }, []);

    // 处理附件上传的函数
    const handleAttachmentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setNewMail(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...files],
            date: new Date()
        }));
    }, []);

    // 移除附件的函数
    const removeAttachment = useCallback((index: number) => {
        setNewMail(prev => {
            const newAttachments = [...prev.attachments];
            newAttachments.splice(index, 1);
            return { ...prev, attachments: newAttachments, date: new Date() };
        });
    }, []);

    const sendMail = useCallback(async () => {
        setIsSending(true); 
        try {
            const formData = new FormData();
            formData.append('to', newMail.to);
            formData.append('subject', newMail.subject);
            formData.append('body', newMail.body);
            newMail.attachments.forEach((attachment, index) => {
                formData.append(`attachment_${index}`, attachment);
            });

            if (userInfo) {
                formData.append('token', userInfo.token); // 添加 token
            }

            await axios.post('/api/mail/send', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSent(prev => [...prev, newMail]);
            setNewMail({
                to: '',
                subject: '',
                body: '',
                attachments: [],
                date: new Date()
            });
            setStatus('sent');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '发送邮件时发生未知错误';
            alert(`发送邮件失败: ${errorMessage}`);
            console.error('发送邮件失败:', error);
        } finally {
            setIsSending(false); 
        }
    }, [newMail, userInfo]);

    const saveDraft = useCallback(async () => {
        setIsSavingDraft(true); 
        try {
            const formData = new FormData();
            formData.append('to', newMail.to);
            formData.append('subject', newMail.subject);
            formData.append('body', newMail.body);
            newMail.attachments.forEach((attachment, index) => {
                formData.append(`attachment_${index}`, attachment);
            });

            if (userInfo) {
                formData.append('token', userInfo.token); // 添加 token
            }

            await axios.post('/api/mail/save', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setDrafts(prev => [...prev, newMail]);
            setNewMail({
                to: '',
                subject: '',
                body: '',
                attachments: [],
                date: new Date()
            });
            setStatus('drafts');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '保存草稿时发生未知错误';
            alert(`保存草稿失败: ${errorMessage}`);
            console.error('保存草稿失败:', error);
        } finally {
            setIsSavingDraft(false); 
        }
    }, [newMail, userInfo]);

    return (
        <Container className="" fluid>
            <Row className="mb-2" style={{height: '100vh'}}>
                <Col lg={1}>
                    <Row>
                        <Col>
                            <div
                                onClick={() => setStatus('inbox')}
                                className={`w-100 btn btn-outline-primary text-truncate my-2 py-2 ${status === 'inbox' ? 'active' : ''}`}
                            >
                                Inbox
                            </div>
                            <div
                                onClick={() => setStatus('sent')}
                                className={`w-100 btn btn-outline-primary text-truncate my-2 py-2 ${status === 'sent' ? 'active' : ''}`}
                            >
                                Sent
                            </div>
                            <div
                                onClick={() => setStatus('drafts')}
                                className={`w-100 btn btn-outline-primary text-truncate my-2 py-2 ${status === 'drafts' ? 'active' : ''}`}
                            >
                                Drafts
                            </div>
                            <div
                                onClick={() => setStatus('folded')}
                                className={`w-100 btn btn-outline-primary text-truncate my-2 py-2 ${status === 'folded' ? 'active' : ''}`}
                            >
                                Folded
                            </div>
                            <div
                                onClick={() => setStatus('write')}
                                className={`w-100 btn btn-outline-primary text-truncate my-2 py-2 ${status === 'write' ? 'active' : ''}`}
                            >
                                Write
                            </div>
                            <div
                                onClick={() => setStatus('star')}
                                className={`w-100 btn btn-outline-primary text-truncate my-2 py-2 ${status === 'write' ? 'active' : ''}`}
                            >
                                star
                            </div>
                        </Col>
                    </Row>
                </Col>
                <Col lg={10}>
                    {status === 'write' ? (
                        <Write
                            newMail={newMail}
                            handleInputChange={handleInputChange}
                            sendMail={sendMail}
                            saveDraft={saveDraft}
                            handleAttachmentChange={handleAttachmentChange}
                            removeAttachment={removeAttachment}
                        />
                    ) : status === 'inbox' ? (
                        <Inbox  />
                    ) : status === 'sent' ? (
                        <Sent  />
                    ) : status === 'drafts' ? (
                        <Drafts />
                    ) : status === 'folded' ? (
                        <Folded />
                    ) : status === 'star' ? (
                        <Star />
                    ):(<div>Hello World</div>)}
                </Col>
            </Row>
        </Container>
    );
}
