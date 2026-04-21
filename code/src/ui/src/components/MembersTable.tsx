/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React from 'react';
//import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { styled } from '@mui/material';
import { Person } from '../common/common';

interface Props {
    members: Person[];
    setMembers: React.Dispatch<React.SetStateAction<Person[]>>;
    updated?(data: Person[]): Promise<void>;
    disabled?: boolean;
}

/**
 * Renders the MembersTable component with member information and handles member deletion.
 *
 * @param props.members - The list of members
 * @param props.setMembers - The function to set the list of members
 * @param props.updated - The function to call when the list of members is updated
 * @param props.disabled - Indicates whether the component is disabled
 *
 * @returns {JSX.Element}
 */
const MembersTable: React.FC<Props> = ({
    members,
    setMembers,
    updated,
    disabled,
}) => {
    const TableTheme = styled('table')(({ theme }: any) => ({
        width: '100%',
        '.name': {
            width: '250px;',
        },
        '.email': {
            minWidth: '200px;',
        },
        '.action': {
            width: '150px;',
        },
        '.contact': {
            width: '250px;',
        },
    }));

    /**
     * Member deleted
     *
     * @param event
     */
    async function handleDeleteMember(event: any): Promise<void> {
        event.preventDefault();
        console.log('delete member: ', event.target.value);
        const id = event.target.value;
        let data = members.filter((item: Person, i) => {
            return i !== id; // can't be !==
        });
        await setMembers(data);
        if (updated) {
            await updated(data);
        }
    }

    /**
     * New name edited
     *
     * @param event
     */
    //  async function handleNewName(event: any): Promise<void> {
    //     event.preventDefault();
    //     console.log(event.target.value);
    //     setNewName(event.target.value);
    // }

    /**
     * New email edited
     *
     * @param event
     */
    //  async function handleNewEmail(event: any): Promise<void> {
    //     event.preventDefault();
    //     console.log(event.target.value);
    //     setNewEmail(event.target.value);
    // }

    /**
     * Add member
     *
     * @param event
     */
    //  async function handleAddMember(event: any): Promise<void> {
    //     event.preventDefault();
    //     console.log("add member: ", event.target.value);
    //     if (!newEmail) {
    //         alert("Missing email");
    //         return;
    //     }
    //     let member: Person = {
    //         name:  newName,
    //         department: "",
    //         email: newEmail,
    //         phone: "",
    //         title: "",
    //         employeeNumber: "",
    //     }
    //     let data = [...members];
    //     data.push(member);
    //     console.log("new member list=",data)
    //     await setMembers(data);
    //     if (updated) {
    //         await updated(data);
    //     }
    //     setNewName("");
    //     setNewEmail("");
    // }

    // useEffect(() => {
    //     console.log("State of new member updated");
    // }, [newName, newEmail])

    if (members && members.length > 0) {
        return (
            <div>
                <TableTheme className="membersTable roundedTable">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            {!disabled && <th>Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((member, i) => (
                            <tr key={i} style={{ height: '40px' }}>
                                <td className="name">{member.name}</td>
                                <td className="email">{member.email}</td>
                                {!disabled && (
                                    <td className="action actionCol">
                                        <Button
                                            value={i}
                                            onClick={handleDeleteMember}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </TableTheme>
            </div>
        );
    } else {
        return <div>No members</div>;
    }
};

export default MembersTable;
