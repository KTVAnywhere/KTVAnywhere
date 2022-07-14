import { ReactNode } from 'react';
import { Drawer } from '@mui/material';
import { GetColorTheme } from '../Settings';
import { TITLE_BAR_HEIGHT } from '../TitleBar';

interface SidebarProps {
  children: ReactNode;
}

const DRAWER_HEIGHT = 'calc(100vh - 130px)';

export const LeftSidebar = ({ children }: SidebarProps) => {
  const backgroundColor = GetColorTheme().sidebarBackground;

  return (
    <Drawer
      sx={{
        '& .MuiDrawer-paper': {
          width: '330px',
          height: DRAWER_HEIGHT,
          boxSizing: 'border-box',
          background: backgroundColor,
          top: TITLE_BAR_HEIGHT,
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
  const backgroundColor = GetColorTheme().sidebarBackground;

  return (
    <Drawer
      sx={{
        '& .MuiDrawer-paper': {
          width: '330px',
          height: DRAWER_HEIGHT,
          boxSizing: 'border-box',
          alignItems: 'center',
          background: backgroundColor,
          top: TITLE_BAR_HEIGHT,
        },
      }}
      variant="permanent"
      anchor="right"
    >
      {children}
    </Drawer>
  );
};
