/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React, { useEffect } from 'react';
import { useState } from 'react';
import { Button, Radio } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import { IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { TextField } from '@mui/material';
import { styled } from '@mui/material';
import { EditorDoc } from '../common/common';
import { AppContext } from '../common/states';
import { DocMgr } from '../models/DocMgr';

export interface ExtraColumn {
    label: string;
    fieldName: string;
    fieldType: 'string' | 'radiobutton';
}

interface Props {
    fieldName: string;
    context: AppContext;
    document: EditorDoc;
    setDocument: React.Dispatch<React.SetStateAction<EditorDoc>>;
    editMode: boolean;
    label?: string;
    extraColumns?: ExtraColumn[];
    onChange?: (document: EditorDoc, fieldName: string) => Promise<void>;
    required?: boolean;
}

/**
 * Edit the list of people/accounts
 *
 * @param {string} props.fieldName - The field name
 * @param {AppContext} props.context - The app context
 * @param {EditorDoc} props.document - The document object
 * @param props.setDocument - The function to set the document
 * @param {boolean} props.editMode - True if in edit mode
 * @param props.onChange - The function to call when the document is changed
 * @param {string} props.label - The label
 * @param {ExtraColumn} props.extraColumns - The extra columns
 * @param {boolean} props.required - True if the field is required
 *
 * @returns {JSX.Element} The person list editor
 */
const PersonListEditor: React.FC<Props> = ({
    fieldName,
    context,
    document,
    setDocument,
    editMode,
    onChange,
    label,
    extraColumns,
    required,
}) => {
    const docMgr = DocMgr.getInstance();
    const [input, setInput] = useState<string>('');
    console.log('PersonListEditor');

    async function checkForError(value: any) {
        console.log('checkForError()');
        if (required) {
            if (value && value.length > 0) {
                context.setError(fieldName, '');
            } else {
                context.setError(fieldName, `Field ${fieldName} is required`);
            }
        }
    }

    // TODO: Move out to css
    const TableTheme = styled('table')(({ theme }) => ({
        width: '100%',
        '.name': {
            width: '250px;',
        },
        '.email': {
            minWidth: '200px;',
        },
        '.action': {
            width: '150px;',
        },
        '.contact': {
            width: '250px;',
        },
    }));

    async function handleExtraColumnChanged(
        row: number,
        column: ExtraColumn
    ): Promise<void> {
        console.log('handleExtraColumnChanged: row =', row, 'column =', column);
        if (column.fieldType === 'radiobutton') {
            var data = [...document[fieldName]];
            data.forEach((person, _row) => {
                person[column.fieldName] = _row === row ? true : false;
            });
            console.log('new person array=', data);
            const r = await docMgr.saveDocument(
                { id: document.id, [fieldName]: data },
                fieldName
            );
            if (r) {
                checkForError(data);
                setDocument(r);
                if (onChange) {
                    onChange(r, fieldName);
                }
            }
        } else if (column.fieldType === 'string') {
            console.warn("Extra column type 'string' not supported yet.");
        }
    }

    async function handleDeletePerson(row: number): Promise<void> {
        console.log('handleDeletePerson: row =', row);
        const persons = document[fieldName].filter(
            (item: any, _row: number) => {
                return _row !== row;
            }
        );
        const r = await docMgr.saveDocument(
            { id: document.id, [fieldName]: persons },
            fieldName
        );
        if (r) {
            checkForError(persons);
            setDocument(r);
            if (onChange) {
                onChange(r, fieldName);
            }
        }
    }

    async function handleAddPerson(
        email: string,
        create: boolean = false
    ): Promise<void> {
        console.log(`handleAddPerson(${email})`);
        if (!email) {
            context.setShowDialog({
                title: 'Error adding ' + (label || fieldName) + '.',
                text: `Missing email address.`,
            });
            return;
        }
        context.setShowSpinner('Getting emails...');
        const person = await docMgr.getUserProfile(email);
        context.setShowSpinner('');
        console.log('person=', person);
        let newPerson: any = {
            name: email.split('@')[0],
            department: '',
            email: email.indexOf('@') > -1 ? email : '',
            title: '',
            employeeNumber: '',
        };
        if (extraColumns) {
            for (var column of extraColumns) {
                if (column.fieldType === 'radiobutton') {
                    newPerson[column.fieldName] = false;
                } else if (column.fieldType === 'string') {
                    newPerson[column.fieldName] = '';
                }
            }
        }
        if (!person || person.error || person.length === 0) {
            if (!create) {
                context.setShowDialog({
                    title: 'Error adding ' + (label || fieldName) + '.',
                    text: `The email address "${email}" was not found.  Do you want to add them anyway?`,
                    email: email,
                    closeLabel: 'No',
                    callback: handleAddPerson,
                });
                return;
            }
        } else if (person.length > 1) {
            let emails = [];
            for (var i = 0; i < person.length; i++) {
                let em: string = person[i].user.email;
                emails.push(
                    <tr key={i}>
                        <td>{person[i].user.name}</td>
                        <td>{person[i].user.email}</td>
                        <td>
                            <Button
                                onClick={() => {
                                    handleAddPerson(em);
                                    context.setShowDialog(null);
                                }}
                            >
                                Add
                            </Button>{' '}
                        </td>
                    </tr>
                );
            }
            context.setShowDialog({
                title: 'Multiple Emails Were Found',
                text: (
                    <>
                        <div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>{emails}</tbody>
                            </table>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            Select one to Add or Close to cancel.
                        </div>
                    </>
                ),
            });
            return;
        } else {
            newPerson.email = person[0].user.email;
            newPerson.name = person[0].user.name;
            newPerson.department = person[0].user.department;
            newPerson.title = person[0].user.title;
            newPerson.employeeNumber = person[0].user.employeeNumber;
        }
        let data = [...document[fieldName]];
        data.push(newPerson);
        const r = await docMgr.saveDocument(
            { id: document.id, [fieldName]: data },
            fieldName
        );
        if (r) {
            checkForError(data);
            setDocument(r);
            setInput('');
            if (onChange) {
                onChange(r, fieldName);
            }
        }
    }

    const renderExtraColumnHeaders = () => {
        if (extraColumns) {
            const r = [];
            for (const column of extraColumns) {
                r.push(<th key={'th-' + column.label}>{column.label}</th>);
            }
            return r;
        }
    };

    const renderExtraColumns = (person: any, row: number) => {
        if (extraColumns) {
            const r = [];
            for (const column of extraColumns) {
                if (column.fieldType === 'radiobutton') {
                    r.push(
                        <td
                            className="contact actionCol"
                            key={'td-' + column.fieldName}
                        >
                            <Radio
                                disabled={!editMode}
                                onChange={event =>
                                    handleExtraColumnChanged(row, column)
                                }
                                value={'' + row}
                                // type="radio"
                                checked={person[column.fieldName]}
                                // label=""
                            />
                        </td>
                    );
                } else if (column.fieldType === 'string') {
                    r.push(
                        <td
                            className="contact actionCol"
                            key={'td-' + column.fieldName}
                        >
                            {person[column.fieldName]}
                        </td>
                    );
                }
            }
            return r;
        }
    };

    const numColumns = 3 + (extraColumns ? extraColumns.length : 0);

    useEffect(() => {
        checkForError((document as any)[fieldName]);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div>
            <TableTheme className="roundedTable">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        {extraColumns && renderExtraColumnHeaders()}
                        {editMode && <th>Action</th>}
                    </tr>
                </thead>
                <tbody>
                    {(!document[fieldName] ||
                        document[fieldName].length === 0) && (
                        <>
                            <tr style={{ textAlign: 'center' }}>
                                <td colSpan={numColumns}>No Data</td>
                            </tr>
                        </>
                    )}
                    {document[fieldName].map((person: any, row: number) => (
                        <tr key={row}>
                            <td className="name">{person.name}</td>
                            <td className="email">{person.email}</td>
                            {extraColumns && renderExtraColumns(person, row)}
                            {editMode && (
                                <td className="action actionCol">
                                    <Button
                                        disabled={!editMode}
                                        value={row}
                                        onClick={() => handleDeletePerson(row)}
                                    >
                                        Delete
                                    </Button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </TableTheme>

            {editMode && (
                <div>
                    <div>&nbsp;</div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                            id="newGroupName"
                            className="text"
                            type="input"
                            disabled={!editMode}
                            style={{ width: '350px' }}
                            label={'Enter Email of the ' + (label || fieldName)}
                            value={input}
                            onChange={(e: any) => setInput(e.target.value)}
                        />
                        &nbsp; &nbsp;{' '}
                        <IconButton
                            disabled={!editMode}
                            onClick={() => handleAddPerson(input)}
                            aria-label={'Add'}
                        >
                            <AddIcon />
                        </IconButton>
                    </div>
                </div>
            )}

            {(!document[fieldName] || document[fieldName].length === 0) && (
                <div
                    style={{
                        color: '#A01C2B',
                        fontSize: '14px',
                        marginLeft: '10px',
                        marginTop: '10px',
                    }}
                >
                    <ErrorIcon style={{ width: '12px', height: '12px' }} /> This
                    data is required.
                </div>
            )}
        </div>
    );
};

export default PersonListEditor;
