import { useState, useEffect, useContext } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const Attendance = () => {
  const { user } = useContext(AuthContext);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(0);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/students/attendance/${user._id}`
        );
        const attendanceData = response.data.data.attendance;
        const transformed = transformBackendData(attendanceData);
        setAttendanceData(transformed);
        
        // Update selected semester based on fetched data
        if (transformed.length > 0) {
          setSelectedSemester(transformed[0].semester);
        }
        
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch attendance data");
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user.id]);
  const transformBackendData = (backendData) => {
    if (!backendData || !backendData.subjects || backendData.subjects.length === 0) {
      console.warn("No valid data found in backend response.");
      return [];
    }
    const subjectsMap = {};

    return backendData.subjects.map((subject) => ({
      subjectName: subject.subjectName,
      semester: backendData.semester,
      subjectCode: subject.subjectCode || "N/A",
      months: [
        {
          month: backendData.month,
          classesTaken: subject.totalClasses,
          classesAttended: subject.attendedClasses,
        },
      ],
    }));
  };

  const getCumulativeAttendance = (subject) => {
    const totalAttended = subject.months.reduce((sum, month) => sum + month.classesAttended, 0);
    const totalTaken = subject.months.reduce((sum, month) => sum + month.classesTaken, 0);
    
    if (totalTaken === 0) return "No Data"; // Prevent division by zero
  
    const percentage = ((totalAttended / totalTaken) * 100).toFixed(2);
    return `${totalAttended}/${totalTaken} (${percentage}%)`;
  };

  const getOverallAttendance = () => {
    const attended = attendanceData.reduce((total, subject) => {
      const attended = subject.months.reduce(
        (total, month) => total + month.classesAttended,
        0
      );
      return total + attended;
    }, 0);
    const taken = attendanceData.reduce((total, subject) => {
      const taken = subject.months.reduce(
        (total, month) => total + month.classesTaken,
        0
      );
      return total + taken;
    }, 0);
    const percentage = ((attended / taken) * 100).toFixed(2);
    return `${attended}/${taken} (${percentage}%)`;
  };

  useEffect(() => {
    // Add code to send notification if overall attendance is less than 75%
  }, [getOverallAttendance()]);

  const getMonthAttendance = (subject) => {
    if (selectedMonth === 0) { // If "All" is selected, show total attendance
      const totalAttended = subject.months.reduce((sum, m) => sum + m.classesAttended, 0);
      const totalTaken = subject.months.reduce((sum, m) => sum + m.classesTaken, 0);
      if (totalTaken === 0) return "No Data";
      const percentage = ((totalAttended / totalTaken) * 100).toFixed(2);
      return `${totalAttended}/${totalTaken} (${percentage}%)`;
    }
  
    // If a specific month is selected
    const monthData = subject.months.find(m => m.month === selectedMonth);
    if (!monthData) return "No Data";
    
    const { classesAttended, classesTaken } = monthData;
    const percentage = ((classesAttended / classesTaken) * 100).toFixed(2);
    return `${classesAttended}/${classesTaken} (${percentage}%)`;
  };
  

  return (
    <Box sx={{ p: 2 }}>
      <h1 sx={{ textAlign: "center", mb: 2 }}>Attendance Report</h1>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <label>
          Select Semester:
          <Select
            value={selectedSemester}
            // onChange={handleSemesterChange}
            sx={{ ml: 1 }}
          >
            {Array.from({ length: 8 }, (_, index) => (
              <MenuItem key={index + 1} value={index + 1}>
                Semester {index + 1}
              </MenuItem>
            ))}
          </Select>
        </label>
        <Box sx={{ ml: 2 }}>
          <label>
            Select Month:
            <Select
              value={selectedMonth}
              // onChange={handleMonthChange}
              sx={{ ml: 1 }}
            >
              <MenuItem value={0}>All</MenuItem>
              {Array.from({ length: 3 }, (_, index) => (
                <MenuItem key={index + 1} value={index + 1}>
                  Month {index + 1}
                </MenuItem>
              ))}
            </Select>
          </label>
        </Box>
      </Box>
      <TableContainer sx={{ border: "1px solid gray" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ border: "1px solid gray" }}>
                Subject Code
              </TableCell>
              <TableCell sx={{ border: "1px solid gray" }}>
                Subject Name
              </TableCell>
              <TableCell sx={{ border: "1px solid gray" }}>
                Attendance
              </TableCell>
              <TableCell sx={{ border: "1px solid gray" }}>
                Cumulative Attendance
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendanceData
              .filter((subject) => subject.semester === selectedSemester)
              .map((subject) => (
                <TableRow key={subject.subjectCode}>
                  <TableCell sx={{ border: "1px solid gray" }}>
                    {subject.subjectCode}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid gray" }}>
                    {subject.subjectName}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid gray" }}>
                    {getMonthAttendance(subject)}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid gray" }}>
                    {getCumulativeAttendance(subject)}
                  </TableCell>
                </TableRow>
              ))}
            <TableRow sx={{ fontWeight: "bold" }}>
              <TableCell colSpan={2}>Overall Attendance</TableCell>
              <TableCell>
                {getOverallAttendance()}{" "}
                <Box component="span" sx={{ ml: 1 }}>
                  (for all subjects)
                </Box>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Attendance;
