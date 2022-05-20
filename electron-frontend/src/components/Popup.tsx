import { Dispatch, ReactNode, SetStateAction } from 'react';
import './Popup.css';

interface PopupProps {
  children: ReactNode;
  trigger: boolean;
  setTrigger: Dispatch<SetStateAction<boolean>>;
}

const Popup = ({ children, trigger, setTrigger }: PopupProps) =>
  trigger ? (
    <div className="popup">
      <div className="popup-inner">
        <button
          type="button"
          className="close-btn"
          onClick={() => setTrigger(false)}
        >
          X
        </button>
        {children}
      </div>
    </div>
  ) : (
    <></>
  );

export default Popup;
