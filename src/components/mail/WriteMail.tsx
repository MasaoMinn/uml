"use client";
import { useState, useCallback } from "react";
import { Button, Col, Container, Dropdown, Row } from "react-bootstrap";
import styled from "styled-components";
import { useTheme } from "@/context/theme";
import axios from "axios";
import { useUserInfo } from "@/context/user";

type DraftMailItem = {
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
  attachments: any[];
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

    &::placeholder {
      color: ${({ theme }) => 
        theme === 'light' ? '#6c757d' : '#a9a9a9'};
    }
  }
`;

type Mail = {
  id:number;
  targetemailaddress: string;
  theme: string;
  content: string;
};

interface WriteMailProps {
  initialMail?: DraftMailItem | null;
  onBack?: () => void;
}

const WriteMail: React.FC<WriteMailProps> = ({ initialMail, onBack }) => {
  const { theme } = useTheme();
  const { userInfo } = useUserInfo();
  const [bgcolor, setBgcolor] = useState<string>('white');
  const [textcolor, setTextcolor] = useState<string>('black');
  const inputStyle = {
    color: textcolor,
    backgroundColor: bgcolor
  };
  const [mail, setMail] = useState<Mail>(initialMail 
    ? {
      id:initialMail.id,
        targetemailaddress: initialMail.recaddress,
        theme: initialMail.theme,
        content: initialMail.content
      } 
    : {id:0,
        targetemailaddress: '',
        theme: '',
        content: ''
      }
  );
  
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMail(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleAttachmentChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    setAttachments(prev => [...prev, ...files]);
  }, []);

  // 移除附件
  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const sendMail = useCallback(async () => {
    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append("mail", JSON.stringify(mail));

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });
      console.log(JSON.stringify(mail));
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/mail/send`, formData, {
        params:{
          mailid: mail.id
        },
        headers: {
          Authorization: userInfo?.token,
          // 不要手动设置 Content-Type，浏览器会自动带上 boundary
        }
      });

      setMail({
        id:0,
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
      const formData = new FormData();
      formData.append('mail', JSON.stringify(mail));
      
      attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
      
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/mail/save`, formData, {
        params:{
          mailid: mail.id
        },
        headers: {
          Authorization: userInfo?.token,
        }
      });
      
      alert('草稿保存成功');
    } catch (error) {
      alert('保存草稿失败: ' + (error as Error).message);
    } finally {
      setIsSavingDraft(false);
    }
  }, [mail, attachments, userInfo]);

  const colorList = {
    'red': '#FF0000',
    'green': '#00FF00',
    'blue': '#0000FF',
    'yellow': '#FFFF00',
    'cyan': '#00FFFF',
    'magenta': '#FF00FF',
    'black': '#000000',
    'white': '#FFFFFF',
    'gray': '#808080',
    'lightgray': '#D3D3D3',
    'darkgray': '#A9A9A9',
    'orange': '#FFA500',
    'purple': '#800080',
    'pink': '#FFC0CB',
    'brown': '#A52A2A',
    'lime': '#00FF00',
    'teal': '#008080',
    'lavender': '#E6E6FA',
    'maroon': '#800000',
    'olive': '#808000',
    'navy': '#000080',
    'aqua': '#00FFFF',
    'fuchsia': '#FF00FF',
    'silver': '#C0C0C0',
    'gold': '#FFD700'
  };

  return (
    <MailForm fluid>
      {onBack && (
        <Row className="mb-3">
          <Col>
            <Button variant="secondary" onClick={onBack}>
              返回草稿箱
            </Button>
          </Col>
        </Row>
      )}
      <Row className="align-items-center mb-3">
        <Col xs="auto">
          <MailButton onClick={sendMail} disabled={isSending}>
            {isSending ? '发送中...' : 'Send'}
          </MailButton>
          <MailButton onClick={saveDraft} disabled={isSavingDraft}>
            {isSavingDraft ? '保存中...' : 'Save Draft'}
          </MailButton>
          <input
            type="file"
            id="attachment-input"
            multiple
            style={{ display: 'none' }}
            onChange={handleAttachmentChange}
          />
          <MailButton as="label" htmlFor="attachment-input">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-file-earmark-plus" viewBox="0 0 16 16">
              <path d="M8 6.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V9.5H6a.5.5 0 0 1 0-1h1.5V7a.5.5 0 0 1 .5-.5z"/>
              <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
            </svg>
            Add Attachments
          </MailButton>
        </Col>

        <Col className="d-flex justify-content-end gap-2 ms-auto">
          <Dropdown>
            <Dropdown.Toggle variant={theme} id="dropdown-bg-color">
              Background Color:{bgcolor}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {Object.entries(colorList).map(([colorName, colorValue]) => (
                <Dropdown.Item
                  key={colorName}
                  onClick={() => setBgcolor(colorValue)}
                  style={{ backgroundColor: colorValue }}
                >
                  {colorName}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>

      <Row>
        <Col>
          To: <input 
            type="text" 
            name="targetemailaddress" 
            value={mail.targetemailaddress} 
            style={inputStyle}
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
            style={inputStyle}
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
            style={{ ...{ minHeight: '80vh',  overflow: 'auto' }, ...inputStyle }}
          />
        </Col>
      </Row>
      
      {attachments.length > 0 && (
        <Row>
          <Col>
            <h5>attachments ({attachments.length})</h5>
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

export default WriteMail;
