import { useState, useCallback } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import styled from "styled-components";
import { useTheme } from "@/context/theme";
import axios from "axios";
import { useUserInfo } from "@/context/user";

// 更新 Mail 类型
type Mail = {
    targetemailaddress: string;
    theme: string;
    content: string;
};

// 定义附件项样式
const AttachmentItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  margin: 4px 0;
  border-radius: 4px;
  background-color: ${({ theme }) => (theme === 'light' ? '#f8f9fa' : '#343a40')};
  color: ${({ theme }) => (theme === 'light' ? '#212529' : '#ffffff')};
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

const Write = () => {
    const { theme } = useTheme();
    const { userInfo } = useUserInfo(); // 移到组件内部使用

    // 状态初始化移到组件内部
    const [mail, setMail] = useState<Mail>({
        targetemailaddress: '',
        theme: '',
        content: '',
    });
    
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);

    // 格式化文件大小
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // 处理输入变化 - 使用不可变方式更新状态
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        setMail(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    // 处理附件上传
    const handleAttachmentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        
        setAttachments(prev => [...prev, ...files]);
    }, []);

    // 移除附件
    const removeAttachment = useCallback((index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    }, []);

    // 发送邮件
    const sendMail = useCallback(async () => {
        setIsSending(true);
        
        try {
            // 创建FormData处理文件上传
            const formData = new FormData();
            formData.append('mail', JSON.stringify(mail));
            
            // 添加附件
            attachments.forEach((file, index) => {
                formData.append(`attachments[${index}]`, file);
            });
            console.log(JSON.stringify(mail));
            await axios.post('http://localhost:8080/mail/send', formData, {
                headers: {
                    Authorization: userInfo?.token,
                }
            });
            
            // 重置表单
            setMail({
                targetemailaddress: '',
                theme: '',
                content: '',
            });
            setAttachments([]);
            
            alert('邮件发送成功');
        } catch (error) {
            alert('发送邮件失败: ' + (error as Error).message);
        } finally {
            setIsSending(false);
        }
    }, [mail, attachments, userInfo]);

    // 保存草稿
    const saveDraft = useCallback(async () => {
        setIsSavingDraft(true);
        
        try {
            // 同样使用FormData处理文件
            const formData = new FormData();
            formData.append('mail', JSON.stringify(mail));
            
            attachments.forEach((file, index) => {
                formData.append(`attachments[${index}]`, file);
            });
            
            await axios.post('http://localhost:8080/mail/save', formData, {
                headers: {
                    Authorization: userInfo?.token,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            alert('草稿保存成功');
        } catch (error) {
            alert('保存草稿失败: ' + (error as Error).message);
        } finally {
            setIsSavingDraft(false);
        }
    }, [mail, attachments, userInfo]);

    return (
        <MailForm fluid>
            <Row>
                <Col>
                    <MailButton onClick={sendMail} disabled={isSending}>
                        {isSending ? '发送中...' : 'Send'}
                    </MailButton>
                    <MailButton onClick={saveDraft} disabled={isSavingDraft}>
                        {isSavingDraft ? '保存中...' : 'Save Draft'}
                    </MailButton>
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
                        multiple
                        onChange={handleAttachmentChange}
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    To: <input 
                        type="text" 
                        name="targetemailaddress" 
                        value={mail.targetemailaddress} 
                        onChange={handleInputChange} 
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    Subject: <input 
                        type="text" 
                        name="theme" 
                        value={mail.theme} 
                        onChange={handleInputChange} 
                    />
                </Col>
            </Row>
            <Row>
                <Col>
                    Body: <textarea 
                        name="content" 
                        value={mail.content} 
                        onChange={handleInputChange} 
                        style={{minHeight:'50vh',maxHeight:'120vh',overflow:'auto'}}
                    />
                </Col>
            </Row>
            
            {/* 显示附件列表 */}
            {attachments.length > 0 && (
                <Row>
                    <Col>
                        <h5>附件 ({attachments.length})</h5>
                        {attachments.map((attachment, index) => (
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

export default Write;