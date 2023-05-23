import useAuth from "./useAuth";
import apiService from "../service/apiService";

const useRefreshToken = () => {
  const { setAuth} = useAuth();

  const refresh = async () => {
    try {
      const res = await apiService.refresh_token();
      const newAccessToken = res.data.accessToken;
      const userRole = localStorage.getItem('userRole')

      setAuth({token: newAccessToken, userRole});
      return newAccessToken;
    } catch (error) {
      console.log(error);
    }
  };

  return refresh;
};

export default useRefreshToken;
