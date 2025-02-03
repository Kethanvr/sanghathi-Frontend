import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
} from "@mui/material";

const StudentTable = ({ students, selectedStudents, onSelectStudent }) => {
  console.log('Students data:',students);
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      onSelectStudent(students.map(student => student._id));
    } else {
      onSelectStudent([]);
    }
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              checked={selectedStudents.length === students.length}
              indeterminate={selectedStudents.length > 0 && selectedStudents.length < students.length}
              onChange={handleSelectAll}
            />
          </TableCell>
          <TableCell>Name</TableCell>
          <TableCell>USN</TableCell>
          <TableCell>Branch</TableCell>
          <TableCell>Sem</TableCell>
          <TableCell>Current Mentor</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student._id}>
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
            <TableCell>{student.name}</TableCell>
            <TableCell>{student?.profile?.usn || 'N/A'}</TableCell>
            <TableCell>{student?.profile?.department || 'N/A'}</TableCell>
            <TableCell>{student?.profile?.sem || 'N/A'}</TableCell>
            <TableCell>{student?.mentor?.name || "Not Assigned"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default StudentTable;