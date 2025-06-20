import { useState, useCallback } from "react";
import { Button, Col, Container, Row, ListGroup } from "react-bootstrap";
import styled from "styled-components";
import { useTheme, darkTheme, lightTheme } from "@/context/theme";
import axios from "axios";
import { useUserInfo } from "@/context/user"; 
import Inbox from "./Inbox";
import Sent from "./Sent";
import Drafts from "./Drafts";
import Star from "./Star";
import Write from './Write';
import Fold from "./Folded";

export default function MailComponent() {
    const { theme } = useTheme();
    const { userInfo } = useUserInfo(); 
    const [status, setStatus] = useState<'write'|'inbox'|'sent'|'drafts'|'star'|'fold'>('inbox');

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
                                <i className="bi bi-inbox"></i>
                            </div>
                            <div
                                onClick={() => setStatus('sent')}
                                className={`w-100 btn btn-outline-primary text-truncate my-2 py-2 ${status === 'sent' ? 'active' : ''}`}
                            >
                                Sent
                                <i className="bi bi-send"></i>
                            </div>
                            <div
                                onClick={() => setStatus('drafts')}
                                className={`w-100 btn btn-outline-primary text-truncate my-2 py-2 ${status === 'drafts' ? 'active' : ''}`}
                            >
                                Drafts
                                <i className="bi bi-file-earmark-text"></i>
                            </div>
                            <div
                                onClick={() => setStatus('write')}
                                className={`w-100 btn btn-outline-primary text-truncate my-2 py-2 ${status === 'write' ? 'active' : ''}`}
                            >
                                Write
                                <i className="bi bi-pen"></i>
                            </div>
                            <div
                                onClick={() => setStatus('star')}
                                className={`w-100 btn btn-outline-primary text-truncate my-2 py-2 ${status === 'star' ? 'active' : ''}`}
                            >
                                Star
                                <i className="bi bi-star"></i>
                            </div>
                            <div
                                onClick={() => setStatus('fold')}
                                className={`w-100 btn btn-outline-primary text-truncate my-2 py-2 ${status === 'fold' ? 'active' : ''}`}
                            >
                                Fold
                                <i className="bi bi-arrows-collapse"></i>
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
                    ) : status === 'star' ? (
                        <Star />
                    ):(
                        <Fold />
                    )}
                </Col>
            </Row>
        </Container>
    );
}
