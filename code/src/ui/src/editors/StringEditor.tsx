/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React, { useState, useEffect } from 'react';
import { DocMgr } from '../models/DocMgr';
import { TextField } from '@mui/material';
import { EditorDoc } from '../common/common';

let timeOutId: any;

interface Props {
    fieldName: string;
    label?: string;
    document: EditorDoc;
    setDocument: React.Dispatch<React.SetStateAction<EditorDoc>>;
    editMode: boolean;
    children?: React.ReactNode;
    onChange?: (document: EditorDoc, fieldName: string) => Promise<void>;
    required?: boolean;
    setError: (name: string, text: string) => void;
}

/**
 * Editor for a string field
 *
 * @param {string} props.fieldName - The field name
 * @param {string} props.label - The label for the field
 * @param {EditorDoc} props.document - The document
 * @param props.setDocument - The setter for the document
 * @param {boolean} props.editMode - True if in edit mode
 * @param props.onChange - The function to call when the document is changed
 * @param {boolean} props.required - True if the field is required
 * @param props.setError - The setter for the error
 *
 * @returns {JSX.Element} The string editor
 */
const StringEditor: React.FC<Props> = ({
    fieldName,
    label,
    document,
    setDocument,
    editMode,
    children,
    onChange,
    required = false,
    setError,
}) => {
    const docMgr = DocMgr.getInstance();
    const [initComplete, setInitComplete] = useState<boolean>(false);

    const _value = document[fieldName];
    const [value, setValue] = useState<string>(_value || '');

    async function saveData() {
        if (document[fieldName] !== value) {
            console.log('Editor state data changed=', value);
            document[fieldName] = value;
            const r = await docMgr.saveDocument(document, fieldName);
            if (r) {
                setDocument(r);
                if (onChange) {
                    onChange(r, fieldName);
                }
            }
        }
    }

    async function onEditorBlur() {
        saveData();
    }

    async function onEditorChange(event: any): Promise<void> {
        const _value = event.target.value;
        setValue(_value);
    }

    useEffect(() => {
        console.log('Init page load');
        setInitComplete(true);
    }, []);

    useEffect(() => {
        if (initComplete) {
            if (timeOutId) clearTimeout(timeOutId);
            timeOutId = setTimeout(async () => {
                timeOutId = null;
                saveData();
            }, 1000);
        }
        if (required) {
            if (value) {
                setError(fieldName, '');
            } else {
                setError(fieldName, `Field ${fieldName} is required`);
            }
        }
    }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div>
            {children && <div className="editorDescription">{children}</div>}
            <div style={{ paddingTop: '8px' }} />
            <div className="editorDiv">
                <TextField
                    id={'editor-' + fieldName}
                    value={value}
                    disabled={!editMode}
                    onBlur={onEditorBlur}
                    onChange={onEditorChange}
                    label={label}
                    sx={{
                        width: '100%',
                    }}
                />
            </div>
        </div>
    );
};

export default StringEditor;
