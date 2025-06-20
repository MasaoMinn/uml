import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import { Col, Container, Form, Row } from 'react-bootstrap';
import styled from 'styled-components';
import { useUserInfo } from '@/context/user';
import { darkTheme, lightTheme, useTheme } from '@/context/theme';
import { Dropdown } from 'react-bootstrap';

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
    username: "",
    password: null,
    emailAddress: "",
    telephone: "",
    createTime: "",
    updateTime: ""
  }
};

export default () => {
  const { userInfo, setUserInfo } = useUserInfo();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false); // 新增：邮箱编辑状态
  const [editedUser, setEditedUser] = useState<UserData>(userInfo?.data || defaultUser.data);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
    await axios.post('http://localhost:8080/user/changename',{
      username: editedUser.username,
    },{
      headers: {
        Authorization: userInfo.token
      }
    }).then((res)=>{
      if(res.data.code === 0) {
        alert('更新成功');
        setUserInfo(userInfo.token,editedUser);
        setIsEditing(false);
      } else {
        alert(res.data.message);
      }
    }).catch((err)=>{
      alert(err.message);
    }).finally(()=>{
      setIsLoading(false);
    });
  };

  const handleEditEmail = () => setIsEditingEmail(true);

  const handleCancelEditEmail = () => {
    setIsEditingEmail(false);
    setEditedUser(userInfo?.data || defaultUser.data);
  };

  const handleSaveEmail = async () => {
    if (!userInfo) {
      setError('用户信息未找到');
      return;
    }
    setIsLoading(true);
    await axios.post('http://localhost:8080/user/changemail',{
      emailAddress: editedUser.emailAddress,
    },{
      headers: {
        Authorization: userInfo.token,
        'Content-Type': 'application/json'
      }
    }).then((res)=>{
      if(res.data.code === 0) {
        alert('邮箱更新成功');
        setUserInfo(userInfo.token,editedUser);
        setIsEditingEmail(false);
      } else {
        alert(res.data.message);
      }
    }).catch((err)=>{
      alert(err.message);
    }).finally(()=>{
      setIsLoading(false);
    });
  };

  const handleChangePassword = () => setIsChangingPassword(true);

  const handleCancelChangePassword = () => {
    setIsChangingPassword(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSavePassword = async () => {
    if (!userInfo) {
      setError('用户信息未找到');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('两次输入的新密码不一致');
      return;
    }
    setIsLoading(true);
    await axios.post('http://localhost:8080/user/changepswd',{
      password: newPassword
    },{
      headers: {
        Authorization: userInfo.token,
        'Content-Type': 'application/json'
      }
    }).then((res)=>{
      if(res.data.code === 0) {
        alert('密码修改成功');
        setIsChangingPassword(false);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        alert(res.data.message);
      }
    }).catch((err)=>{
      alert(err.message);
    }).finally(()=>{
      setIsLoading(false);
    });
  };

  const { theme } = useTheme();
  return (
    <div style={theme==='light'?lightTheme:darkTheme}>
    <Card style={{ 
      width: isEditing || isChangingPassword || isEditingEmail ? '35vw' : 'fit-content',
      maxWidth: '90vw',
      minWidth: '20vw',        // 可选：设置最小宽度避免收缩过小
      height: 'auto',
      overflow: 'auto',
      margin: '0 auto',
      marginTop: '3vw',
      display: 'block',        // （覆盖之前的 inline-block）
      boxSizing: 'border-box',     // 正确计算宽度
      borderRadius: '10px',
      border: '2px solid rgb(0, 128, 255)',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
    }
    }>
      {isLoading && <div className="text-center p-3"><Spinner animation="border" /></div>}
      
      {error && (
        <div className="alert alert-danger m-3">
          {error}，请<a href="#" onClick={(e) => { e.preventDefault(); }}>重试</a>
        </div>
      )}

      {userInfo?.data && (
        <Container style={theme==='light'?lightTheme:darkTheme}>
          <Row>
            <Col>
              <Card.Body>
                {isChangingPassword ? (
                  <div>
                    <Row className="mb-2">
                      <Col sm="3" className="fw-bold">旧密码</Col>
                      <Col sm="9">
                        <Form.Control
                          type="password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                        />
                      </Col>
                    </Row>
                    <Row className="mb-2">
                      <Col sm="3" className="fw-bold">新密码</Col>
                      <Col sm="9">
                        <Form.Control
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </Col>
                    </Row>
                    <Row className="mb-2">
                      <Col sm="3" className="fw-bold">确认新密码</Col>
                      <Col sm="9">
                        <Form.Control
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </Col>
                    </Row>
                    <div className="d-flex gap-2 mt-3">
                      <Button variant="primary" onClick={handleSavePassword} disabled={isLoading}>
                        {isLoading ? '保存中...' : '保存'}
                      </Button>
                      <Button variant="secondary" onClick={handleCancelChangePassword}>
                        取消
                      </Button>
                    </div>
                  </div>
                ) : isEditingEmail ? (
                  <div>
                    <Row className="mb-2">
                      <Col sm="3" className="fw-bold">邮箱地址</Col>
                      <Col sm="9">
                        <Form.Control
                          value={editedUser.emailAddress}
                          onChange={(e) => setEditedUser({...editedUser, emailAddress: e.target.value})}
                        />
                      </Col>
                    </Row>
                    <div className="d-flex gap-2 mt-3">
                      <Button variant="primary" onClick={handleSaveEmail} disabled={isLoading}>
                        {isLoading ? '保存中...' : '保存'}
                      </Button>
                      <Button variant="secondary" onClick={handleCancelEditEmail}>
                        取消
                      </Button>
                    </div>
                  </div>
                ) : isEditing ? (
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
                  <Row>
                    <Col>
                    <i className="bi bi-person-vcard" style={{ fontSize: '2rem' }}></i>
                    </Col>
                    <Col>
                    <Card.Text style={{whiteSpace:'nowrap'}}>
                      {userInfo?.data && (
                        <>
                          <p>用户名: {userInfo.data.username}</p>
                          <p>邮箱地址: {userInfo.data.emailAddress}</p>
                          <p>电话号码: {userInfo.data.telephone}</p>
                          <p>创建时间: {userInfo.data.createTime}</p>
                          <p>更新时间: {userInfo.data.updateTime}</p>
                        </>
                      )}
                    </Card.Text>
                    <Dropdown align="end">
                      <Dropdown.Toggle variant="primary" id="dropdown-basic" disabled={isLoading}>
                        {isLoading ? '操作中...' : '操作'}
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item href='./' disabled={isLoading}>
                          {isLoading ? '更新中...' : '刷新数据'}
                        </Dropdown.Item>
                        <Dropdown.Item onClick={handleEdit} disabled={isLoading}>
                          修改用户名
                        </Dropdown.Item>
                        <Dropdown.Item onClick={handleChangePassword} disabled={isLoading}>
                          修改密码
                        </Dropdown.Item>
                        <Dropdown.Item onClick={handleEditEmail} disabled={isLoading}>
                          修改邮箱
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </Col></Row>
                )}
              </Card.Body>
            </Col>
          </Row>
        </Container>
      )}
    </Card>
    </div>
  );
};