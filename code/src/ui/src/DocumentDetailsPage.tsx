/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React, { useState, useEffect } from 'react';
import ActionButtons from './components/ActionButtons';
import { Button, Select, MenuItem, SelectProps } from '@mui/material';
import {
    Backdrop,
    CircularProgress,
    Stepper,
    Step,
    StepLabel,
    Tabs,
    Tab,
    Snackbar,
    Alert as MuiAlert,
} from '@mui/material';

import { DocMgr } from './models/DocMgr';
import { DocumentInfo } from './common/common';
import {
    AppContext,
    docStates,
    phases,
    Role,
    Phase,
    doesUserHaveRole,
} from './common/states';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import TopBanner from './components/TopBanner';
import Comments from './components/Comments';
import DateEditor from './editors/DateEditor';
import StringEditor from './editors/StringEditor';
import WysiwygEditor from './editors/WysiwygEditor';
import StringSelectableEditor from './editors/StringSelectableEditor';
import CheckboxEditor from './editors/CheckboxEditor';
import PersonListEditor from './editors/PersonListEditor';
import CheckList, { renderDeliveryTeam } from './components/CheckList';
import StyledDialog from './components/StyledDialog';
import { FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import Navbar from './navbar';

interface Props {
    context: AppContext;
}

const infoText =
    'Your request is automatically saved to the server as you type and make changes.';
const errors = {};

const DocumentDetailsPage: React.FC<Props> = ({ context }) => {
    function getCurrentStatus(switchName: string) {
        let currentStateStr = window.localStorage.getItem(switchName);
        var currentState = false;
        if (currentStateStr != null && currentStateStr.endsWith('true')) {
            currentState = true;
        }
        return currentState;
    }
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
        useState(getCurrentStatus('tabbed_document_view_switch'));

    const docMgr = DocMgr.getInstance();

    const navigate = useNavigate();

    const [aDocument, _setDocument] = useState<DocumentInfo | undefined>();

    const [initComplete, setInitComplete] = useState<boolean>(false);
    const [phaseDisplayed, setPhaseDisplayed] = useState<Phase>({
        label: '',
        description: '',
    });
    const [showDialog, setShowDialog] = useState<any>(null);
    const [showSpinner, setShowSpinner] = useState<string>('');
    const [showToast, setShowToast] = useState<string>('');

    context.setError = setError;
    context.setInfoText = infoText;
    context.phaseDisplayed = null;
    context.setShowDialog = setShowDialog;
    context.setShowSpinner = setShowSpinner;
    context.showSection = showSection;

    const setDocument = async (r: DocumentInfo, fields?: string[]) => {
        if (r) {
            await documentChanged(r);
            _setDocument(r);
            if (initComplete) {
                setShowToast('Idea saved');
            } else {
                setInitComplete(true);
            }
        }
    };

    // Url query parms
    let { id } = useParams();
    let { search, hash } = useLocation();
    const query = new URLSearchParams(search);
    console.log('hash=', hash);
    console.log('isAdministrator=', context.isAdministrator);
    if (context.isAdministrator) {
        context.wasAdministrator = true;
    }
    const print = query.get('print');
    const viewAs = query.get('viewAs');

    const location = useLocation();
    const [selectedTab, setSelectedTab] = useState<string>(
        window.localStorage.getItem('request-details-SelectedTab') || 'title'
    );
    useEffect(() => {
        console.log('location changed to', location);
        if (location.hash) {
            showSection(location.hash.substring(1));
        }
    }, [location]); // eslint-disable-line react-hooks/exhaustive-deps

    const documentId = id || '';
    console.log(
        `DocumentDetailsPage: Param id = ${documentId} print = ${print}`
    );

    useEffect(() => {
        console.log('id changed: ', documentId);

        const init = async () => {
            document.body.classList.add('wait');
            const res = await docMgr.getDocument(documentId);
            if (res != null) {
                await setDocument(res);
            } else {
                console.log('Document not found');
                _setDocument(undefined);
            }
            setInitComplete(true);
            document.body.classList.remove('wait');
        };

        setInitComplete(false);
        init();

        function clear() {
            console.log('Clean up page');
            setInitComplete(false);
        }
        return () => {
            clear();
        };
    }, [documentId]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (aDocument) {
            console.log(`document state=${aDocument.state})`);
            const docState = docStates[aDocument.state];
            console.log(`docState=`, docState);
            if (docState.phase) {
                setPhaseDisplayed(docState.phase);
            }

            if (!aDocument.title) {
                setSelectedTab('title');
            }
        }
    }, [initComplete]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (aDocument && initComplete) {
            console.log('Errors updated: ', errors);
        }
    }, [errors]); // eslint-disable-line react-hooks/exhaustive-deps

    const documentChanged = async (document: DocumentInfo) => {
        let viewAsAdmin = false;
        if (viewAs) {
            if (context.wasAdministrator) {
                context.isAdministrator = false;
                context.isRequestor = false;
                context.isReviewer = false;
                if (viewAs === 'requestor') context.isRequestor = true;
                if (viewAs === 'reviewer') context.isReviewer = true;
                viewAsAdmin = true;
            }
        }

        if (!viewAsAdmin) {
            context.isAdministrator = await doesUserHaveRole(
                context,
                document,
                Role.Administrator.name
            );
            context.isRequestor = await doesUserHaveRole(
                context,
                document,
                Role.Requestor.name
            );
            context.isReviewer = await doesUserHaveRole(
                context,
                document,
                Role.Reviewer.name
            );
            context.isEmployee = await doesUserHaveRole(
                context,
                document,
                Role.Employee.name
            );
        }

        if (!initComplete) {
            const docState = docStates[document.state];
            if (docState && docState.phase) {
                setPhaseDisplayed(docState.phase);
            }
        }
    };

    const [viewSelect, setViewSelect] = useState<SelectProps['value']>(
        viewAs || 'administrator'
    );

    const handleChange: SelectProps['onChange'] = evt => {
        setViewSelect(evt.target.value);
    };

    useEffect(() => {
        console.log('viewSelect changed to', viewSelect);
        if (viewSelect) {
            if (viewSelect === 'administrator') {
                const r = window.location.origin + window.location.pathname;
                if (window.location.href !== r) {
                    window.location.href = r;
                }
            } else {
                const r =
                    window.location.origin +
                    window.location.pathname +
                    '?viewAs=' +
                    viewSelect;
                if (window.location.href !== r) {
                    window.location.href = r;
                }
            }
        }
    }, [viewSelect]);

    useEffect(() => {
        if (selectedTab) {
            console.log('Selected tab changed =', selectedTab);
            window.localStorage.setItem(
                'request-details-SelectedTab',
                selectedTab
            );
        }
    }, [selectedTab]);

    const tabChanged = (event: any, newValue: string) => {
        setSelectedTab(newValue);
    };

    const scroll = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            console.log('Not found: Scroll id', id);
        }
    };

    function showSection(section: string) {
        console.log('showSection: ', section);
        switch (section) {
            case 'title':
                setSelectedTab('title');
                break;
            case 'agreement':
                setSelectedTab('title');
                break;
            case 'planning':
                setSelectedTab('planning');
                break;
            default:
        }
        scroll(section);
    }

    /**
     * Add an error to the list of errors.
     * To clear an error from the list, set text to "".
     *
     * @param name Field name
     * @param text The error message or "" if no error
     */
    async function setError(name: string, text: string) {}

    const renderAlert = () => {
        if (!showDialog) {
            return;
        }
        let actions = [
            {
                label: showDialog.closeLabel || 'Close',
                onClick: async function onClick() {
                    return setShowDialog(null);
                },
            },
        ];
        if (showDialog.email) {
            actions.push({
                label: 'Yes',
                onClick: async function onClick() {
                    if (showDialog.callback) {
                        await showDialog.callback(showDialog.email, true);
                    }
                    return setShowDialog(null);
                },
            });
        }

        return (
            <StyledDialog
                open={showDialog != null}
                // closeable={true}
                actions={actions}
                onClose={function onClose() {
                    return setShowDialog(null);
                }}
                title={showDialog ? showDialog.title : ''}
            >
                {showDialog ? showDialog.text : ''}
            </StyledDialog>
        );
    };

    const renderProgress = () => {
        let steps = [];
        let activeStep = 0;
        if (aDocument && docStates[aDocument.state]) {
            let s = docStates[aDocument.state].phase;
            let i = 0;
            for (var step in phases) {
                steps.push((phases as any)[step].label);
                if ((phases as any)[step].label === s?.label) {
                    activeStep = i;
                }
                i++;
            }
        }
        return (
            <>
                <Stepper
                    activeStep={activeStep}
                    alternativeLabel
                    sx={{
                        '& .Mui-disabled': {
                            opacity: 'unset',
                        },
                    }}
                >
                    {steps.map(label => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                {aDocument && (
                    <div
                        style={{
                            fontStyle: 'italic',
                            textAlign: 'center',
                            paddingTop: '20px',
                        }}
                    >
                        {docStates[aDocument.state].label}:{' '}
                        {docStates[aDocument.state].description}
                    </div>
                )}
            </>
        );
    };

    function enableSubmit(aDocument: DocumentInfo) {
        console.log('Document state' + aDocument.state);
        if (aDocument.state != null && !aDocument.state.endsWith('created')) {
            return true;
        } else {
            if (
                aDocument.title &&
                aDocument.planningPlatforms &&
                aDocument.planningMotivation &&
                aDocument.planningObjectives &&
                aDocument.planningIncubation &&
                aDocument.marketingBudget &&
                aDocument.planningThemes
            )
                return true;
            else return false;
            //return true;
        }
    }

    async function switchOptionShowHide(): Promise<any> {
        setShowSwitchOptionDiv(!showSwitchOptionDiv);
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

    const renderSwitches = () => {
        return (
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
        );
    };

    if (aDocument && initComplete) {
        // if (viewAs) {
        //     if (context.wasAdministrator) {
        //         context.isAdministrator = false;
        //         context.isRequestor = false;
        //         context.isReviewer = false;
        //         if (viewAs == "requestor") context.isRequestor = true;
        //         if (viewAs == "reviewer") context.isReviewer = true;
        //     }
        // }

        const docState = docStates[aDocument.state];
        console.log('docState=', docState);
        console.log(`docState.write=${docState?.write}`);
        context.writeGroups = aDocument.curStateWrite || [];
        context.readGroups = aDocument.curStateRead || [];

        console.log('context=', context);

        if (
            context.writeGroups.includes(Role.Requestor.name) &&
            context.isRequestor
        ) {
            console.log(`  -- requestor so can edit document`);
            context.editMode = true;
        } else if (
            context.writeGroups.includes(Role.Reviewer.name) &&
            context.isReviewer
        ) {
            console.log(`  -- reviewer so can edit document`);
            context.editMode = true;
        } else if (context.isAdministrator) {
            console.log(`   -- admin so can edit document`);
            context.editMode = true;
        }
        if (print) {
            context.editMode = false;
        }
        console.log(`editMode=${context.editMode}`);

        context.phaseDisplayed = phaseDisplayed;

        const checklist = [
            { label: 'Requestor Tasks' },
            { label: 'Title', fields: ['title'], link: 'title' },
            {
                label: 'Process Agreement',
                fields: ['agreement'],
                link: 'agreement',
            },
            {
                label: 'Planning Topics',
                fields: [
                    'planningPlatforms',
                    'planningMotivation',
                    'planningObjectives',
                    'planningIncubation',
                    'marketingBudget',
                    'planningThemes',
                ],
                link: 'planning',
            },
        ];

        return (
            <>
                <Navbar context={context} errors={errors} />
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
                <div className="content1" style={{ marginTop: '0px' }}>
                    <TopBanner user={context.user}>
                        <div
                            style={{
                                display: 'flex',
                                paddingRight: '20px',
                                paddingTop: '10px',
                                justifyContent: 'flex-end',
                            }}
                        >
                            {renderSwitches()}
                            {/* <ConfigSwitchModal/> */}
                            <Button
                                onClick={async () => {
                                    navigate('/');
                                }}
                            >
                                Dashboard
                            </Button>
                            &nbsp;
                            {enable_print_option_switch && !print && (
                                <Button
                                    onClick={async () => {
                                        navigate('?print=true');
                                    }}
                                >
                                    View to Print
                                </Button>
                            )}
                            {print && (
                                <Button
                                    onClick={async () => {
                                        navigate('');
                                    }}
                                >
                                    View Normal
                                </Button>
                            )}
                            {!view_as_admin_only_switch &&
                                context.wasAdministrator && (
                                    <>
                                        &nbsp;
                                        <div className="editorDiv viewAs">
                                            <Select
                                                value={viewSelect}
                                                onChange={handleChange}
                                                label="View as"
                                            >
                                                <MenuItem value="requestor">
                                                    {' '}
                                                    Requestor{' '}
                                                </MenuItem>
                                                <MenuItem value="reviewer">
                                                    {' '}
                                                    Reviewer{' '}
                                                </MenuItem>
                                                <MenuItem value="administrator">
                                                    {' '}
                                                    Administrator{' '}
                                                </MenuItem>
                                            </Select>
                                        </div>
                                    </>
                                )}
                        </div>
                    </TopBanner>

                    <Snackbar
                        className="action-container"
                        open={!!showToast}
                        autoHideDuration={3000}
                        onClose={() => setShowToast('')}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    >
                        <MuiAlert
                            onClose={() => setShowToast('')}
                            severity="success"
                            sx={{
                                width: '100%',
                                backgroundColor: 'var(--Slate-0)',
                                // border: "2px solid var(--success)",
                            }}
                        >
                            {showToast}
                        </MuiAlert>
                    </Snackbar>

                    <div className="content">
                        {renderAlert()}
                        {show_stepper_and_phases_switch && (
                            <div
                                style={{
                                    paddingTop: 'var(--spacing-3)',
                                    paddingBottom: 'var(--spacing-3)',
                                }}
                            >
                                {renderProgress()}
                            </div>
                        )}

                        <div
                            className="content"
                            style={{
                                display: 'flex',
                                gap: '10px',
                                paddingRight: '0px',
                                marginRight: '0px',
                            }}
                        >
                            <div style={{ flexGrow: 1 }}>
                                {show_stepper_and_phases_switch && (
                                    <Tabs
                                        onChange={tabChanged}
                                        value={selectedTab}
                                        className="slate"
                                    >
                                        <Tab
                                            value="title"
                                            label="Event Details"
                                        />
                                        <Tab
                                            value="planning"
                                            label="Planning Topics"
                                        />
                                    </Tabs>
                                )}

                                <div className="spacer detailDiv" />

                                {selectedTab === 'title' && (
                                    <div className="detailDiv">
                                        <h4 className="detailDiv" id="title">
                                            Title
                                        </h4>
                                        <div className="detailDiv">
                                            <StringEditor
                                                fieldName="title"
                                                label="Enter document title"
                                                document={aDocument}
                                                setDocument={setDocument}
                                                editMode={context.editMode}
                                                setError={context.setError}
                                                required={true}
                                            />
                                        </div>

                                        <h4
                                            className="detailDiv spacer"
                                            id="agreement"
                                        >
                                            Process Agreement
                                        </h4>
                                        <div className="detailDiv">
                                            Process Agreement text can go here.
                                            This is free flow text reading which
                                            the user will agree to the terms and
                                            conditions of the process. This is
                                            to show demonstrate the
                                            CheckboxEditor
                                            <CheckboxEditor
                                                fieldName="agreement"
                                                label="I understand and agree"
                                                document={aDocument}
                                                setDocument={setDocument}
                                                editMode={context.editMode}
                                                setError={context.setError}
                                                required={true}
                                            ></CheckboxEditor>
                                        </div>
                                        <div className="spacer" />
                                        {!show_stepper_and_phases_switch && (
                                                <div className="spacer" />
                                            ) && (
                                                <div className="detailDiv">
                                                    <div className="detailQuestion">
                                                        1. Please select the
                                                        type of team outing.
                                                    </div>
                                                    <StringSelectableEditor
                                                        fieldName="planningPlatforms"
                                                        values={[
                                                            {
                                                                label: 'Select',
                                                                value: '',
                                                            },
                                                            {
                                                                label: 'Lunch Outing',
                                                                value: 'o1',
                                                            },
                                                            {
                                                                label: 'Dinner Outing',
                                                                value: 'o2',
                                                            },
                                                            {
                                                                label: 'Bowling',
                                                                value: 'o3',
                                                            },
                                                            {
                                                                label: 'Golf',
                                                                value: 'o4',
                                                            },
                                                            {
                                                                label: 'Basketball',
                                                                value: 'o5',
                                                            },
                                                            {
                                                                label: 'Other',
                                                                value: 'o0',
                                                            },
                                                        ]}
                                                        defaultValue={
                                                            aDocument.planningPlatforms
                                                        }
                                                        document={aDocument}
                                                        setDocument={
                                                            setDocument
                                                        }
                                                        editMode={
                                                            context.editMode
                                                        }
                                                        setError={
                                                            context.setError
                                                        }
                                                        required={true}
                                                        variant="select"
                                                    ></StringSelectableEditor>
                                                    <div className="spacer" />

                                                    <WysiwygEditor
                                                        fieldName="planningMotivation"
                                                        document={aDocument}
                                                        setDocument={
                                                            setDocument
                                                        }
                                                        context={context}
                                                        required={true}
                                                    >
                                                        <div className="detailQuestion">
                                                            2. Please provide
                                                            the reason for the
                                                            outing.
                                                        </div>
                                                    </WysiwygEditor>
                                                    <div className="spacer" />

                                                    <div className="detailQuestion">
                                                        3. Please provide a
                                                        proposed date of the
                                                        outing
                                                    </div>
                                                    <div className="eventdate">
                                                        <DateEditor
                                                            fieldName="planningObjectives"
                                                            document={aDocument}
                                                            setDocument={
                                                                setDocument
                                                            }
                                                            editMode={
                                                                context.editMode
                                                            }
                                                            required={true}
                                                            setError={
                                                                context.setError
                                                            }
                                                        />
                                                    </div>
                                                    <div className="spacer" />
                                                    <div className="spacer" />
                                                    <div className="detailQuestion">
                                                        4. Please select the
                                                        vendor for this outing.
                                                    </div>
                                                    <div className="spacer" />
                                                    <StringEditor
                                                        fieldName="planningIncubation"
                                                        label="Enter Vendor Name"
                                                        document={aDocument}
                                                        setDocument={
                                                            setDocument
                                                        }
                                                        editMode={
                                                            context.editMode
                                                        }
                                                        setError={
                                                            context.setError
                                                        }
                                                        required={true}
                                                    />
                                                    <div className="spacer" />
                                                    <div className="spacer" />
                                                    <div className="detailQuestion">
                                                        5. Please provide total
                                                        dollar amount.
                                                    </div>
                                                    <div className="spacer" />
                                                    <StringEditor
                                                        fieldName="marketingBudget"
                                                        label="Enter Total Dollar amount"
                                                        document={aDocument}
                                                        setDocument={
                                                            setDocument
                                                        }
                                                        editMode={
                                                            context.editMode
                                                        }
                                                        setError={
                                                            context.setError
                                                        }
                                                        required={true}
                                                    />
                                                    <div className="spacer" />
                                                    <div className="spacer" />
                                                    <div className="detailQuestion">
                                                        6. Select the team
                                                        participating in the
                                                        outing.
                                                    </div>
                                                    <StringSelectableEditor
                                                        fieldName="planningThemes"
                                                        values={[
                                                            {
                                                                label: 'Select',
                                                                value: '',
                                                            },
                                                            {
                                                                label: 'CCT Team',
                                                                value: 't1',
                                                            },
                                                            {
                                                                label: 'CCO Team',
                                                                value: 't2',
                                                            },
                                                            {
                                                                label: 'DTA Team',
                                                                value: 't3',
                                                            },
                                                            {
                                                                label: 'Finance Department',
                                                                value: 't4',
                                                            },
                                                            {
                                                                label: 'Other',
                                                                value: 't5',
                                                            },
                                                        ]}
                                                        defaultValue={
                                                            aDocument.planningThemes
                                                        }
                                                        document={aDocument}
                                                        setDocument={
                                                            setDocument
                                                        }
                                                        editMode={
                                                            context.editMode
                                                        }
                                                        setError={
                                                            context.setError
                                                        }
                                                        required={true}
                                                        variant="select"
                                                    ></StringSelectableEditor>
                                                    <div className="spacer" />
                                                    <div className="spacer" />
                                                    <div className="detailQuestion">
                                                        7. Add persons attending
                                                        the outing.
                                                    </div>
                                                    <div className="spacer" />
                                                    <PersonListEditor
                                                        fieldName="deliveryTeam"
                                                        context={context}
                                                        document={aDocument}
                                                        setDocument={
                                                            setDocument
                                                        }
                                                        extraColumns={[
                                                            {
                                                                label: 'Primary Contact',
                                                                fieldName:
                                                                    'primary',
                                                                fieldType:
                                                                    'radiobutton',
                                                            },
                                                        ]}
                                                        label="Attendee"
                                                        editMode={
                                                            context.editMode
                                                        }
                                                    />
                                                </div>
                                            )}
                                    </div>
                                )}

                                {selectedTab === 'planning' && (
                                    <div className="detailDiv">
                                        <h4 className="detailDiv" id="planning">
                                            Planning Topics
                                        </h4>
                                        <div className="spacer" />
                                        <div className="detailDiv">
                                            <div className="detailQuestion">
                                                1. Please select the type of
                                                team outing.
                                            </div>
                                            <StringSelectableEditor
                                                fieldName="planningPlatforms"
                                                values={[
                                                    {
                                                        label: 'Select',
                                                        value: '',
                                                    },
                                                    {
                                                        label: 'Lunch Outing',
                                                        value: 'o1',
                                                    },
                                                    {
                                                        label: 'Dinner Outing',
                                                        value: 'o2',
                                                    },
                                                    {
                                                        label: 'Bowling',
                                                        value: 'o3',
                                                    },
                                                    {
                                                        label: 'Golf',
                                                        value: 'o4',
                                                    },
                                                    {
                                                        label: 'Basketball',
                                                        value: 'o5',
                                                    },
                                                    {
                                                        label: 'Other',
                                                        value: 'o0',
                                                    },
                                                ]}
                                                defaultValue={
                                                    aDocument.planningPlatforms
                                                }
                                                document={aDocument}
                                                setDocument={setDocument}
                                                editMode={
                                                    context.editMode ||
                                                    context.isAdministrator
                                                }
                                                setError={context.setError}
                                                required={true}
                                                variant="select"
                                            ></StringSelectableEditor>
                                            <div className="spacer" />

                                            <WysiwygEditor
                                                fieldName="planningMotivation"
                                                document={aDocument}
                                                setDocument={setDocument}
                                                context={context}
                                                required={true}
                                            >
                                                <div className="detailQuestion">
                                                    2. Please provide the reason
                                                    for the outing.
                                                </div>
                                            </WysiwygEditor>
                                            <div className="spacer" />

                                            <div className="detailQuestion">
                                                3. Please provide a proposed
                                                date of the outing
                                            </div>
                                            <div className="eventdate">
                                                <DateEditor
                                                    fieldName="planningObjectives"
                                                    document={aDocument}
                                                    setDocument={setDocument}
                                                    editMode={true}
                                                    required={true}
                                                    setError={context.setError}
                                                />
                                            </div>
                                            <div className="spacer" />
                                            <div className="spacer" />
                                            <div className="detailQuestion">
                                                4. Please select the vendor for
                                                this outing.
                                            </div>
                                            <div className="spacer" />
                                            <StringEditor
                                                fieldName="planningIncubation"
                                                label="Enter Vendor Name"
                                                document={aDocument}
                                                setDocument={setDocument}
                                                editMode={context.editMode}
                                                setError={context.setError}
                                                required={true}
                                            />
                                            <div className="spacer" />
                                            <div className="spacer" />
                                            <div className="detailQuestion">
                                                5. Please provide total dollar
                                                amount.
                                            </div>
                                            <div className="spacer" />
                                            <StringEditor
                                                fieldName="marketingBudget"
                                                label="Enter Total Dollar amount"
                                                document={aDocument}
                                                setDocument={setDocument}
                                                editMode={context.editMode}
                                                setError={context.setError}
                                                required={true}
                                            />
                                            <div className="spacer" />
                                            <div className="spacer" />
                                            <div className="detailQuestion">
                                                6. Select the team participating
                                                in the outing.
                                            </div>
                                            <StringSelectableEditor
                                                fieldName="planningThemes"
                                                values={[
                                                    {
                                                        label: 'Select',
                                                        value: '',
                                                    },
                                                    {
                                                        label: 'CCT Team',
                                                        value: 't1',
                                                    },
                                                    {
                                                        label: 'CCO Team',
                                                        value: 't2',
                                                    },
                                                    {
                                                        label: 'DTA Team',
                                                        value: 't3',
                                                    },
                                                    {
                                                        label: 'Finance Department',
                                                        value: 't4',
                                                    },
                                                    {
                                                        label: 'Other',
                                                        value: 't5',
                                                    },
                                                ]}
                                                defaultValue={
                                                    aDocument.planningThemes
                                                }
                                                document={aDocument}
                                                setDocument={setDocument}
                                                editMode={
                                                    context.editMode ||
                                                    context.isAdministrator
                                                }
                                                setError={context.setError}
                                                required={true}
                                                variant="select"
                                            ></StringSelectableEditor>
                                            <div className="spacer" />
                                            <div className="spacer" />
                                        </div>
                                    </div>
                                )}

                                {selectedTab === 'deliveryTeam' && (
                                    <div
                                        className="detailDiv"
                                        id="deliveryTeam"
                                    >
                                        <h4 className="detailDiv">
                                            Delivery Team
                                        </h4>
                                        <div className="detailDiv">
                                            <div className="spacer" />
                                            {renderDeliveryTeam(
                                                context,
                                                aDocument,
                                                setDocument
                                            )}
                                        </div>
                                    </div>
                                )}
                                {!show_checklist_switch && (
                                        <div className="spacer" />
                                    ) && (
                                        <div className="checklist-buttons">
                                            <ActionButtons
                                                document={aDocument}
                                                setDocument={setDocument}
                                                context={context}
                                                enabled={enableSubmit(
                                                    aDocument
                                                )}
                                                tab="checklist"
                                            />
                                        </div>
                                    )}
                                {show_comments_section_switch && (
                                        <div className="spacer" />
                                    ) && (
                                        <div
                                            className="slate"
                                            style={{
                                                padding: 'var(--spacing-2)',
                                            }}
                                        >
                                            COMMENTS
                                        </div>
                                    ) && <div className="spacer" /> && (
                                        <div className="detailDiv">
                                            <Comments
                                                context={context}
                                                document={aDocument}
                                                setDocument={setDocument}
                                                topic="Team Outing"
                                            />
                                        </div>
                                    )}
                            </div>

                            <div
                                style={{
                                    position: 'sticky',
                                    top: 70,
                                    height: '100%',
                                }}
                            >
                                {show_checklist_switch && (
                                    <CheckList
                                        context={context}
                                        document={aDocument}
                                        setDocument={setDocument}
                                        list={checklist}
                                    ></CheckList>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    } else if (initComplete) {
        return (
            <>
                <Navbar context={context} />
                <div
                    style={{
                        marginTop: '100px',
                        marginBottom: '100px',
                        textAlign: 'center',
                    }}
                >
                    <h1>
                        Document request not found or you don't have access.
                    </h1>
                </div>
            </>
        );
    } else {
        return (
            <>
                <Navbar context={context} />
                <Backdrop
                    sx={{
                        color: '#fff',
                        zIndex: theme => theme.zIndex.drawer + 1,
                    }}
                    open={true}
                >
                    <div
                        style={{
                            backgroundColor: 'black',
                            padding: '20px',
                            margin: '20px',
                        }}
                    >
                        <p>Loading request...</p>
                    </div>
                </Backdrop>
            </>
        );
    }
};

export default DocumentDetailsPage;
