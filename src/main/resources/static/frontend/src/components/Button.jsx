import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import './Button.css';

const Button = ({ label, fontIcon, type = "button", onClick }) => {
    const [ariaPressed, setAriaPressed] = useState(false);
    const [faIcon, setFaIcon] = useState(fontIcon);
    const buttonRef = useRef(null);

    const onButtonClick = (event) => {
        const newAriaPressed = !ariaPressed;
        setAriaPressed(newAriaPressed);

        const iconToSet = newAriaPressed ? faThumbsUp : fontIcon;
        setFaIcon(<FontAwesomeIcon icon={iconToSet} />);

        if (newAriaPressed) {
            setTimeout(() => {
                setAriaPressed(false);
                setFaIcon(<FontAwesomeIcon icon={fontIcon} />);
            }, 1555);
        }
        console.log("Button clicked. New state is:", newAriaPressed);
        if (type !== "submit" && onClick) {
            onClick(event);
        }
    };

    useEffect(() => {
        if (type === "submit" && !ariaPressed) {
          setFaIcon(fontIcon);
        }
      }, [ariaPressed, fontIcon, type]);
    

    return (
        <button
            className={`button-${label}`}
            ref={buttonRef}
            onClick={onButtonClick}
            type={type}
            aria-pressed={ariaPressed}
            aria-label={label}
        >
            <span className="icon">{fontIcon}</span>
            <span className="button-label">{label}</span>
        </button>
    );
};

export default Button;
