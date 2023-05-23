import "../styles/Lobby.css";
import BlogCard from "./BlogCard";
import usePosts from "../hooks/usePosts";
import Snackbar from "@mui/material/Snackbar";
import { useState } from "react";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
const PostsList = ({ token }) => {
  const { data: posts, isLoading } = usePosts(token);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  if (isLoading) {
    return <div>
    <Skeleton height={30} />
  </div>;
  }

  return (
    <div>
      {posts.map((post, index) => {
        return (
          <div className="blog-card ">
            <BlogCard
              key={index}
              title={post.title}
              description={post.description}
              dataPublished={post.date_published}
              coverPhoto={post.coverImage}
              link={post.slug}
              blogStructure={post.structureHtml}
              setOpenSnackbar={setOpenSnackbar}
            />
          </div>
        );
      })}
      <Snackbar
        message="Copied to clibboard"
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={2000}
        onClose={() => setOpenSnackbar(false)}
        open={openSnackbar}
      />
    </div>
  );
};

export default PostsList;
