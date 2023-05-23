
import React, { useEffect, useState } from "react"
import { useDispatch } from "react-redux";
import { setChannelInfo } from "../features/appSlice";
import { setCloseStatus } from "../features/filterSlice";
import "../styles/SidebarChannel.css"

function SidebarChannel({ id, channelName, onClick, isSelected }) {
    const dispatch = useDispatch()
    const [isClicked, setIsClicked] = useState(false)

    useEffect(() => {
        if (isSelected === false) {
            setIsClicked(false)
        }else if(isSelected){
            setIsClicked(true)
        }

    }, [isSelected])


    const handleClick = () => {

        dispatch(
            setChannelInfo({
                channelId: id,
                channelName: channelName,
            })
        )
        onClick(id);
        setIsClicked(true)
        dispatch(setCloseStatus({
            closeStatus: true
        }))
    }

    return (
        <div className={`sidebarChannel ${isClicked ? 'clicked' : ''}`} onClick={handleClick}>
            <h4><span className="sidebarChannel__hash">#</span>{channelName}</h4>
        </div>

    )
}


export default SidebarChannel;