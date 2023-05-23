import Avatar from "@mui/material/Avatar";
import "../styles/Sidebar.css";
import SidebarChannel from "./SidebarChannel";
import { selectUser } from "../features/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import Settings from "./Settings";
import DropdownMenu from "./DropdownMenu";
import AddChannelForm from "./AddChannelForm";
import {
  selectChannelId,
  selectChannelLink,
  setChannelInfo,
} from "../features/appSlice";
import { deepOrange } from "@mui/material/colors";
import { DragDropContext, Draggable } from "react-beautiful-dnd";
import Button from "@mui/material/Button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DropdownForms from "./DropdownForms";
import { StrictModeDroppable } from "./StrictModeDropable";
import { closeNews, showNews } from "../features/newsSlice";
import apiService from "../service/apiService";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import BungalowIcon from '@mui/icons-material/Bungalow';
import Tooltip from "@mui/material/Tooltip";

function deleteChannelById(channels, channelId) {
  let left = 0;
  let right = channels.length - 1;
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (channels[mid].chatId === channelId) {
      channels.splice(mid, 1);
      return channels;
    } else if (channels[mid].chatId < channelId) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return channels;
}

function onDragEnd(result, columns, setColumns) {
  if (!result.destination) return;
  const items = Array.from(columns);
  const [reorderedItem] = items.splice(result.source.index, 1);
  items.splice(result.destination.index, 0, reorderedItem);
  setColumns(items);
}

function Sidebar(props) {
  const { channels, setChannels } = props;
  const user = useSelector(selectUser);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [connectChannelGood, setConnectChannelGood] = useState(false);
  const [showCreateLinkForm, setShowCreateLinkForm] = useState(false);
  const [showLeaveChannelForm, setLeaveChannelForm] = useState(false);
  const dispatch = useDispatch();
  const channelId = useSelector(selectChannelId);
  const channelLink = useSelector(selectChannelLink);
  const notifyLinkIsInvalid = () =>
    toast.error("Link is ivalid", {
      position: "bottom-right",
      autoClose: 1500,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const notifyUserAlredyInChannel = () =>
    toast.error("User is already in channel", {
      position: "bottom-right",
      autoClose: 1500,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const notifyUserLeftChannel = () =>
    toast.success("User left the channel", {
      position: "bottom-right",
      autoClose: 1500,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const handleCloseSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleChannelClick = (channelId) => {
    setSelectedChannel(channelId);
    dispatch(closeNews());
  };

  const axiosPrivate = useAxiosPrivate();

  const handleAddChannel = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const channelData = { name: data.get("channelName") };
    apiService.createChannel(channelData, axiosPrivate).then((response) => {
      setChannels((prevChannels) => {
        const newChannel = { ...response, index: prevChannels?.length || 0 };
        return prevChannels ? [...prevChannels, newChannel] : [newChannel];
      });
      dispatch(
        setChannelInfo({
          channelId: response.chatId,
          channelName: response.chatName,
        })
      );
      dispatch(closeNews());
      setSelectedChannel(response.chatId);
    });
  };

  const handleShowSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleLeaveChannel = () => {
    apiService
      .leaveChannel(channelId, axiosPrivate)
      .catch((error) => {
        return Promise.reject(error);
      })
      .then((response) => {
        if (response.status === 200) {
          console.log(response);
          setChannels((prevChannels) =>
            deleteChannelById(prevChannels, parseInt(channelId))
          );
          notifyUserLeftChannel();
          const firstChannel = channels[channels.length - 1];
          if (channels.length === 0) {
            dispatch(
              setChannelInfo({
                channelId: null,
                channelName: null,
              })
            );
            setSelectedChannel(null);
            dispatch(showNews());
          } else {
            dispatch(
              setChannelInfo({
                channelId: firstChannel.chatId,
                channelName: firstChannel.chatName,
              })
            );
            setSelectedChannel(firstChannel.chatId);
          }
        }
      });
  };

  const handleJoinChannel = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const channelId = data.get("channelId");
    if (channels === "") {
      apiService
        .connectToChannel(channelId, axiosPrivate)
        .catch((error) => {
          if (error.response && error.response.status === 404) {
            notifyLinkIsInvalid();
          } else if (error.response && error.response.status === 409) {
            notifyUserAlredyInChannel();
          }
          return Promise.reject(error.code);
        })
        .then((response) => {
          const responseData = response.data;

          setChannels((prevChannels) => {
            return [
              ...prevChannels,
              { ...responseData, index: prevChannels.length },
            ];
          });
          dispatch(
            setChannelInfo({
              channelId: responseData.chatId,
              channelName: responseData.chatName,
            })
          );
          dispatch(closeNews());
          setSelectedChannel(responseData.chatId);
          setConnectChannelGood(true);
        });
    } else {
      const doesChannelIdExist =
        channels === null
          ? null
          : channels.some((channel) => channel.chatId === parseInt(channelId));
      if (!doesChannelIdExist) {
        apiService
          .connectToChannel(channelId, axiosPrivate)
          .catch((error) => {
            if (error.response && error.response.status === 404) {
              notifyLinkIsInvalid();
            } else if (error.response && error.response.status === 409) {
              notifyUserAlredyInChannel();
            }

            return Promise.reject(error.code);
          })
          .then((response) => {
            const responseData = response.data;
            setChannels((prevChannels) => {
              const newChannel = {
                ...responseData,
                index: prevChannels?.length || 0,
              };
              return prevChannels
                ? [...prevChannels, newChannel]
                : [newChannel];
            });
            dispatch(
              setChannelInfo({
                channelId: responseData.chatId,
                channelName: responseData.chatName,
              })
            );
            setSelectedChannel(responseData.chatId);
            setConnectChannelGood(true);
          });
      }
    }
  };

  return (
    <div className="sidebar">
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
      <div className="sidebar__top">
        <Button
          variant="contained"
          sx={{ maxWidth: 60, maxHeight: 50, backgroundColor: "gray" }}
          onClick={() => {
            dispatch(showNews());
            setSelectedChannel(null);
            dispatch(
              setChannelInfo({
                channelId: null,
                channelName: null,
              })
            );
          }}
        >
           <Tooltip title="Home" arrow>
          <BungalowIcon sx={{width:50, height:50}}/>
          </Tooltip>
          &nbsp;
        </Button>
        {channelId !== null && (
          <DropdownMenu
            handleShowCreateLink={setShowCreateLinkForm}
            handleLeaveChannel={setLeaveChannelForm}
          />
        )}
      </div>
      <DropdownForms
        status={showCreateLinkForm}
        handleStatus={setShowCreateLinkForm}
        channelLink={channelLink}
        statusLeaveChannel={showLeaveChannelForm}
        handleLeaveChannel={setLeaveChannelForm}
        leaveChannel={handleLeaveChannel}
      />

      <div className="sidebar__channels">
        <div className="sidebar__channelsHeader">
          <div className="sidebar__header">
            <h4>Text Channels</h4>
          </div>
          <AddChannelForm
            handleAddChannel={handleAddChannel}
            handleJoinChannel={handleJoinChannel}
            status={connectChannelGood}
            setStatus={setConnectChannelGood}
          />
        </div>

        <DragDropContext
          onDragEnd={(result) => onDragEnd(result, channels, setChannels)}
        >
          <StrictModeDroppable droppableId="channels">
            {(provided) => (
              <div
                className="sidebar__channelsList"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {channels &&
                  channels
                    .slice()
                    .reverse()
                    .map(({ chatId, chatName, index }) => {
                      return (
                        <Draggable
                          key={chatId.toString()}
                          draggableId={chatId.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <SidebarChannel
                                id={chatId}
                                channelName={chatName}
                                onClick={handleChannelClick}
                                isSelected={selectedChannel === chatId}
                              />
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                {provided.placeholder}
              </div>
            )}
          </StrictModeDroppable>
        </DragDropContext>
      </div>

      <div className="sidebar__profile">
        {user.image ? (
          <Avatar src={`data:image/jpeg;base64, ${user.image}`} />
        ) : (
          <Avatar sx={{ bgcolor: deepOrange[500] }}>
            {user.firstName.charAt(0)}
          </Avatar>
        )}

        <div className="sidebar__profileInfo">
          <h3>
            {user.firstName} {user.lastName}
          </h3>
        </div>
        <Tooltip title="Settings" arrow>
        <SettingsIcon
          className="sidebar__showProfileSettings"
          onClick={handleShowSettings}
        />
        </Tooltip>
        {showSettings && (
          <Settings
            firstName={user.firstName}
            lastName={user.lastName}
            image={user.image}
            email={user.email}
            onClose={handleCloseSettings}
          />
        )}
      </div>
    </div>
  );
}

export default Sidebar;
