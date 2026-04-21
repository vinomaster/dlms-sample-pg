/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React from 'react';
import { Radio } from '@mui/material';

interface Props {
    id: string;
    changed(e: any): void;
    value: string;
    isSelected: boolean;
    label: string;
    disabled?: boolean;
}

/**
 * Renders a radio button element.
 *
 * @param {string} props.id - The unique identifier for the radio button
 * @param {function} props.changed - The function to call when the radio button changes
 * @param {string} props.value - The value of the radio button
 * @param {boolean} props.isSelected - Indicates if the radio button is selected
 * @param {string} props.label - The label text for the radio button
 * @param {boolean} props.disabled - Indicates if the radio button is disabled
 *
 * @returns {JSX.Element} The rendered radio button component
 */
const RadioButton: React.FC<Props> = ({
    id,
    changed,
    value,
    isSelected,
    label,
    disabled,
}) => {
    return (
        <div className="RadioButton">
            <Radio
                id={id}
                onChange={changed}
                value={value}
                // type="radio"
                checked={isSelected}
                aria-label={label}
                disabled={disabled}
            />
        </div>
    );
};

export default RadioButton;
