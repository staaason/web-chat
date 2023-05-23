import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import { useCallback } from "react";
import "../styles/Settings.css";
import { useDispatch, useSelector } from "react-redux";
import { getUser, selectUser } from "../features/userSlice";
import CloseIcon from "@mui/icons-material/Close";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import apiService from "../service/apiService";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { deepOrange } from "@mui/material/colors";
import MenuItem from "@mui/material/MenuItem";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

export default function Settings({
  firstName,
  lastName,
  email,
  image,
  onClose,
}) {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const { clearCookies, auth } = useAuth();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();

  const handleLogout = useCallback(async () => {
    apiService
      .logout(auth.token)
      .then((response) => {
        localStorage.clear();
        clearCookies();
        sessionStorage.clear();
        navigate("/login");
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleChangeImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async function () {
      if (input.files.length === 0) return;

      const file = input.files[0];
      const reader = new FileReader();

      reader.readAsDataURL(file);

      reader.onload = function () {
        let tempUser = { ...user };
        tempUser.image = reader.result.split(",")[1];
        dispatch(getUser(tempUser));
        const data = { file: reader.result };
        apiService.uploadAvatarToServer(data, axiosPrivate);
      };
    };
    input.click();
  };

  return (
    <div className="settings-modal">
      <div className="settings__leftSidebar">
        <div className="settings__header">
          <h2>My account</h2>
        </div>
        <div className="settings__content">
          <div className="settings__contentProfile">
            <div className="settings_contentProfileTop">
              <div className="sidebar__formToggle">
                <CloseIcon onClick={onClose} />
              </div>
            </div>
            <div className="settings_contentProfileBottom">
              <div className="settings_contentProfileBottomTopInfo">
                {image ? (
                  <Avatar src={`data:image/jpeg;base64, ${image}`} />
                ) : (
                  <Avatar sx={{ bgcolor: deepOrange[500] }}>
                    {firstName.charAt(0)}
                  </Avatar>
                )}

                <h2>
                  {firstName} {lastName}
                </h2>
                <Button
                  className="setting_buttonChangeImage"
                  onClick={handleChangeImage}
                  variant="contained"
                  sx={{backgroundColor: "gray"}}
                >
                  Change your avatar
                </Button>
              </div>

              <div className="settings_contentProfileBottomInfo">
                <h1>User name</h1>
                <h2>
                  {firstName} {lastName}
                </h2>
                <h1>Email</h1>
                <h2>{email}</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="settings__rightSidebar">
        <div className="settings__rightHeader">
          <h2>User settings</h2>
        </div>
        <div className="settings__rightContent">
          <div className="setting">
            {/* <h3>My account</h3> */}
            <MenuItem
              onClick={handleLogout}
              sx={{ display: "flex", alignItems: "center", marginTop: "20px", color: "white" }}
            >
              <ExitToAppIcon sx={{ fontSize: "18px", marginRight: "10px", color: "white" }} />
              <span>Leave channel</span>
            </MenuItem>
          </div>
        </div>
      </div>
    </div>
  );
}
