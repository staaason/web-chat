import Box from "@mui/material/Box";
import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import { deepOrange } from "@mui/material/colors";
import { format, parseISO } from "date-fns";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import IconButton from "@mui/material/IconButton";

export default function FilteredMessageForm(props) {
  const { messages, handleScroll } = props;

  return (
    <Box
      sx={{
        width: 300,
        height: "90%",
        backgroundColor: "rgb(43, 45, 49)",
        position: "absolute",
        right: 0,
        marginTop: "65px",
        overflowY: "auto",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      <Box
        sx={{
          height: "30px",
          backgroundColor: "rgb(30, 31, 34)",
          paddingTop: "10px",
          marginBottom: "20px",
          paddingBottom: "10px",
        }}
      >
        <Typography
          variant="subtitle2"
          display="block"
          gutterBottom
          sx={{
            marginLeft: "20px",
            marginTop: "10px",
            marginBottom: "10px",
            color: "white",
          }}
        >
          {messages.length} results
        </Typography>
      </Box>
      <List
        sx={{
          width: "100%",
          maxWidth: 360,
          bgcolor: "inherit",
          color: "rgb(152, 154, 162)",
        }}
      >
        {messages
          ? messages.map((msg, index) => {
              const date = parseISO(msg.createdAt);
              const formattedDate = format(date, "d MMM, yyyy");
              const formattedTime = format(date, "h:mm a");
              return (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      {msg.user.image ? (
                        <Avatar
                          src={`data:image/jpeg;base64, ${msg.user.image}`}
                        />
                      ) : (
                        <Avatar sx={{ bgcolor: deepOrange[500] }}>
                          {msg.user.firstName.charAt(0)}
                        </Avatar>
                      )}
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${msg.user.firstName} ${msg.user.lastName}`}
                      secondary={
                        <React.Fragment>
                          <Typography
                            sx={{
                              display: "inline",
                              wordWrap: "break-word",
                            }}
                            component="span"
                            variant="body2"
                            color="rgb(221, 222, 226)"
                          >
                            {msg.message}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                    <span
                      style={{
                        color: "gray",
                        marginLeft: "20px",
                        fontSize: "x-small",
                        alignItems: "center",
                        marginTop: "10px",
                      }}
                    >
                      {formattedDate} at {formattedTime}
                    </span>

                    <IconButton
                      onClick={() => {
                        handleScroll(msg.messageId);
                      }}
                      aria-label="scroll to message"
                    >
                      <ArrowDownwardIcon />
                    </IconButton>
                  </ListItem>
                </React.Fragment>
              );
            })
          : null}
      </List>
    </Box>
  );
}
