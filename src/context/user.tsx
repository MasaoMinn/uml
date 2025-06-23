"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react';

// 辅助函数：设置 cookie
const setCookie = (name: string, value: string, days: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  if (typeof document !== 'undefined') {
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  }
}

// 辅助函数：获取 cookie
export const getCookie = (name: string) => {
  if (typeof document !== 'undefined') {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
}

// 辅助函数：删除 cookie
const deleteCookie = (name: string) => {
  if (typeof document !== 'undefined') {
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
}

// 定义上下文类型
type UserData = {
  id: number;
  username: string;
  password: string | null;
  emailAddress: string;
  telephone: string;
  createTime: string;
  updateTime: string;
};

type UserContextType = {
  userInfo: {
    token: string;
    data: UserData;
  } | null;
  setUserInfo: (token: string, data: UserData) => void;
};

// 创建上下文（默认值需要保持一致的类型结构）
const UserContext = createContext<UserContextType | null>(null);

// 自定义Hook组件
export const useUserInfo = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('必须在UserInfoProvider中使用useUserInfo');
  }
  return context;
};

// Provider组件
export const UserInfoProvider = ({ children }: { children: ReactNode }) => {
  // 状态管理（带有类型标注），初始值设为 undefined
  const [userInfo, setUserInfoState] = useState<{
    token: string;
    data: UserData;
  } | null | undefined>(undefined);

  useEffect(() => {
    const storedUserInfo = getCookie('userInfo');
    if (storedUserInfo) {
      try {
        const parsedInfo = JSON.parse(storedUserInfo);
        setUserInfoState(parsedInfo);
      } catch (error) {
        console.error('解析cookie中的用户信息失败:', error);
      }
    } else {
      setUserInfoState(undefined);
    }
  }, []);

  // 状态更新方法（同步到cookie）
  const setUserInfo = (token: string, data: UserData) => {
    try {
      const value = { token, data };
      console.log('设置用户信息:', value);
      if (token === '' && data.username === '') {
        deleteCookie('userInfo'); // 清除 cookie
        setUserInfoState(null);
      } else {
        setCookie('userInfo', JSON.stringify(value), 3); // 存储 3 天
        setUserInfoState(value);
      }
    } catch (error) {
      console.error('保存到cookie失败:', error);
    }
  };
  return (
    <UserContext.Provider value={{ userInfo: userInfo || null, setUserInfo }}>
      {children}
    </UserContext.Provider>
  );
};