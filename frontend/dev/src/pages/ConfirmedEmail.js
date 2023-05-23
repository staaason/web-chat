import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { ToastContainer, toast } from "react-toastify";
import ErrorIcon from "@mui/icons-material/Error";
import "react-toastify/dist/ReactToastify.css";
import "../styles/confirmedEmail.css";
import Button from "@mui/material/Button";

export default function ConfirmedEmail() {
  const location = useLocation();
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);
  const dataFetchedRef = React.useRef(false);
  const navigate = useNavigate();
  const notifyEmailConfirmed = () =>
    toast.success("Email was successfully confirmed", {
      position: "top-center",
      autoClose: 1500,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const notifyEmailConfirmError = () =>
    toast.error("Email was already confirmed or link is invalid", {
      position: "top-center",
      autoClose: 1500,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  const token = new URLSearchParams(location.search).get("token");

  const fetchData = async () => {
    setIsLoading(true);

    await axios
      .get(`http://localhost:8080/api/v1/verify?token=${token}`)
      .catch((error) => {
        setError(true);
        notifyEmailConfirmError();
        setIsLoading(false);
        setIsLoaded(true);
        return Promise.reject(error.response.code);
      })
      .then(() => {
        setIsLoading(false);
        setIsLoaded(true);
        notifyEmailConfirmed();
      });
  };

  React.useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    if (token) {
      fetchData();
    }
  }, []);

  // The rest of your component

  return (
    <div>
      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {isLoading && <LoadingSpinner />}
      {isLoaded && (
        <div className="confirmation-box">
          {error ? (
            <div>
              <h2>
                {" "}
                <ErrorIcon /> Email was already confirmed or link is invalid
              </h2>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={() => navigate("/login")}
              >
                main page
              </Button>
            </div>
          ) : (
            <div>
              <h2>Email Confirmed!</h2>
              <p>Thank you for confirming your email address.</p>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={() => navigate("/login")}
              >
                main page
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
