import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import { Col, Container, Form, Row } from 'react-bootstrap';
import styled from 'styled-components';
import { useUserInfo } from '@/context/user';
import { useTheme } from '@/context/theme';

interface UserData {
  id: number;
  username: string;
  password: string | null;
  emailAddress: string;
  telephone: string;
  createTime: string;
  updateTime: string;
}

interface User {
  token: string;
  data: UserData;
}

const defaultUser: User = {
  token: "",
  data: {
    id: 0,
    username: "Not Found",
    password: null,
    emailAddress: "Not Found",
    telephone: "Not Found",
    createTime: "",
    updateTime: ""
  }
};

export default () => {
  const { userInfo, setUserInfo } = useUserInfo();
  const [cfUser, setCfUser] = useState<User>(defaultUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 新增编辑相关状态
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserData>(userInfo?.data || defaultUser.data);

  // 新增编辑处理函数
  const handleEdit = () => setIsEditing(true);
  
  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser(userInfo?.data || defaultUser.data);
  };

  const handleSave = async () => {
    if (!userInfo) {
      setError('用户信息未找到');
      return;
    }
    setIsLoading(true);
    try {
      // 调用API保存修改（替换为实际API地址）
      const response = await axios.put("", editedUser, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      
      if (response.data.status === 'OK') {
        // 更新上下文和本地状态
        setUserInfo(userInfo.token, editedUser);
        setCfUser({ token: userInfo.token, data: editedUser });
        setIsEditing(false);
      }
    } catch (err) {
      setError('更新用户信息失败');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 添加 fetchUser 方法定义
  const fetchUser = useCallback(async () => {
    if (!userInfo?.data) {
      setError('用户信息未找到');
      setCfUser(defaultUser);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/user`, {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      
      if (response.data.status === 'OK') {
        const userData = response.data.result;
        setCfUser({ token: userInfo.token, data: userData });
        setUserInfo(userInfo.token, userData);
      }
    } catch (err) {
      setError('获取用户信息失败');
    } finally {
      setIsLoading(false);
    }
  }, [userInfo]);

  return (
    <Card style={{ 
      width: isEditing ? '35vw' : 'fit-content',
      maxWidth: '90vw',
      minWidth: '20vw',        // 可选：设置最小宽度避免收缩过小
      height: 'auto',
      overflow: 'auto',
      margin: '0 auto',
      marginTop: '3vw',
      display: 'block',        // （覆盖之前的 inline-block）
      boxSizing: 'border-box'     // 正确计算宽度
    }}>
      {isLoading && <div className="text-center p-3"><Spinner animation="border" /></div>}
      
      {error && (
        <div className="alert alert-danger m-3">
          {error}，请<a href="#" onClick={(e) => { e.preventDefault(); fetchUser(); }}>重试</a>
        </div>
      )}

      {cfUser && (
        <Container>
          <Row>
            <Col>
              <Card.Body>
                {isEditing ? (
                  // 编辑状态表单
                  <div>
                    <Row className="mb-2">
                      <Col sm="3" className="fw-bold">Name</Col>
                      <Col sm="9">
                        <Form.Control
                          value={editedUser.username}
                          onChange={(e) => setEditedUser({...editedUser, username: e.target.value})}
                        />
                      </Col>
                    </Row>
                    <Form.Group as={Row} className="mb-3">
                      <Form.Label column sm="3">
                        Email Address
                      </Form.Label>
                      <Col sm="9">
                        <Form.Control
                          type="email"
                          value={editedUser.emailAddress}
                          onChange={(e) => setEditedUser({ ...editedUser, emailAddress: e.target.value })}
                        />
                      </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                      <Form.Label column sm="3">
                        Tel
                      </Form.Label>
                      <Col sm="9">
                        <Form.Control
                          type="tel"
                          value={editedUser.telephone}
                          onChange={(e) => setEditedUser({ ...editedUser, telephone: e.target.value })}
                        />
                      </Col>
                    </Form.Group>
                    <div className="d-flex gap-2 mt-3">
                      <Button variant="primary" onClick={handleSave} disabled={isLoading}>
                        {isLoading ? '保存中...' : '保存'}
                      </Button>
                      <Button variant="secondary" onClick={handleCancel}>
                        取消
                      </Button>
                    </div>
                  </div>
                ) : (
                  // 非编辑状态显示
                  <div>
                    <Card.Text style={{whiteSpace:'nowrap'}}>
                      {/* 原有信息展示... */}
                    </Card.Text>
                    <div className="d-flex gap-2">
                      <Button variant={`${useTheme().theme}`} style={{border:'2px skyblue solid'}} 
                        onClick={fetchUser} disabled={isLoading}>
                        {isLoading ? '更新中...' : '刷新数据'}
                      </Button>
                      <Button variant="warning" style={{border:'2px orange solid'}} 
                        onClick={handleEdit} disabled={isLoading}>
                        编辑信息
                      </Button>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Col>
          </Row>
        </Container>
      )}
    </Card>
  );
};