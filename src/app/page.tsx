"use client";
import { useEffect, useState } from "react";
import NavBar from "@/components/navbar";
import { Container } from "react-bootstrap";
import { useTheme, darkTheme, lightTheme } from "@/context/theme";
import Mail from "../components/mail/mail";
import BgImgHandler from "@/components/bgimgHandler";

export default function Main() {
  const { theme } = useTheme();
  // 初始化 imgUrl 状态
  const [imgUrl, setImgUrl] = useState<'/game.png'|'/furry1.png'|'/furry2.png'|'#FF0000'|'#00FF00'|'#FFFFFF'>('#FFFFFF');
  const { BgImgStyle, DropdownComponent } = BgImgHandler(imgUrl, setImgUrl);

  const [mainStyle, setMainStyle] = useState({
    ...(theme === 'dark' ? darkTheme : lightTheme),
    ...BgImgStyle()
  });

  useEffect(() => {
    setMainStyle({
      ...(theme === 'dark' ? darkTheme : lightTheme),
      ...BgImgStyle()
    });
  }, [theme, imgUrl]);

  return (
    <Container fluid style={mainStyle} className="p-2">
      <NavBar DropdownComponent={DropdownComponent} />
      <Mail />
    </Container>
  );
}