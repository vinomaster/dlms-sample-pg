/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React, { useState, useEffect } from 'react';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js';
import parse from 'html-react-parser';
import draftToHtml from 'draftjs-to-html';
import EditorContainer from '../components/EditorContainer';
import { DocMgr } from '../models/DocMgr';
import { AppContext } from '../common/states';
import { EditorDoc } from '../common/common';

let timeOutId: any;

interface Props {
    fieldName: string;
    document: EditorDoc;
    setDocument: React.Dispatch<React.SetStateAction<EditorDoc>>;
    context: AppContext;
    children?: React.ReactNode;
    onChange?: (document: EditorDoc, fieldName: string) => Promise<void>;
    required?: boolean;
}

/**
 * WYSIWYG (What You See Is What You Get) editor
 *
 * @summary Textarea editor with editing capabilities
 *
 * @param {string} props.fieldName - The name of the field
 * @param {EditorDoc} props.document - The document to edit
 * @param props.setDocument - The function to set the document
 * @param {AppContext} props.context - The app context
 * @param {React.ReactNode} props.children - The editor content
 * @param props.onChange - The function to call when the data is changed
 * @param {boolean} props.required - Indicates whether the field is required
 *
 * @returns {JSX.Element} The WYSIWYG editor
 */
const WysiwygEditor: React.FC<Props> = ({
    fieldName,
    document,
    setDocument,
    context,
    children,
    onChange,
    required = false,
}) => {
    const docMgr = DocMgr.getInstance();
    const [initComplete, setInitComplete] = useState<boolean>(false);

    const iData = document[fieldName];
    const [data, setData] = useState<EditorState>(
        iData
            ? EditorState.createWithContent(convertFromRaw(JSON.parse(iData)))
            : EditorState.createEmpty()
    );

    async function saveData() {
        let value = '';
        if (data.getCurrentContent().getPlainText()) {
            value = JSON.stringify(convertToRaw(data.getCurrentContent()));
        }
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

    function uploadImageCallback(file: File): Promise<any> {
        console.log('uploadImageCallback()');
        return new Promise(async (resolve, reject): Promise<any> => {
            const r = await docMgr.uploadAttachment(document.id, file);
            const _doc = { ...document, attachments: r };
            setDocument(_doc);
            if (onChange) {
                onChange(_doc, fieldName);
            }
            for (var i = 0; i < r.length; i++) {
                if (r[i].name === file.name) {
                    return resolve({ data: { link: r[i].url } });
                }
            }
            return resolve({ data: { link: 'Error uploading' } });
        });
    }

    /** Save when focus is no longer on the editor */
    async function onEditorBlur() {
        saveData();
    }

    useEffect(() => {
        console.log('Init page load');
        setInitComplete(true);
    }, []);

    /** Autosave data every 3 seconds. Don't autosave if there is no data. */
    useEffect(() => {
        if (initComplete) {
            if (timeOutId) clearTimeout(timeOutId);
            timeOutId = setTimeout(async () => {
                timeOutId = null;
                saveData();
            }, 3000); // 3 seconds
        }
    }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div>
            {children && <div className="editorDescription">{children}</div>}
            <div className="editorDiv">
                {context.editMode && (
                    <EditorContainer
                        id={'editor-' + fieldName}
                        data={data}
                        setData={setData}
                        label={fieldName}
                        editMode={context.editMode}
                        onBlur={onEditorBlur}
                        uploadImageCallback={uploadImageCallback}
                        required={required}
                        setError={context.setError}
                    />
                )}
                {!context.editMode && (
                    <div>
                        {parse(
                            draftToHtml(convertToRaw(data.getCurrentContent()))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WysiwygEditor;
