import "../styles/Chat.css";
import ChatHeader from "./ChatHeader";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import EmojiEmotionsRoundedIcon from "@mui/icons-material/EmojiEmotionsRounded";
import GifRoundedIcon from "@mui/icons-material/GifRounded";
import Message from "./Message";
import { useEffect, useRef, useState } from "react";
import SockJsClient from "react-stomp";
import { useSelector } from "react-redux";
import { selectChannelId, selectChannelName } from "../features/appSlice";
import EmojiPicker from "emoji-picker-react";
import ChatInfo from "./ChatInfo";
import SystemMessage from "./SystemMessage";
import { ClickAwayListener } from "@mui/base";
import SearchForm from "./SearchForm";
import Table from "./UserMessagesFilter";
import FilteredMessageForm from "./FilteredMessagesForm";
import { selectUid } from "../features/filterSlice";
import apiService from "../service/apiService";
import useAxiosPrivate from "../hooks/useAxiosPrivate";


const SOCKET_URL = "http://localhost:8080/ws-message";

function binarySearchMessageById(array, target) {
  let low = 0;
  let high = array.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const message = array[mid];

    if (message.messageId === target) {
      return mid;
    } else if (message.messageId < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return -1;
}

function binarySearchReactionsById(reactions, id) {
  let left = 0;
  let right = reactions.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    if (reactions[mid].id === id) {
      return mid;
    }

    if (reactions[mid].id < id) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}

function deleteUserByUid(users, targetUid) {
  const filteredUsers = users.filter(
    (user) => parseInt(user.uid) !== parseInt(targetUid)
  );
  const deleted = filteredUsers.length !== users.length;
  return [filteredUsers, deleted];
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const channelName = useSelector(selectChannelName);
  const channelId = useSelector(selectChannelId);
  const [input, setInput] = useState("");
  const inputRef = useRef();
  const [showEmojis, setShowEmojis] = useState(false);
  const [cursorPosition, setCursorPosition] = useState();
  const bottomRef = useRef(null);
  const [showUsersList, setShowUsersList] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchClicked, setSearchClicked] = useState(true);
  const [searchFilter, setSearchFilter] = useState(null);
  const [query, setQuery] = useState("");
  const [showTable, setShowTable] = useState(false);
  const uid = useSelector(selectUid);
  const [showFilteredMessages, setShowFilteredMessages] = useState(false);
  const axiosPrivate = useAxiosPrivate();


  const messageRef = useRef([]);

  const scrollToMessage = (messageId) => {
    const index = binarySearchMessageById(messages, messageId);
    if (index !== -1) {
      const listItem = messageRef.current[index];
      listItem?.scrollIntoView({ behavior: "smooth" });
      listItem?.classList.add("highlighted");
      setTimeout(() => {
        listItem?.classList.remove("highlighted");
      }, 1500);
    }
  };

  const searchMessagesByUser = (uid) => {
    return messages
      .filter((msg) => msg.user !== null)
      .filter((msg) => msg.user.uid === uid);
  };

  const search = () => {
    return messages
      .filter((msg) => msg.user !== null)
      .filter(
        (msg, index, arr) =>
          index ===
          arr.findIndex(
            (m) =>
              m.user.firstName?.toLowerCase() ===
              msg.user.firstName?.toLowerCase()
          )
      )
      .filter((msg) => msg.user.firstName?.toLowerCase().includes(query));
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onEmojiClick = (emojiObject) => {
    const ref = inputRef.current;
    ref.focus();
    const start = input.substring(0, ref.selectionStart);
    const end = input.substring(ref.selectionEnd);
    const text = start + emojiObject.emoji + end;
    setInput(text);
    setCursorPosition(start.length + emojiObject.emoji.length);
    setShowEmojis(false);
  };

  const handleShowEmojis = () => {
    setShowEmojis((prev) => !prev);
  };

  const handleClickAway = () => {
    setShowEmojis(false);
  };

  let onConnected = () => {
    console.log("Connected!!");
  };

  let onMessageReceived = (msg) => {
    if (msg.method === "join-channel") {
      if (channelId === msg.info.channelId) {
        const userInfo = msg.info.user;
        if (!users.includes(userInfo)) {
          setUsers([...users, userInfo]);
          const message = msg.info.message;
          message.type = "connect-channel";
          setMessages([...messages, message]);
        }
      }
    }
    if (msg.method === "leave-channel") {
      if (parseInt(channelId) === parseInt(msg.info.channelId)) {
        const userId = msg.info.uid;
        const tempUsers = [...users];
        tempUsers.sort((a, b) => a.uid - b.uid);
        const [updatedUsers, deleted] = deleteUserByUid(
          tempUsers,
          parseInt(userId)
        );
        if (deleted) {
          setUsers(updatedUsers);
          const message = msg.info.message;
          message.type = "leave-channel";
          setMessages([...messages, message]);
        }
      }
    }
    if (msg.method === "addReaction") {
      if (msg.message.type ?? false) {
        const index = binarySearchMessageById(
          messages,
          parseInt(msg.message.message)
        );
        if (index !== -1) {
          const updatedMessages = [...messages];
          const reactions = messages[index].reactions;
          const reactionIdToFind = msg.message.id;
          const reactionIndex = binarySearchReactionsById(
            reactions,
            reactionIdToFind
          );
          if (reactionIndex !== -1) {
            const updatedReaction = {
              ...updatedMessages[index].reactions[reactionIndex],
              count: updatedMessages[index].reactions[reactionIndex].count + 1,
            };
            const updatedReactions = [
              ...updatedMessages[index].reactions.slice(0, reactionIndex),
              updatedReaction,
              ...updatedMessages[index].reactions.slice(reactionIndex + 1),
            ];
            updatedMessages[index] = {
              ...updatedMessages[index],
              reactions: updatedReactions,
            };
            setMessages(updatedMessages);
          } else {
            const newReaction = {
              type: msg.message.type,
              count: 1,
              id: msg.message.id,
            };
            updatedMessages[index] = {
              ...updatedMessages[index],
              reactions: [...updatedMessages[index].reactions, newReaction],
            };
            setMessages(updatedMessages);
          }
        }
      }
    }
    if (msg.method === "putReaction") {
      if (msg.message.type ?? false) {
        const index = binarySearchMessageById(
          messages,
          parseInt(msg.message.message)
        );
        if (index !== -1) {
          const updatedMessages = [...messages];
          const reactions = messages[index].reactions;
          const reactionIdToFind = msg.message.id;
          const reactionIndex = binarySearchReactionsById(
            reactions,
            reactionIdToFind
          );
          if (reactionIndex !== -1) {
            const updatedReaction = {
              ...updatedMessages[index].reactions[reactionIndex],
              count: updatedMessages[index].reactions[reactionIndex].count - 1,
            };
            const updatedReactions = [
              ...updatedMessages[index].reactions.slice(0, reactionIndex),
              updatedReaction,
              ...updatedMessages[index].reactions.slice(reactionIndex + 1),
            ];
            updatedMessages[index] = {
              ...updatedMessages[index],
              reactions: updatedReactions,
            };
            setMessages(updatedMessages);
          }
        }
      }
    }
    if (msg.method === "deleteReaction") {
      if (msg.message.type ?? false) {
        const index = binarySearchMessageById(
          messages,
          parseInt(msg.message.message)
        );
        if (index !== -1) {
          const updatedMessages = [...messages];
          const reactions = messages[index].reactions;
          const reactionIdToFind = msg.message.id;
          const reactionIndex = binarySearchReactionsById(
            reactions,
            reactionIdToFind
          );
          if (reactionIndex !== -1) {
            const updatedReactions = [
              ...updatedMessages[index].reactions.slice(0, reactionIndex),
              ...updatedMessages[index].reactions.slice(reactionIndex + 1),
            ];
            updatedMessages[index] = {
              ...updatedMessages[index],
              reactions: updatedReactions,
            };
            setMessages(updatedMessages);
          }
        }
      }
    }
    if (msg.status === "deleted") {
      const index = binarySearchMessageById(messages, parseInt(msg.messageId));
      if (index !== -1) {
        const updatedMessages = [...messages];
        updatedMessages.splice(index, 1);
        setMessages(updatedMessages);
      }
    }
    if (msg.method === "add-message") {
      const message = msg.message;
      if (message.chatId === channelId) {
        const index = binarySearchMessageById(messages, message.messageId);
        if (index !== -1) {
          const updatedMessages = [...messages];
          updatedMessages[index] = {
            ...updatedMessages[index],
            message: message.message,
          };
          setMessages(updatedMessages);
        } else {
          setMessages([...messages, message]);
        }
      }
    }
  };

  const handleSendMessage = (event) => {
    event.preventDefault();
    const messageData = { content: input };
    apiService.sendMessage(messageData, axiosPrivate, channelId);
    setInput("");
  };

  useEffect(() => {
    if (channelId) {
      apiService
        .getMessagesByChannelId(channelId, axiosPrivate)
        .then((response) => {
          setMessages(response);
        });
    }
  }, [channelId]);

  return (
    <div className="chat">
      <SockJsClient
        url={SOCKET_URL}
        topics={[
          "/topic/message",
          "/topic/edit-message",
          "/topic/delete-message",
          "/topic/add-reaction",
          "/topic/delete-reaction",
          "/topic/channel",
        ]}
        onConnect={onConnected}
        onDisconnect={() => {}}
        onMessage={(msg) => onMessageReceived(msg)}
        debug={false}
      />

      {channelId !== null ? (
        <div className="chat">
          <ChatHeader
            id={channelId}
            channelName={channelName}
            handleShowUsersList={setShowUsersList}
            searchClicked={searchClicked}
            setSearchClicked={setSearchClicked}
            searchFilter={searchFilter}
            setSearchFilter={setSearchFilter}
            setQuery={setQuery}
            setShowTable={setShowTable}
            setShowFilteredMessages={setShowFilteredMessages}
          />

          <div
            className={`chat__messages ${
              showUsersList || showFilteredMessages ? "clicked" : ""
            }`}
          >
            {messages.map((msg, index) => {
              if (msg.type === "connect-channel") {
                return (
                  <SystemMessage
                    key={index}
                    message={msg.message}
                    timestamp={msg.createdAt}
                    type={msg.type}
                  />
                );
              } else if (msg.type === "leave-channel") {
                return (
                  <SystemMessage
                    key={index}
                    message={msg.message}
                    timestamp={msg.createdAt}
                    type={msg.type}
                  />
                );
              } else {
                return (
                  <div
                    key={index}
                    ref={(el) => (messageRef.current[index] = el)}
                  >
                    <Message
                      key={index}
                      name={msg.user.firstName}
                      image={msg.user.image}
                      lastName={msg.user.lastName}
                      message={msg.message}
                      timestamp={msg.createdAt}
                      id={msg.messageId}
                      setMessageState={setMessages}
                      uid={msg.user.uid}
                      emojiList={msg.reactions}
                      showUsersList={showUsersList}
                      showFilteredMessages={showFilteredMessages}
                    />
                  </div>
                );
              }
            })}

            <div ref={bottomRef} />
          </div>
          {showUsersList && <ChatInfo users={users} setUsers={setUsers} />}

          {searchClicked && (
            <SearchForm
              setSearchFilter={setSearchFilter}
              open={searchClicked}
            />
          )}

          {showTable && (
            <Table
              data={search()}
              query={query}
              setShowTable={setShowTable}
              setShowFilteredMessages={setShowFilteredMessages}
            />
          )}

          {showFilteredMessages && (
            <FilteredMessageForm
              messages={searchMessagesByUser(uid)}
              handleScroll={scrollToMessage}
            />
          )}

          {showEmojis ? (
            <div
              className={`chat__emojiPicker ${
                showUsersList || showFilteredMessages ? "clicked" : ""
              }`}
            >
              <EmojiPicker
                height={400}
                width={300}
                onEmojiClick={onEmojiClick}
              />
            </div>
          ) : null}

          <div
            className={`chat__input ${
              showUsersList || showFilteredMessages ? "clicked" : ""
            }`}
          >
            {/* <AddCircleOutlineRoundedIcon fontSize="large" /> */}
            <form>
              <input
                value={input}
                disabled={!channelId}
                selectionstart={cursorPosition}
                selectionend={cursorPosition}
                onChange={(e) => setInput(e.target.value)}
                ref={inputRef}
                placeholder={`Message #${channelName}`}
              />
              <button
                className="chat__inputButton"
                onClick={handleSendMessage}
                type="submit"
              >
                Send message
              </button>
            </form>

            <div className="chat__inputIcons">
              <ClickAwayListener onClickAway={handleClickAway}>
                <EmojiEmotionsRoundedIcon
                  fontSize="large"
                  onClick={handleShowEmojis}
                />
              </ClickAwayListener>
              <GifRoundedIcon fontSize="large" />
            </div>
          </div>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}
