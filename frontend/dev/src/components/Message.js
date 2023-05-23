import "../styles/Message.css";
import Avatar from "@mui/material/Avatar";

import { format, parseISO } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { selectChannelId, setMessageInfo } from "../features/appSlice";
import { useEffect, useRef, useState } from "react";
import AddReactionIcon from "@mui/icons-material/AddReaction";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { selectUser } from "../features/userSlice";
import Reactions from "./Reactions";
import EmojiPicker from "emoji-picker-react";
import { deepOrange } from "@mui/material/colors";
import apiService from "../service/apiService";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

export default function Message({
  name,
  lastName,
  image,
  message,
  timestamp,
  id,
  uid,
  emojiList,
  showUsersList,
  showFilteredMessages,
  messageRef,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const date = parseISO(timestamp);
  const formattedDate = format(date, "d MMM, yyyy");
  const formattedTime = format(date, "h:mm a");
  const dispatch = useDispatch();
  const channelId = useSelector(selectChannelId);
  const [changedMessage, setChangedMessage] = useState(message);
  const user = useSelector(selectUser);
  const emojiRef = useRef(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  const handleDeleteMessage = () => {
    apiService.deleteMessage(id, axiosPrivate);
  };

  useEffect(() => {
    let handler = (e) => {
      try {
        if (!emojiRef.current.contains(e.target)) {
          setShowEmojis(false);
        }
      } catch (error) {}
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, [showEmojis, emojiRef.current]);

  const onEmojiClick = (emojiObject) => {
    const request = { type: emojiObject.emoji };
    apiService
      .addReaction(channelId, id, request, axiosPrivate)
      .catch((error) => {
        setShowEmojis(false);
      })
      .then((response) => {
        setShowEmojis(false);
      });
  };

  const handleSaveEditedMessage = () => {
    const messageData = { content: changedMessage, id: id };
    apiService.editMessage(messageData, axiosPrivate);
    setIsEditing(false);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    dispatch(
      setMessageInfo({
        messageId: id,
      })
    );
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    dispatch(
      setMessageInfo({
        messageId: null,
      })
    );
  };

  return (
    <div
      className="message"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={messageRef}
    >
      {image ? (
        <Avatar src={`data:image/jpeg;base64, ${image}`} />
      ) : (
        <Avatar sx={{ bgcolor: deepOrange[500] }}>{name.charAt(0)}</Avatar>
      )}
      <div className="message__info">
        <h4>
          {name} {lastName}
          <span className="message__timestamp">
            {formattedDate} at {formattedTime}
          </span>
        </h4>
        {isEditing ? (
          <div>
            <input
              type="text"
              onChange={(e) => setChangedMessage(e.target.value)}
            />
            <button onClick={handleSaveEditedMessage}>Save</button>
          </div>
        ) : (
          <div>
            <p>{message}</p>
          </div>
        )}
        <div>
          <Reactions emojiList={emojiList} messageId={id} />
        </div>
      </div>

      {isHovering && (
        <div className="message__actions">
          <AddReactionIcon
            fontSize="large"
            onClick={() => setShowEmojis((prev) => !prev)}
          />
          {user.uid === uid && <EditIcon onClick={() => setIsEditing(true)} />}

          {user.uid === uid && <DeleteIcon onClick={handleDeleteMessage} />}
        </div>
      )}
      {showEmojis && (
        <div
          className={`message__emojiPicker ${
            showUsersList || showFilteredMessages ? "clicked" : ""
          }`}
          ref={emojiRef}
        >
          <EmojiPicker height={400} width={300} onEmojiClick={onEmojiClick} />
        </div>
      )}
    </div>
  );
}
