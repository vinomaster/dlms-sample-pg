/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React from 'react';
import RadioButton from './RadioButton';

interface Props {
    buttons: string;
    setButtons: any; //React.Dispatch<React.SetStateAction<string>>;
    handleRadioButtons(e: any): void;
    allowedSelections: any;
}

/**
 * Renders a set of radio buttons based on the provided parameters.
 *
 * @param {string} props.buttons - The currently selected button
 * @param props.setButtons - The function to set the selected button
 * @param {function} props.handleRadioButtons - The function to handle radio button selection
 * @param props.allowedSelections - The object containing information about allowed selections
 *
 * @returns {JSX.Element}
 */
const RadioButtons: React.FC<Props> = ({
    buttons,
    setButtons,
    handleRadioButtons,
    allowedSelections,
}) => {
    if (!allowedSelections.managed && !allowedSelections.assigned) {
        return <div></div>;
    }

    return (
        <div className="button-container">
            <RadioButton
                changed={handleRadioButtons}
                id="1"
                isSelected={buttons === 'mine'}
                label="My Requests"
                value="mine"
            />
            {allowedSelections.managed && (
                <RadioButton
                    changed={handleRadioButtons}
                    id="2"
                    isSelected={buttons === 'managed'}
                    label="All Employee Requests"
                    value="managed"
                />
            )}
            {allowedSelections.assigned && (
                <RadioButton
                    changed={handleRadioButtons}
                    id="3"
                    isSelected={buttons === 'assigned'}
                    label="Requests Assigned to Me"
                    value="assigned"
                />
            )}
        </div>
    );
};

export default RadioButtons;
