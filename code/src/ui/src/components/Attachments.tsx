/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React, { useState } from 'react';
import { DocumentInfo, AttachmentInfo } from '../common/common';
import { DocMgr } from '../models/DocMgr';
import { AppContext } from '../common/states';
import { Backdrop, Snackbar } from '@mui/material';
import AttachmentsView from './AttachmentsView';
import { CircularProgress } from '@mui/material';
import StyledDialog from './StyledDialog';
import FileUpload from './FileUpload';

interface Props {
    document: DocumentInfo;
    setDocument: (
        document: DocumentInfo,
        fields?: string[]
    ) => Promise<void> | undefined;
    context: AppContext;
}

/**
 * Renders the Attachments component.
 *
 * @param {string} props.document - The document
 * @param props.setDocument - The function to set the document
 * @param {AppContext} props.context - The AppContext
 *
 * @returns {JSX.Element}
 */
const Attachments: React.FC<Props> = ({ document, setDocument, context }) => {
    const ideationMgr = DocMgr.getInstance();

    const [showSpinner, setShowSpinner] = useState<string>('');
    const [showAlert, setShowAlert] = useState<any>(null);
    const [snackbar, setSnackbar] = useState<boolean>(false);

    async function attachmentView(file: AttachmentInfo): Promise<void> {
        console.log('attachmentView()');
        console.log(file);
        window.open(file.url); // open in new tab
    }

    async function attachmentDelete(file: AttachmentInfo): Promise<void> {
        console.log('attachmentDelete()');
        console.log(file);
        setShowAlert(file);
    }
    async function doAttachmentDelete(file: AttachmentInfo): Promise<void> {
        console.log('Delete attachment ', file);
        const r = await ideationMgr.deleteAttachment(document.id, file.id);
        if (r !== null) {
            setDocument({ ...document, attachments: r });
        }
    }

    async function attachmentCopy(file: AttachmentInfo): Promise<void> {
        console.log('attachmentCopy()');
        console.log(file);
        navigator.clipboard.writeText(file.url);
        setSnackbar(true);
    }

    async function uploadFiles(files: any): Promise<void> {
        console.log('uploadFiles()');
        if (files) {
            setShowSpinner('Uploading file...');
            for (var i = 0; i < files.length; i++) {
                let file = files[i];
                console.log('Upload file', file);
                if (file) {
                    const r = await ideationMgr.uploadAttachment(
                        document.id,
                        file
                    );
                    if (r) {
                        setDocument({ ...document, attachments: r });
                    }
                }
            }
            setTimeout(function () {
                setShowSpinner('');
            }, 10);
        }
    }

    return (
        <div id="attachmentsTable">
            {context.editMode && (
                <div>
                    <FileUpload uploadFiles={uploadFiles} />
                    <div className="spacer" />
                </div>
            )}
            <AttachmentsView
                attachments={document.attachments || []}
                handleViewRow={attachmentView}
                handleDeleteRow={attachmentDelete}
                handleCopyRow={attachmentCopy}
                disabled={!context.editMode}
            />

            <Snackbar
                open={snackbar}
                onClose={(event, reason) => {
                    setSnackbar(false);
                }}
                message="Attachment URL copied to clipboard"
                autoHideDuration={3000}
                transitionDuration={1000}
            />

            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: (theme: any) => theme.zIndex.drawer + 1,
                }}
                open={showSpinner.length > 0}
                onClick={() => setShowSpinner('')}
            >
                <div
                    style={{
                        backgroundColor: 'black',
                        padding: '20px',
                        margin: '20px',
                        textAlign: 'center',
                    }}
                >
                    <p>{showSpinner}</p>
                    <CircularProgress color="inherit" />
                </div>
            </Backdrop>

            {showAlert != null && (
                <StyledDialog
                    open={true}
                    actions={[
                        {
                            label: 'Yes',
                            onClick: async function onClick() {
                                let file = { ...showAlert };
                                setShowAlert(null);
                                await doAttachmentDelete(file);
                                return;
                            },
                        },
                        {
                            label: 'No',
                            onClick: function onClick() {
                                return setShowAlert(null);
                            },
                        },
                    ]}
                    onClose={function onClose() {
                        return setShowAlert(null);
                    }}
                    title="Delete Attachment?"
                >
                    Do you want to delete "{showAlert.name}"?
                </StyledDialog>
            )}
        </div>
    );
};

export default Attachments;
