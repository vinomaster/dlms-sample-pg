/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React, { useEffect, useState } from 'react';
import { DocumentInfo, Person } from '../common/common';
import { docStates, AppContext } from '../common/states';
import { Button, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import './CheckList.css';
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material';
import {
    ListItem,
    ListItemIcon,
    ListItemText,
    Tab,
    Tabs,
    LinearProgress,
    LinearProgressProps,
    Link,
    Select,
    InputLabel,
    MenuItem,
    Modal,
    Box,
} from '@mui/material';
import ActionButtons from './ActionButtons';
import UserAvatar from './UserAvatar';
import AddPerson from './AddPerson';
import { DocMgr } from '../models/DocMgr';
import { PeopleHandler } from './PeopleHandler';
import Attachments from '../components/Attachments';
import AllCommentsModal from './AllCommentsModal';
import CloseIcon from '@mui/icons-material/Close';

const CheckListItem = (props: any) => {
    const style = props.style || {};
    return (
        <ListItem style={style} onClick={props.onClick}>
            <ListItemIcon>
                {props.checked && <CheckBox style={{ color: 'black' }} />}
                {!props.checked && (
                    <CheckBoxOutlineBlank style={{ color: 'black' }} />
                )}
            </ListItemIcon>
            <ListItemText className="caption" primary={props.label} />
        </ListItem>
    );
};

const CommentModalStyle = {
    position: 'absolute',
    left: '50%',
    transform: 'translate(-50%, 0)',
    width: '80%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    borderRadius: '16px',
};

const tabWidth = { minWidth: '50%', width: '100%' };

interface Props {
    document: DocumentInfo;
    context: AppContext;
    setDocument: (
        document: DocumentInfo,
        fields?: string[]
    ) => Promise<void> | undefined;
    list: any;
    children?: React.ReactNode;
}

/**
 * Component for rendering the checklist.
 *
 * @param {DocumentInfo} props.document - The document info
 * @param {AppContext} props.context - The app context
 * @param props.setDocument - The function to set the document
 * @param {any} props.list - The list
 * @param {React.ReactNode} props.children - The children
 *
 * @returns {JSX.Element}
 */
const CheckList: React.FC<Props> = ({
    context,
    document,
    setDocument,
    list,
    children,
}) => {
    const docMgr = DocMgr.getInstance();
    const peopleHandler = PeopleHandler.getInstance();

    const [renderedList, setRenderedList] = useState<any>();
    const [enableActions, setEnableActions] = useState<any>({});
    const [progress, setProgress] = useState<number>(0);

    const [reviewers, setReviewers] = useState<Person[]>([]);
    const [selectedReviewer, setSelectedReviewer] = useState<string>('');

    const [showAllComments, setShowAllComments] = useState<boolean>(false);

    const [selectedTab, setSelectedTab] = useState<string>(
        window.localStorage.getItem('request-checklist-selectedTab') ||
            'checklist'
    );
    useEffect(() => {
        if (selectedTab) {
            console.log('Selected tab changed =', selectedTab);
            window.localStorage.setItem(
                'request-checklist-selectedTab',
                selectedTab
            );
        }
    }, [selectedTab]); // eslint-disable-line react-hooks/exhaustive-deps

    function LinearProgressWithLabel(
        props: LinearProgressProps & { value: number }
    ) {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    paddingTop: '10px',
                    gap: '10px',
                }}
            >
                <div style={{ width: '100%' }}>
                    <LinearProgress variant="determinate" {...props} />
                </div>
                <div style={{ minWidth: 35 }}>
                    <div>{`${Math.round(props.value)}%`}</div>
                </div>
            </div>
        );
    }

    useEffect(() => {
        async function getReviewers() {
            const r = await DocMgr.getInstance().getUserGroup('ReviewerGroup');
            setReviewers(r.members);
        }
        getReviewers();
    }, []);

    useEffect(() => {
        const enabledTabs = {} as any;
        {
            let cnt = 0;
            let maxCnt = 0;
            const r = [];
            let b = true;
            let _list = list['checklist'];
            if (_list === undefined) {
                _list = list;
            }
            for (var i = 0; i < _list.length; i++) {
                const item = _list[i];

                if (item.fields === undefined) {
                    r.push(<h6>{item.label}</h6>);
                } else {
                    let checked = true;
                    cnt++;
                    maxCnt++;
                    if (typeof item.fields === 'function') {
                        const r = item.fields(document);
                        if (!r) {
                            checked = false;
                            b = false;
                            cnt--;
                        }
                    } else {
                        for (var j = 0; j < item.fields.length; j++) {
                            const field = item.fields[j];
                            const parts = field.split('.');
                            let val = document as any;
                            for (var k = 0; k < parts.length; k++) {
                                const part = parts[k];
                                // If requestors
                                if (part === 'requestors') {
                                    const person = val[part];
                                    let found = false;
                                    for (const p in person) {
                                        if (!person[p].requested) {
                                            found = true;
                                            break;
                                        }
                                    }
                                    if (!found) {
                                        checked = false;
                                        b = false;
                                        cnt--;
                                        break;
                                    }
                                }
                                // If field not set
                                else if (Array.isArray(val[part])) {
                                    if (val[part].length === 0) {
                                        checked = false;
                                        b = false;
                                        cnt--;
                                        break;
                                    }
                                } else if (!val[part]) {
                                    checked = false;
                                    b = false;
                                    cnt--;
                                    break;
                                }
                                // If yn question or timeline
                                else if (val[part].hasOwnProperty('yesNo')) {
                                    const item = val[part];
                                    console.log(
                                        '>>> ITEM=',
                                        part,
                                        'item=',
                                        item
                                    );
                                    if (
                                        !item.yesNo ||
                                        (item.yesNo === 'yes' && !item.value)
                                    ) {
                                        checked = false;
                                        b = false;
                                        cnt--;
                                        break;
                                    }
                                }
                                val = val[part];
                            }
                            if (!checked) break;
                        }
                    }
                    const style = {} as any;
                    if (context.showSection && item.link) {
                        style.cursor = 'pointer';
                    }
                    r.push(
                        <CheckListItem
                            className="checklist-items"
                            label={item.label}
                            checked={checked}
                            style={style}
                            onClick={() => {
                                if (context.showSection && item.link)
                                    context.showSection(item.link);
                            }}
                        />
                    );
                }
            }
            const z = React.createElement(React.Fragment, {}, ...r); // This removes warning messages about keys
            setRenderedList(z);
            //setEnableChecklistActions(b);
            enabledTabs['checklist'] = b;
            setProgress((cnt * 100) / maxCnt);
        }

        for (var s in ['requestors', 'reviewers']) {
            //let cnt = 0;
            //let maxCnt = 0;
            let b = true;
            let _list = list[s];
            if (_list !== undefined) {
                for (var ii = 0; ii < _list.length; ii++) {
                    const item = _list[ii];
                    let checked = true;
                    //cnt++;
                    //maxCnt++;

                    if (typeof item.fields === 'function') {
                        const r = item.fields(document);
                        if (!r) {
                            checked = false;
                            b = false;
                            //cnt--;
                        }
                    } else {
                        for (var jj = 0; jj < item.fields.length; jj++) {
                            const field = item.fields[jj];
                            const parts = field.split('.');
                            let val = document as any;
                            for (var kk = 0; kk < parts.length; kk++) {
                                const part = parts[kk];
                                // If field not set
                                if (!val[part]) {
                                    checked = false;
                                    b = false;
                                    //cnt--;
                                    break;
                                }
                                // If yn question or timeline
                                else if (val[part].hasOwnProperty('yesNo')) {
                                    const item = val[part];
                                    console.log(
                                        '>>> ITEM=',
                                        part,
                                        'item=',
                                        item
                                    );
                                    if (
                                        !item.yesNo ||
                                        (item.yesNo === 'yes' && !item.value)
                                    ) {
                                        checked = false;
                                        b = false;
                                        //cnt--;
                                        break;
                                    }
                                }
                                val = val[part];
                            }
                            if (!checked) break;
                        }
                    }
                }
            }
            enabledTabs[s] = b;
        }
        setEnableActions(enabledTabs);
    }, [document]); // eslint-disable-line react-hooks/exhaustive-deps

    const renderCheckList = () => {
        return (
            <>
                <div className="checklist-progress">
                    {/* TODO: Progress Bar is not showing */}
                    <div className="caption-bold">Progress:</div>
                    {/* <Progress progress={progress} /> */}
                    <LinearProgressWithLabel value={progress} />
                </div>
                <div className="checklist-items1">{renderedList}</div>
                <div className="checklist-items">{children}</div>
                {/* <div className='checklist-buttons-test'>
                    
                </div> */}
                <ActionButtons
                    document={document}
                    setDocument={setDocument}
                    context={context}
                    enabled={enableActions['checklist']}
                    tab="checklist"
                />
            </>
        );
    };

    const renderRequestor = (requestor: any) => {
        const r = [];
        if (requestor.owner) {
            r.push(<div>Owner</div>);
            r.push(
                <Link
                    onClick={() =>
                        peopleHandler.releaseProject(
                            context,
                            document,
                            setDocument,
                            requestor
                        )
                    }
                >
                    Release request
                </Link>
            );
        } else {
            r.push(<div>Requestor</div>);
            if (
                !requestor.requested &&
                (context.isAdministrator || context.isReviewer)
            ) {
                r.push(
                    <div>
                        <Link
                            onClick={() =>
                                peopleHandler.leaveProject(
                                    requestor,
                                    document,
                                    setDocument
                                )
                            }
                        >
                            Leave request
                        </Link>
                    </div>
                );
            }
            if (
                !requestor.requested &&
                (context.isRequestor || context.isAdministrator)
            ) {
                r.push(
                    <div>
                        <Link
                            onClick={() =>
                                peopleHandler.setOwnerOfProject(
                                    context,
                                    document,
                                    setDocument,
                                    requestor
                                )
                            }
                        >
                            Set as owner
                        </Link>
                    </div>
                );
            }
            if (requestor.requested) {
                if (requestor.email === context.user.email) {
                    r.push(<div>Requested</div>);
                } else {
                    r.push(<div>Requested</div>);
                }
                if (context.isAdministrator || context.isRequestor) {
                    r.push(
                        <>
                            <Link
                                onClick={() =>
                                    peopleHandler.acceptInvite(
                                        requestor,
                                        document,
                                        setDocument
                                    )
                                }
                            >
                                Approve
                            </Link>
                            <Link
                                onClick={() =>
                                    peopleHandler.leaveProject(
                                        requestor,
                                        document,
                                        setDocument
                                    )
                                }
                                style={{ paddingLeft: 'var(--spacing-2' }}
                            >
                                Reject
                            </Link>
                        </>
                    );
                }
            }
        }
        const z = React.createElement(React.Fragment, {}, ...r); // This removes warning messages about keys
        return (
            <div
                style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                    paddingBottom: '10px',
                }}
            >
                <UserAvatar user={requestor} />
                <div>
                    <div>{requestor.name}</div>
                    {z}
                </div>
            </div>
        );
    };

    const renderRequestors = () => {
        const r: any = [];
        let found = false; // T=there are requestors in list (not just requested)
        let requestor: any; // If the current user is also a requested requestor
        if (document.requestors && document.requestors.length > 0) {
            for (const person of document.requestors) {
                r.push(renderRequestor(person));
                if (!person.requested) {
                    found = true;
                }
                if (person.requested) {
                    if (person.email === context.user.email) {
                        requestor = person;
                    }
                }
            }
        }
        if (!found) {
            r.push(
                <div>
                    <div>There are no requestors.</div>
                    <div className="spacer" />
                    {!requestor && (
                        <>
                            <div>This request is looking for a new owner.</div>
                            <div className="spacer" />
                            <Button
                                onClick={async () => {
                                    let user = { ...context.user } as any;
                                    if (user.id) delete user.id;
                                    if (user.roles) delete user.roles;
                                    const r = await docMgr.runAction(document, {
                                        action: 'ownerRequest',
                                        person: user,
                                    });
                                    if (r) {
                                        setDocument(r);
                                    }
                                }}
                            >
                                Request Ownership
                            </Button>
                        </>
                    )}
                    {requestor && (
                        <div>
                            You have already requested ownership. Your request
                            is under consideration.
                        </div>
                    )}
                </div>
            );
        }
        const z = React.createElement(React.Fragment, {}, ...r); // This removes warning messages about keys
        return (
            <>
                <div className="checklist-subcontent">{z}</div>
                {!found && !context.isAdministrator && requestor && (
                    <div className="spacer">
                        You've been invited to contribute to the the project.
                        <div className="spacer">
                            <Button
                                onClick={() =>
                                    peopleHandler.acceptInvite(
                                        requestor,
                                        document,
                                        setDocument
                                    )
                                }
                            >
                                Accept
                            </Button>
                            <Link
                                onClick={() =>
                                    peopleHandler.leaveProject(
                                        requestor,
                                        document,
                                        setDocument
                                    )
                                }
                                style={{ paddingLeft: '20px' }}
                            >
                                Pass
                            </Link>
                        </div>
                    </div>
                )}

                {found && (context.isRequestor || context.isAdministrator) && (
                    <>
                        <h6>Invite Requestor</h6>
                        <div className="checklist-subcontent">
                            <AddPerson
                                label="Enter email for requestor"
                                handleAdd={(email: string) =>
                                    peopleHandler.addRequestor(
                                        context,
                                        document,
                                        setDocument,
                                        email
                                    )
                                }
                            />
                        </div>
                    </>
                )}

                <div className="checklist-buttons">
                    <ActionButtons
                        document={document}
                        setDocument={setDocument}
                        context={context}
                        enabled={enableActions['checklist']}
                        tab="requestors"
                    />
                </div>
            </>
        );
    };

    const renderReviewers = () => {
        const r: any = [];
        if (document.reviewers && document.reviewers.length > 0) {
            for (const person of document.reviewers) {
                r.push(
                    <div
                        style={{
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'center',
                            paddingBottom: '10px',
                        }}
                    >
                        <UserAvatar user={person} />
                        <div>
                            <div>{person.name}</div>
                            <div>{person.title}</div>
                            {context.isAdministrator && (
                                <div>
                                    <Link
                                        onClick={() =>
                                            peopleHandler.removeReviewer(
                                                document,
                                                setDocument,
                                                person
                                            )
                                        }
                                    >
                                        Remove Reviewer
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                );
            }
        } else {
            r.push(
                <div>
                    <div>Nobody has been assigned yet.</div>
                    <div className="spacer" />
                    <div>
                        Usually, a reviewer is assigned after the request is
                        submitted.
                    </div>
                </div>
            );
        }
        const z = React.createElement(React.Fragment, {}, ...r); // This removes warning messages about keys
        return (
            <>
                <div className="checklist-subcontent">{z}</div>
                {context.isAdministrator && (
                    <div className="spacer">
                        <h6>Add Reviewer</h6>
                        <div className="checklist-subcontent">
                            <InputLabel id="reviewer-select-label">
                                Reviewer
                            </InputLabel>
                            <Select
                                id="reviewer-select"
                                labelId="reviewer-select-label"
                                label="Reviewer"
                                autoWidth
                                sx={{ minWidth: '60%', maxWidth: '80%' }}
                                value={selectedReviewer}
                                onChange={e =>
                                    setSelectedReviewer(e.target.value)
                                }
                            >
                                {renderReviewerSelectables()}
                            </Select>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            <IconButton
                                disabled={selectedReviewer === ''}
                                onClick={() =>
                                    peopleHandler.addReviewer(
                                        document,
                                        setDocument,
                                        selectedReviewer
                                    )
                                }
                                aria-label={'Add Reviewer'}
                            >
                                <AddIcon />
                            </IconButton>
                        </div>
                    </div>
                )}
                <div className="checklist-buttons">
                    <ActionButtons
                        document={document}
                        setDocument={setDocument}
                        context={context}
                        enabled={enableActions['checklist']}
                        tab="reviewers"
                    />
                </div>
            </>
        );
    };

    const renderReviewerSelectables = () => {
        // console.log("reviwers:", reviwers)
        var r = [];
        var selectables = reviewers;
        for (var i = 0; i < selectables.length; i++) {
            const s = selectables[i].name;
            r.push(
                <MenuItem key={s} value={selectables[i].email}>
                    {s}
                </MenuItem>
            );
        }
        return r;
    };

    const renderAttachments = () => {
        return (
            <>
                <div className="detailDiv">
                    <Attachments
                        document={document}
                        setDocument={setDocument}
                        context={context}
                    />
                </div>
            </>
        );
    };

    const handleStateChange = async (event: any) => {
        console.log(event.target.value);
        const newState = event.target.value;
        const r = await docMgr.saveDocument(
            { id: document.id, state: newState },
            'state'
        );
        if (r) {
            setDocument(r);
        }
    };

    const renderState = () => {
        return (
            <div>
                <Select
                    style={{ fontSize: '100%', height: '45px' }}
                    onChange={handleStateChange}
                    value={document.state}
                >
                    {Object.keys(docStates)
                        .filter((s: string) => {
                            return s !== 'start';
                        })
                        .map((s: string) => {
                            return (
                                <MenuItem key={'stateSelect_' + s} value={s}>
                                    <>
                                        {docStates[s].label}{' '}
                                        {/* <span style={{fontStyle:"italic"}}>({docStates[s].description})</span> */}
                                    </>
                                </MenuItem>
                            );
                        })}
                </Select>
            </div>
        );
    };

    return (
        <div className="checklist-container">
            <Modal open={showAllComments} sx={{ overflow: 'scroll' }}>
                <Box sx={CommentModalStyle}>
                    <h3>All Comments</h3>
                    <IconButton
                        size="large"
                        style={{
                            position: 'fixed',
                            top: '24px',
                            right: '24px',
                        }}
                        onClick={() => setShowAllComments(false)}
                        aria-label={'Close'}
                    >
                        <CloseIcon />
                    </IconButton>
                    <br />
                    <AllCommentsModal
                        document={document}
                        setDocument={setDocument}
                        context={context}
                    />
                </Box>
            </Modal>
            <div className="checklist-content">
                <div>
                    <span
                        style={{
                            textTransform: 'uppercase',
                            paddingTop: '10px',
                            paddingRight: '8px',
                        }}
                    >
                        {document.title}
                    </span>
                    <br />
                    <Link
                        onClick={() => setShowAllComments(true)}
                        style={{ fontSize: 'smaller' }}
                    >
                        <i>(View all comments)</i>
                    </Link>
                </div>
                {selectedTab === 'checklist' && (
                    <>
                        <h4>Check List</h4>
                        {renderCheckList()}
                    </>
                )}
                {selectedTab === 'requestors' && (
                    <>
                        <h4>Requestors</h4>
                        {renderRequestors()}
                    </>
                )}
                {selectedTab === 'reviewers' && (
                    <>
                        <h4>Reviewers</h4>
                        {renderReviewers()}
                    </>
                )}
                {selectedTab === 'deliveryTeam' && (
                    <>
                        <h4>Delivery Team</h4>
                        {renderDeliveryTeam(context, document, setDocument)}
                        <div className="checklist-buttons">
                            <ActionButtons
                                document={document}
                                setDocument={setDocument}
                                context={context}
                                enabled={enableActions['checklist']}
                                tab="deliveryTeam"
                            />
                        </div>
                    </>
                )}

                {selectedTab === 'attachments' && (
                    <>
                        <h4>Attachments</h4>
                        {renderAttachments()}
                    </>
                )}

                {context.isAdministrator && (
                    <div style={{ paddingTop: '100px' }}>
                        <div>Admin can change State:</div>
                        {renderState()}
                    </div>
                )}
            </div>

            <div className="checklist-sidemenu">
                {/* TODO: Figure out MUI Tab stylings */}
                <Tabs
                    orientation="vertical"
                    value={selectedTab}
                    onChange={(event: any, newValue: string) =>
                        setSelectedTab(newValue)
                    }
                    sx={{
                        '.MuiTabs-indicator': {
                            left: 2,
                            width: 4,
                        },
                    }}
                >
                    <Tab
                        value="checklist"
                        icon={
                            <img
                                src="../sidemenuCheckbox.svg"
                                alt="CheckList"
                            />
                        }
                        aria-label="checklist"
                        style={tabWidth}
                    />
                    <Tab
                        value="requestors"
                        icon={
                            <img
                                src="../sidemenuRequestors.svg"
                                alt="Requestors"
                            />
                        }
                        aria-label="requestors"
                        style={tabWidth}
                    />
                    <Tab
                        value="reviewers"
                        icon={
                            <img
                                src="../sidemenuReviewers.svg"
                                alt="Reviewers"
                            />
                        }
                        aria-label="reviewers"
                        style={tabWidth}
                    />
                    <Tab
                        value="attachments"
                        icon={
                            <img
                                src="../sidemenuAttachments.svg"
                                alt="Attachments"
                            />
                        }
                        aria-label="attachments"
                        style={tabWidth}
                    />
                </Tabs>
            </div>
        </div>
    );
};

export default CheckList;

export const renderDeliveryTeam = (
    context: AppContext,
    document: DocumentInfo,
    setDocument: (
        document: DocumentInfo,
        fields?: string[]
    ) => Promise<void> | undefined
) => {
    const peopleHandler = PeopleHandler.getInstance();
    const r: any = [];
    let found = false;
    if (document.deliveryTeam && document.deliveryTeam.length > 0) {
        for (const person of document.deliveryTeam) {
            r.push(
                <div
                    style={{
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                        paddingBottom: '10px',
                    }}
                >
                    <UserAvatar user={person} />
                    <div>
                        <div>{person.name}</div>
                        <div>{person.title}</div>
                        {(context.isAdministrator || context.isReviewer) && (
                            <div>
                                <Link
                                    onClick={() =>
                                        peopleHandler.removeDeliveryTeam(
                                            document,
                                            setDocument,
                                            person
                                        )
                                    }
                                >
                                    Remove member
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            );
            found = true;
        }
    }
    if (!found) {
        r.push(
            <>
                <div>Nobody has been assigned yet.</div>
                <div className="spacer" />
                <div>
                    Usually, a delivery team is assigned after the request has
                    been approved.
                </div>
            </>
        );
    }
    const z = React.createElement(React.Fragment, {}, ...r); // This removes warning messages about keys
    return (
        <>
            {z}
            {(context.isRequestor ||
                context.isReviewer ||
                context.isAdministrator) && (
                <div className="spacer">
                    <h6>Add Member</h6>
                    <div className="checklist-subcontent">
                        <AddPerson
                            label="Enter email for member"
                            handleAdd={(email: string) =>
                                peopleHandler.addDeliveryTeam(
                                    document,
                                    setDocument,
                                    email
                                )
                            }
                        />
                    </div>
                </div>
            )}
        </>
    );
};
