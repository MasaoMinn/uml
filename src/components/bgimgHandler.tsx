"use client";
import { useTheme } from "@/context/theme";
import Dropdown from "react-bootstrap/Dropdown";

// 接收 imgUrl 和 setImgUrl 作为参数
export default function BgImgHandler(imgUrl: '/game.png'|'/furry1.png'|'/furry2.png', setImgUrl: (url: '/game.png'|'/furry1.png'|'/furry2.png') => void) {
  function BgImgStyle() {
    return {
      backgroundImage: `url(${imgUrl})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
    };
  }
  const { theme } = useTheme();

  return {
    BgImgStyle,
    // 返回 Dropdown 组件
    DropdownComponent: () => (
      <Dropdown>
        <Dropdown.Toggle variant={theme} id="dropdown-basic">
          选择背景图片
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => setImgUrl('/game.png')}>Game 背景</Dropdown.Item>
          <Dropdown.Item onClick={() => setImgUrl('/furry1.png')}>Furry 1 背景</Dropdown.Item>
          <Dropdown.Item onClick={() => setImgUrl('/furry2.png')}>Furry 2 背景</Dropdown.Item>
          
        </Dropdown.Menu>
      </Dropdown>
    )
  };
}