import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import { Col, Container, Row } from 'react-bootstrap';
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
  const [cfUser, setCfUser] = useState<User>(defaultUser); // 初始化为默认用户信息
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userInfo) {
      setError('用户信息未找到');
      setCfUser(defaultUser); // 请求失败时重置为默认用户信息
      return;
    }
    setIsLoading(true);
    setError(null);
    const controller = new AbortController();
    try {
      const response = await axios.get(
        ``,
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}` // 添加 token 到请求头
          }
        }
      );
      if (!controller.signal.aborted) {
        if (response.data.status === 'OK' && response.data.result?.length > 0) {
          const userData = response.data.result[0];
          setCfUser({
            token: userInfo.token,
            data: userData
          });
          setUserInfo(userInfo.token, userData);
        } else {
          setCfUser(defaultUser); // 响应数据不符合要求时重置为默认用户信息
        }
      }
    } catch (err) {
      if (!axios.isCancel(err)) {
        console.error('Failed to fetch user:', err);
        setError('Failed to fetch user data');
        setCfUser(defaultUser); // 请求出错时重置为默认用户信息
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [userInfo]);

  // 组件挂载时自动获取数据
  useEffect(() => {
    if (userInfo) {   // 只有当userInfo存在时才发起请求
      fetchUser();
    }
  }, [userInfo]);  // 监听userInfo变化 ✅
  useEffect(() => {
    const controller = new AbortController();
    return () => controller.abort();  // 清理未完成请求
  }, []);
  return (
    <Card style={{ 
    width: 'fit-content',
    maxWidth: '90vw',        // 防止子元素过宽导致的溢出
    minWidth: '20vw',        // 可选：设置最小宽度避免收缩过小
    height: 'auto',
    overflow: 'auto',
    margin: '0 auto',
    marginTop: '3vw',
    display: 'block',        // （覆盖之前的 inline-block）
    boxSizing: 'border-box'     // 正确计算宽度
  }}
  bg={`${useTheme().theme.toLowerCase()}`} 
  key={`${useTheme().theme}`} 
  text={`${useTheme().theme}` === 'light' ? 'dark' : 'white'}>
      {isLoading && <div className="text-center p-3"><Spinner animation="border" /></div>}
      
      {error && (
        <div className="alert alert-danger m-3">
          {error}，请<a href="#" onClick={(e) => { e.preventDefault(); fetchUser(); }}>重试</a>
        </div>
      )}

      {cfUser && (
        <Container>
          <Row>
            <Col style={{paddingLeft:'0' ,alignContent: 'center', justifyContent: 'center'}}>
            </Col>
            <Col>
              <Card.Body>
                <Card.Text style={{whiteSpace:'nowrap'}}>
                  {/* Add null checks */}
                  <Row><Col>Name:{userInfo?.data?.username || 'Data Not Found'}</Col></Row>
                  <Row><Col>Email Address:{userInfo?.data?.emailAddress || 'Data Not Found'}</Col></Row>
                  <Row><Col>Tel:{userInfo?.data?.telephone || 'Data Not Found'}</Col></Row>
                  <Row><Col>Register time:{userInfo?.data?.createTime || 'Data Not Found'}</Col></Row>
                  <Row><Col>Last Login Time:{userInfo?.data?.updateTime || 'Data Not Found'}</Col></Row>
                </Card.Text>
                <Button variant={`${useTheme().theme}`} style={{border:'2px skyblue solid'}} onClick={fetchUser} disabled={isLoading}>{isLoading ? '更新中...' : '刷新数据'}</Button>
              </Card.Body>
            </Col>
          </Row>
        </Container>
      )}
    </Card>
  );
};