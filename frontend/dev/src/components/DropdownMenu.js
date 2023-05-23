import * as React from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AddLinkIcon from "@mui/icons-material/AddLink";
import { useDispatch, useSelector } from "react-redux";
import { selectChannelId, setChannelLink } from "../features/appSlice";
import apiService from "../service/apiService";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

export default function DropdownMenu(props) {
  const { handleShowCreateLink, handleLeaveChannel } = props;
  const channelId = useSelector(selectChannelId);
  const dispatch = useDispatch();
  const axiosPrivate = useAxiosPrivate();

  const handleCreateJoinLink = () => {
    handleShowCreateLink(true);
    apiService
      .createChannelLink(channelId, axiosPrivate)
      .catch((error) => {
        dispatch(
          setChannelLink({
            channelLink: "invalid",
          })
        );
        return Promise.reject(error.response.status);
      })
      .then((response) => {
        const responseData = response.data;
        dispatch(
          setChannelLink({
            channelLink: responseData.link,
          })
        );

        handleShowCreateLink(true);
      });
  };

  return (
    <PopupState variant="popover" popupId="demo-popup-menu">
      {(popupState) => (
        <React.Fragment>
          <ExpandMoreIcon {...bindTrigger(popupState)} />

          <Menu {...bindMenu(popupState)} sx={{ marginTop: "25px" }}>
            {/* <MenuItem
              onClick={popupState.close}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <SettingsIcon sx={{ fontSize: "18px", marginRight: "10px" }} />
              <span>Edit channel profile</span>
            </MenuItem> */}
            <MenuItem
              onClick={() => {
                popupState.close();
                handleCreateJoinLink();
              }}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <AddLinkIcon sx={{ fontSize: "20px", marginRight: "10px" }} />
              <span>Create link</span>
            </MenuItem>
            <MenuItem
              onClick={() => {
                popupState.close();
                handleLeaveChannel(true);
              }}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <ExitToAppIcon sx={{ fontSize: "18px", marginRight: "10px" }} />
              <span>Leave channel</span>
            </MenuItem>
          </Menu>
        </React.Fragment>
      )}
    </PopupState>
  );
}
