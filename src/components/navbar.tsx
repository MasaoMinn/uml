"use client";
import { Button } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import LoginSheet from './loginsheet';
import { darkTheme, lightTheme, useTheme } from '@/context/theme';
import { useUserInfo } from '@/context/user';
import axios from 'axios';
import { useState } from 'react';
import UserCard from '@/components/userCard'; // 假设组件名为 UserCard，注意首字母大写
import Offcanvas from 'react-bootstrap/Offcanvas';

function BasicExample() {
  const { theme, toggleTheme } = useTheme();
  const { userInfo, setUserInfo } = useUserInfo();
  const navbarClassName = theme === 'dark' ? 'bg-dark navbar-dark' : 'bg-light navbar-light';
  const [show, setShow] = useState(false);
  const [showUserCardOffCanvas, setShowUserCardOffCanvas] = useState(false);

  const deleteuser = () => {
    axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/deleteuser`, {}, {
      headers: {
        Authorization: userInfo?.token
      }
    }).then((res) => {
      alert(res.data.message);
      // 注销用户
      logout();
    }).catch((err) => {
      alert(err.response.data.message);
    });
  };

  const logout = () => {
    // 调用 setUserInfo 清除用户信息
    setUserInfo('', {
      id: 0,
      username: '',
      password: null,
      emailAddress: '',
      telephone: '',
      createTime: '',
      updateTime: ''
    });
    alert('用户已注销');
  };

  const handleCloseUserCardOffCanvas = () => setShowUserCardOffCanvas(false);
  const handleShowUserCardOffCanvas = () => setShowUserCardOffCanvas(true);

  return (
    <>
      <Navbar expand="lg" className={`align-items-center ${navbarClassName}`}>
        <Container>
          <Navbar.Brand href="./"><i className="bi bi-envelope"></i>@Hgmail.com</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto align-items-center">
            </Nav>
            <Nav className="align-items-center">
              <Nav.Link><LoginSheet /></Nav.Link>
              <Nav.Link onClick={handleShowUserCardOffCanvas}>{userInfo?.data?.username}</Nav.Link>
              <NavDropdown title="More" id="basic-nav-dropdown">
                <NavDropdown.Item onClick={toggleTheme} className='text-center'>theme {theme==='dark'?<i className="bi bi-moon"></i>:<i className="bi bi-sun"></i>}</NavDropdown.Item>
                {userInfo?.token && (
                  <NavDropdown.Item>
                    <Button onClick={deleteuser} variant='danger'>
                      <i className="bi bi-person-exclamation"></i> delete account
                    </Button>
                  </NavDropdown.Item>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item href="./">
                  <i className="bi bi-github"></i> See us on Github
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Offcanvas show={showUserCardOffCanvas} onHide={handleCloseUserCardOffCanvas} placement='top' className='h-50'
      style={theme==='dark'?darkTheme:lightTheme}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>用户信息</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <UserCard />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default BasicExample;