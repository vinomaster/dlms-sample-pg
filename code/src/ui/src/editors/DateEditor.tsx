/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React, { useState, useEffect } from 'react';
import { DocMgr } from '../models/DocMgr';
import { Input } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import { EditorDoc } from '../common/common';
import 'react-datepicker/dist/react-datepicker.css';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';

let timeOutId: any;

interface Props {
    fieldName: string;
    document: EditorDoc;
    setDocument: React.Dispatch<React.SetStateAction<EditorDoc>>;
    editMode: boolean;
    onChange?: (document: EditorDoc, fieldName: string) => Promise<void>;
    required?: boolean;
    setError: (name: string, text: string) => void;
}

/**
 * Component for rendering date editor
 *
 * @param {string} props.feildName - The field name
 * @param {EditorDoc} props.document - The document
 * @param props.setDocument - The function to set the document
 * @param {boolean} props.editMode - The edit mode
 * @param props.onChange - The function to call when the data changes
 * @param {boolean} props.required - The required flag
 * @param {any} props.setError - The function to set the error
 *
 * @returns {JSX.Element} The DateEditor component
 */
const DateEditor: React.FC<Props> = ({
    fieldName,
    document,
    setDocument,
    editMode,
    onChange,
    required = false,
    setError,
}) => {
    const docMgr = DocMgr.getInstance();
    const [initComplete, setInitComplete] = useState<boolean>(false);

    const _value = document[fieldName];
    const __value = dayjs(_value);
    const [value, setValue] = useState<Dayjs | null>(
        _value && __value.isValid() ? __value : null
    );

    async function saveData() {
        const newValue = value?.toDate().getTime();
        if (document[fieldName] !== newValue) {
            console.log('Editor state data changed=', newValue);

            // //@TODO: How to unset an optional document field that has been previously set???
            document[fieldName] = newValue ? newValue : 0; //undefined;
            const r = await docMgr.saveDocument(document, fieldName);
            if (r) {
                setDocument(r);
                if (onChange) {
                    onChange(r, fieldName);
                }
            }
        }
    }

    async function onEditorChange(date: any): Promise<void> {
        if (date) {
            setValue(date);
        } else {
            setValue(null);
        }
    }

    useEffect(() => {
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
            if (value && !value.isValid()) {
                setError(fieldName, '');
            } else {
                setError(fieldName, `Field ${fieldName} is required`);
            }
        }
    }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

    if (editMode) {
        console.log('value=', value?.valueOf());
        return (
            <div>
                <div style={{ paddingTop: '8px' }} />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        value={value}
                        onChange={(value: any) => {
                            console.log('date change=', value);
                            onEditorChange(value);
                        }}
                    />
                </LocalizationProvider>
                {(!value || !value.isValid()) && required && (
                    <div
                        style={{
                            color: '#A01C2B',
                            fontSize: '14px',
                            marginLeft: '10px',
                            marginTop: '10px',
                        }}
                    >
                        <ErrorIcon style={{ width: '12px', height: '12px' }} />{' '}
                        This selection is required.
                    </div>
                )}
            </div>
        );
    } else {
        return (
            <div>
                <div style={{ paddingTop: '8px' }} />
                <div className="editorDiv">
                    <Input
                        value={value ? value.format('MM/DD/YYYY') : ''}
                        disabled={true}
                        sx={{
                            '& .Mui-disabled': {
                                color: '#23233F !important',
                                WebkitTextFillColor: '#23233F !important',
                            },
                        }}
                    />
                </div>
            </div>
        );
    }
};

export default DateEditor;
