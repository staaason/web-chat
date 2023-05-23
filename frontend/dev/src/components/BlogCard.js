import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { CardActionArea, CardActions } from "@mui/material";
import { useNavigate } from "react-router-dom";

function formatDate(dateString) {
  return new Date(dateString)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, ".");
}

export default function BlogCard({
  title,
  description,
  coverPhoto,
  dataPublished,
  link,
  setOpenSnackbar,
}) {
  const navigate = useNavigate();
  const [redirect, setRedirect] = React.useState(false);

  React.useEffect(() => {
    if (redirect) {
      navigate(`/posts/${link}`);
      setRedirect(false);
    }
  }, [redirect]);

  const handleShareClick = () => {
    navigator.clipboard
      .writeText(`${window.location.origin}/posts/${link}`)
      .then(() => setOpenSnackbar(true))
      .catch((err) => console.error("Failed to copy link to clipboard", err));
  };

  return (
    <Card sx={{ maxWidth: 345, maxHeight: "auto" }}>
      <CardActionArea onClick={() => setRedirect(true)}>
        <CardMedia
          component="img"
          height="140"
          src={`data:image/jpeg;base64, ${coverPhoto}`}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions sx={{ justifyContent: "space-between" }}>
        <Button size="small" color="primary" onClick={() => handleShareClick()}>
          Share
        </Button>
        <Typography
          variant="caption"
          display="block"
          sx={{ right: 0, marginRight: 5 }}
        >
          {formatDate(dataPublished)}
        </Typography>
      </CardActions>
    </Card>
  );
}
