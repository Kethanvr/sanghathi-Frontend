import React, { useState, useEffect } from "react";
import {
  Box,
  TableContainer,
  Paper,
  Container,
  MenuItem,
  Select,
  Button,
} from "@mui/material";
import ConfirmationDialogMentor from '../Users/ConfirmationDialogMentorAllocation';
import Page from "../../components/Page";
import api from "../../utils/axios";
import StudentTable from "./StudentTable";
import MentorAssignmentDialog from "./MentorAssignmentDialog";

const MentorAllocation = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterOption, setFilterOption] = useState("all");
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [studentsWithMentors, setStudentsWithMentors] = useState([]);
  const [filterSem, setFilterSem] = useState("all");
  const [filterBranch, setFilterBranch] = useState("all");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get("/students");
        const { data } = response.data;
        console.log("Fetched data",data);
        
        setStudents(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchStudents();
  }, []);

  const refreshStudents = async () => {
    const fetchStudents = async () => {
      try {
        const response = await api.get("/students");
        const { data } = response.data;
        setStudents(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchStudents();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    refreshStudents(); 
  };

  const filteredStudents = students.filter((student) => {
    const matchesMentorFilter =
      filterOption === "all" ||
      (filterOption === "assigned" && student.mentor && student.mentor.name) ||
      (filterOption === "unassigned" && (!student.mentor || !student.mentor.name));

    const matchesSemFilter = filterSem === "all" || student.profile?.sem === filterSem;
    const matchesBranchFilter =
      filterBranch === "all" || student.profile?.department === filterBranch;

    return matchesMentorFilter && matchesSemFilter && matchesBranchFilter;
  });


  const handleAssignMentor = () => {
    setDialogOpen(true);
  };

  const handleAssignClick = () => {
    // Filter selected students who already have mentors
    const assignedStudents = students.filter(
      student => 
        selectedStudents.includes(student._id) && 
        student.mentor && 
        student.mentor.name
    );

    if (assignedStudents.length > 0) {
      setStudentsWithMentors(assignedStudents);
      setConfirmationOpen(true);
    } else {
      setDialogOpen(true);
    }
  };

  const handleConfirmReassignment = () => {
    setConfirmationOpen(false);
    setDialogOpen(true);
  };
  const uniqueSems = [
    "all",
    ...new Set(students.map((student) => student.profile?.sem).filter(Boolean)),
  ];
  const uniqueBranches = [
    "all",
    ...new Set(
      students.map((student) => student.profile?.department).filter(Boolean)
    ),
  ];


  return (
    <Page title="User: Account Settings">
      <Container maxWidth="lg">
        <TableContainer component={Paper}>
          <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
              <Select
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
              >
                <MenuItem value="all">All Students</MenuItem>
                <MenuItem value="assigned">Assigned Mentors</MenuItem>
                <MenuItem value="unassigned">Unassigned Mentors</MenuItem>
              </Select>
              {/* Semester Filter */}
              <Select
                value={filterSem}
                onChange={(e) => setFilterSem(e.target.value)}
              >
                {uniqueSems.map((sem) => (
                  <MenuItem key={sem} value={sem}>
                    {sem === "all" ? "All Semesters" : `Sem ${sem}`}
                  </MenuItem>
                ))}
              </Select>

              {/* Branch Filter */}
              <Select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
              >
                {uniqueBranches.map((branch) => (
                  <MenuItem key={branch} value={branch}>
                    {branch === "all" ? "All Branches" : branch}
                  </MenuItem>
                ))}
              </Select>
              
              <Button
                variant="contained"
                color="primary"
                disabled={selectedStudents.length === 0}
                onClick={handleAssignClick}
              >
                Assign Mentor to Selected
              </Button>
            </Box>

            <StudentTable
              students={filteredStudents}
              selectedStudents={selectedStudents}
              onSelectStudent={setSelectedStudents}
            />
          </Box>
        </TableContainer>
      </Container>

      <ConfirmationDialogMentor
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={handleConfirmReassignment}
        assignedStudents={studentsWithMentors}
      />

      <MentorAssignmentDialog
        open={dialogOpen}
        studentIds={selectedStudents}
        onClose={() => {
          setDialogOpen(false);
          setSelectedStudents([]);
        }}
      />
    </Page>
  );
};

export default MentorAllocation;
