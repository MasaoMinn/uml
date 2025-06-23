"use client";
import { useEffect, useState } from "react";
import LoginSheet from "@/components/loginsheet";
import NavBar from "@/components/navbar";
import {useUserInfo} from "@/context/user";
import { Col, Container, Row } from "react-bootstrap";
import { useTheme, darkTheme, lightTheme } from "@/context/theme";
import UserCard from "@/components/userCard";
import Mail from "../components/mail/mail";
export default function Main() {
  
  const {theme} = useTheme();
  const [mainStyle,setMainStyle] = useState(theme === 'dark' ? darkTheme : lightTheme);
  useEffect(()=>{
    setMainStyle(theme === 'dark' ? darkTheme : lightTheme);
  },[theme]);
  const { userInfo } = useUserInfo();
  return (
    // 应用选择的样式
    <Container fluid style={mainStyle} className="p-2">
          <NavBar />
          <Mail />
    </Container>
  )
}