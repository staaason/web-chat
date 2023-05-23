import { createContext, useState, useEffect } from "react";
import { useCookies } from "react-cookie";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [cookies, setCookie, removeCookie] = useCookies(["token", "userRole"]);
  const [auth, setAuth] = useState({
    token: cookies.token,
    userRole: cookies.userRole,
  });

  useEffect(() => {
    if (cookies.token) {
      setAuth({
        token: cookies.token,
        userRole: cookies.userRole,
      });
    }
  }, [cookies.token, cookies.userRole]);

  const clearCookies = () => {
    removeCookie("token");
    removeCookie("userRole");
  };

  const updateAuth = (newAuth) => {
    console.log(newAuth)
    const updatedAuth = {
      ...auth,
      token: newAuth.token,
      userRole: newAuth.userRole || auth.userRole,
    };
    setAuth(updatedAuth);
    if (newAuth.token) {
      setCookie("token", newAuth.token);
    } else {
      removeCookie("token");
    }
    if (newAuth.userRole) {
      setCookie("userRole", newAuth.userRole);
    } else {
      removeCookie("userRole");
    }
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth: updateAuth, clearCookies }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
