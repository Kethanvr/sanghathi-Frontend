import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  Tooltip,
  Chip,
  Avatar,
  Box,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";
import useResponsive from "../../hooks/useResponsive";

import logger from "../../utils/logger.js";
const StudentTable = ({ students, selectedStudents, onSelectStudent, theme, isLight }) => {
  const isMobile = useResponsive("down", "sm");

  // Helper function to safely get profile data
  const getProfileData = (student, field) => {
    // Check all possible paths where the data might be
    if (student?.profile && student.profile[field]) {
      return student.profile[field];
    }
    
    if (student?.studentProfile && student.studentProfile[field]) {
      return student.studentProfile[field];
    }
    
    if (student?.[field]) {
      return student[field];
    }
    
    return 'N/A';
  };
  
  // Helper function to get mentor information
  const getMentorInfo = (student) => {
    // Check all possible paths where mentor data might be
    if (student?.mentor?.name) {
      return student.mentor.name;
    }
    
    if (student?.mentorName) {
      return student.mentorName;
    }
    
    if (student?.mentorId?.name) {
      return student.mentorId.name;
    }
    
    if (student?.mentorDetails?.name) {
      return student.mentorDetails.name;
    }
    
    // If we have a nested structure
    if (student?.mentor?.mentorDetails?.name) {
      return student.mentor.mentorDetails.name;
    }
    
    logger.info("Mentor data for debugging:", student.mentor);
    return null;
  };
  
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      onSelectStudent(students.map(student => student._id));
    } else {
      onSelectStudent([]);
    }
  };

  return (
    <Table sx={{ minWidth: { xs: 680, md: "100%" } }}>
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              checked={selectedStudents.length === students.length && students.length > 0}
              indeterminate={selectedStudents.length > 0 && selectedStudents.length < students.length}
              onChange={handleSelectAll}
            />
          </TableCell>
          <TableCell>Name</TableCell>
          <TableCell>USN</TableCell>
          <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Department</TableCell>
          <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Sem</TableCell>
          <TableCell>Current Mentor</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {students.map((student) => {
          const mentorName = getMentorInfo(student);
          
          return (
            <TableRow 
              key={student._id}
              hover
              sx={{ 
                '&:hover': {
                  backgroundColor: isLight 
                    ? alpha(theme.palette.primary.main, 0.05)
                    : alpha(theme.palette.info.main, 0.05)
                }
              }}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedStudents.includes(student._id)}
                  onChange={(event) => {
                    if (event.target.checked) {
                      onSelectStudent([...selectedStudents, student._id]);
                    } else {
                      onSelectStudent(selectedStudents.filter(id => id !== student._id));
                    }
                  }}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    sx={{ width: 36, height: 36, bgcolor: 'info.main' }}
                  >
                    {student.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {student.name || 'Unknown'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getProfileData(student, 'usn')}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Tooltip title={getProfileData(student, 'usn') === 'N/A' ? 'USN not available' : ''}>
                  <Chip 
                    label={getProfileData(student, 'usn')} 
                    size="small" 
                    variant="outlined"
                    sx={{ borderRadius: 1, fontSize: '0.75rem' }}
                  />
                </Tooltip>
              </TableCell>
              <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                <Tooltip title={getProfileData(student, 'department') === 'N/A' ? 'Branch not available' : ''}>
                  <span>{getProfileData(student, 'department')}</span>
                </Tooltip>
              </TableCell>
              <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                <Tooltip title={getProfileData(student, 'sem') === 'N/A' ? 'Semester not available' : ''}>
                  <span>{getProfileData(student, 'sem')}</span>
                </Tooltip>
              </TableCell>
              <TableCell>
                {mentorName ? (
                  <Chip 
                    icon={<PersonIcon />} 
                    label={mentorName}
                    size="small"
                    sx={{
                      backgroundColor: isLight 
                        ? alpha(theme.palette.success.main, 0.1) 
                        : alpha(theme.palette.success.main, 0.2),
                      color: isLight 
                        ? theme.palette.success.dark 
                        : theme.palette.success.light,
                      fontWeight: 500,
                    }}
                  />
                ) : (
                  <Chip 
                    label={isMobile ? "Unassigned" : "Not Assigned"}
                    size="small"
                    sx={{
                      backgroundColor: isLight 
                        ? alpha(theme.palette.text.secondary, 0.1) 
                        : alpha(theme.palette.text.secondary, 0.2),
                      color: theme.palette.text.secondary,
                    }}
                  />
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default StudentTable;