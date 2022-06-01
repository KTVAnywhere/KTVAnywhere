import { ReactNode } from 'react';
import { Drawer } from '@mui/material';
import './Sidebar.css';

interface SidebarProps {
  children: ReactNode;
}

const drawerWidth = '16%';
const drawerHeight = '88%';

export const LeftSidebar = ({ children }: SidebarProps) => {
  return (
    <Drawer
      sx={{
        width: drawerWidth,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          height: drawerHeight,
          boxSizing: 'border-box',
          alignItems: 'center',
        },
        padding: 2,
      }}
      variant="permanent"
      anchor="left"
    >
      {children}
    </Drawer>
  );
};

export const RightSidebar = ({ children }: SidebarProps) => {
  return (
    <Drawer
      sx={{
        maxWidth: drawerWidth,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          height: drawerHeight,
          boxSizing: 'border-box',
          alignItems: 'center',
        },
      }}
      variant="permanent"
      anchor="right"
    >
      {children}
    </Drawer>
  );
};

export default LeftSidebar;
