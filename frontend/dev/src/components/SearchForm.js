import * as React from "react";
import MenuUnstyled from "@mui/base/MenuUnstyled";
import MenuItemUnstyled, {
  menuItemUnstyledClasses,
} from "@mui/base/MenuItemUnstyled";
import PopperUnstyled from "@mui/base/PopperUnstyled";
import { styled } from "@mui/system";
import Typography from "@mui/material/Typography";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";

const blue = {
  100: "#DAECFF",
  200: "#99CCF3",
  400: "#3399FF",
  500: "#007FFF",
  600: "#0072E5",
  900: "#003A75",
};

const grey = {
  50: "#f6f8fa",
  100: "#eaeef2",
  200: "#d0d7de",
  300: "#afb8c1",
  400: "#8c959f",
  500: "#6e7781",
  600: "#57606a",
  700: "#424a53",
  800: "#32383f",
  900: "#24292f",
};

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: blue[400],
    },
    background: {
      default: grey[900],
    },
    text: {
      primary: grey[300],
    },
  },
});

const StyledListbox = styled("ul")(
  ({ theme }) => `
  font-family: IBM Plex Sans, sans-serif;
  font-size: 0.875rem;
  box-sizing: border-box;
  padding: 6px;
  margin: 12px 0;
  min-width: 250px;
  border-radius: 12px;
  overflow: auto;
  outline: 0px;
  background: ${theme.palette.mode === "dark" ? grey[900] : "#fff"};
  border: 1px solid ${theme.palette.mode === "dark" ? grey[700] : grey[200]};
  color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
  box-shadow: 0px 4px 30px ${
    theme.palette.mode === "dark" ? grey[900] : grey[200]
  };
  `
);

const StyledMenuItem = styled(MenuItemUnstyled)(
  ({ theme }) => `
  list-style: none;
  padding: 8px;
  border-radius: 8px;
  cursor: default;
  user-select: none;

  &:last-of-type {
    border-bottom: none;
  }

  &.${menuItemUnstyledClasses.focusVisible} {
    outline: 3px solid ${theme.palette.mode === "dark" ? blue[600] : blue[200]};
    background-color: ${theme.palette.mode === "dark" ? grey[800] : grey[100]};
    color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
  }

  &.${menuItemUnstyledClasses.disabled} {
    color: ${theme.palette.mode === "dark" ? grey[700] : grey[400]};
  }

  &:hover:not(.${menuItemUnstyledClasses.disabled}) {
    background-color: ${theme.palette.mode === "dark" ? grey[800] : grey[100]};
    color: ${theme.palette.mode === "dark" ? grey[300] : grey[900]};
  }
  `
);

const Popper = styled(PopperUnstyled)`
  z-index: 1;
  margin-left: 82%;
  margin-top: 4%;
`;

export default function SearchForm({ setSearchFilter, open }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isOpen, setIsOpen] = React.useState(open);
  const menuActions = React.useRef(null);

  const close = () => {
    setIsOpen(false); // set isOpen to false
    setAnchorEl(null);
  };

  const createHandleMenuClick = (menuItem) => {
    return () => {
      const inputElement = document.getElementById("search__input");
      inputElement.focus();
      setSearchFilter(menuItem);
    };
  };

  return (
    <div>
      <ThemeProvider theme={theme}>
        <MenuUnstyled
          actions={menuActions}
          open={isOpen}
          onClose={close}
          anchorEl={anchorEl}
          theme={"dark"}
          slots={{ root: Popper, listbox: StyledListbox }}
          slotProps={{ listbox: { id: "simple-menu" } }}
        >
          <Typography variant="body2" gutterBottom sx={{ marginLeft: "5px" }}>
            Search filter
          </Typography>
          <StyledMenuItem onClick={createHandleMenuClick("user")}>
            from : user
          </StyledMenuItem>
        </MenuUnstyled>
      </ThemeProvider>
    </div>
  );
}
