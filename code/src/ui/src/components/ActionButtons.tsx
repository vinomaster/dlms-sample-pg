/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React from 'react';
import { DocumentInfo } from '../common/common';
import { docStates, AppContext, Role } from '../common/states';
import { DocMgr } from '../models/DocMgr';
import { Button } from '@mui/material';
import { Tooltip } from '@mui/material';

interface Props {
    document: DocumentInfo;
    setDocument: (
        document: DocumentInfo,
        fields?: string[]
    ) => Promise<void> | undefined;
    context: AppContext;
    enabled: boolean;
    tab: string;
}

/**
 * Renders action buttons based on the document state and user context.
 *
 * @param {DocumentInfo} props.document - The document info object.
 * @param props.setDocument - The function to set the document info object.
 * @param {AppContext} props.context - The app context object.
 * @param {boolean} props.enabled - Indicates whether the component is enabled.
 * @param {string} props.tab - The tab string.
 *
 * @returns {JSX.Element[]} The action buttons.
 */
const ActionButtons: React.FC<Props> = ({
    document,
    setDocument,
    context,
    enabled,
    tab,
}) => {
    const ideationMgr = DocMgr.getInstance();
    const state = document.state;

    const renderActionButtons = () => {
        console.log('renderActionBuffons()');
        let buffer = [];
        let temp = [];
        var count = 1;
        const docState = docStates[state];
        const nextStates = docState.nextStates || null;
        if (nextStates) {
            for (var cstate in nextStates) {
                console.log('cstate=', cstate);
                const nextState = nextStates[cstate];

                // Determine if button is to be shown on this tab
                const _showOnTab = nextState.props?.showOnTab;
                let showOnTab = 'checklist';
                if (_showOnTab) {
                    if (typeof _showOnTab === 'function') {
                        showOnTab = _showOnTab(document);
                    } else {
                        showOnTab = _showOnTab;
                    }
                }
                if (showOnTab.indexOf(tab) > -1) {
                    // || (tab == "checklist")) {
                    // Yes, show it
                } else {
                    continue; // No, skip it
                }

                // Always enable this button regardless of checklist complete
                const alwaysEnabled = nextState.props?.alwaysEnabled === tab;

                // Determine if the document is complete to go to next state
                let canChangeState = true;
                const canChangeStateFunction = nextState.props?.canChangeState;
                if (canChangeStateFunction) {
                    canChangeState = !!canChangeStateFunction(document);
                }

                // Final determine if button is enabled or not
                var isEnabled = false;
                if (canChangeState && (enabled || alwaysEnabled)) {
                    const groups = nextState.groups;
                    if (
                        groups.includes(Role.Requestor.name) &&
                        context.isRequestor
                    ) {
                        console.log(
                            `ActionButtons:  -- requestor so can do action`
                        );
                        isEnabled = true;
                    } else if (
                        groups.includes(Role.Employee.name) &&
                        context.isEmployee
                    ) {
                        console.log(
                            `ActionButtons:  -- employee so can do action`
                        );
                        isEnabled = true;
                    } else if (context.isAdministrator) {
                        console.log(
                            `ActionButtons:  -- admin so can do action`
                        );
                        isEnabled = true;
                    } else if (
                        groups.includes(Role.Reviewer.name) &&
                        context.isReviewer
                    ) {
                        console.log(
                            `ActionButtons:  -- reviewer so can do action`
                        );
                        isEnabled = true;
                    }
                }
                if (isEnabled || context.isAdministrator) {
                    // admin sees all buttons (even if disabled)
                    // admin sees all buttons (even if disabled)
                    temp.push(
                        <div key={cstate}>
                            <Tooltip
                                title={nextState.description}
                                placement="top"
                                enterDelay={500}
                            >
                                <Button
                                    style={{
                                        marginRight: '9px',
                                        width: '190px',
                                        fontSize: '15px',
                                    }}
                                    value={cstate}
                                    onClick={(e: any) =>
                                        handleAction(e.target.value)
                                    }
                                    disabled={!isEnabled}
                                >
                                    {nextState.label || docStates[cstate].label}
                                </Button>
                            </Tooltip>
                        </div>
                    );
                    if (count % 2 === 0) {
                        var second = temp.pop();
                        var first = temp.pop();
                        buffer.push(
                            <div style={{ display: 'flex' }}>
                                {first}
                                {second}
                            </div>
                        );
                        buffer.push(<div className="spacer" />);
                    }
                }
                count = count + 1; // tracking a
            }
            //if any button left to be odded, lets add it here
            if (temp) {
                buffer.push(
                    <div style={{ display: 'flex' }}>{temp.pop()}</div>
                );
                buffer.push(<div className="spacer" />);
            }
        }

        return buffer;
    };

    /** Handles all actions on the Button created in renderActionButtons */
    const handleAction = async (value: any) => {
        console.log('handleAction: value=', value);
        const r = await ideationMgr.saveDocument(
            { id: document.id, state: value },
            'state'
        );
        if (r) {
            setDocument(r);
        }
    };

    return <div>{renderActionButtons()}</div>;
};

export default ActionButtons;
