import * as React from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useSelector } from 'react-redux';
import Snackbar from '@mui/material/Snackbar';
import { selectChannelName } from '../features/appSlice';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function BootstrapDialogTitle(props) {
    const { children, onClose, ...other } = props;


    return (
        <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
            {children}
            {onClose ? (
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            ) : null}
        </DialogTitle>
    );
}

BootstrapDialogTitle.propTypes = {
    children: PropTypes.node,
    onClose: PropTypes.func.isRequired,
};




export default function DropdownForms(props) {
    const { status, handleStatus, channelLink, statusLeaveChannel, handleLeaveChannel, leaveChannel } = props
    const channelName = useSelector(selectChannelName)
    const [openSnackbar, setOpenSnackbar] = React.useState(false)

    React.useEffect(() => {
        if (channelLink) {
            document.getElementById('filled-read-only-input').value = channelLink;
        }
    }, [channelLink]);


    const CopyButton = () => (
        <IconButton onClick={handleCopyClick}>
            <ContentCopyIcon />
        </IconButton>
    )

    const handleCopyClick = () => {
        setOpenSnackbar(true);
        navigator.clipboard.writeText(channelLink.toString());
    };

    const handleClose = () => {
        handleStatus(false);
    };


    const handleCloseLeaveChannel = () => {
        handleLeaveChannel(false);

    }

    return (<div>{statusLeaveChannel && (<BootstrapDialog
        onClose={handleCloseLeaveChannel}
        aria-labelledby="customized-dialog-title"
        open={statusLeaveChannel}
        PaperProps={{
            style: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'stretch',
                width: '400px',
                backgroundColor: 'rgba(49, 51, 56, 149)'
            },
        }}
    >
        <Typography variant="h7" component="h3" gutterBottom sx={{ textAlign: 'left', marginTop: '10px', marginLeft: '20px', color: 'rgb(243, 244, 245)' }}>
            Leave "{channelName}"
        </Typography>
        <Typography variant="body3" gutterBottom sx={{ textAlign: 'left', marginTop: '10px', marginLeft: '20px', color: 'rgb(205, 207, 211)' }}>
            Are you sure you want to leave the {channelName}? You won't be able to come back here until you are invited again.
        </Typography>
        <Box sx={{ backgroundColor: 'rgb(43, 45, 49)', display: 'flex', justifyContent: "flex-end", marginTop: '5px' }}>
            <Button onClick={handleCloseLeaveChannel} sx={{ color: 'rgb(199, 200, 201)', marginRight: '10px', marginTop: '15px', marginBottom: '15px', textTransform: 'initial' }}>Cancel</Button>
            <Button onClick={() => {
                leaveChannel();
                handleCloseLeaveChannel();
            }} color='error' variant="contained" sx={{ backgroundColor: 'rgb(218, 55, 60)', marginRight: '10px', marginTop: '15px', marginBottom: '15px', textTransform: 'initial' }}>Leave channel</Button>
        </Box>

    </BootstrapDialog>)}

        {status && (<BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={status}
            PaperProps={{
                style: {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'stretch',
                    width: '400px'
                },
            }}
        >
            <Snackbar
                message="Copied to clibboard"
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                autoHideDuration={2000}
                onClose={() => setOpenSnackbar(false)}
                open={openSnackbar}
            />
            <CloseIcon onClick={handleClose} sx={{
                color: '#aaa', right: '0px',
                position: 'initial',
                fontSize: '16px',
                width: '25px',
                height: '25px',
                fontWeight: 'bold',
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': {
                    color: 'gray',
                }
            }} />
            <Typography variant="h7" component="h3" sx={{ textAlign: 'left', marginTop: '10px', marginLeft: '20px' }}>
                Invite your friends to {channelName}
            </Typography>

            <TextField
                id="filled-read-only-input"
                defaultValue={`${channelLink}`}
                InputProps={{
                    readOnly: true,
                    endAdornment: <CopyButton />,
                }}
                sx={{ marginLeft: '20px', marginRight: '20px', marginTop: '30px' }}
                variant="filled"
            />
            <Typography variant="h7" component="h6" sx={{ textAlign: 'left', marginTop: '10px', marginLeft: '20px', marginBottom: '20px' }}>
                The validity period of your link expires in 7 days.
            </Typography>

        </BootstrapDialog>)}
    </div>)
}