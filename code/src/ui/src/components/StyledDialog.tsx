/**
 * Copyright (c) 2024 Discover Financial Services
 */
import { styled } from '@mui/material';
import { SimpleDialog } from './SimpleDialog';

/** Styled version of SimpleDialog */
const StyledDialog = styled(SimpleDialog)(({ theme }) => ({
    '& .MuiLink-button': {
        backgroundColor: 'var(--white) !important',
        color: 'var(--on-white) !important',
    },
    '& .MuiIconButton-root': {
        backgroundColor: 'var(--white) !important',
        color: 'var(--on-white) !important',
    },
    '& .MuiDialog-paper': {
        overflowY: 'visible',
    },
}));

export default StyledDialog;
