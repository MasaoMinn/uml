"use client";
import { useState, useCallback, useEffect } from "react";
import { Button, Col, Container, Row, ListGroup } from "react-bootstrap";
import styled from "styled-components";
import { useTheme, darkTheme, lightTheme } from "@/context/theme";
import axios from "axios";
import { useUserInfo } from "@/context/user"; 
import ReadMail from "./ReadMail";
import WriteMail from "./WriteMail";
import { getCookie } from "@/context/user"; // 假设 getCookie 函数在该文件中定义

// 假设 DraftMailItem 类型定义在对应文件中
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

export default function MailComponent() {
  const { theme } = useTheme();
  const { userInfo, setUserInfo } = useUserInfo(); 
  const [status, setStatus] = useState<'write'|'inbox'|'sent'|'drafts'|'star'|'fold'>('inbox');
  const [editingDraft, setEditingDraft] = useState<DraftMailItem | null>(null);
  const [cameFromDrafts, setCameFromDrafts] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyTheme, setReplyTheme] = useState<string | null>(null); // 新增状态用于存储原邮件标题

  const mailTypeMap: Record<typeof status, number> = {
    inbox: 1,
    sent: 2,
    drafts: 3,
    star: 5,
    fold: 4,
    write: 0
  };

  const handleEditDraft = (draft: DraftMailItem) => {
    setEditingDraft(draft);
    setStatus('write');
    setCameFromDrafts(true);
  };

  const handleBackToDrafts = () => {
    setEditingDraft(null);
    setStatus('drafts');
    setCameFromDrafts(false);
  };

  const handleEnterWrite = () => {
    setStatus('write');
    setCameFromDrafts(false);
  };

  const handleReply = (recipient: string, theme: string) => {
    setStatus('write');
    setCameFromDrafts(false);
    setReplyTo(recipient);
    setReplyTheme(theme); // 存储原邮件标题
  };

  // 检查 cookie 是否过期
  useEffect(() => {
    const userInfoCookie = getCookie('userInfo');
    if (!userInfoCookie && userInfo?.data) {
      setUserInfo('', {
        id: 0,
        username: '',
        password: null,
        emailAddress: '',
        telephone: '',
        createTime: '',
        updateTime: ''
      });
      window.location.reload();
    }
  }, [userInfo, setUserInfo]);

  return (
    <Container className="" fluid style={{ opacity: 0.8}}>
      <Row className="mb-2" style={{minHeight: '100vh'}}>
        <Col lg={1}>
          <Row>
            <Col>
              <div
                onClick={handleEnterWrite}
                className={`w-100 btn btn-outline-dark text-truncate my-2 py-2 ${status === 'write' ? 'active' : ''}`}
              >
                Write
                <i className="bi bi-pen"></i>
              </div>
              <div
                onClick={() => {setStatus('inbox')}}
                className={`w-100 btn btn-outline-dark text-truncate my-2 py-2 ${status === 'inbox' ? 'active' : ''}`}
              >
                Inbox
                <i className="bi bi-inbox"></i>
              </div>
              <div
                onClick={() => setStatus('sent')}
                className={`w-100 btn btn-outline-dark text-truncate my-2 py-2 ${status === 'sent' ? 'active' : ''}`}
              >
                Sent
                <i className="bi bi-send"></i>
              </div>
              <div
                onClick={() => setStatus('drafts')}
                className={`w-100 btn btn-outline-dark text-truncate my-2 py-2 ${status === 'drafts' ? 'active' : ''}`}
              >
                Drafts
                <i className="bi bi-file-earmark-text"></i>
              </div>
              <div
                onClick={() => setStatus('star')}
                className={`w-100 btn btn-outline-dark text-truncate my-2 py-2 ${status === 'star' ? 'active' : ''}`}
              >
                Star
                <i className="bi bi-star"></i>
              </div>
              <div
                onClick={() => setStatus('fold')}
                className={`w-100 btn btn-outline-dark text-truncate my-2 py-2 ${status === 'fold' ? 'active' : ''}`}
              >
                Fold
                <i className="bi bi-arrows-collapse"></i>
              </div>
            </Col>
          </Row>
        </Col>
        <Col lg={10}>
          {status === 'write' ? userInfo?.data&&(
            <WriteMail 
              initialMail={editingDraft ? {
                ...editingDraft,
                recaddress: replyTo || editingDraft.recaddress,
                theme: replyTheme ? `Re: ${replyTheme}` : editingDraft.theme
              } : {
                id: 0,
                sendername: 0,
                sendaddress: '',
                receivername: '',
                recaddress: replyTo || '',
                theme: replyTheme ? `Re: ${replyTheme}` : '',
                content: '',
                summary: '',
                sendtime: '',
                isread: 0,
                sedstatus: 0,
                recstatus: 0,
                attachments: []
              }} 
              onBack={cameFromDrafts ? handleBackToDrafts : undefined}
            />
          ) : (
            <ReadMail 
              mailType={mailTypeMap[status]} 
              onEditDraft={handleEditDraft}
              onReply={(recipient, theme) => handleReply(recipient, theme)} // 修改 onReply 回调
            />
          )}
        </Col>
      </Row>
    </Container>
  );
}
