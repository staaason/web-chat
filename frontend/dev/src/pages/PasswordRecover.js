import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/PasswordRecover.css'
import TextField from '@mui/material/TextField';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorIcon from '@mui/icons-material/Error';
import Button from '@mui/material/Button';
import authenticationService from "../service/apiService";



const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,24}$/;

export default function PasswordRecover() {
    const search = useLocation().search;
    const recoveryToken = new URLSearchParams(search).get('token');
    const [emailValidated, setEmailValidated] = React.useState(false);
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const tokenVerifiedRef = React.useRef(false);

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            handleChangePassword();
        }
    };

    const notifyChangeSuccess = () => toast.success('Password was changed, please log in', {
        position: "bottom-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
    });



    React.useEffect(() => {
        if (tokenVerifiedRef.current) return;
        tokenVerifiedRef.current = true;
        if (recoveryToken) {
            handleVerifyToken();
        }
    }, []);


    const notifyNotVerified = () => toast.error('Link is expired or not valid', {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
    });

    const handleVerifyToken = () => {
        setIsLoading(true);
        authenticationService.verifyToken(recoveryToken).catch((error) => {
            setIsLoading(false);
            setIsLoaded(true);
            notifyNotVerified();
            return Promise.reject(error)
        }).then(() => {
            setIsLoading(false);
            setIsLoaded(true);
            setEmailValidated(true)
        }

        )
    }

    const notifyError = (error) => toast.error(error, {
        position: "bottom-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
    });


    const handleChangePassword = () => {
        const password_test = PWD_REGEX.test(password)
        if (!password_test) {
            notifyError('Incorrect password type');
            return;
        }
       
        authenticationService.changePassword(recoveryToken, password).catch((error) => {
            return Promise.reject(error)
        }).then(() => {
            notifyChangeSuccess();
            setTimeout(() => navigate('/login'), 2000)


        }



        )
    }

    const navigate = useNavigate();
    return (
        <div className="container">
            
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
                theme="light"
            />
   
            {isLoading && <LoadingSpinner />}
                {isLoaded && <div className="container__form">
                    {emailValidated ? <div className="container__formHeader" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div className="container__formHeaderTop">
                            <div className="container__formHeaderTopTitle">
                                <p>Change password</p>
                            </div>
                            <div className="container__formHeaderTopSubTitle">
                                <p>Enter new password </p>
                            </div>
                        </div>

                        <TextField
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            autoComplete="new-password"
                            helperText="8 to 24 characters, must include uppercase and lowercase letters, a number and a special character."
                            onChange={e => setPassword(e.target.value)}
                        />


                        <button
                            onClick={handleChangePassword}
                            onKeyDown={handleKeyDown}

                            className="container__formBottomButton"
                        >
                            Change
                        </button>
                    </div>
                        :

                        <div className="container__formHeader" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}} >
                            <div className="container__formHeaderTopTitle">
                                <p> <ErrorIcon />Link is not valid or expired</p>
                            </div>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                onClick={() => navigate('/web/login')}
                            >
                                main page
                            </Button>
                            
                        </div>

                    }
                </div>
                }

            </div>
    );
}