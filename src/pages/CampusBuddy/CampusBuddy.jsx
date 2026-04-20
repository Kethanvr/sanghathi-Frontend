import React, { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Paper,
  TextField,
  Typography,
  IconButton,
  Card,
  Container,
  Avatar,
  keyframes,
  useTheme,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { deepOrange } from "@mui/material/colors";
import AssistantIcon from "@mui/icons-material/Assistant";
import PersonIcon from "@mui/icons-material/Person";
import api from "../../utils/axios";
import { useSnackbar } from "notistack";
import logger from "../../utils/logger.js";
const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;
const ThinkingAnimation = ({ size = 40 }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: size,
        height: size,
        position: "relative",
      }}
    >
      <Box
        sx={{
          width: size / 2,
          height: size / 2,
          bgcolor: "primary.main",
          borderRadius: "50%",
          position: "absolute",
          top: 0,
          left: 0,
          animation: `${bounce} 1s ease-in-out infinite`,
          animationDelay: "-0.5s",
        }}
      />
      <Box
        sx={{
          width: size / 2,
          height: size / 2,
          bgcolor: "secondary.main",
          borderRadius: "50%",
          position: "absolute",
          top: 0,
          right: 0,
          animation: `${bounce} 1s ease-in-out infinite`,
        }}
      />
    </Box>
  );
};

const useTypewriter = (text, speed = 20) => {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (index === text.length) {
        clearTimeout(timeoutId);
        return;
      }

      setDisplayText((prevText) => prevText + text.charAt(index));
      setIndex((prevIndex) => prevIndex + 1);
    }, speed);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [text, speed, index]);

  return displayText;
};
const CampusBuddyHeader = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const colorMode = isLight ? 'primary' : 'info';

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        mt: { xs: 1, sm: 2 },
        mb: 2,
        ml: { xs: 2, sm: 4 },
        height: "auto",
        width: "100%",
      }}
    >
      <Avatar
        sx={{ 
          bgcolor: theme.palette[colorMode].main, 
          mr: 2,
          width: { xs: 40, sm: 48 },
          height: { xs: 40, sm: 48 }
        }}
        variant="rounded"
        size="large"
      >
        <AssistantIcon fontSize="large" />
      </Avatar>
      <Box>
        <Typography variant="h6" sx={{ mb: 0, fontWeight: 700 }}>
          Campus Buddy
        </Typography>
        <Typography variant="caption" sx={{ mb: 0, color: 'text.secondary' }}>
          Your Personal AI Assistant
        </Typography>
      </Box>
    </Box>
  );
};

const MOCK_MESSAGE = [
  {
    body: "Hey, I'm your Campus Buddy. How can I help you today?",
    sender: "ai",
  },
];

const CampusBuddy = () => {
  const [messages, setMessages] = useState(MOCK_MESSAGE);
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleMessageInput = (e) => {
    setMessageInput(e.target.value);
  };

  // api for communicating with campusBuddy (chatbot)
  const handleSendMessage = async () => {
    logger.info(messageInput);
    setMessageInput("");
    if (messageInput.trim().length > 0) {
      setMessages([...messages, { body: messageInput, sender: "user" }]);
      setIsLoading(true);
      try {
        const response = await api.post("campus-buddy/query", {
          query: messageInput,
        });
        const { data } = response.data;
        setMessages((prevMessages) => [
          ...prevMessages,
          { body: data.output, sender: "ai" },
        ]);
      } catch (error) {
        logger.error("Error communicating with Campus Buddy:", error);
        enqueueSnackbar(
          "Error communicating with Campus Buddy. Please try again.",
          { variant: "error" }
        );
      }
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <CampusBuddyHeader />
      <Container maxWidth="lg" sx={{ flexGrow: 1, display: "flex", flexDirection: "column", pb: 2 }}>
        <Card 
          sx={{ 
            height: { xs: "calc(100vh - 140px)", sm: "calc(100vh - 160px)", md: "70vh" },
            minHeight: "400px",
            display: "flex", 
            flexDirection: "column",
            backgroundColor: theme => theme.palette.mode === 'light' 
              ? theme.palette.background.paper 
              : theme.palette.background.paper,
            boxShadow: theme => theme.palette.mode === 'light'
              ? "0 2px 8px rgba(0,0,0,0.08)"
              : "0 2px 8px rgba(0,0,0,0.3)",
            border: theme => `1px solid ${theme.palette.divider}`
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              p: { xs: 2, sm: 3 },
              gap: 1.5,
              backgroundColor: theme => theme.palette.mode === 'light'
                ? theme.palette.background.default
                : theme.palette.background.paper,
            }}
          >
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {isLoading && <ThinkingAnimation size={24} />}
          </Box>
          <Box 
            sx={{ 
              p: 2, 
              borderTop: theme => `1px solid ${theme.palette.divider}`,
              backgroundColor: theme => theme.palette.background.paper
            }}
          >
            <ChatMessageInput
              messageInput={messageInput}
              setMessageInput={setMessageInput}
              handleSendMessage={handleSendMessage}
              handleKeyPress={handleKeyPress}
              isLoadin15;
  const typewriterText = useTypewriter(
    message.sender === "ai" ? message.body : "",
    typingSpeed
  );

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: justifyContent,
        gap: 1,
      }}
    >
      {!isUserMessage && (
        <Avatar 
          sx={{ 
            backgroundColor: theme.palette[colorMode].main,
            width: 32,
            height: 32,
            flexShrink: 0,
          }}
        >
          <AssistantIcon sx={{ fontSize: 18 }} />
        </Avatar>
      )}
      <Paper
        sx={{
          p: { xs: 1.5, sm: 2 },
          bgcolor: isUserMessage 
            ? theme.palette[colorMode].main
            : theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[800],
          color: isUserMessage ? "common.white" : theme.palette.text.primary,
          borderRadius: "12px",
          maxWidth: "70%",
          wordWrap: "break-word",
          boxShadow: isUserMessage
            ? `0 2px 8px ${theme.palette[colorMode].main}30`
            : "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
          {message.sender === "ai" ? typewriterText : message.body}
        </Typography>
      </Paper>
      {isUserMessage && (
        <Avatar 
          sx={{ 
            backgroundColor: theme.palette[colorMode].main,
            width: 32,
            height: 32,
            flexShrink: 0,
          }}
        >
          <PersonIcon sx={{ fontSize: 18 }} />
        </Avatar>
      )}ersonIcon />
          </Avatar>
        ) : (
          <Avatar 
            sx={{ mr: 1 }} 
            style={{ 
              backgroundColor: isLight ? theme.palette.primary.main : theme.palette.info.main
            }}
          >
            <AssistantIcon />
          </Avatar>
        )}
        <Typography>
          {message.sender === "ai" ? typewriterText : message.body}
        </Typography>
      </Paper>
    </Box>
  );
};
const ChatMessageInput = ({
  handleSendMessage,
  handleKeyPress,
  messageInput,
  setMessageInput,
  isLoading,
}) => {
  const theme = useTheme();
  const [isDisabled, setIsDisabled] = useState(true);

  const handleInput = (e) => {
    const { value } = e.target;
    setMessageInput(value);
    if (value.trim().length > 0) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  };

  return (
    <Stack direction="row" spacing={1} alignItems="flex-end">
      <TextField
        fullWidth
        value={messageInput}
        onChange={handleInput}
        onKeyPress={handleKeyPress}
        variant="outlined"
        size="small"
        placeholder={isLoading ? "Thinking..." : "Type your message..."}
        disabled={isLoading}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            backgroundColor: theme.palette.mode === 'light'
              ? theme.palette.background.paper
              : theme.palette.grey[900],
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: theme.palette.mode === 'light'
                ? theme.palette.grey[50]
                : theme.palette.grey[800],
            },
            "&.Mui-focused": {
              backgroundColor: theme.palette.background.paper,
            }
          }
        }}
        InputProps={{
          endAdornment: (
            <IconButton
              size="small"
              color={theme.palette.mode === 'light' ? 'primary' : 'info'}
              disabled={isDisabled || isLoading}
              onClick={handleSendMessage}
              sx={{
                transition: "all 0.2s ease",
                "&:hover:not(:disabled)": {
                  transform: "scale(1.1)",
                }
              }}
            >
              <SendIcon />
            </IconButton>
          ),
        }}
      />
    </Stack>
  );
};

export default CampusBuddy;
