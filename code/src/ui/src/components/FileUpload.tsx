/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface Props {
    uploadFiles: any;
}

/**
 * Renders the FileUpload component.
 *
 * @param props.uploadFiles - Function to handle uploading files
 *
 * @returns {JSX.Element}
 */
const FileUpload: React.FC<Props> = ({ uploadFiles }) => {
    const onDrop = useCallback((acceptedFiles: any) => {
        uploadFiles(acceptedFiles);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    const { getRootProps, getInputProps } = useDropzone({ onDrop });

    return (
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            <div className="fileupload">
                <img alt="" src="/upload.png" style={{ height: '32px' }} />
                <div>
                    DROP FILE(S) TO UPLOAD
                    <br />
                    OR CLICK TO BROWSE FILE(S)
                </div>
            </div>
        </div>
    );
};
export default FileUpload;
