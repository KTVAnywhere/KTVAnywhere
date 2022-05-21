import { Dispatch, ReactNode, SetStateAction } from 'react';
import './Sidebar.css';

interface SidebarProps {
  children: ReactNode;
  trigger: boolean;
  setTrigger: Dispatch<SetStateAction<boolean>>;
}

export const LeftSidebar = ({ children, trigger, setTrigger }: SidebarProps) =>
  trigger ? (
    <div className="leftsidebar-opened">
      <div className="leftsidebar-inner">{children}</div>
      <button
        type="button"
        className="toggle-btn"
        onClick={() => setTrigger(!trigger)}
      >
        ◀
      </button>
    </div>
  ) : (
    <div className="leftsidebar-collasped">
      <button
        type="button"
        className="toggle-btn"
        onClick={() => setTrigger(!trigger)}
      >
        ▶
      </button>
    </div>
  );

export const RightSidebar = ({ children, trigger, setTrigger }: SidebarProps) =>
  trigger ? (
    <div className="rightsidebar-opened">
      <button
        type="button"
        className="toggle-btn"
        onClick={() => setTrigger(!trigger)}
      >
        ▶
      </button>
      <div className="rightsidebar-inner">{children}</div>
    </div>
  ) : (
    <div className="rightsidebar-collasped">
      <button
        type="button"
        className="toggle-btn"
        onClick={() => setTrigger(!trigger)}
      >
        ◀
      </button>
    </div>
  );

export default LeftSidebar;
