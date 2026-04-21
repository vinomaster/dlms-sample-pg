/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React, { useState, useEffect } from 'react';
import { Button, Input, CircularProgress } from '@mui/material';
import { IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Select, MenuItem, Backdrop, InputLabel } from '@mui/material';
import { Person, UserGroupInfo } from './common/common';
import { AppContext } from './common/states';
import { useNavigate } from 'react-router-dom';
import MembersTable from './components/MembersTable';
import AddPerson from './components/AddPerson';
import { SimpleDialog } from './components/SimpleDialog';
import { Admin } from './models/Admin';
import { DocMgr } from './models/DocMgr';
import Navbar from './navbar';
import TopBanner from './components/TopBanner';
import ConfigSwitchModal from './components/ConfigSwitchModal';
let admin = new Admin();

interface Props {
    context: AppContext;
}

let initComplete = false;

/**
 * Renders the Admin Page with group management functionalities.
 *
 * @param {Props} context - The context containing the state of the application
 * @returns {JSX.Element} The rendered Admin Page component
 */
const AdminPage: React.FC<Props> = ({ context }) => {
    const navigate = useNavigate();

    const [group, setGroup] = useState<string>('');
    const [groups, setGroups] = useState<UserGroupInfo[]>([]);
    const [members, setMembers] = useState<Person[]>([]);
    const [inputGroup, setInputGroup] = useState<string>('');
    const [showDialog, setShowDialog] = useState<any>(null);
    const [showDelete, setShowDelete] = useState<boolean>(true);
    const [showSpinner, setShowSpinner] = useState<string>('');

    useEffect(() => {
        console.log('Init page load');
        const init = async () => {
            await admin.init();
            const _groups = await admin.getGroups();
            setGroups(_groups);
            if (_groups) {
                let groupId = window.localStorage.getItem('adminGroup');
                if (!groupId || groupId === 'undefined' || !getGroup(groupId)) {
                    groupId = _groups[0].id;
                }
                console.log('Trying to select group: ', groupId);
                for (const _group of _groups) {
                    if (_group.id === groupId) {
                        setGroup(_group.id);
                        break;
                    }
                }
            }
            console.log(' -- init page done');
            initComplete = true;
        };
        init();

        function clear() {
            console.log('Clean up page');
            initComplete = false;
        }
        return () => {
            clear();
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /** Returns the group with the given id */
    function getGroup(id: string): UserGroupInfo | undefined {
        for (const _group of groups) {
            if (_group.id === id) {
                return _group;
            }
        }
    }

    /** Update the selected group */
    useEffect(() => {
        console.log('Selected group updated: ', group);
        if (initComplete) {
            console.log('Get new members for group');
            if (group) {
                const r = getGroup(group);
                console.log('getGroup=', r);
                if (r) {
                    setMembers(r.members);
                    setShowDelete(r.deletable);
                    window.localStorage.setItem('adminGroup', group);
                }
            }
        }
    }, [group]); // eslint-disable-line react-hooks/exhaustive-deps

    async function handleAdd(event: any): Promise<any> {
        console.log('handleAdd()');
        event.preventDefault();
        console.log('add group: ', inputGroup);
        const r = await admin.addGroup(inputGroup);
        const _groups = groups;
        _groups.push(r);
        setGroups(_groups);
        setGroup(r.id);
        setInputGroup('');
    }

    async function handleDelete(event: any): Promise<any> {
        console.log('handleDelete()');
        event.preventDefault();
        console.log('delete group: ', group);
        if (group) {
            let indexOfDeletedGroup = 0;
            for (var i = 0; i < groups.length; i++) {
                if (groups[i].id === group) {
                    indexOfDeletedGroup = i;
                }
            }
            if (indexOfDeletedGroup > 0) {
                indexOfDeletedGroup = indexOfDeletedGroup - 1;
            }
            if (indexOfDeletedGroup < 0) {
                indexOfDeletedGroup = 0;
            }
            await admin.deleteGroup(group);
            const _groups = await admin.getGroups();
            setGroups(_groups);
            setGroup(groups[indexOfDeletedGroup].id);
        }
    }

    async function handleInputChange(value: string): Promise<any> {
        console.log('add changed: ', value);
        setInputGroup(value);
    }

    async function handleGroupSelected(event: any): Promise<void> {
        console.log('handleGroupSelected: ', event.target.value);
        setGroup(event.target.value);
    }

    async function handleGroupUpdated(data: Person[]): Promise<void> {
        console.log('handleGroupUpdated() group=', group, ' members=', data);
        if (group) {
            await admin.setMembers(group, data);
        }
    }

    /**
     * Handles the addition of a new member to a group.
     *
     * @param {string} email - The email of the member to add
     * @param {boolean} create - Flag indicating whether to create the member if not found
     * @returns {void}
     */
    async function handleAddMember(
        email: string,
        create: boolean = false
    ): Promise<void> {
        console.log(`handleAddMember(${email}, ${create})`);
        if (!group) {
            setShowDialog({
                title: 'Error adding member.',
                text: `Group not selected.`,
            });
            return;
        }
        if (!email) {
            setShowDialog({
                title: 'Error adding member.',
                text: `Missing email address.`,
            });
            return;
        }
        setShowSpinner('Getting emails...');
        const docMgr = DocMgr.getInstance();
        const person = await docMgr.getUserProfile(email);
        setShowSpinner('');
        console.log('person=', person);
        let member: Person = {
            name: email.split('@')[0],
            department: '',
            email: email.indexOf('@') > -1 ? email : '',
            title: '',
            employeeNumber: '',
        };
        if (!person || person.error || person.length === 0) {
            if (!create) {
                setShowDialog({
                    title: 'Error adding member.',
                    text: `The members's email address "${email}" was not found.  Do you want to add them anyway?`,
                    email: email,
                });
                return;
            }
        } else {
            member.email = person[0].user.email;
            member.name = person[0].user.name;
            member.department = person[0].user.department;
            member.title = person[0].user.title;
            member.employeeNumber = person[0].user.employeeNumber;
        }
        let data = [...members];
        data.push(member);
        console.log('new member list=', data);
        await setMembers(data);
        await handleGroupUpdated(data);
    }

    /**
     * Renders an alert dialog based on the showDialog state.
     *
     * @returns {JSX.Element} The JSX element representing the alert dialog
     */
    const renderAlert = () => {
        console.log('renderAlert=', showDialog);
        if (!showDialog) {
            return;
        }
        let actions = [
            {
                label: 'Close',
                onClick: async function onClick() {
                    return setShowDialog(null);
                },
            },
        ];
        if (showDialog.email) {
            actions.push({
                label: 'Yes',
                onClick: async function onClick() {
                    await handleAddMember(showDialog.email, true);
                    return setShowDialog(null);
                },
            });
        }

        // TODO: Need to fix Dialog to accept closeable & actions

        return (
            <SimpleDialog
                open={showDialog != null}
                // closeable={true}
                actions={actions}
                onClose={function onClose() {
                    return setShowDialog(null);
                }}
                title={showDialog ? showDialog.title : ''}
            >
                {showDialog ? showDialog.text : ''}
            </SimpleDialog>
        );
    };

    console.log('RENDER: members=', members);

    return (
        <>
            <Navbar context={context} />
            <div className="content1" style={{ marginTop: '0px' }}>
                <TopBanner
                    user={context.user}
                    headerText="Document Administration"
                >
                    <div
                        style={{
                            display: 'flex',
                            paddingRight: '20px',
                            paddingTop: '10px',
                            justifyContent: 'flex-end',
                        }}
                    >
                        <ConfigSwitchModal />
                        <Button
                            onClick={async () => {
                                navigate('/');
                            }}
                        >
                            Dashboard
                        </Button>
                    </div>
                </TopBanner>
                {renderAlert()}
                <div className="content">
                    <div className="detailDiv">
                        <h2>Select Group to Edit</h2>
                        <div>
                            <InputLabel id="selectGroup">Group Name</InputLabel>
                            <Select
                                id="selectGroup"
                                style={{
                                    fontSize: '100%',
                                    height: '45px',
                                    width: '300px',
                                }}
                                onChange={handleGroupSelected}
                                value={group}
                                label="Group"
                            >
                                {groups.map((group: UserGroupInfo) => {
                                    return (
                                        <MenuItem
                                            key={group.id}
                                            value={group.id}
                                        >
                                            {group.id}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </div>
                        <br />
                        <h2>Add a New Group</h2>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {/* TODO: This doesn't render the same as before */}
                            <Input
                                id="newGroupName"
                                className="text"
                                type="input"
                                style={{ width: '350px' }}
                                placeholder="New group name"
                                value={inputGroup}
                                onChange={(e: any) =>
                                    handleInputChange(e.target.value)
                                }
                            ></Input>
                            &nbsp; &nbsp;
                            <IconButton onClick={handleAdd} aria-label={'Add'}>
                                <AddIcon />
                            </IconButton>
                        </div>
                        <br />
                        <h2>Editing Group {group}</h2>
                        <div className="detailDiv">
                            <MembersTable
                                members={members}
                                setMembers={setMembers}
                                updated={handleGroupUpdated}
                            />
                            <div>&nbsp;</div>
                            <AddPerson
                                label="Email of new member to add to group"
                                handleAdd={value => {
                                    console.log('Add Member: ', value);
                                    handleAddMember(value);
                                }}
                            />
                            <br />
                            {showDelete && (
                                <Button onClick={handleDelete}>
                                    Delete Group
                                </Button>
                            )}
                        </div>
                    </div>

                    <Backdrop
                        sx={{
                            color: '#fff',
                            zIndex: theme => theme.zIndex.drawer + 1,
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
                </div>
            </div>
        </>
    );
};

export default AdminPage;
