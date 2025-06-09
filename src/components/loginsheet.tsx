"use client";
import { useState, useCallback } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { useTheme,darkTheme,lightTheme } from '@/context/theme';
import { useUserInfo } from '@/context/user';
import axios from 'axios';

type User ={
  userName: string;
  password: string|null;
  emailAddress: string;
  phoneNumber:string|null;
};

export default function LoginSheet() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const {theme} = useTheme();
  const { userInfo, setUserInfo } = useUserInfo();
  const offcanvasClassName = theme === 'dark' ? 'bg-dark text-white' : 'bg-light text-dark';
  const [status, setStatus] = useState<'login' | 'register' | 'forget'>('login');
  let curuser:User={
    userName: '',
    password: null,
    emailAddress: '',
    phoneNumber:null,
  };
  const register = () => {
    console.log("用户注册：",curuser);
    axios.post('http://localhost:8080/user/register', {
      username: curuser.userName,
      password: curuser.password,
      emailAddress: curuser.emailAddress,
      telephone: curuser.phoneNumber
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(response => {
      alert(response.data.message);
    }).catch(error => {
      alert(error);
    }).finally(() => {
      handleClose();
    });
  }
  const login =() => {
    console.log("用户登录：",curuser);
    axios.post("http://localhost:8080/user/login?status=0", {
      username: curuser.userName,
      password: curuser.password
      }, {
        headers: {
          'Content-Type': 'application/json'
      }
      }).then(response => {
        alert('Login successfully!');
        // 假设响应中包含 token 和用户数据
        const { token, data } = response.data;
        setUserInfo(token, {
          id: data.id || 0,
          username: curuser.userName,
          password: curuser.password,
          emailAddress: curuser.emailAddress,
          telephone: curuser.phoneNumber || '',
          createTime: data.createTime || '',
          updateTime: data.updateTime || '',
        });
        handleClose();
    }).catch(error => {
        axios.post('http://localhost:8080/user/login?status=1', {
          emailAddress: curuser.userName,
          password: curuser.password
        },{
          headers:{
            'Content-Type': 'application/json'
          }
        }).then(response => {
            alert('Login successfully!');
            // 假设响应中包含 token 和用户数据
            const { token, data } = response.data;
            setUserInfo(token, {
              id: data.id || 0,
              username: curuser.userName,
              password: curuser.password,
              emailAddress: curuser.emailAddress,
              telephone: curuser.phoneNumber || '',
              createTime: data.createTime || '',
              updateTime: data.updateTime || '',
            });
            handleClose();
        }).catch(error => {
          alert(error);
        });
    }).finally(()=> {
      handleClose();
    });
  }
  const forget = () => {
    
  }

  const Register = () => {
    return (
        <Offcanvas show={show} onHide={handleClose} placement='top' className={offcanvasClassName} style={{height: 'auto'}} fluid>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title className='mx-auto'>Login/Register</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <InputGroup className="mb-3 w-50 mx-auto">
              <InputGroup.Text 
                id="inputGroup-sizing-default"
                className="bg-primary text-white border-primary w-30 text-center"
              >
                User Name
              </InputGroup.Text>
              <Form.Control
                placeholder="username"
                aria-label="Recipient's username"
                aria-describedby="basic-addon2"
                className="border-primary"
                type="string"
                onChange={(e)=>curuser.userName=e.target.value}
              />
            </InputGroup>
              <InputGroup className="mb-3 w-50 mx-auto">
              <InputGroup.Text 
                id="inputGroup-sizing-default"
                className="bg-primary text-white border-primary w-30 text-center"
              >
                Email Address
              </InputGroup.Text>
              <Form.Control
                placeholder='email address'
                aria-label="Default"
                aria-describedby="inputGroup-sizing-default"
                className="border-primary"
                onChange={(e)=>{curuser.emailAddress=e.target.value}}
              />
              <InputGroup.Text id="basic-addon2"
                className="bg-primary text-white border-primary w-30 text-center">
                @Hgmail.com
              </InputGroup.Text>
            </InputGroup>
            <InputGroup className="mb-3 w-50 mx-auto">
              <InputGroup.Text 
                id="inputGroup-sizing-default"
                className="bg-primary text-white border-primary"
              >
                Password
              </InputGroup.Text>
              <Form.Control
                placeholder="password"
                aria-label="Recipient's username"
                aria-describedby="basic-addon2"
                className="border-primary"
                onChange={(e)=>curuser.password=e.target.value}
              />
            </InputGroup>
            <InputGroup className="mb-3 w-50 mx-auto">
              <InputGroup.Text 
                id="inputGroup-sizing-default"
                className="bg-primary text-white border-primary w-30 text-center"
              >
                Phone Number
              </InputGroup.Text>
              <Form.Control
                placeholder="phone number"
                aria-label="Recipient's username"
                aria-describedby="basic-addon2"
                className="border-primary"
                type="number"
                // 使用优化后的函数
                onChange={(e)=>{curuser.phoneNumber=e.target.value}}
              />
            </InputGroup>
            <div className="d-flex justify-content-center gap-2">
              <Button variant={theme} type="button" className="w-40" onClick={() => setStatus('login')}>
                Return to Login
              </Button>
              <Button variant="primary" type="button" className="w-40" onClick={register}>
                Register
              </Button>
            </div>
          </Offcanvas.Body>
        </Offcanvas>
    )
  }

  const Login = () => {
    return (
          <Offcanvas show={show} onHide={handleClose} placement='top' className={offcanvasClassName}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title className='mx-auto'>Login/Register</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
              {/* 设置 InputGroup 宽度并水平居中 */}
              <InputGroup className="mb-3 w-50 mx-auto">
              <InputGroup.Text 
                id="inputGroup-sizing-default"
                className="bg-primary text-white border-primary"
              >
                User name or Email address
              </InputGroup.Text>
              <Form.Control
                placeholder=''
                aria-label="Default"
                aria-describedby="inputGroup-sizing-default"
                className="border-primary"
                // 使用优化后的函数
                onChange={(e)=>{curuser.userName=e.target.value}}
              />
            </InputGroup>
            <InputGroup className="mb-3 w-50 mx-auto">
              <InputGroup.Text 
                id="inputGroup-sizing-default"
                className="bg-primary text-white border-primary"
              >
                Password
              </InputGroup.Text>
              <Form.Control
                placeholder=""
                aria-label="Recipient's username"
                aria-describedby="basic-addon2"
                className="border-primary"
                onChange={(e)=>curuser.password=e.target.value}
              />
            </InputGroup>
            <div className="d-flex justify-content-center gap-2">
              <Button variant="primary" type="button" className="w-40" onClick={login}>
                Login
              </Button>
              <Button variant={theme} type="button" className="w-40" onClick={() => setStatus('register')}>
                Register
              </Button>
              <Button variant="link" type="button" className="w-20 text-primary" onClick={() => setStatus('forget')}>
                Forgot?
              </Button>
            </div>
          </Offcanvas.Body>
        </Offcanvas>
    )
  }
  const Forget = () => {
    return (
        <Offcanvas show={show} onHide={handleClose} placement='top' className={offcanvasClassName}>
          <Offcanvas.Header closeButton>
            <Offcanvas.Title className='mx-auto'>Login/Register</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
              <InputGroup className="mb-3 w-50 mx-auto">
              <InputGroup.Text 
                id="inputGroup-sizing-default"
                className="bg-primary text-white border-primary"
              >
                User phone number
              </InputGroup.Text>
              <Form.Control
                placeholder='username'
                aria-label="Default"
                aria-describedby="inputGroup-sizing-default"
                className="border-primary"
                onChange={(e)=>{curuser.userName=e.target.value}}
              />
            </InputGroup>
            <div className="d-flex justify-content-center gap-2">
              <Button variant={theme} type="button" className="w-40" onClick={() => setStatus('login')}>
                Return to Login
              </Button>
              <Button variant="primary" type="button" className="w-40">
                Check
              </Button>
            </div>
          </Offcanvas.Body>
        </Offcanvas>
    )
  }
    
  return (
    <>
      {!userInfo?.data&&<Button variant={theme} onClick={handleShow}>登录/注册</Button>}
      {userInfo?.data&&<Button variant={theme} onClick={handleShow}>退出登录</Button>}
      {status === 'login' && <Login />}
      {status === 'register' && <Register />}
      {status === 'forget' && <Forget />}
    </>
  );
}
