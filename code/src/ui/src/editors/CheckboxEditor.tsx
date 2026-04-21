/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React, { useState, useEffect } from 'react';
import { DocMgr } from '../models/DocMgr';
import { Checkbox } from '@mui/material';
import { EditorDoc } from '../common/common';

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
 * Function to handle saving checkbox editor data and triggering onChange callback.
 *
 * @param {any} props.feildName - The field name
 * @param {string} props.label - The label
 * @param {EditorDoc} props.document - The document
 * @param props.setDocument - The function to set the document
 * @param {boolean} props.editMode - Indicates whether the editor is in edit mode
 * @param {React.ReactNode} props.children - The checkbox editor content
 * @param props.onChange - The function to call when the data is changed
 * @param {boolean} props.required - Indicates whether the field is required
 * @param props.setError - The function to set the error
 *
 * @returns {JSX.Element} The checkbox editor compoonent
 */
const CheckboxEditor: React.FC<Props> = ({
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
    const [value, setValue] = useState<boolean>(_value || false);

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

    async function onEditorChange(event: any, value: any): Promise<void> {
        setValue(value);
    }

    useEffect(() => {
        console.log('Init page load');
        setInitComplete(true);
    }, []);

    useEffect(() => {
        if (initComplete) {
            saveData();
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
                <Checkbox
                    id={'editor-' + fieldName}
                    checked={value}
                    disabled={!editMode}
                    onChange={onEditorChange}
                    aria-label={label}
                />
            </div>
        </div>
    );
};

export default CheckboxEditor;
