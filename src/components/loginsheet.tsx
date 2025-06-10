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
  const [status, setStatus] = useState<'login' | 'register' | 'forget1'|'forget2'|'forget3'>('login');
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

  const logout = () => {
    axios({
      url: 'http://localhost:8080/user/deleteuser',
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: userInfo?.token
      }
    }).then(response => {
      if (response.data.code === 0) {
        alert('Logout successfully!');
        setUserInfo('', {
          id: 0,
          username: '',
          password: null,
          emailAddress: '',
          telephone: '',
          createTime: '',
          updateTime: ''
        });
      } else {
        alert(response.data.message);
      }
    }).catch(error => {
      alert('Logout failed: ' + error);
    }).finally(() => {
      handleClose();
      location.reload();
    });
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
              <Button variant="link" type="button" className="w-20 text-primary" onClick={() => setStatus('forget1')}>
                Forgot?
              </Button>
            </div>
          </Offcanvas.Body>
        </Offcanvas>
    )
  }
  let stat:boolean = false;
  const Forget1 = () => {
  const check1 = () => {
    axios.post('localhost:8080/user/forgetps1',{
      status : stat? 0 : 1,
      username: curuser.userName,
      emailAddress: curuser.emailAddress,
    }).then(response => {
      alert(response.data.message);
      if(response.data.code==0) {
        curuser.phoneNumber = response.data.data;
        setStatus('forget2');
      }
    }).catch((err)=>{
      alert(err);
    });
  }
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
                Check with user name
              </InputGroup.Text>
              <Form.Control
                placeholder='username'
                aria-label="Default"
                aria-describedby="inputGroup-sizing-default"
                className="border-primary"
                onChange={(e)=>{curuser.userName=e.target.value}}
              />
              <Button onClick={()=>{check1()}}>Check</Button>
            </InputGroup>
            <p className="text-center">OR</p>
            <InputGroup className="mb-3 w-50 mx-auto">
              <InputGroup.Text 
                id="inputGroup-sizing-default"
                className="bg-primary text-white border-primary"
              >
               Check with Email Address
              </InputGroup.Text>
              <Form.Control
                placeholder='email'
                aria-label="Default"
                aria-describedby="inputGroup-sizing-default"
                className="border-primary"
                onChange={(e)=>{curuser.userName=e.target.value}}
              />
              <Button onClick={()=>{check1();stat=true;}}>Check</Button>
            </InputGroup>

            <div className="d-flex justify-content-center gap-2">
              <Button variant={theme} type="button" className="w-40" onClick={() => setStatus('login')}>
                Return to Login
              </Button>
            </div>
          </Offcanvas.Body>
        </Offcanvas>
    )
  }
  const Forget2 = () => {
    const [err, setErr] = useState('');
    const check2 = () => {
      axios.get('http://localhost:8080/user/forgetps3', {
        params: {
          code: curuser.password,
          telephone: curuser.phoneNumber,
        }
        ,headers: {
        'Content-Type': 'application/json',
        }
      }).then(response => {
        alert(response.data.message);
        if(response.data.code==0) {
          setStatus('forget3');
        }else {
          setErr(response.data.message);
        }
      }).catch((err)=>{
        setErr(err.message);
      });
    }
    const send  = () => {
      axios.get('http://localhost:8080/user/sendCode',{
        params: {
          telephone: curuser.phoneNumber,
        },
      }).then((res)=>{
        if(res.data.code==0) {
          setErr(res.data.message);
        }else {
          setErr(res.data.message);
        }
      }).catch((err)=>{
        setErr(err.message);
      });
    }
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
                code
              </InputGroup.Text>
              <Form.Control
                placeholder='code'
                aria-label="Default"
                aria-describedby="inputGroup-sizing-default"
                className="border-primary"
                onChange={(e)=>{curuser.password=e.target.value}}
              />
              <Button onClick={()=>{send}}>Get</Button>
            </InputGroup>
            <div className="d-flex justify-content-center gap-2">
              <Button variant={theme} type="button" className="w-40" onClick={() => setStatus('login')}>
                Return to Login
              </Button>
              <Button variant="primary" type="button" className="w-40" onClick={check2}>
                Check
              </Button>
            </div>
            <p className="text-center">{err}</p>
          </Offcanvas.Body>
        </Offcanvas>
    )
  }
  const Forget3 = () => {
    let passw:string='';
    let passw2:string='';
    const [err, setErr] = useState('');
    const check3 = () => {
      if(passw!=passw2) {
        setErr('Passwords do not match');
        return;
      }
      axios.get('http://localhost:8080/user/forgetps4', {
        params:{
          status: stat? 0 : 1,
          code: curuser.password,
          telephone: curuser.phoneNumber,
        },
        data: {
          username: curuser.userName,
          emailAddress: curuser.emailAddress,
          password: passw,
        },
        headers: {
          'Content-Type': 'application/json', 
        }
      }).then((res)=>{
        if(res.data.code==0) {
          alert(res.data.message);
          setStatus('login'); 
        }else {
          setErr(res.data.message);
        }
      }).catch((err)=>{
        setErr(err.message);
      });
    }
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
                New Password
              </InputGroup.Text>
              <Form.Control
                placeholder='new password'
                aria-label="Default"
                aria-describedby="inputGroup-sizing-default"
                className="border-primary"
                onChange={(e)=>{curuser.password=e.target.value}}
              />
            </InputGroup>
              <InputGroup className="mb-3 w-50 mx-auto">
              <InputGroup.Text 
                id="inputGroup-sizing-default"
                className="bg-primary text-white border-primary"
              >
                Check Password
              </InputGroup.Text>
              <Form.Control
                placeholder='re-input password'
                aria-label="Default"
                aria-describedby="inputGroup-sizing-default"
                className="border-primary"
                onChange={(e)=>{passw=e.target.value}}
              />
            </InputGroup>
            <div className="d-flex justify-content-center gap-2">
              <Button variant={theme} type="button" className="w-40" onClick={() => setStatus('login')}>
                Return to Login
              </Button>
              <Button variant="primary" type="button" className="w-40" onClick={check3}>
                Check
              </Button>
            </div>
            <p className="text-center">{err}</p>
          </Offcanvas.Body>
        </Offcanvas>
    ) 
  }
    
  return (
    <>
      {!userInfo?.data&&<Button variant={theme} onClick={()=>{setStatus('login');handleShow()}}>登录/注册</Button>}
      {userInfo?.data&&<Button variant={theme} onClick={logout}>退出登录</Button>}
      {status === 'login' && <Login />}
      {status === 'register' && <Register />}
      {status === 'forget1' && <Forget1 />}
      {status === 'forget2' && <Forget2 />}
      {status === 'forget3' && <Forget3 />}
    </>
  );
}
