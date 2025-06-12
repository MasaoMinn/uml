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
  const [phonen,setPhonen]=useState('');
  const [namen,setNamen] =useState('');
  const [emaila,setEmaila] =useState('');

  const logout = () => {
    axios({
      url: 'http://localhost:8080/user/logout',
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
    const [err, setErr] = useState('');
    const send  = () => {
      console.log(':'+curuser.phoneNumber);
      axios.get('http://localhost:8080/user/sendCode',{
      params: {
        phone: curuser.phoneNumber ,
      }
      }).then((res)=>{
        console.log(res);
        if(res.data.code==0) {
          setErr(res.data.message);
        }else {
          setErr(res.data.message);
        }
      }).catch((err)=>{
        setErr(err.message);
      });
    }
  const register = () => {
      console.log(curuser);
      setCapcha(curuser.password);
      axios.post('http://localhost:8080/user/forgetps3', {
          telephone: curuser.phoneNumber,
        },{
        headers: {
          'Content-Type': 'application/json',
        }
        ,params:{
          code: curuser.password,
        }
      }).then(response => {
        alert(response.data.message);
        if(response.data.code==0) {
          setStatus('forget3');
          return true;
        }else {
          setErr(response.data.message);
        }
      }).catch((err)=>{
        setErr(err.message);
      }).finally(()=>{
        return false;
      })
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
                onChange={(e)=>{curuser.phoneNumber=e.target.value}}
              />
              <Button variant='primary' onClick={send}>Check</Button>
            </InputGroup>
            <InputGroup className="mb-3 w-50 mx-auto">
              <InputGroup.Text 
                id="inputGroup-sizing-default"
                className="bg-primary text-white border-primary w-30 text-center"
              >
                Code
              </InputGroup.Text>
              <Form.Control
                placeholder="phone number"
                aria-label="Recipient's username"
                aria-describedby="basic-addon2"
                className="border-primary"
                type="string"
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
  const [namae, setNamae] = useState<boolean>(true);
  const login =() => {
    console.log("用户登录：",curuser);
    axios.post("http://localhost:8080/user/login", {
      username: curuser.userName,
      emailAddress:curuser.userName,
      password: curuser.password
      }, {
        params: {
          status: namae?0:1
        },
        headers: {
          'Content-Type': 'application/json'
      }
      }).then(response => {
        if(response.data.code!=0) {
          throw new Error(response.data.message);
        }
        alert('Login successfully!');
        console.log(response);
        // 假设响应中包含 token 和用户数据
        const data=response.data.data,token=response.data.token;
        console.log(data);
        setUserInfo(token, {
          id: data.id,
          username: data.username,
          password: curuser.password,
          emailAddress: data.emailAddress,
          telephone: data.telephone || '',
          createTime: data.createTime || '',
          updateTime: data.updateTime || '',
        });
    }).catch(error => {
        alert(error);
    }).finally(()=> {
      handleClose();
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
                {namae?'User Name':'Email Address'}
              </InputGroup.Text>
              <Form.Control
                placeholder=''
                aria-label="Default"
                aria-describedby="inputGroup-sizing-default"
                className="border-primary"
                // 使用优化后的函数
                onChange={(e)=>{curuser.userName=e.target.value}}
              />
              {!namae&&<InputGroup.Text id="basic-addon2"
                className="bg-primary text-white border-primary w-30 text-center">
                @Hgmail.com
              </InputGroup.Text>}
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
              <Button variant='warning' onClick={()=>{setNamae(!namae);}}>use {namae?'Email Address':'UserName'} to login</Button>
            </div>
          </Offcanvas.Body>
        </Offcanvas>
    )
  }
  const [stat,setStat]=useState(false);

  const Forget1 = () => {
  const check1 = () => {
    
    axios.post('http://localhost:8080/user/forgetps1',{
      username: curuser.userName,
      emailAddress: curuser.emailAddress,
    },{
      headers: {
        'Content-Type': 'application/json',
      }
      ,params:{
        status: stat?1:0, 
      }
    }).then(response => {
      alert(response.data.message);
      if(response.data.code==0) {
        setPhonen(response.data.data);
        setNamen(curuser.userName);
        setEmaila(curuser.emailAddress);
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
              <Button onClick={()=>{check1();setStat(true)}}>Check</Button>
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
  const [capcha,setCapcha]=useState<string|null>('');
  const Forget2 = () => {
    const [err, setErr] = useState('');
    const check2 = () => {
      console.log(curuser.password);
      setCapcha(curuser.password);
      axios.post('http://localhost:8080/user/forgetps3', {
          telephone: phonen,
        },{
        headers: {
          'Content-Type': 'application/json',
        }
        ,params:{
          code: curuser.password,
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
      console.log(':'+phonen);
      axios.get('http://localhost:8080/user/sendCode',{
      params: {
        phone: phonen,
      }
      }).then((res)=>{
        console.log(res);
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
              <Button onClick={send}>Get</Button>
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
    const [passw,setPassw] =useState('');
    const [passw2,setPassw2] =useState('');
    const [err, setErr] = useState('');
    const check3 = () => {
      if(passw!=passw2) {
        setErr('Passwords do not match');
        return;
      }
      console.log(namen+emaila+passw+capcha+phonen+stat)
      axios.post('http://localhost:8080/user/forgetps4', {
        username: namen,
        emailAddress: emaila,
        password: passw,
      },{
        params:{
          status: stat? 1 : 0,
          code: capcha,
          telephone: phonen,
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
                onChange={(e)=>{setPassw(e.target.value)}}
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
                onChange={(e)=>{setPassw2(e.target.value)}}
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
