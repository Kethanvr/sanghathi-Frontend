import PropTypes from "prop-types";
import { useState, useContext } from "react";

import ChatContext from "../../context/ChatContext";
// @mui
import { styled } from "@mui/material/styles";
import { Input, Divider, IconButton } from "@mui/material";

import Iconify from "../Iconify";

const RootStyle = styled("div")(({ theme }) => ({
  minHeight: 56,
  display: "flex",
  position: "relative",
  alignItems: "center",
  paddingLeft: theme.spacing(2),
}));

// ----------------------------------------------------------------------

ChatMessageInput.propTypes = {
  disabled: PropTypes.bool,
  conversationId: PropTypes.string,
  onSend: PropTypes.func,
};

export default function ChatMessageInput({ disabled, conversationId, onSend }) {
  const [message, setMessage] = useState("");

  const { sendMessage } = useContext(ChatContext);

  const handleKeyUp = (event) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  const handleSend = () => {
    if (!message) {
      return "";
    }

    sendMessage(message);
    setMessage("");
  };

  return (
    <RootStyle>
      <Input
        disabled={disabled}
        fullWidth
        value={message}
        disableUnderline
        onKeyUp={handleKeyUp}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Type a message"
        endAdornment={
          null
        }
      />

      <Divider orientation="vertical" flexItem />

      <IconButton
        color="primary"
        disabled={!message}
        onClick={handleSend}
        sx={{ mx: 1 }}
      >
        <Iconify icon="ic:round-send" width={22} height={22} />
      </IconButton>
    </RootStyle>
  );
}
