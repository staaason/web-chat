import axios from "axios";

const BASE_URL = "http://localhost:8080";

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

const axiosBase = axios.create({
  baseURL: BASE_URL
});


const register = async (registerRequest) => {
  return await axiosBase.post(
    "/api/v1/auth/register",
    registerRequest
  );
};
const login = async (authenticationRequest) => {
  return await axiosBase.post(
    "/api/v1/auth/login",
    authenticationRequest,
    {
      headers: {
        "Content-type": "application/json",
      },
      withCredentials: true,
    }
  );
};



const refresh_token = async () => {
  return await axiosBase.post(
    "/api/v1/auth/refresh-token",
    {},
    { withCredentials: true }
  );
};

const getUserData = async (token) => {
  return axiosBase.get('/api/v1/users', {
    headers: { Authorization: `Bearer ${token}` }
  })
};

const checkEmailExists = async (email) => {
  return await axiosBase.get("/api/v1/users/email-exists", {
    params: {
      email: email,
    },
  });
};


const verifyToken = async (token) => {
  return await axiosBase.get("/api/v1/recover-password", {
    params: {
      token: token,
    },
  });
};
const changePassword = async (token, password) => {
  return await axiosBase.post("/api/v1/recover-password", {
    token: token,
    password: password,
  });
};
const logout = async (token) => {
  return axiosBase.post(
    "/api/v1/auth/logout",
    { token: token },
    {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

const createChannel = (channelRequest, axiosProvider) => {
  return axiosProvider
    .post("/api/v1/text-channels", channelRequest)
    .then((response) => {
      return response.data;
    })
};
const connectToChannel = (channelId, axiosProvider) => {
  return axiosProvider
    .post(
      `/api/v1/text-channels/connect/${channelId}`,
      {}
    )
    .then((response) => {
      return response;
    });
};
const getUserChannels = async (axiosProvider) => {
  return  await axiosProvider
    .get("/api/v1/users/channels", {
    })
   
};
const sendMessage = (message, axiosProvider, channelId) => {
  return axiosProvider
    .post(`/api/v1/messages/${channelId}`, message, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
};
const getMessagesByChannelId = (channelId, axiosProvider) => {
  return axiosProvider
    .get(`/api/v1/messages/${channelId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
};
const getUserImage = (token) => {
  return axiosBase
    .get("/api/v1/gcp", {
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error(error);
    });
};
const uploadAvatarToServer = (uploadRequest, axiosProvider) => {
  return axiosProvider
    .post("/api/v1/gcp", uploadRequest)
    .then((response) => {
      return response.data;
    })
};
const editMessage = (message, axiosProvider) => {
  return axiosProvider
    .put(`/api/v1/messages`, message)
    .then((response) => {
      return response.data;
    })
};
const deleteMessage = (messageId, axiosProvider) => {
  return axiosProvider
    .delete(`/api/v1/messages/${messageId}`)
    .then((response) => {
      return response;
    })
};
const addReaction = (channelId, messageId, reactionRequest, axiosProvider) => {
  return axiosProvider
    .post(
      `/api/v1/messages/${messageId}/reactions`,
      reactionRequest
    )
    .then((response) => {
      return response.data;
    });
};
const putReaction = (textChannelId, id, request, axiosProvider) => {
  return axiosProvider
    .put(`/api/v1/messages/${id}/reactions`, request)
    .then((response) => {
      return response.data;
    })
};
const deleteReaction = (id, reactionID, axiosProvider) => {
  return axiosProvider
    .delete(
      `/api/v1/messages/${id}/reactions/${reactionID}`)
    .then((response) => {
      return response.data;
    })
};
const createChannelLink = (channelId, axiosProvider) => {
  return axiosProvider
    .post(
      `/api/v1/text-channels/temporary-link/${channelId}`, {})
    .then((response) => {
      return response;
    });
};
const leaveChannel = (channelId, axiosProvider) => {
  return axiosProvider
    .delete(`/api/v1/text-channels/disconnect/${channelId}`)
    .then((response) => {
      return response;
    });
};
const getUsersInChannel = (channelId, axiosProvider) => {
  return axiosProvider
    .get(`/api/v1/text-channels/${channelId}/users`)
    .then((response) => {
      return response;
    });
};
const createPost = async (formData, axiosProvider) => {
    return await axiosProvider.post(
      "/api/v1/posts",
      formData,

    );
};
const getPosts = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await axiosBase.get(
      "/api/v1/posts",
      {},
      config
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
const getPost = async (slug, axiosProvider) => {

  return await axiosProvider.get(`/api/v1/posts/${slug}`);
};
const apiService = {
  register,
  login,
  checkEmailExists,
  verifyToken,
  changePassword,
  logout,
  createChannel,
  getUserChannels,
  sendMessage,
  getMessagesByChannelId,
  connectToChannel,
  changeUserImage: getUserImage,
  uploadAvatarToServer,
  editMessage,
  deleteMessage,
  addReaction,
  putReaction,
  deleteReaction,
  createChannelLink,
  leaveChannel,
  getUsersInChannel,
  createPost,
  getPosts,
  getPost,
  refresh_token,
  getUserData
};
export default apiService;
