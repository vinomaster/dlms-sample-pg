/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React, { useState, useEffect, ReactNode } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';

export interface ActionProps {
    label: string;
    onClick: () => void;
}

interface Props {
    title: string;
    open: boolean;
    onClose: () => void;
    actions?: ActionProps[];
    children: ReactNode;
}

/**
 * Renders a simple dialog component with a title, content, and customizable action buttons.
 *
 * @param props.title - The title of the dialog
 * @param props.open - Flag indicating if the dialog is open
 * @param props.onClose - The function to close the dialog
 * @param props.actions - An array of action objects with a label and onClick function
 * @param props.children - The content of the dialog
 *
 * @returns {JSX.Element}
 */
export const SimpleDialog: React.FC<Props> = ({
    title,
    open,
    onClose,
    actions,
    children,
}) => {
    const [showDialog, setShowDialog] = useState(open);

    useEffect(() => {
        setShowDialog(open);
    }, [open]);

    const renderActions = (actions?: any[]) => {
        if (!actions || actions.length === 0) {
            return <Button onClick={() => onClose()}>OK</Button>;
        }
        const actionsArray = actions.map(action => {
            return <Button onClick={action.onClick}>{action.label}</Button>;
        });

        return actionsArray;
    };

    return (
        <Dialog
            open={showDialog}
            onClose={onClose}
            sx={{
                '& .MuiDialog-paper': {
                    padding: '20px',
                    borderRadius: '32px',
                },
            }}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>{children}</DialogContent>
            <DialogActions>{renderActions(actions)}</DialogActions>
        </Dialog>
    );
};
