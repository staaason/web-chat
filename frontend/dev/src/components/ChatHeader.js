import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import "../styles/ChatHeader.css";
import { useEffect, useRef } from "react";
import ClickAwayListener from "@mui/base/ClickAwayListener";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import { selectCloseStatus, setCloseStatus } from "../features/filterSlice";
import Tooltip from "@mui/material/Tooltip";

export default function ChatHeader({
  id,
  channelName,
  handleShowUsersList,
  searchClicked,
  setSearchClicked,
  searchFilter,
  setSearchFilter,
  setQuery,
  setShowTable,
  setShowFilteredMessages,
}) {
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const closeStatus = useSelector(selectCloseStatus);
  const handleClick = () => {
    setSearchClicked(true);
  };

  const handleClickAway = () => {
    setShowTable(false);
    if (!searchFilter) {
      setSearchClicked(false);
    }
  };

  const handleCloseSearch = () => {
    setSearchFilter(null);
    setSearchClicked(false);
    setShowTable(false);
    setShowFilteredMessages(false);
    inputRef.current.value = "";
  };

  useEffect(() => {
    if (closeStatus === true) {
      handleCloseSearch();
      dispatch(
        setCloseStatus({
          closeStatus: false,
        })
      );
    }
  }, [closeStatus]);

  useEffect(() => {
    if (searchFilter === null) {
      setSearchClicked(false);
    }
  }, [searchFilter]);

  return (
    <div className="chatHeader">
      <div className="chatHeader__left">
        <h3>
          <span className="chatHeader__hash">#</span>
          {channelName}
        </h3>
      </div>
      <div className="chatHeader__right">
        {/* <NotificationsRoundedIcon /> */}
        
        <PeopleRoundedIcon
          onClick={() => {
            handleShowUsersList((prev) => !prev);
            handleCloseSearch();
          }}
        />
        <ClickAwayListener onClickAway={handleClickAway}>
          <div
            className={`chatHeader__search ${searchClicked ? "clicked" : ""}`}
            onClick={handleClick}
          >
            <input
              ref={inputRef}
              placeholder={searchFilter === "user" ? `from` : "Search"}
              id="search__input"
              onChange={(e) => {
                setQuery(e.target.value.toLowerCase());
                setShowTable(true);
              }}
            />
            {searchFilter ? (
              <CloseIcon onClick={handleCloseSearch} />
            ) : (
              <SearchRoundedIcon />
            )}
          </div>
        </ClickAwayListener>
      </div>
    </div>
  );
}
