/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React, { useState } from 'react';
import { FormGroup, FormControlLabel, Checkbox } from '@mui/material';

interface Props {
    tabbed_document_view?: boolean;
}

/**
 * Component for rendering comments.
 *
 * @param {DocumentInfo} props.tabbed_document_view
 *
 * @returns {JSX.Element}
 */
const ConfigSwitchModal: React.FC<Props> = ({
    tabbed_document_view = false,
}) => {
    const [showSwitchOptionDiv, setShowSwitchOptionDiv] = useState(false);
    const [show_checklist_switch, setShow_checklist_switch] = useState(
        getCurrentStatus('show_checklist_switch')
    );
    const [show_comments_section_switch, setShow_comments_section_switch] =
        useState(getCurrentStatus('show_comments_section_switch'));
    const [show_stepper_and_phases_switch, setShow_stepper_and_phases_switch] =
        useState(getCurrentStatus('show_stepper_and_phases_switch'));
    const [view_as_admin_only_switch, setview_as_admin_only_switch] = useState(
        getCurrentStatus('view_as_admin_only_switch')
    );
    const [enable_print_option_switch, setEnable_print_option_switch] =
        useState(getCurrentStatus('enable_print_option_switch'));
    const [tabbed_document_view_switch, setTabbed_document_view_switch] =
        useState<boolean>(tabbed_document_view);

    async function switchOptionShowHide(): Promise<any> {
        setShowSwitchOptionDiv(!showSwitchOptionDiv);
    }

    function getCurrentStatus(switchName: string) {
        let currentStateStr = window.localStorage.getItem(switchName);
        var currentState = false;
        if (currentStateStr != null && currentStateStr.endsWith('true')) {
            currentState = true;
        }
        return currentState;
    }

    async function handleSwitchValChange(switchName: String): Promise<any> {
        switch (switchName) {
            case 'tabbed_document_view_switch':
                setTabbed_document_view_switch(!tabbed_document_view_switch);
                window.localStorage.setItem(
                    'tabbed_document_view_switch',
                    (!tabbed_document_view_switch).toString()
                );
                break;
            case 'show_checklist_switch':
                setShow_checklist_switch(!show_checklist_switch);
                window.localStorage.setItem(
                    'show_checklist_switch',
                    (!show_checklist_switch).toString()
                );
                break;
            case 'show_comments_section_switch':
                setShow_comments_section_switch(!show_comments_section_switch);
                window.localStorage.setItem(
                    'show_comments_section_switch',
                    (!show_comments_section_switch).toString()
                );
                break;
            case 'show_stepper_and_phases_switch':
                setShow_stepper_and_phases_switch(
                    !show_stepper_and_phases_switch
                );
                window.localStorage.setItem(
                    'show_stepper_and_phases_switch',
                    (!show_stepper_and_phases_switch).toString()
                );
                break;
            case 'view_as_admin_only_switch':
                setview_as_admin_only_switch(!view_as_admin_only_switch);
                window.localStorage.setItem(
                    'view_as_admin_only_switch',
                    (!view_as_admin_only_switch).toString()
                );
                break;
            case 'enable_print_option_switch':
                setEnable_print_option_switch(!enable_print_option_switch);
                window.localStorage.setItem(
                    'enable_print_option_switch',
                    (!enable_print_option_switch).toString()
                );
                break;
        }
    }

    // TODO: Verify FormGroup & FormControlLabel & Checkbox
    //       There is a red checkbox instead of just a checkmark
    // TODO: Gear icon on top-right is missing
    //
    return (
        <>
            <div className="switch_div_list">
                <div
                    style={{ backgroundImage: 'url(/spcommon.png)' }}
                    className="switch_div_gear"
                    onClick={async () => switchOptionShowHide()}
                ></div>
                <div
                    style={{
                        width: '278px',
                        top: '-79px',
                        minHeight: '90vh',
                        right: '-230px',
                    }}
                    className={
                        !showSwitchOptionDiv
                            ? 'switch_div_details_option_fadeout'
                            : 'switch_div_details_option_fadein'
                    }
                >
                    <div className="switch_config_grouping">
                        <div>Landing page configurations</div>
                        <FormGroup
                        // direction="row"
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        defaultChecked={false}
                                        checked={getCurrentStatus(
                                            'tabbed_document_view_switch'
                                        )}
                                        onChange={async () =>
                                            handleSwitchValChange(
                                                'tabbed_document_view_switch'
                                            )
                                        }
                                        value="y"
                                    />
                                }
                                label="Tabbed View"
                            />
                        </FormGroup>
                    </div>
                    <div className="switch_config_segregation" />
                    <div className="switch_config_grouping">
                        <div>Details page configurations</div>
                        <FormGroup
                        // direction="row"
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        defaultChecked={true}
                                        checked={getCurrentStatus(
                                            'show_checklist_switch'
                                        )}
                                        onChange={async () =>
                                            handleSwitchValChange(
                                                'show_checklist_switch'
                                            )
                                        }
                                        value="show_checklist_switchy"
                                    />
                                }
                                label="Show Checklist"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        defaultChecked={true}
                                        checked={getCurrentStatus(
                                            'show_comments_section_switch'
                                        )}
                                        onChange={async () =>
                                            handleSwitchValChange(
                                                'show_comments_section_switch'
                                            )
                                        }
                                        value="show_comments_section_switch"
                                    />
                                }
                                label="Show Comment Section"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        defaultChecked={true}
                                        checked={getCurrentStatus(
                                            'show_stepper_and_phases_switch'
                                        )}
                                        onChange={async () =>
                                            handleSwitchValChange(
                                                'show_stepper_and_phases_switch'
                                            )
                                        }
                                        value="show_stepper_and_phases_switch"
                                    />
                                }
                                label="Show Stepper And Phases"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        defaultChecked={false}
                                        checked={getCurrentStatus(
                                            'view_as_admin_only_switch'
                                        )}
                                        onChange={async () =>
                                            handleSwitchValChange(
                                                'view_as_admin_only_switch'
                                            )
                                        }
                                        value="view_as_admin_only_switch"
                                    />
                                }
                                label="View As Admin Only"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        defaultChecked={true}
                                        checked={getCurrentStatus(
                                            'enable_print_option_switch'
                                        )}
                                        onChange={async () =>
                                            handleSwitchValChange(
                                                'enable_print_option_switch'
                                            )
                                        }
                                        value="enable_print_option_switch"
                                    />
                                }
                                label="Enable Print Option"
                            />
                        </FormGroup>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ConfigSwitchModal;
