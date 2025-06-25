"use client";
import { Button, Image } from 'react-bootstrap';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import LoginSheet from './loginsheet';
import { darkTheme, lightTheme, useTheme } from '@/context/theme';
import { useUserInfo } from '@/context/user';
import axios from 'axios';
import { JSX, useState } from 'react';
import UserCard from '@/components/userCard';
import Offcanvas from 'react-bootstrap/Offcanvas';

// 接收 DropdownComponent 作为参数
function BasicExample({ DropdownComponent }: { DropdownComponent: () => JSX.Element }) {
  const { theme, toggleTheme } = useTheme();
  const { userInfo, setUserInfo } = useUserInfo();
  const [show, setShow] = useState(false);
  const [showUserCardOffCanvas, setShowUserCardOffCanvas] = useState(false);

  const deleteuser = () => {
    axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/deleteuser`, {}, {
      headers: {
        Authorization: userInfo?.token
      }
    }).then((res) => {
      alert(res.data.message);
      logout();
    }).catch((err) => {
      alert(err.response.data.message);
    });
  };

  const logout = () => {
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

  const delcookie = () => {
    setUserInfo('', {
      id: 0,
      username: '',
      password: null,
      emailAddress: '',
      telephone: '',
      createTime: '',
      updateTime: ''
    });
    location.reload();
  };

  const handleCloseUserCardOffCanvas = () => setShowUserCardOffCanvas(false);
  const handleShowUserCardOffCanvas = () => setShowUserCardOffCanvas(true);

  return (
    <>
      <Navbar expand="lg" className={`align-items-center ${theme === 'dark' ? 'bg-dark navbar-dark' : 'bg-light navbar-light'}`} style={{ paddingLeft: '5vw', paddingRight: '10vw',opacity:'1'}}>
        <Navbar.Brand href="./" className=''><i className="bi bi-envelope"></i>@Hgmail.com</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto align-items-center">
          </Nav>
          <Nav className="align-items-center">
            <Nav.Link><LoginSheet /></Nav.Link>
            <Nav.Link onClick={handleShowUserCardOffCanvas}>{userInfo?.data?.username&&<>{userInfo?.data?.username}<Image src={new Date().getMinutes()%6<3?'/header1.jpg':'/header2.jpg'} height={30}></Image></>}</Nav.Link>
            <DropdownComponent />
            <NavDropdown title="More" id="basic-nav-dropdown">
              <NavDropdown.Item onClick={toggleTheme} className='text-center'>theme {theme === 'dark' ? <i className="bi bi-moon"></i> : <i className="bi bi-sun"></i>}</NavDropdown.Item>
              {userInfo?.token && (
                <NavDropdown.Item onClick={deleteuser} className='text-center'>
                  <i className="bi bi-person-exclamation"></i> delete account
                </NavDropdown.Item>
              )}
              <NavDropdown.Item onClick={delcookie} className='text-center'>
                delCookie
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="https://gitee.com/Arcues777/mail-demo.git" target='_blank'>
                <i className="bi bi-github"></i> Back-end on Gitee
              </NavDropdown.Item>
              <NavDropdown.Item href="https://github.com/MasaoMinn/uml" target='_blank'>
                <i className="bi bi-github"></i> Front-end on Github
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Offcanvas show={showUserCardOffCanvas} onHide={handleCloseUserCardOffCanvas} placement='top' className='h-50'
        style={theme === 'dark' ? darkTheme : lightTheme}>
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