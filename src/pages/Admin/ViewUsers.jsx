import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const ViewUsers = ({ groupedData }) => {
  // Structure: groupedData = [{ semester: "1", branch: "CS", users: [...] }, ...]
  
  // Group data by semester
  const groupedBySemester = groupedData?.reduce((acc, group) => {
    const semester = group.semester;
    if (!acc[semester]) acc[semester] = [];
    acc[semester].push(group);
    return acc;
  }, {});

  return (
    <div>
      {Object.entries(groupedBySemester || {}).map(([semester, groups]) => (
        <Accordion key={semester} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Semester {semester}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {groups.map(({ branch, users }) => (
              <div key={`${semester}-${branch}`} style={{ marginBottom: '2rem' }}>
                <Typography variant="subtitle1" sx={{ 
                  backgroundColor: '#f5f5f5',
                  padding: '8px',
                  borderRadius: '4px',
                  marginBottom: '1rem'
                }}>
                  {branch} Branch
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>USN</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Phone</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Mentor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users?.map((user) => (
                      <TableRow key={user._id} hover>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.usn}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          {user.mentor?.name || 'Unassigned'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

export default ViewUsers;