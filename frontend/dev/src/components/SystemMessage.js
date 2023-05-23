import "../styles/Message.css";
import { format, parseISO } from "date-fns";
import EastIcon from "@mui/icons-material/East";
import WestIcon from "@mui/icons-material/West";

export default function SystemMessage({ message, timestamp, type }) {
  const date = parseISO(timestamp);
  const formattedDate = format(date, "d MMM, yyyy");
  const formattedTime = format(date, "h:mm a");

  return (
    <div className="message">
      {type === "connect-channel" ? (
        <EastIcon sx={{ color: "rgb(59, 165, 92)" }} />
      ) : (
        <WestIcon sx={{ color: "rgb(237, 66, 69)" }} />
      )}
      <div className="message__info">
        <h4>
          <span className="message__timestamp">
            {formattedDate} at {formattedTime}
          </span>
        </h4>
        <div>
          <p>{message}</p>
        </div>
        <div></div>
      </div>
    </div>
  );
}
