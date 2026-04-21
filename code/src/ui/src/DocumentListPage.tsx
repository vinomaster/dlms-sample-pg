/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React, { useState, useEffect } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import { User, Person, DocumentSummary } from './common/common';
import { AppContext } from './common/states';
import RequestDataGrid, {
    DataGridSettings,
} from './components/RequestDataGrid';
import { useNavigate, useLocation } from 'react-router-dom';
import { DocMgr } from './models/DocMgr';
import { Admin } from './models/Admin';
import { Tabs, Tab, Backdrop, Card, CardContent } from '@mui/material';
import StyledDialog from './components/StyledDialog';
import Navbar from './navbar';

let admin = new Admin();

const TAB_ALL = 'all';
const TAB_MINE = 'mine';
const TAB_COMPLETED = 'completed';
// const TAB_CANCELLED = "cancelled";
const TAB_ACTION = 'action';

interface Props {
    context: AppContext;
}

const TestDocumentListPage: React.FC<Props> = ({ context }) => {
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
    const user = context.user;
    const person: Person = {
        name: user.name,
        email: user.email,
        title: user.title,
        department: user.department,
        employeeNumber: user.employeeNumber,
    };

    const navigate = useNavigate();
    let create = false;
    {
        let { search } = useLocation();
        const query = new URLSearchParams(search);
        create = query.get('create') ? true : false;
        console.log('create=', create);
    }

    // State for settings of grids
    const [selectedTab, setSelectedTab] = useState<string>(TAB_ALL);
    const v = window.localStorage.getItem('documentGridSettings');
    const [gridSettings, setGridSettings] = useState<DataGridSettings>(
        v ? JSON.parse(v) : { displayColumns: 'default', filter: {} }
    );

    // Requests listed in table
    const [documents, setDocuments] = useState<DocumentSummary[]>([]);
    const [initComplete, setInitComplete] = useState<boolean>(false);
    const [filteredDocuments, setFilteredIdeations] =
        useState<DocumentSummary[]>();
    const [metrics, setMetrics] = useState<any>({
        all: 0,
        mine: 0,
        completed: 0,
        //cancelled: 0,
        needaction: 0,
    });

    const [showAlert, setShowAlert] = useState<any>(null);
    const [showSpinner, setShowSpinner] = useState<string>('Loading data...');

    // Set to "true" to show confirmation dialog on delete
    const confirmOnDelete = false; //true;

    // Load documents
    async function loadDocuments(_user: User) {
        console.log(`loadDocuments()`);
        let _allDocumentList = await docMgr.getDocuments();
        console.log('documents=', _allDocumentList);
        if (!context.isAdministrator && _allDocumentList) {
            for (var i = _allDocumentList.length - 1; i >= 0; i--) {
                if (
                    _allDocumentList[i].dateCreated ===
                    _allDocumentList[i].dateUpdated
                ) {
                    _allDocumentList.splice(i, 1);
                }
            }
        }
        setDocuments(_allDocumentList);
    }

    useEffect(() => {
        if (documents && initComplete) {
            let all = documents.length;
            let mine = 0;
            let completed = 0;
            //let cancelled = 0;
            let needaction = 0;
            documents?.forEach(aDoc => {
                if (aDoc.requestors) {
                    for (var ideators of aDoc.requestors) {
                        if (ideators.email === user.email && ideators.owner) {
                            mine++;
                        }
                    }
                }
            });
            documents?.forEach(aDoc => {
                if (
                    aDoc.state === 'approved' ||
                    aDoc.state === 'denied' ||
                    aDoc.state === 'cancelled'
                ) {
                    completed++;
                }
            });
            documents?.forEach(aDoc => {
                if (aDoc.requestors) {
                    for (var ideators of aDoc.requestors) {
                        if (
                            ideators.email === user.email &&
                            ideators.owner &&
                            aDoc.state === 'moreinforequested'
                        ) {
                            needaction++;
                        }
                    }
                }

                //for review action
                if (aDoc.requestors) {
                    for (var aReviewer of aDoc.reviewers) {
                        if (
                            aReviewer.email === user.email &&
                            aDoc.state === 'submitted'
                        ) {
                            needaction++;
                        }
                    }
                }
            });
            //setMetrics({ all, mine, completed, cancelled })
            setMetrics({ all, mine, completed, needaction });
        }
    }, [documents, initComplete]); // eslint-disable-line react-hooks/exhaustive-deps

    const createNewDocument = async () => {
        console.log('Creating new request');
        const request = await docMgr.createDocument({
            requestors: [{ ...person, owner: true }],
            reviewers: await admin.getMembers('ReviewerGroup'),
        });
        if (request) {
            console.log('id=', request.id);
            navigate('/details/' + request.id);
            //navigate("/details/"+uuidv4())
        } else {
            console.error('Error creating request');
        }
    };

    // Load request on startup
    useEffect(() => {
        console.log('useEffect[]');
        if (create) {
            createNewDocument();
        } else {
            loadDocuments(user);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const tabChanged = (event: any, newValue: string) => {
        setSelectedTab(newValue);
    };

    // Load requests when button changed
    useEffect(() => {
        if (selectedTab && documents) {
            console.log('Selected tab changed =', selectedTab);
            window.localStorage.setItem('selectedTab', selectedTab);
            var v = window.localStorage.getItem('gridSettings');
            let filter = v ? JSON.parse(v).filter : gridSettings.filter;
            console.log('-- current filter =', filter);
            let filterChanged = false;
            switch (selectedTab) {
                case TAB_ALL:
                    setFilteredIdeations(documents);
                    break;
                case TAB_MINE:
                    const list2: DocumentSummary[] = [];
                    documents?.forEach(aRequest => {
                        if (aRequest.requestors) {
                            for (var ideators of aRequest.requestors) {
                                if (
                                    ideators.email === user.email &&
                                    ideators.owner
                                ) {
                                    list2.push(aRequest);
                                }
                            }
                        }
                    });
                    setFilteredIdeations(list2);
                    break;
                case TAB_ACTION:
                    const list3: DocumentSummary[] = [];
                    documents?.forEach(aDoc => {
                        if (aDoc.requestors) {
                            //for own request info action
                            for (var ideators of aDoc.requestors) {
                                if (
                                    ideators.email === user.email &&
                                    ideators.owner &&
                                    aDoc.state === 'moreinforequested'
                                ) {
                                    list3.push(aDoc);
                                }
                            }
                            //for review action
                            for (var aReviewer of aDoc.reviewers) {
                                if (
                                    aReviewer.email === user.email &&
                                    aDoc.state === 'submitted'
                                ) {
                                    list3.push(aDoc);
                                }
                            }
                        }
                    });
                    setFilteredIdeations(list3);
                    break;
                case TAB_COMPLETED:
                    const list4: DocumentSummary[] = [];
                    documents?.forEach(aDoc => {
                        if (
                            aDoc.state === 'approved' ||
                            aDoc.state === 'denied' ||
                            aDoc.state === 'cancelled'
                        ) {
                            list4.push(aDoc);
                        }
                    });
                    setFilteredIdeations(list4);
                    break;
                default:
            }
            if (filterChanged) {
                console.log('-- new filter =', filter);
                setGridSettings({
                    displayColumns: gridSettings.displayColumns,
                    filter: filter,
                });
            }

            setInitComplete(true);
        }
    }, [selectedTab, documents]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!tabbed_document_view_switch) {
            setSelectedTab(TAB_ALL);
        }
    }, [tabbed_document_view_switch]);

    useEffect(() => {
        const doWork = async () => {
            if (filteredDocuments) {
                console.log(
                    'Filtered document list updated=',
                    filteredDocuments
                );
                setShowSpinner('');
            }
        };
        doWork();
    }, [filteredDocuments]);

    useEffect(() => {
        if (initComplete) {
            console.log('gridSettings changed: ', gridSettings);
            window.localStorage.setItem(
                'documentGridSettings',
                JSON.stringify(gridSettings)
            );
        }
    }, [gridSettings]); // eslint-disable-line react-hooks/exhaustive-deps

    async function handleSetGridSettings(event: any) {
        if (documents) {
            console.log('gridSettings changed: ', event);
            window.localStorage.setItem(
                'documentGridSettings',
                JSON.stringify(event)
            );
            // Can't set gridSettings here since data grid filter field looses focus
            if (event.displayColumns !== gridSettings.displayColumns) {
                setGridSettings(event);
            }
        }
    }

    /**
     * Edit button for document row was clicked
     *
     * @param e
     */
    async function handleEditRow(event: any): Promise<any> {
        console.log('edit document: ', event);
        const i = event;
        navigate('/details/' + i); //show[i]['id']);
    }

    async function handleDeleteRow(event: any): Promise<any> {
        console.log('delete document: ', event);
        const i = event.id;
        if (confirmOnDelete) {
            console.log('Show alert');
            setShowAlert(i);
        } else {
            await doDeleteRequest(i);
        }
    }

    async function doDeleteRequest(id: string): Promise<any> {
        console.log(`doDeletePatent(${id})`);
        await docMgr.deleteDocument(id);
        await loadDocuments(user);
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

    async function switchOptionShowHide(): Promise<any> {
        setShowSwitchOptionDiv(!showSwitchOptionDiv);
    }

    const renderSwitches = () => {
        return (
            <div className="switch_div_list">
                <div
                    style={{
                        backgroundImage: 'url(/spcommon.png)',
                        top: '-44px',
                    }}
                    className="switch_div_gear"
                    onClick={async () => switchOptionShowHide()}
                ></div>
                <div
                    style={{
                        width: '278px',
                        top: '-32px',
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
                        {/* TODO: This is duplicated 3 places.  Move to a common component */}
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

    const renderAdminButton = () => {
        if (context.isAdministrator) {
            return (
                <div className="admin_button_div">
                    <Button
                        style={{ marginLeft: '20px' }}
                        onClick={async () => {
                            navigate('/admin/');
                        }}
                    >
                        Administrator
                    </Button>
                    {/* &nbsp; <Button onClick={async () => { navigate("/metrics/"); }}>Metrics</Button> */}
                </div>
            );
        }
    };

    const renderWelcome = () => {
        return (
            <>
                <div
                    style={{
                        backgroundImage: 'url(/background.png)',
                        height: '160px',
                        backgroundSize: '100%',
                        paddingLeft: '61px',
                        paddingRight: '61px',
                        paddingTop: '5px',
                        paddingBottom: '17px',
                    }}
                >
                    <h2>Team-Outing Request Tracker Dashboard</h2>
                    {renderSwitches()}
                    <div style={{ padding: '0px' }}>
                        You can view or manage your team-outing requests from
                        this dashboard.
                        <br />
                    </div>
                    <div
                        style={{
                            paddingTop: '13px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                        }}
                    >
                        <Button
                            onClick={async () => {
                                const docId = await docMgr.createDocument({
                                    requestors: [{ ...person, owner: true }],
                                    reviewers:
                                        await admin.getMembers('ReviewerGroup'),
                                });
                                if (docId) {
                                    console.log('document id=', docId.id);
                                    navigate('/details/' + docId.id);
                                } else {
                                    console.error('Error creating request');
                                }
                            }}
                            // icon={<img src="/star.png"/>}
                            // iconPosition="before"
                        >
                            New Team-Outing Request
                        </Button>
                        {renderAdminButton()}
                    </div>
                </div>
            </>
        );
    };

    if (create) {
        return <></>;
    }

    return (
        <>
            <Navbar context={context} />
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
                {renderWelcome()}
                <div className="content spacer" style={{}}>
                    {tabbed_document_view_switch && (
                        <div style={{ display: 'flex' }}>
                            <Card className="metricsCard">
                                <CardContent>
                                    <h3>{metrics.all}</h3>
                                    <img
                                        alt=""
                                        src="/blueLineChart.png"
                                        width="100%"
                                    />
                                    <div>All Requests</div>
                                </CardContent>
                            </Card>
                            <Card className="metricsCard">
                                <CardContent>
                                    <h3>{metrics.mine}</h3>
                                    <img
                                        alt=""
                                        src="/greenLineChart.png"
                                        width="100%"
                                    />
                                    <div>My Requests</div>
                                </CardContent>
                            </Card>
                            <Card className="metricsCard">
                                <CardContent>
                                    <h3>{metrics.needaction}</h3>
                                    <img
                                        alt=""
                                        src="/greenLineChart.png"
                                        width="100%"
                                    />
                                    <div>Need Action</div>
                                </CardContent>
                            </Card>
                            <Card className="metricsCard">
                                <CardContent>
                                    <h3>{metrics.completed}</h3>
                                    <img
                                        alt=""
                                        src="/blueLineChart.png"
                                        width="100%"
                                    />
                                    <div>Completed Requests</div>
                                </CardContent>
                            </Card>
                            {/* <Card className="metricsCard">
                            <CardContent>
                                <h3>{metrics.cancelled}</h3>
                                <img src="/greenLineChart.png" width="100%" />
                                <div>Cancelled Requests</div>
                            </CardContent>
                        </Card> */}
                        </div>
                    )}

                    <div className="detailDiv">
                        {tabbed_document_view_switch && (
                            <Tabs
                                onChange={tabChanged}
                                value={selectedTab}
                                className="slate"
                            >
                                <Tab value={TAB_ALL} label="All Requests" />
                                <Tab value={TAB_MINE} label="My Requests" />
                                <Tab value={TAB_ACTION} label="Need Action" />
                                <Tab
                                    value={TAB_COMPLETED}
                                    label="Completed Requests"
                                />
                                {/* <Tab value={TAB_CANCELLED} label="Cancelled Requests" /> */}
                            </Tabs>
                        )}
                        {tabbed_document_view_switch && (
                            <div className="spacer detailDiv">
                                {selectedTab === TAB_ALL && (
                                    <div>
                                        View all the requests regardless of
                                        Phase, Status or Ownership.
                                    </div>
                                )}
                                {selectedTab === TAB_MINE && (
                                    <div>
                                        Find only the requests that you are the
                                        requestor.
                                    </div>
                                )}
                                {selectedTab === TAB_COMPLETED && (
                                    <div>
                                        Find the requests that are completed.
                                    </div>
                                )}
                                {/* {selectedTab == TAB_CANCELLED && <div>
                                Find the requests thate are cancelled.
                            </div>} */}
                                {selectedTab === TAB_ACTION && (
                                    <div>
                                        Find the requests that need action
                                    </div>
                                )}
                            </div>
                        )}
                        {!tabbed_document_view_switch && (
                            <h2>All Team-Outing Requests</h2>
                        )}

                        {!filteredDocuments && (
                            <div className="detailDiv spacer">
                                <h4 className="detailDiv roundedDiv">
                                    No documents for this selection
                                </h4>
                            </div>
                        )}

                        {filteredDocuments && (
                            <RequestDataGrid
                                title="Documents"
                                requests={filteredDocuments}
                                handleEditRow={handleEditRow}
                                handleDeleteRow={handleDeleteRow}
                                isAdmin={context.isAdministrator}
                                settings={gridSettings}
                                setSettings={handleSetGridSettings}
                            />
                        )}
                    </div>

                    {/* // TODO: Need to fix Dialog to accept closeable & actions */}

                    {showAlert != null && (
                        <StyledDialog
                            open={true}
                            // closeable={true}
                            actions={[
                                {
                                    label: 'Yes',
                                    onClick: async function onClick() {
                                        let id = showAlert.id;
                                        setShowAlert(null);
                                        await doDeleteRequest(id);
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
                            title="Delete Document?"
                        >
                            Do you want to delete the document "
                            {showAlert.title}"?
                        </StyledDialog>
                    )}
                    <div className="spacer detailDiv" />
                    <div className="spacer detailDiv" />
                </div>
            </div>
        </>
    );
};

export default TestDocumentListPage;
