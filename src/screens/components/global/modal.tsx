import React from 'react';
import '../styles/components.css';
import { children } from 'types/interfaces';

type Props = {
    isOpen: boolean,
    onClose: (e: any) => void,
    children: any | null
}

const Modal = ({ isOpen, onClose, children }: Props) => {
  return (
    <>
      {isOpen && (
        <div className="modal-overlay">
             <span className="modal-close" onClick={onClose}>
              &times;
            </span>
          <div className="modal-content">
           {children}
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;