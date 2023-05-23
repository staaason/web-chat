import useAuth from "../hooks/useAuth";
import "../styles/Lobby.css";
import PostsList from "./PostList";

export default function Lobby() {
  const { auth } = useAuth();

  const token = auth.token;
  return (
    <div className="lobby">
      <div className="blog-layout-container">
        <div className="blog-layout">
          <PostsList token={token} />
        </div>
      </div>
    </div>
  );
}
