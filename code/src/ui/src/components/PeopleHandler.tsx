/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React from 'react';
import { DocumentInfo, Requestor, Person } from '../common/common';
import { AppContext } from '../common/states';
import { Button } from '@mui/material';
import { DocMgr } from '../models/DocMgr';

export class PeopleHandler {
    ideationMgr: DocMgr = DocMgr.getInstance();

    private static instance: PeopleHandler;

    public static init(): PeopleHandler {
        console.log(`PeopleHandler.init()`);
        if (this.instance !== undefined) {
            return this.instance;
        }
        this.instance = new PeopleHandler();
        return this.instance;
    }

    public static getInstance(): PeopleHandler {
        return this.init();
    }

    async acceptInvite(
        ideator: any,
        document: DocumentInfo,
        setDocument?: (
            document: DocumentInfo,
            fields?: string[]
        ) => Promise<void> | undefined
    ) {
        console.log('Accept invitation to project for ', ideator);
        let data = document.requestors ? [...document.requestors] : [];
        let isOwnerFound = false;
        for (var i = 0; i < data.length; i++) {
            if (data[i].owner) {
                isOwnerFound = true;
                break;
            }
        }
        for (var ii = 0; ii < data.length; ii++) {
            if (data[ii].email === ideator.email) {
                data[ii].requested = false;
                if (!isOwnerFound) {
                    // If no owner, then set this one to the owner
                    data[ii].owner = true;
                }
            }
        }
        let r = await this.ideationMgr.saveDocument(
            { id: document.id, requestors: data },
            'requestors'
        );
        if (r && setDocument) {
            await setDocument(r);
        }
        // let newState = "";
        // // If in state Abandon_Idea, then change state
        // if (document.state == "Abandon_Idea") {
        //     newState = "Idea_Submitted";
        // }
        // // If in state Abandon_Concept, then change state
        // else if (document.state == "Abandon_Concept") {
        //     newState = "Discover";
        // }
        // else if (document.state == "Idea_Looking_For_New_Owner") {
        //     newState = "Discover";
        // }
        // if (newState) {
        //     r = await this.ideationMgr.saveDocument({ id: document.id, state: newState }, "state");
        //     if (r && setDocument) {
        //         setDocument(r);
        //     }
        // }
        // else if (r && setDocument) {
        //     setDocument(r);
        // }
        // }
    }

    async leaveProject(
        ideator: Requestor,
        document: DocumentInfo,
        setDocument?: (
            document: DocumentInfo,
            fields?: string[]
        ) => Promise<void> | undefined
    ) {
        console.log('Leave project for ', ideator);
        let data = document.requestors ? [...document.requestors] : [];
        for (var i = 0; i < data.length; i++) {
            if (data[i].email === ideator.email) {
                data.splice(i, 1);
                break;
            }
        }
        const r = await this.ideationMgr.saveDocument(
            { id: document.id, requestors: data },
            'requestors'
        );
        if (r && setDocument) {
            await setDocument(r);
        }
    }

    async releaseProject(
        context: AppContext,
        document: DocumentInfo,
        setDocument: (
            document: DocumentInfo,
            fields?: string[]
        ) => Promise<void> | undefined,
        ideator: any
    ) {
        console.log('Release project for ', ideator);
        // // If creation phase, then next state = "Abandon_Idea" else "Abandon_Concept"
        // let nextState = "Abandon_Idea";
        // if (context.phaseDisplayed?.tab != "Creation") {
        //     nextState = "Abandon_Concept";
        // }
        // if (document.state == "Idea_Approved") {
        //     nextState = "Idea_Looking_For_New_Owner";
        // }
        // console.log(">>>> NEXT STATE=", nextState)
        // const r = await this.ideationMgr.saveDocument({ id: document.id, state: nextState }, "state");
        // if (r) {
        //     setDocument(r);
        // }
    }

    async setOwnerOfProject(
        context: AppContext,
        document: DocumentInfo,
        setDocument: (
            document: DocumentInfo,
            fields?: string[]
        ) => Promise<void> | undefined,
        ideator: any
    ) {
        console.log('Set new owner of project to ', ideator);
        let data = document.requestors ? [...document.requestors] : [];
        for (var i = 0; i < data.length; i++) {
            if (data[i].email === ideator.email) {
                data[i].owner = true;
            } else {
                data[i].owner = false;
            }
        }
        const r = await this.ideationMgr.saveDocument(
            { id: document.id, requestors: data },
            'requestors'
        );
        if (r) {
            setDocument(r);
        }
    }

    async addRequestor(
        context: AppContext,
        document: DocumentInfo,
        setDocument: (
            document: DocumentInfo,
            fields?: string[]
        ) => Promise<void> | undefined,
        email: string,
        force?: boolean
    ) {
        console.log(`handleAddRequestor(${email}, ${force})`);
        if (!email) {
            context.setShowDialog({
                title: 'Error adding ideator.',
                text: `Missing email address.`,
            });
            return;
        }
        let ideatorItem: Requestor = {
            name: email.split('@')[0],
            department: '',
            email: email.indexOf('@') > -1 ? email : '',
            title: '',
            employeeNumber: '',
            owner: false,
            requested: true,
        };
        if (!force) {
            context.setShowSpinner('Getting emails...');
            const ideator = await this.ideationMgr.getUserProfile(email);
            context.setShowSpinner('');
            console.log('ideator=', ideator);
            if (!ideator || ideator.error || ideator.length === 0) {
                context.setShowDialog({
                    title: 'Error adding ideator.',
                    text: `The ideator's email address "${email}" was not found.  Do you want to add them anyway?`,
                    email: email,
                    closeLabel: 'No',
                    callback: () => {
                        this.addRequestor(
                            context,
                            document,
                            setDocument,
                            email,
                            true
                        );
                    },
                });
                return;
            } else if (ideator.length > 1) {
                let emails = [];
                for (var i = 0; i < ideator.length; i++) {
                    let em: string = ideator[i].user.email;
                    emails.push(
                        <tr>
                            <td>{ideator[i].user.name}</td>
                            <td>{ideator[i].user.email}</td>
                            <td>
                                <Button
                                    onClick={() => {
                                        this.addRequestor(
                                            context,
                                            document,
                                            setDocument,
                                            em
                                        );
                                        context.setShowDialog(null);
                                    }}
                                >
                                    Add
                                </Button>{' '}
                            </td>
                        </tr>
                    );
                }
                context.setShowDialog({
                    title: 'Multiple Emails Were Found',
                    text: (
                        <>
                            <div>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>{emails}</tbody>
                                </table>
                            </div>
                            <div style={{ marginTop: '10px' }}>
                                Select one to Add or Close to cancel.
                            </div>
                        </>
                    ),
                });
                return;
            } else {
                ideatorItem.email = ideator[0].user.email;
                ideatorItem.name = ideator[0].user.name;
                ideatorItem.department = ideator[0].user.department;
                ideatorItem.title = ideator[0].user.title;
                ideatorItem.employeeNumber = ideator[0].user.employeeNumber;
                ideatorItem.requested = true;
            }
        }
        let data = document.requestors ? [...document.requestors] : [];
        data.push(ideatorItem);
        console.log('new requestors list=', data);
        const r = await this.ideationMgr.saveDocument(
            { id: document.id, requestors: data },
            'requestors'
        );
        if (r) {
            setDocument(r);
        }
    }

    async removeReviewer(
        document: DocumentInfo,
        setDocument: (
            document: DocumentInfo,
            fields?: string[]
        ) => Promise<void> | undefined,
        reviewer: Person
    ) {
        console.log(`removeIASquad(${reviewer.name})`);
        let data = document.reviewers ? [...document.reviewers] : [];
        for (var i = 0; i < data.length; i++) {
            if (data[i].name === reviewer.name) {
                data.splice(i, 1);
                break;
            }
        }
        const r = await this.ideationMgr.saveDocument(
            { id: document.id, reviewers: data },
            'reviewers'
        );
        if (r) {
            setDocument(r);
        }
    }

    async addReviewer(
        document: DocumentInfo,
        setDocument: (
            document: DocumentInfo,
            fields?: string[]
        ) => Promise<void> | undefined,
        email: string
    ) {
        console.log(`handleAddReviewer(${email})`);
        let data = document.reviewers ? [...document.reviewers] : [];

        const alreadyPresent = data.some(person => {
            return person.email === email;
        });
        if (alreadyPresent) {
            return;
        }
        const reviewerItem: Person = {
            name: '',
            email: email,
            department: '',
            title: '',
            employeeNumber: '',
        };
        const reviewer = await this.ideationMgr.getUserProfile(email);
        if (reviewer && reviewer.length > 0) {
            reviewerItem.email = reviewer[0].user.email;
            reviewerItem.name = reviewer[0].user.name;
            reviewerItem.department = reviewer[0].user.department;
            reviewerItem.title = reviewer[0].user.title;
            reviewerItem.employeeNumber = reviewer[0].user.employeeNumber;
        }
        data.push(reviewerItem);
        console.log('new reviewers list=', data);
        const r = await this.ideationMgr.saveDocument(
            { id: document.id, reviewers: data },
            'reviewers'
        );
        if (r) {
            setDocument(r);
        }
    }

    async removeDeliveryTeam(
        document: DocumentInfo,
        setDocument: (
            document: DocumentInfo,
            fields?: string[]
        ) => Promise<void> | undefined,
        person: Person
    ) {
        console.log(`removeDeliveryTeam(${person.name})`);
        let data = document.deliveryTeam ? [...document.deliveryTeam] : [];
        for (var i = 0; i < data.length; i++) {
            if (data[i].name === person.name) {
                data.splice(i, 1);
                break;
            }
        }
        const r = await this.ideationMgr.saveDocument(
            { id: document.id, deliveryTeam: data },
            'deliveryTeam'
        );
        if (r) {
            setDocument(r);
        }
    }

    async addDeliveryTeam(
        document: DocumentInfo,
        setDocument: (
            document: DocumentInfo,
            fields?: string[]
        ) => Promise<void> | undefined,
        email: string
    ) {
        console.log(`handleAddReviewer(${email})`);
        let data = document.deliveryTeam ? [...document.deliveryTeam] : [];

        const alreadyPresent = data.some(person => {
            return person.email === email;
        });
        if (alreadyPresent) {
            return;
        }
        const reviewerItem: Person = {
            name: '',
            email: email,
            department: '',
            title: '',
            employeeNumber: '',
        };
        const reviewer = await this.ideationMgr.getUserProfile(email);
        if (reviewer && reviewer.length > 0) {
            reviewerItem.email = reviewer[0].user.email;
            reviewerItem.name = reviewer[0].user.name;
            reviewerItem.department = reviewer[0].user.department;
            reviewerItem.title = reviewer[0].user.title;
            reviewerItem.employeeNumber = reviewer[0].user.employeeNumber;
        }
        data.push(reviewerItem);
        console.log('new deliveryTeam list=', data);
        const r = await this.ideationMgr.saveDocument(
            { id: document.id, deliveryTeam: data },
            'deliveryTeam'
        );
        if (r) {
            setDocument(r);
        }
    }
}
