import { ReactNode } from 'react';
import { Drawer } from '@mui/material';

interface SidebarProps {
  children: ReactNode;
}

const backgroundColor = '#2C2F33';
const drawerHeight = 'calc(100vh - 130px)';
export const LeftSidebar = ({ children }: SidebarProps) => {
  return (
    <Drawer
      sx={{
        '& .MuiDrawer-paper': {
          height: drawerHeight,
          boxSizing: 'border-box',
          background: backgroundColor,
        },
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
        '& .MuiDrawer-paper': {
          minWidth: '330px',
          height: drawerHeight,
          boxSizing: 'border-box',
          alignItems: 'center',
          background: backgroundColor,
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
