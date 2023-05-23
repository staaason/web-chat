import React from "react";
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
} from "@mui/material";
import { setUid } from "../features/filterSlice";
import { useDispatch } from "react-redux";
import { deepOrange } from "@mui/material/colors";
import Typography from "@mui/material/Typography";


const Table = ({ data, query, setShowTable, setShowFilteredMessages }) => {
  const dispatch = useDispatch();

  const handleSetUid = (uid) => {
    dispatch(
      setUid({
        uid: uid,
      })
    );
    setShowTable((prev) => !prev);
    setShowFilteredMessages(true);
  };
  return (
    <div>
      {query.length !== 0 && data.length !== 0 && (
        <List
          sx={{
            width: "100%",
            maxWidth: 300,
            bgcolor: "rgb(17, 18, 20)",
            position: "absolute",
            top: 0,
            right: 10,
            height: "auto",
            marginTop: "70px",
            zIndex: 99999,
            borderRadius: "5px",
          }}
        >
          <Typography
            variant="caption"
            display="block"
            gutterBottom
            sx={{
              marginLeft: "20px",
              marginTop: "10px",
              marginBottom: "10px",
              color: "rgb(176, 177, 183)",
            }}
          >
            From users
          </Typography>
          {data.map((msg, index) => (
            <React.Fragment key={index}>
              <ListItem
                gutterBottom
                sx={{
                  height: 40,
                  marginRight: "10px",
                  marginLeft: "10px",
                  marginBottom: "5px",
                  "&:hover": {
                    backgroundColor: "rgb(48, 50, 55)",
                    cursor: "pointer",
                    borderRadius: "5px",
                    width: "calc(100% - 20px)",
                  },
                }}
                alignItems="flex-start"
                onClick={() => handleSetUid(msg.user.uid)}
              >
                <ListItemAvatar>
                  {msg.user.image ? (
                    <Avatar
                      sx={{
                        height: 20,
                        width: 20,
                      }}
                      src={`data:image/jpeg;base64, ${msg.user.image}`}
                    />
                  ) : (
                    <Avatar sx={{ bgcolor: deepOrange[500], height: 20,
                      width: 20 }}>
                      {msg.user.firstName.charAt(0)}
                    </Avatar>
                  )}
                </ListItemAvatar>
                <ListItemText
                  sx={{ marginTop: "5px", color: "rgb(223, 224, 228)" }}
                  primary={`${msg.user.firstName} ${msg.user.lastName}`}
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}
    </div>
  );
};

export default Table;
