import * as React from "react";
import Box from "@mui/material/Box";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import { Button } from "@mui/material";
import apiService from "../service/apiService";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
export default function AdminPage() {
  const [htmlFile, setHtmlFile] = React.useState(null);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [coverPhoto, setCoverPhoto] = React.useState(null);
  const [slug, setSlug] = React.useState("");
  const axiosPrivate = useAxiosPrivate();

  const handleFileChange = (event) => {
    setHtmlFile(event.target.files[0]);
  };

  const handleCoverPhotoChange = (event) => {
    setCoverPhoto(event.target.files[0]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData();
    const postInfo = { title: title, description: description, slug: slug };
    formData.append("htmlFile", htmlFile);
    formData.append("info", JSON.stringify(postInfo));
    formData.append("coverImage", coverPhoto);
    apiService.createPost(formData, axiosPrivate);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      Create Post
      <div>
        Title:
        <FormControl fullWidth sx={{ m: 1 }}>
          <InputLabel htmlFor="outlined-adornment-amount">Title</InputLabel>
          <OutlinedInput
            onChange={(event) => setTitle(event.target.value)}
            id="outlined-adornment-amount"
            label="Title"
          />
        </FormControl>
      </div>
      <div>
        Post photo:
        <FormControl fullWidth sx={{ m: 1 }}>
          <InputLabel htmlFor="cover-photo"></InputLabel>
          <OutlinedInput
            id="cover-photo"
            type="file"
            onChange={handleCoverPhotoChange}
          />
        </FormControl>
      </div>
      <div>
        Description:
        <FormControl fullWidth sx={{ m: 1 }}>
          <InputLabel htmlFor="outlined-adornment-amount">
            Description
          </InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            label="desription"
            onChange={(event) => setDescription(event.target.value)}
          />
        </FormControl>
      </div>
      <div>
        HTML structure:
        <FormControl fullWidth sx={{ m: 1 }}>
          <InputLabel htmlFor="html-file"></InputLabel>
          <OutlinedInput
            id="html-file"
            type="file"
            onChange={handleFileChange}
          />
        </FormControl>
      </div>
      <div>
        Short link :
        <FormControl fullWidth sx={{ m: 1 }}>
          <InputLabel htmlFor="outlined-adornment-amount">Slug</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            label="slug"
            onChange={(event) => setSlug(event.target.value)}
          />
        </FormControl>
      </div>
      <Button onClick={handleSubmit}>Create Post</Button>
    </Box>
  );
}
