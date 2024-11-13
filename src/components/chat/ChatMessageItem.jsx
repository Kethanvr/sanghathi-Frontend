import React,{ useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Box, Avatar, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { formatDistanceToNowStrict } from "date-fns";


const RootStyle = styled("div")(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const ContentStyle = styled("div")(({ theme }) => ({
  maxWidth: 380,
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.grey[500_12],
  color: theme.palette.text.primary,
}));

export default function ChatMessageItem({ message, conversation }) {
  const { user } = useContext(AuthContext);
  const currentUserId = user?.id; // You may want to get this dynamically (e.g., from state or context)
 
  console.log("Message Sender ID:", message.senderId);
  console.log("Participants:", conversation?.participants);
  
  conversation?.participants?.forEach((participant) => {
    console.log("Participant ID:", participant._id);

    console.log("Complete Conversation Data:", conversation);

  });
  
  
  // Ensure that conversation and participants exist and handle undefined cases
  // const sender = conversation?.participants?.find(
  //   (participant) => participant._id === message.senderId
  // );
  const sender = conversation?.participants?.find(
    (participant) => String(participant._id) === String(message.senderId)
  );
  console.log("Sender after type matching:", sender);

if (!conversation || !Array.isArray(conversation.participants)) {
  return <p>Loading...</p>; // Or handle the loading state appropriately
}
  

  console.log("Sender from participants:",sender);
  // Safely access sender details
  const isMe = message.senderId === currentUserId;
  const justifyContent = isMe ? "flex-end" : "flex-start";




  // Safely extract the first name
  const firstName = sender?.name?.split(" ")[0] || "Unknown";  // Default to "Unknown" if sender.name is undefined

  return (
    <RootStyle>
      <Box sx={{ display: "flex", justifyContent }}>
        {!isMe && sender && sender.avatar && (
          <Avatar alt={sender.name} src={sender.avatar} sx={{ width: 32, height: 32, mr: 2 }} />
        )}

        <div>
          <ContentStyle sx={{ ...(isMe && { color: "grey.800", bgcolor: "primary.lighter" }) }}>
            <Typography variant="body2">{message.body}</Typography>
          </ContentStyle>
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              textAlign: isMe ? "right" : "left",
            }}
          >
            {!isMe && `${firstName}, `}
            {formatDistanceToNowStrict(new Date(message.createdAt), {
              addSuffix: true,
            })}
          </Typography>
        </div>
      </Box>
    </RootStyle>
  );
}
