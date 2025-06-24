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
  let pss:string='';
  const [phonen,setPhonen]=useState('');
  const [namen,setNamen] =useState('');
  const [emaila,setEmaila] =useState('');

const Register = () => {
    let capcha='';
    const [err, setErr] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const send  = () => {
      console.log(':'+curuser.phoneNumber);
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/sendCode`,{
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
    console.log("用户注册：",curuser);
    axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/register`, {
      username: curuser.userName,
      password: curuser.password,
      emailAddress: curuser.emailAddress+'@Hgmail.com',
      telephone: curuser.phoneNumber
    }, {
      params:{
        code:capcha,
      },
      headers: {
        'Content-Type': 'application/json'
      },
    }).then(response => {
      alert(response.data.message);
    }).catch(error => {
      alert(error);
    }).finally(() => {
      setStatus('login');
    });
  }
  const [notify, setNotify] = useState('');
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
                type={showPassword ? 'text' : 'password'}
                onChange={(e)=>curuser.password=e.target.value}
              />
              <Button
                variant="outline-primary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '隐藏' : '显示'}
              </Button>
            </InputGroup>
            <InputGroup className="mb-3 w-50 mx-auto">
              <InputGroup.Text 
                id="inputGroup-sizing-default"
                className="bg-primary text-white border-primary"
              >
                Password Confirm
              </InputGroup.Text>
              <Form.Control
                placeholder="password confirm"
                aria-label="Recipient's username"
                aria-describedby="basic-addon2"
                className="border-primary"
                type={showConfirmPassword ? 'text' : 'password'}
                onChange={(e)=>{pss=e.target.value;if(pss!=curuser.password) setNotify('Password not match');else setNotify('');}}
              />
              <Button
                variant="outline-primary"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? '隐藏' : '显示'}
              </Button>
            </InputGroup>
            {notify && <p className="text-center text-danger" color='red'>{notify}</p>}
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
                type="string"
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
                onChange={(e)=>{capcha=e.target.value}}
              />
            </InputGroup>
            <div className="d-flex justify-content-center gap-2">
              <Button variant={theme} type="button" className="w-40" onClick={() => setStatus('login')}>
                Return to Login
              </Button>
              <Button variant="primary" type="button" className="w-40" onClick={register}>
                Register<i className="bi bi-person-add"></i>
              </Button>
            </div>
            {err && <p className="text-center text-danger">{err}</p>}
          </Offcanvas.Body>
        </Offcanvas>
    )
  }
  

const Login = () => {
  const [namae, setNamae] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState(false);
  const login =() => {
    console.log("用户登录：",curuser);
    axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/login`, {
      username: curuser.userName,
      emailAddress:curuser.userName+'@Hgmail.com',
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
        handleClose();
    }).catch(error => {
        alert(error);
    }).finally(()=> {
      
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
                type={showPassword ? 'text' : 'password'}
                aria-label="Recipient's username"
                aria-describedby="basic-addon2"
                className="border-primary"
                onChange={(e)=>curuser.password=e.target.value}
              />
              <Button
                variant="outline-primary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '隐藏' : '显示'}
              </Button>
            </InputGroup>
            <div className="d-flex justify-content-center gap-2">
              <Button variant="primary" type="button" className="w-40" onClick={login}>
                Login<i className="bi bi-person-check"></i>
              </Button>
              <Button variant={theme} type="button" className="w-40" onClick={() => setStatus('register')}>
                Register<i className="bi bi-person-add"></i>
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
    
    axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/forgetps1`,{
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
      axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/forgetps3`, {
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
      axios.get(`${process.env.NEXT_PUBLIC_API_URL}/user/sendCode`,{
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
      axios.post(`${process.env.NEXT_PUBLIC_API_URL}/user/forgetps4`, {
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
      {status === 'login' && <Login />}
      {status === 'register' && <Register />}
      {status === 'forget1' && <Forget1 />}
      {status === 'forget2' && <Forget2 />}
      {status === 'forget3' && <Forget3 />}
    </>
  );
}
