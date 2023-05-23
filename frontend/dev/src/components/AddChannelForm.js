import * as React from "react";
import PropTypes from "prop-types";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import KeyIcon from "@mui/icons-material/Key";
import Avatar from "@mui/material/Avatar";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Tooltip from "@mui/material/Tooltip";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
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
            position: "absolute",
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

export default function AddChannelForm(props) {
  const { handleAddChannel, handleJoinChannel, status, setStatus } = props;
  const user = useSelector(selectUser);
  const [open, setOpen] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [showJoinForm, setJoinForm] = React.useState(false);

  const handleBoxClick = () => {
    setShowForm(true);
  };

  const handleBackClick = () => {
    setShowForm(false);
    setJoinForm(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClickJoinOpen = () => {
    setJoinForm(true);
  };

  const handleJoinChannelForm = (e) => {
    handleJoinChannel(e);
    if (status === true) {
      handleClose();
      setStatus(false);
    }
  };

  React.useEffect(() => {
    if (status) {
      handleClose();
      setStatus(false);
    }
  }, [status]);

  const handleAddChannelForm = (e) => {
    handleAddChannel(e);
    handleClose();
  };

  const handleClose = () => {
    setOpen(false);
    setShowForm(false);
    setJoinForm(false);
  };

  return (
    <div>
      <Tooltip title="Add channel" arrow>
        <AddIcon onClick={handleClickOpen} className="sidebar__addChannel" />
      </Tooltip>

      <div>
        {showForm ? (
          <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
            PaperProps={{
              style: {
                display: "flex",
                justifyContent: "center",
                alignItems: "stretch",
                width: "400px",
                overflow: "hidden",
              },
            }}
          >
            <CloseIcon
              onClick={handleClose}
              sx={{
                color: "#aaa",
                right: "0px",
                position: "initial",
                fontSize: "16px",
                width: "25px",
                height: "25px",
                fontWeight: "bold",
                textAlign: "center",
                cursor: "pointer",
                "&:hover": {
                  color: "gray",
                },
              }}
            />
            <Typography
              variant="h7"
              component="h2"
              sx={{ textAlign: "center", marginTop: "10px" }}
            >
              Personalise your channel
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                textAlign: "justify",
                marginTop: "10px",
                padding: "0 60px",
                marginBottom: "10px",
              }}
            >
              Make your channel unique with a name. You can always change it
              later.
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  textAlign: "center",
                  marginTop: "10px",
                  padding: "0 60px",
                }}
              >
                Channel name
              </Typography>
              <Box
                component="form"
                onSubmit={handleAddChannelForm}
                noValidate
                sx={{ mt: 1, width: "100%" }}
              >
                <TextField
                  margin="normal"
                  required
                  id="channelName"
                  name="channelName"
                  defaultValue={`Server of user ${user.firstName}`}
                  sx={{ left: "22%" }}
                />
                <Box
                  sx={{
                    backgroundColor: "rgb(243, 244, 245)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      marginTop: "10px",
                      marginBottom: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                      paddingLeft: "20px",
                      paddingRight: "20px",
                    }}
                  >
                    <DialogActions>
                      <Button
                        autoFocus
                        onClick={handleBackClick}
                        sx={{ textTransform: "initial", color: "gray" }}
                      >
                        Back
                      </Button>
                    </DialogActions>
                    <Button
                      type="submit"
                      sx={{
                        color: "white",
                        "&:hover": {
                          backgroundColor: "rgb(78, 80, 88)",
                        },
                        textTransform: "initial",
                        marginRight: "20px",
                        marginTop: "10px",
                        height: "30px",
                      }}
                      variant="contained"
                    >
                      Create
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          </BootstrapDialog>
        ) : showJoinForm ? (
          <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
            PaperProps={{
              style: {
                display: "flex",
                justifyContent: "center",
                alignItems: "stretch",
                width: "400px",
                overflow: "hidden",
              },
            }}
          >
            <CloseIcon
              onClick={handleClose}
              sx={{
                color: "#aaa",
                right: "0px",
                position: "initial",
                fontSize: "16px",
                width: "25px",
                height: "25px",
                fontWeight: "bold",
                textAlign: "center",
                cursor: "pointer",
                "&:hover": {
                  color: "gray",
                },
              }}
            />
            <Typography
              variant="h7"
              component="h2"
              sx={{ textAlign: "center", marginTop: "10px" }}
            >
              Join channel
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                textAlign: "justify",
                marginTop: "10px",
                padding: "0 60px",
                marginBottom: "10px",
              }}
            >
              Enter the invitation below to join an existing channel.
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  textAlign: "center",
                  marginTop: "10px",
                  padding: "0 60px",
                }}
              >
                Invitation link
              </Typography>
              <Box
                component="form"
                onSubmit={handleJoinChannelForm}
                noValidate
                sx={{ mt: 1, width: "100%" }}
              >
                <TextField
                  margin="normal"
                  required
                  id="channelId"
                  name="channelId"
                  defaultValue="hTZm2A"
                  sx={{ left: "22%" }}
                />
                <Box
                  sx={{
                    backgroundColor: "rgb(243, 244, 245)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      marginTop: "10px",
                      marginBottom: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                      paddingLeft: "20px",
                      paddingRight: "20px",
                    }}
                  >
                    <DialogActions>
                      <Button
                        autoFocus
                        onClick={handleBackClick}
                        sx={{ textTransform: "initial", color: "gray" }}
                      >
                        Back
                      </Button>
                    </DialogActions>
                    <Button
                      type="submit"
                      sx={{
                        color: "white",
                        "&:hover": {
                          backgroundColor: "rgb(78, 80, 88)",
                        },
                        textTransform: "initial",
                        marginRight: "20px",
                        marginTop: "10px",
                        height: "30px",
                      }}
                      variant="contained"
                    >
                      Join channel
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          </BootstrapDialog>
        ) : (
          <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
            PaperProps={{
              style: {
                display: "flex",
                justifyContent: "center",
                alignItems: "stretch",
                width: "550px",
              },
            }}
          >
            <CloseIcon
              onClick={handleClose}
              sx={{
                color: "#aaa",
                right: "0px",
                position: "initial",
                fontSize: "16px",
                width: "25px",
                height: "25px",
                fontWeight: "bold",
                textAlign: "center",
                cursor: "pointer",
                "&:hover": {
                  color: "gray",
                },
              }}
            />
            <Typography
              variant="h7"
              component="h2"
              sx={{ textAlign: "center", marginTop: "10px" }}
            >
              Create channel
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                textAlign: "justify",
                marginTop: "10px",
                padding: "0 60px",
                marginBottom: "10px",
              }}
            >
              Your channel is a place where you communicate with friends. Create
              your own channel and start conversations.
            </Typography>
            <DialogContent dividers>
              <Box
                onClick={handleBoxClick}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 25px",
                  border: "2px solid rgb(231, 232, 234)",
                  borderRadius: "5px",
                  height: "50px",
                  "&:hover": {
                    backgroundColor: "rgb(235, 235, 237)",
                    cursor: "pointer",
                  },
                }}
              >
                <Avatar sx={{ backgroundColor: "rgb(113, 142, 247)" }}>
                  <KeyIcon />
                </Avatar>
                <Typography ml={1} component="h1" sx={{ flexGrow: 1 }}>
                  Create your own channel
                </Typography>
                <KeyboardArrowRightIcon />
              </Box>
            </DialogContent>
            <Box
              sx={{
                backgroundColor: "rgb(243, 244, 245)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  textAlign: "center",
                  marginTop: "10px",
                  padding: "0 60px",
                }}
              >
                Already have an invitation?
              </Typography>
              <Box
                sx={{
                  marginTop: "10px",
                  marginBottom: "10px",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Button
                  sx={{
                    width: "100%",
                    backgroundColor: "rgb(108, 111, 120)",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "rgb(78, 80, 88)",
                    },
                    textTransform: "initial",
                  }}
                  variant="contained"
                  onClick={handleClickJoinOpen}
                >
                  Join channel
                </Button>
              </Box>
            </Box>
          </BootstrapDialog>
        )}
      </div>
    </div>
  );
}
