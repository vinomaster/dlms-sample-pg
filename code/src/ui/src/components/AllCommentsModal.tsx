/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React, { useState } from 'react';
import { DocumentInfo } from '../common/common';
import { AppContext } from '../common/states';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import Comments from './Comments';
import { TextField } from '@mui/material';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
    document: DocumentInfo;
    setDocument: (
        document: DocumentInfo,
        fields?: string[]
    ) => Promise<void> | undefined;
    context: AppContext;
}

/**
 * Renders the AllCommentsModal component with a search field and comments section.
 *
 * @param {DocumentInfo} props.document - The document information
 * @param props.setDocument - Function to set the document information
 * @param {AppContext} props.context - The application context
 *
 * @returns {JSX.Element}
 */
const AllCommentsModal: React.FC<Props> = ({
    document,
    setDocument,
    context,
}) => {
    const [searchString, setSearchString] = useState<string>('');

    function onSearchStringChange(event: any): void {
        const value = event.target.value;
        setSearchString(value);
    }

    const handleSearchClear = () => {
        setSearchString('');
    };

    return (
        <>
            <TextField
                id="all-comments-search"
                // variant="outlined"
                placeholder="Search..."
                value={searchString}
                onChange={onSearchStringChange}
                sx={{ width: '100%', left: '20px', mb: 2 }}
                InputProps={{
                    endAdornment: (
                        <IconButton
                            aria-label="Clear Search"
                            onClick={handleSearchClear}
                            style={{ margin: '0 24px' }}
                        >
                            <CloseIcon />
                        </IconButton>
                    ),
                }}
            />
            <div className="spacer" />
            <Comments
                context={context}
                document={document}
                setDocument={setDocument}
                searchString={searchString}
            />
            <br />
        </>
    );
};

export default AllCommentsModal;
