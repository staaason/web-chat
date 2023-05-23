import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";

function appBarLabel(label, func) {
  return (
    <Toolbar>
      <IconButton
        edge="start"
        onClick={func}
        color="inherit"
        aria-label="menu"
        sx={{ mr: 2 }}
      >
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
        {label}
      </Typography>
    </Toolbar>
  );
}

export default function BlogNav() {
  const navigate = useNavigate();
  return (
    <ThemeProvider theme={darkTheme}>
      <AppBar position="static" color="primary">
        {appBarLabel("News", () => navigate("/app"))}
      </AppBar>
    </ThemeProvider>
  );
}

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1976d2",
    },
  },
});
