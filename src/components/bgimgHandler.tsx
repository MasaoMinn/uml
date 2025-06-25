"use client";
import { useTheme } from "@/context/theme";
import Dropdown from "react-bootstrap/Dropdown";

// 定义图片 URL 和纯色背景的类型
type BackgroundOption = '/game.png'|'/furry1.png'|'/furry2.png'|'#FF0000'|'#00FF00'|'#FFFFFF';

// 接收 imgUrl 和 setImgUrl 作为参数
export default function BgImgHandler(imgUrl: BackgroundOption, setImgUrl: (url: BackgroundOption) => void) {
  function BgImgStyle() {
    // 根据背景选项类型设置样式
    if (imgUrl.startsWith('#')) {
      return {
        backgroundColor: imgUrl,
      };
    }
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
          选择背景
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => setImgUrl('/game.png')}>Game 背景</Dropdown.Item>
          <Dropdown.Item onClick={() => setImgUrl('/furry1.png')}>Furry 1 背景</Dropdown.Item>
          <Dropdown.Item onClick={() => setImgUrl('/furry2.png')}>Furry 2 背景</Dropdown.Item>
          <Dropdown.Item onClick={() => setImgUrl('#FF0000')}>红色背景</Dropdown.Item>
          <Dropdown.Item onClick={() => setImgUrl('#00FF00')}>绿色背景</Dropdown.Item>
          <Dropdown.Item onClick={() => setImgUrl('#FFFFFF')}>默认背景</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    )
  };
}