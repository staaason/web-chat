import { useSelector } from "react-redux";
import { selectChannelId } from "../features/appSlice";
import "../styles/Message.css"
import apiService from "../service/apiService";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
export default function Reactions({emojiList, messageId }) {
    const channelId = useSelector(selectChannelId)
    const axiosPrivate = useAxiosPrivate();

    const handleRemoveReaction = async (reactionId, reactionCount, reactionType) => {
      const request = {type : reactionType}
      if(reactionCount === 1){
        await apiService.deleteReaction(messageId, reactionId, axiosPrivate).then(async (response) => {
            if(response === "User has not reacted to this message"){
              await apiService.addReaction(channelId, messageId, request, axiosPrivate)
            }
        })}

      else if(reactionCount > 1){
        await apiService.putReaction(channelId, messageId, request, axiosPrivate).then(async (response) => {
          if(response === "User has not reacted to this message"){
            await apiService.addReaction(channelId, messageId, request, axiosPrivate)
          }
      })
      }

    }

    return (
        <div className="message__ReactionList">
        {emojiList.map(reaction => (
          <div className='message__ReactionListBox' onClick={() =>handleRemoveReaction(reaction.id, reaction.count, reaction.type)}  key={reaction.id}>
            {reaction.type}<span> {reaction.count}</span>
          </div>
        ))}
      </div>
       
    );
}