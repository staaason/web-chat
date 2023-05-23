import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getUser, login } from '../features/userSlice';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setEmail } from '../features/recoverSlice';
import useAuth from '../hooks/useAuth';
import apiService from "../service/apiService";


const theme = createTheme();

export default function SignIn() {
  const [textLength, setTextLength] = React.useState(0);
  const [emailState, setEmailState] = React.useState();
  const { setAuth} = useAuth();
  const [resentStatus, setResentStatus] = React.useState(false);
  
  const handleTextChange = (event) => {
    const value = event.target.value;
    setTextLength(value.length);
    setEmailState(value);
  };
  const inputRef = React.useRef();

  const dispatch = useDispatch();

  const notifyEmailSend = () => toast.success("Check email, code was sended", {
    position: "bottom-right",
    autoClose: 1500,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
  });


  const handleRecoverSubmit = async () => {
    apiService.checkEmailExists(emailState).catch((error) => {
      if (error.response && error.response.status === 404) {
        notifyError("Email doesn't exist");
        return Promise.reject(error.response.status);
      }
      else if(error.response && error.response.status === 429) {
        const cooldownRemainingSeconds = error.response.data.timestamp;
        const minutes = Math.floor(cooldownRemainingSeconds / 60);
        const seconds = cooldownRemainingSeconds % 60;
        notifyError(`You can send another recover email in ${minutes >= 1 ? minutes + ":" + String(seconds).padStart(2, '0') : String(seconds).padStart(2, '0')}
        ${minutes >= 1 ? "minutes" : "seconds"}`);
        return Promise.reject(error.response.status);
      }
    }).then((response) => {
      if (response.status === 200) {
        dispatch(setEmail({ email: emailState }))
        localStorage.setItem("email", emailState)
        setResentStatus(true);
        notifyEmailSend();
      }
    })
  }

  const notifyError = (error) => toast.error(error, {
    position: "bottom-right",
    autoClose: 1500,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
  });



  const location = useLocation();
  const from = location.state?.from?.pathname || "/app";


  const navigate = useNavigate();
  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');


    if (!email) {
      notifyError('Email field is empty');
      return;
    }

    if (!password) {
      notifyError('Password field is empty');
      return;
    }
    var token = null;
    apiService.login({ email, password })
      .then((response) => {
        token = response?.data?.accessToken;
        setAuth({token });
        dispatch(login({ token }));
        return apiService.getUserData(token);
      })
      .then((response) => {
        if (response.status === 200) {
          const user = response.data;
          const tempUser = { ...user };
          apiService.changeUserImage(token)
            .then((response) => {
              const updatedUser = { ...tempUser, image: response };
              dispatch(getUser(updatedUser));
              const userRole = updatedUser.role;
              setAuth({token, userRole});
              localStorage.setItem('userRole', userRole);
              navigate(from, { replace: true });
            });
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 403) {
          notifyError('User email or password is incorrect');
          return Promise.reject(error.response.status);
        } else if (error.response && error.response.status === 401) {
          notifyError('Email is not verified, please check e-mail');
          return Promise.reject(error.response.status);
        }
        else {
          console.error('An error occurred while logging in:', error.message);
          return Promise.reject(error);
        }
      });
  };



  return (
    <ThemeProvider theme={theme}>
      <ToastContainer
        position="bottom-right"
        autoClose={1500}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              inputRef={inputRef}
              onChange={handleTextChange}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link style={{ cursor: 'pointer' }} onClick={() => {

                  if (textLength === 0) {
                    inputRef.current.focus()
                  } else {
                    handleRecoverSubmit();
                  }
                }} variant="body2">
                  {resentStatus ? "Resend code" : "Forgot password?"}
                </Link>
              </Grid>
              <Grid item>
                <Link href="register" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}