import { AppBar, Toolbar, Typography } from '@mui/material';

const AppBarComponent = () => {
  return (
    <AppBar position="static" sx={{ zIndex: 10 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          AccessLite
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default AppBarComponent;