/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { TextField } from '@mui/material';

interface Props {
    label: string;
    handleAdd(value: string): void;
    disabled?: boolean;
}

/**
 * Renders the AddPerson component.
 *
 * @param {string} props.label - The label for the input field.
 * @param {function} props.handleAdd - The function to handle adding a new input value.
 * @param {boolean} props.disabled - Flag to disable the component.
 *
 * @returns {JSX.Element}
 */
const AddPerson: React.FC<Props> = ({ label, handleAdd, disabled }) => {
    const [input, setInput] = useState<string>('');

    if (disabled) {
        return <></>;
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <TextField
                id="newGroupName"
                className="text"
                type="input"
                disabled={disabled}
                // style={{width:"350px"}}
                label={label}
                value={input}
                onChange={(e: any) => setInput(e.target.value)}
            ></TextField>
            &nbsp; &nbsp;{' '}
            <IconButton
                disabled={disabled}
                onClick={() => {
                    handleAdd(input);
                    setInput('');
                }}
                aria-label={'Add'}
            >
                <AddIcon />
            </IconButton>
        </div>
    );
};

export default AddPerson;
