// src/components/AppBarComponent.tsx
// Changed position to "fixed" to pin it at the top without cropping
// Increased zIndex to ensure it's above other elements

import { AppBar, Toolbar, Typography } from '@mui/material';

const AppBarComponent = () => {
  return (
    <AppBar position="fixed" sx={{ zIndex: 1201 }}> {/* Changed to fixed, higher zIndex */}
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          AccessLite
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default AppBarComponent;