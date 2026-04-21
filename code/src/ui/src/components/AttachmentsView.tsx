/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React from 'react';
import { IconButton, Link } from '@mui/material';
import { formatDate, formatFileSize } from '../common/common';
import { AttachmentInfo } from '../common/common';
import DeleteIcon from '@mui/icons-material/Delete';
import { FileCopyOutlined } from '@mui/icons-material';

interface Props {
    attachments: AttachmentInfo[];
    handleViewRow(file: AttachmentInfo): Promise<any>;
    handleDeleteRow(file: AttachmentInfo): Promise<any>;
    handleCopyRow(file: AttachmentInfo): Promise<any>;
    disabled?: boolean;
}

/**
 * Renders the attachments view based on the provided attachments array.
 *
 * @param {AttachmentInfo[]} props.attachments - An array of attachment information
 * @param props.handleViewRow - A function to handle viewing a row
 * @param props.handleDeleteRow - A function to handle deleting a row
 * @param props.handleCopyRow - A function to handle copying a row
 * @param {boolean} props.disabled - Indicates if the attachments view is disabled
 *
 * @returns {JSX.Element}
 */
const AttachmentsView: React.FC<Props> = ({
    attachments,
    handleViewRow,
    handleDeleteRow,
    handleCopyRow,
    disabled,
}) => {
    if (attachments && attachments.length > 0) {
        return (
            <div className="attachmentsList">
                {attachments.map((attachment, i) => (
                    <div className="attachmentItem">
                        <div>
                            <Link
                                component="button"
                                variant="body2"
                                className="buttonLink"
                                onClick={() => {
                                    handleViewRow(attachments[i]);
                                }}
                            >
                                {attachment.name}
                            </Link>
                            <div
                                style={{
                                    fontSize: 'smaller',
                                    fontStyle: 'italic',
                                }}
                            >
                                {formatDate(attachment.date)} &nbsp;
                                {formatFileSize(attachment.size)}
                            </div>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <IconButton
                                aria-label="view attachment"
                                onClick={event => {
                                    (event.target as any).blur();
                                    handleCopyRow(attachments[i]);
                                }}
                            >
                                <FileCopyOutlined />
                            </IconButton>
                            <IconButton
                                aria-label="delete attachment"
                                onClick={event => {
                                    (event.target as any).blur();
                                    handleDeleteRow(attachments[i]);
                                }}
                                disabled={disabled}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </div>
                    </div>
                ))}
            </div>
        );
    } else {
        return <div>No documents</div>;
    }
};

export default AttachmentsView;
