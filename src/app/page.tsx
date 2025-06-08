"use client";
import { useState } from "react";
import LoginSheet from "@/components/loginsheet";
import NavBar from "@/components/navbar";
import {useUserInfo} from "@/context/user";
import { Col, Container, Row } from "react-bootstrap";
import { useTheme, darkTheme, lightTheme } from "@/context/theme";
import UserCard from "@/components/userCard";
import Mail from "../components/mail/mail";
export default function Main() {
  const [user,setUser] = useState(useUserInfo());
  const {theme} = useTheme();
  // 根据主题选择对应的样式
  const containerStyle = theme === 'dark' ? darkTheme : lightTheme;

  return (
    // 应用选择的样式
    <Container fluid style={containerStyle} className="p-2"> 
      <Row>
        <Col>
          <NavBar />
        </Col>
      </Row>
      <Row>
        <Col>
          {user.userInfo&&<UserCard />}
        </Col>
      </Row>
      <Row>
        <Col>
          <Mail />
        </Col>
      </Row>
    </Container>
  )
}