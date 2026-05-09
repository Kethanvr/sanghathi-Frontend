
import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UserForm from './UserForm';

export default function UserFormDialog({ open, onClose, editingUser, onSuccess }) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {editingUser ? 'Edit Mentor' : 'Create Mentor'}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          <UserForm 
            editingUser={editingUser} 
            onSuccess={() => {
              if (onSuccess) onSuccess();
              onClose();
            }} 
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}
