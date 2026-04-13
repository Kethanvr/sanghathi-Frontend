import React from "react";
import ChatBot from "react-chatbotify";
import { askRag } from "./apiCalls.js";

const DEPARTMENT_OPTIONS = [
  "Chemistry",
  "Civil Engineering",
  "CSE",
  "ECE",
  "ISE",
  "Mathematics",
  "Mechanical Engineering",
  "Physics",
  "MBA",
  "AI&DS",
  "AI&ML"
];

const VTU_OPTIONS = [
  "1st Sem",
  "2nd Sem",
  "3rd Sem",
  "4th Sem",
  "5th Sem",
  "6th Sem",
  "7th Sem",
  "8th Sem"
];

const IAT_OPTIONS = ["IAT 1", "IAT 2", "IAT 3"];

const getRagResponse = async (prompt) => {
  try {
    return await askRag(prompt);
  } catch (_error) {
    return "I could not fetch that right now. Please try again in a moment.";
  }
};

const MyChatBot = () => {
  const themes = [{ id: "omen", version: "0.1.0" }];

  const helpOptions = [
    "Department Location",
    "IAT dates",
    "VTU Examinations",
    "Department HOD",
    "Other question"
  ];

  const flow = {
    ask_department_location: {
      message: "Please choose the department you want to know about:",
      options: DEPARTMENT_OPTIONS,
      path: "get_department_location"
    },
    get_department_location: {
      message: async (params) => {
        return getRagResponse(
          `For CMRIT, where is the ${params.userInput} department located on campus? Reply in 2-3 sentences.`
        );
      },
      path: "repeat"
    },

    ask_vtu_exams: {
      message: "Please choose the VTU exam you want to know about:",
      options: VTU_OPTIONS,
      path: "get_vtu_exams"
    },
    get_vtu_exams: {
      message: async (params) => {
        return getRagResponse(
          `For CMRIT students, what is the latest information available for ${params.userInput} VTU examinations?`
        );
      },
      path: "repeat"
    },

    ask_iat_dates: {
      message: "Please choose the IAT dates you want to know about:",
      options: IAT_OPTIONS,
      path: "get_iat_dates"
    },
    get_iat_dates: {
      message: async (params) => {
        return getRagResponse(
          `For CMRIT, what is the date or schedule information for ${params.userInput}?`
        );
      },
      path: "repeat"
    },
    ask_hod_department: {
      message: "Please choose the department to get HOD details:",
      options: DEPARTMENT_OPTIONS,
      path: "give_hod_info"
    },

    give_hod_info: {
      message: async (params) => {
        return getRagResponse(
          `For CMRIT, who is the HOD of ${params.userInput}? Include name and designation if available.`
        );
      },
      path: "repeat"
    },

    start: {
      message: "Hi! Welcome to Sanghathi Assistant. How can I help you today?",
      transition: { duration: 1000 },
      path: "show_options"
    },
    show_options: {
      message: "Please choose from the following options:",
      options: helpOptions,
      path: "process_options"
    },
    prompt_again: {
      message: "Would you like help with anything else?",
      options: helpOptions,
      path: "process_options"
    },
    process_options: {
      transition: { duration: 0 },
      chatDisabled: true,
      path: async (params) => {
        switch (params.userInput) {
          case "Department Location":
            return "ask_department_location";
          case "IAT dates":
            return "ask_iat_dates";
          case "VTU Examinations":
            return "ask_vtu_exams";
          case "Other question":
            return "ask_gemini";
          case "Department HOD":
            return "ask_hod_department";
          default:
            return "ask_gemini";
        }
      }
    },
    ask_gemini: {
      message: "Please ask your question and I will try to help you!",
      path: "get_gemini_response"
    },
    get_gemini_response: {
      message: async (params) => {
        return getRagResponse(params.userInput);
      },
      path: "repeat"
    },
    repeat: {
      transition: { duration: 3000 },
      path: "prompt_again"
    }
  };

  return (
    <>
      <style>
        {`
    .rcb-chat-window {
      position: relative !important;
      top: auto !important;
      left: auto !important;
      width: 100% !important;
      height: min(78vh, 760px) !important;
      max-height: calc(100vh - 120px) !important;
      border-radius: 12px !important;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25) !important;
      background-color: rgba(40, 46, 62, 1) !important;
      z-index: 1 !important;
      transition: all 0.3s ease;
    }

    .rcb-chat-body-container {
      background-color: rgba(40, 46, 62, 1) !important;
      height: calc(100% - 72px) !important;
      width: 100% !important;
      overflow-y: auto;
    }

    .rcb-chat-input-textarea {
      background-color: rgba(60, 66, 82, 1) !important;
      color: white !important;
      width: 100% !important;
      border: none;
      padding: 10px;
      border-radius: 4px;
      resize: none;
    }

    @media (max-width: 768px) {
      .rcb-chat-window {
        height: 72vh !important;
        max-height: calc(100vh - 100px) !important;
      }
    }

    @media (max-width: 480px) {
      .rcb-chat-window {
        height: 68vh !important;
        max-height: calc(100vh - 88px) !important;
      }

      .rcb-chat-input-textarea {
        font-size: 14px;
      }
    }

    .rcb-chat-header-container {
      display: none !important;
    }

  `}
      </style>

      <ChatBot
        themes={themes}
        settings={{
          general: { embedded: true },
          chatHistory: { storageKey: "gemini_college_assistant" }
        }}
        flow={flow}
      />
    </>
  );
};

export default MyChatBot;
