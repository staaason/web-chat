import Box from '@mui/material/Box';
import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { useSelector } from 'react-redux';
import { selectChannelId } from '../features/appSlice';
import { deepOrange } from '@mui/material/colors';
import useAuth from '../hooks/useAuth';
import apiService from "../service/apiService";
import useAxiosPrivate from "../hooks/useAxiosPrivate";


export default function ChatInfo(props){
    const {users, setUsers} = props;
    const channelId = useSelector(selectChannelId);
    const axiosPrivate = useAxiosPrivate();

    React.useEffect(() => {
        apiService.getUsersInChannel(channelId, axiosPrivate).catch((error) => {
            return Promise.reject(error);
        }).then((response) => {
            setUsers(response.data)
        })

    }, [channelId])

    return (
        <Box
          sx={{
            width: 300,
            height: '90%',
            backgroundColor: 'rgb(43, 45, 49)',
            position: 'absolute',
            right: 0,
            marginTop: '65px',
            overflowY: 'auto'
          }}
        >
             <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'inherit', color: 'rgb(152, 154, 162)' }}>
             <Typography variant="caption" display="block" gutterBottom sx={{marginLeft: '20px', marginTop:'10px', marginBottom: '10px'}}>
             Users of server - {users ? users.length : 0}
      </Typography>
      {users ? users.map((user, index) => {
          return (<ListItem key={index} alignItems="flex-start" sx={{"&:hover": {
            backgroundColor: "lightgray"}, marginLeft: '10px', width: 'auto', marginRight: '10px'}}>
                <ListItemAvatar>
                {user.image ? 
                <Avatar src={`data:image/jpeg;base64, ${user.image}`} /> : <Avatar sx={{ bgcolor: deepOrange[500] }}>
                {user.firstName.charAt(0)}
              </Avatar>}
                </ListItemAvatar>
                <ListItemText
                  primary={`${user.firstName} ${user.lastName}`}
                  secondary={
                    <React.Fragment>
                     
                    </React.Fragment>
                  }
                />
              </ListItem>);
        }): null} 
      
    </List>
            </Box>
        
      );
}