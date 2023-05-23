import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Chat from "../components/Chat";
import Lobby from "../components/Lobby";
import Sidebar from "../components/Sidebar";
import { selectNewsState } from "../features/newsSlice";
import { getUser } from "../features/userSlice";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useLocation, useNavigate } from "react-router-dom";
import apiService from "../service/apiService";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'


export default function MainPage() {
  const newsState = useSelector(selectNewsState);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  const [channels, setChannels] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await axiosPrivate.get('/api/v1/users', {
          signal: controller.signal
        });
        if (response.status === 200 && isMounted) {
          const tempUser = { ...response.data };
          const imageResponse = await axiosPrivate.get("/api/v1/gcp")
              .then(response => {
            return response.data;
          })
          const updatedUser = { ...tempUser, image: imageResponse };
          dispatch(getUser(updatedUser));
         apiService.getUserChannels(axiosPrivate).then((res) => {
            if (res.data.length > 0) {
              setChannels(
                res.data.map((channel, index) => ({
                  ...channel,
                  index: index,
                }))
              );
            }
          })
        }
      } catch (err) {
        if (isMounted) {
          navigate('/login', { state: { from: location }, replace: true });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
  
    if (isMounted) {
      fetchData();
    }
  
    return () => {
      isMounted = false;
    }
  }, [])

  return (
    <div>
      {isLoading ? (
        <div>
        <Skeleton height={30} />
      </div>
      ) : (
        <div className="app">
          <Sidebar channels={channels} setChannels={setChannels}/>
          {newsState === false ? <Chat /> : <Lobby />}
        </div>
      )}
    </div>
  );
}
