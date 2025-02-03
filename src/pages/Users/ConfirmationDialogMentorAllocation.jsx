import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

const ConfirmationDialogMentor = ({ open, onClose, onConfirm, assignedStudents }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Warning: Mentor Reassignment</DialogTitle>
      <DialogContent>
        <Typography>
          {assignedStudents.length > 1
            ? `${assignedStudents.length} selected students already have mentors assigned.`
            : "Selected student already has a mentor assigned."}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          Would you like to reassign {assignedStudents.length > 1 ? 'these students' : 'this student'} to a new mentor?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Current assignments:
        </Typography>
        {assignedStudents.map((student) => (
          <Typography key={student._id} variant="body2" color="text.secondary">
            • {student.name} - Currently assigned to {student.mentor.name}
          </Typography>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="primary" variant="contained">
          Proceed with Reassignment
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialogMentor;