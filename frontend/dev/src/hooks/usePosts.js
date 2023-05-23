import { useQuery } from "react-query";

import apiService from "../service/apiService";

const usePosts = (token) => {
  return useQuery("posts", () => apiService.getPosts(token));
};

export default usePosts;
