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
import Write from './Write';

export default function MailComponent() {
    const { theme } = useTheme();
    const { userInfo } = useUserInfo(); // 获取用户信息
    const [status, setStatus] = useState<'write'|'inbox'|'sent'|'drafts'|'folded'|'star'>('inbox');

    return (
        <Container className="" fluid>
            <Row className="mb-2" style={{minHeight: '100vh'}}>
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
                                className={`w-100 btn btn-outline-primary text-truncate my-2 py-2 ${status === 'star' ? 'active' : ''}`}
                            >
                                star
                            </div>
                        </Col>
                    </Row>
                </Col>
                <Col lg={10}>
                    {status === 'write' ? userInfo?.data&&(
                        <Write />
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
                    ):(<h1 style={{color:'red'}} className="text-center">你怎么弄到这里来的？</h1>)}
                </Col>
            </Row>
        </Container>
    );
}
