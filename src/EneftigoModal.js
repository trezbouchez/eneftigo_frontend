import PropTypes from 'prop-types';
import clsx from 'clsx';
import { styled, Box } from '@mui/system';
import ModalUnstyled from '@mui/base/ModalUnstyled';
import { shadows } from '@mui/system';
import { forwardRef } from 'react';
import icon_close_off from './assets/close_off.png';
import icon_close_on from './assets/close_on.png';
import icon_help_off from './assets/help_off.png';
import icon_help_on from './assets/help_on.png';

const BackdropUnstyled = forwardRef((props, ref) => {
    const { open, className, ...other } = props;
    return (
        <div
            className={clsx({ 'MuiBackdrop-open': open }, className)}
            ref={ref}
            {...other}
        />
    );
});

BackdropUnstyled.propTypes = {
    className: PropTypes.string.isRequired,
    open: PropTypes.bool,
};

const Modal = styled(ModalUnstyled)`
  position: fixed;
  z-index: 1300;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Backdrop = styled(BackdropUnstyled)`
  z-index: -1;
  position: fixed;
  right: 0;
  bottom: 0;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.85);
  -webkit-tap-highlight-color: transparent;
`;

const style = (theme) => ({
    background: 'linear-gradient(var(--eneftigo-black), var(--eneftigo-very-dark-grey))',
    border: '0.5px solid var(--eneftigo-white)',
    borderRadius: '5px',
    padding: '0px 0px 0px 0px',
    overflow: 'hidden',
    boxShadow: 15,
});

export function EneftigoModal({ open, title, handleClose, content, handleHelp = null }) {
    return (
        <Modal
            aria-labelledby="unstyled-modal-title"
            aria-describedby="unstyled-modal-description"
            open={open}
            slots={{ backdrop: Backdrop }}
            disableAutoFocus={true}
        >
            <Box sx={style}>
                <ModalHeader
                    title={title}
                    handleHelp={handleHelp}
                    handleClose={handleClose}
                />
                {content}
            </Box>
        </Modal>
    );
}

function ModalHeader({ title, handleHelp, handleClose }) {
    return (
        <div
            className="modal-header"
            style={{
                display: 'flex',
                alignContent: 'normal',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: 'row',
                borderBottom: '1.5px solid var(--eneftigo-black)',
            }}>
            <img
                style={{
                    marginLeft: "10px",
                    marginRight: "-25px",
                    marginTop: "4px",
                    marginBottom: "4px",
                    visibility: handleHelp !== null ? "visible" : "hidden"
                }}
                src={icon_help_off}
                width="18"
                height="18"
                alt="?"
                onMouseEnter={(e) => e.target.src = icon_help_on}
                onMouseLeave={(e) => e.target.src = icon_help_off}
                onClick={handleHelp}
            />
            <p style={{
                margin: "auto",
                fontFamily: "var(--eneftigo-header-font-family)",
                fontSize: "17px"
            }}>{title}</p>
            <img
                style={{
                    marginLeft: "-25px",
                    marginRight: "10px",
                    marginTop: "4px",
                    marginBottom: "4px",
                    visibility: handleClose !== null ? "visible" : "hidden"
                }}
                src={icon_close_off}
                width="20"
                height="20"
                alt="X"
                onMouseEnter={(e) => e.target.src = icon_close_on}
                onMouseLeave={(e) => e.target.src = icon_close_off}
                onClick={handleClose}
            />
        </div>
    );
}
