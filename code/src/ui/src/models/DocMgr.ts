/**
 * Copyright (c) 2024 Discover Financial Services
 */
import {
    docType,
    Person,
    AttachmentInfo,
    UserGroupInfo,
    DocumentInfo,
    DocumentCreate,
    DocumentUpdate,
    CommentUpdate,
    CommentCreate,
} from '../common/common';
import { Http } from '../Http';
import {
    IActionMgr,
    IAttachmentMgr,
    ICommentMgr,
    IDocMgr,
    IUserGroupMgr,
    IServicesMgr,
    DocError,
} from './Managers';

const urlPath = `/api/${docType}/`;

export { DocError } from './Managers';

export class DocMgr
    implements
        IDocMgr,
        IUserGroupMgr,
        IAttachmentMgr,
        ICommentMgr,
        IActionMgr,
        IServicesMgr
{
    http: Http = Http.getInstance();
    private static instance: DocMgr;

    public static init(): DocMgr {
        if (this.instance !== undefined) {
            return this.instance;
        }
        this.instance = new DocMgr();
        return this.instance;
    }

    public static getInstance(): DocMgr {
        return this.init();
    }

    /**
     * Create a blank document object.
     * Optionally set the id
     *
     * @returns {Document}
     */
    createBlankDocument(): DocumentInfo {
        let doc: DocumentInfo = {
            id: '',
            requestors: [],
            reviewers: [],
            deliveryTeam: [],

            title: '',
            dateCreated: 0,
            dateUpdated: 0,
            state: 'created',

            agreement: false,
            planningMotivation: '',
            planningObjectives: 0,
            planningAudience: '',
            planningRules: '',
            planningThemes: '',
            planningChallenges: '',
            planningWinningTopics: '',
            planningIncubation: '',
            planningPlatforms: '',

            logisticsTimeline: '',
            logisticsDuration: '',
            logisticsLocation: '',
            logisticsPlatform: '',
            logisticsInfrastructureBuilt: '',

            marketingBudget: '',
            marketingPrizeCategories: '',
            marketingPrizes: '',
            marketingGuidelines: '',
            marketingChannels: '',
            marketingActivities: '',

            stateHistory: [{ state: 'created', date: 0, email: '' }],
            comments: [],
            attachments: [],
        };
        return doc;
    }

    async createDocument(data?: DocumentCreate): Promise<DocumentInfo | null> {
        try {
            const response = await this.http.post(urlPath, data);
            console.log('createDocument response=', response);
            const body = response.data;
            return body;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    /**
     * Save document to peristent storage
     *
     * @param document The document
     * @param key [Optional] Only the data for the key needs to be updated (comma separated string)
     */
    async saveDocument(
        document: any,
        key?: string
    ): Promise<DocumentInfo | null> {
        if (!document || !document.id) {
            console.log(`saveDocument() error: Document id is missing`);
            throw new Error('DocMgr.saveDocument() - Document id missing');
        }
        console.log(`saveDocument(${key}) data=`, document);
        try {
            let data: any = {};
            if (key) {
                const parts = key.split(',');
                for (var part of parts) {
                    const i = part.trim();
                    data[i] = document[i];
                }
            } else {
                data = { ...document };
            }
            const response = await this.http.patch(urlPath + document.id, data);
            console.log('saveDocument response=', response);
            const body = response.data;
            return body;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    /**
     * Checks if the document is saveable based on the presence of required fields.
     *
     * @param {any} document - The document object to check for saveability
     * @returns {boolean} Returns true if the document is saveable, false otherwise.
     */
    isDocumentSaveable(document: any): boolean {
        if (
            document.title &&
            document.state &&
            document.category &&
            document.question1 &&
            document.question2 &&
            document.question3 &&
            document.question4 &&
            document.timeLimit1 &&
            document.timeLimit2 &&
            document.timeLimit3 &&
            document.timeLimit4 &&
            document.inventors.length
        ) {
            return true;
        }
        return false;
    }

    /**
     * Adds a comment to a document.
     *
     * @param {any} document - The document to add the comment to
     * @param {string} text - The text of the comment
     * @param {string} topic - The topic of the comment
     * @param {boolean} _private - Whether the comment is private
     * @param {string} approved - The approval status of the comment
     * @returns {DocumentInfo | null} The updated document information or null.
     */
    async addComment(
        document: any,
        text: string,
        topic?: string,
        _private = false,
        approved?: string
    ): Promise<DocumentInfo | null> {
        if (!document || !document.id) {
            console.log(`addComment() error: Document id is missing`);
            throw new Error('DocMgr.addComment() - Document id missing');
        }
        console.log(
            `addComment(${document.id}) text=${text} topic=${topic} private=${_private})`
        );
        try {
            let data: CommentCreate = {
                text: text,
                topic: topic || '',
                private: _private,
                approved: approved || '',
            };
            const response = await this.http.post(
                urlPath + document.id + '/comment',
                data
            );
            console.log('addComment response=', response);
            const body = response.data;
            return body;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    /**
     * Delete comment based on the comment id.
     *
     * @param {any} document - The document
     * @param {string} id - The id of the comment
     * @returns {DocumentInfo | null} The response data or null
     */
    async deleteCommentForId(
        document: any,
        id: string
    ): Promise<DocumentInfo | null> {
        if (!document || !document.id) {
            console.log(`deleteCommentForId() error: Document id is missing`);
            throw new Error(
                'DocMgr.deleteCommentForId() - Document id missing'
            );
        }
        console.log(`deleteCommentForId(${document.id}) index=${id})`);
        try {
            const response = await this.http.delete(
                urlPath + document.id + '/comment/' + id
            );
            console.log('deleteCommentForId response=', response);
            const body = response.data;
            return body;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    /**
     * Update comment based on the comment id.
     *
     * @param {any} document - The document
     * @param {string} id - The id of the comment
     * @param {CommentUpdate} data - The data to update the comment
     * @returns {DocumentInfo | null} The response data or null
     */
    async updateCommentForId(
        document: any,
        id: string,
        data: CommentUpdate
    ): Promise<DocumentInfo | null> {
        if (!document || !document.id) {
            console.log(`updateCommentForId() error: Document id is missing`);
            throw new Error(
                'DocMgr.updateCommentForId() - Document id missing'
            );
        }
        console.log(`updateCommentForId(${document.id}) id=${id})`);
        try {
            const response = await this.http.patch(
                urlPath + document.id + '/comment/' + id,
                data
            );
            console.log('updateComment response=', response);
            const body = response.data;
            return body;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    /**
     * Retrieves a document based on the provided ID.
     *
     * @param {string} id - The ID of the document to retrieve
     * @returns {DocumentInfo | null} The retrieved document information or null
     */
    async getDocument(id: string): Promise<DocumentInfo | null> {
        console.log(`getDocument(${id})`);
        if (!id) {
            console.log(`getDocument() error: Document id is missing`);
            throw new Error('DocMgr.getDocument() - Document id missing');
        }
        let document: DocumentInfo;
        try {
            const response = await this.http.get(urlPath + id);
            console.log('getDocument response=', response);
            document = response.data;
            for (const ele of document.reviewers) {
                if (typeof ele.employeeNumber === 'undefined') {
                    ele.employeeNumber = '';
                }
                try {
                    delete (ele as any).phone;
                } catch (e) {}
            }
            for (const ele of document.reviewers) {
                if (typeof ele.employeeNumber === 'undefined') {
                    ele.employeeNumber = '';
                }
                try {
                    delete (ele as any).phone;
                } catch (e) {}
            }
            return document;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    /**
     * Retrieves a list of documents based on the provided configuration.
     *
     * @param {any} config - Optional configuration for fetching documents
     *
     * @returns {DocumentInfo[]} An array of DocumentInfo objects
     */
    async getDocuments(config?: any): Promise<DocumentInfo[]> {
        console.log('getDocuments() config=', config);
        try {
            const response = await this.http.get(urlPath, config);
            console.log('getDocuments response=', response);
            return response.data.items;
        } catch (e: any) {
            console.error(new DocError(e));
            return [];
        }
    }

    /**
     * Deletes a document based on the provided id.
     *
     * @param {string} id - The id of the document to delete
     *
     * @returns {boolean} True if the document is deleted successfully, false otherwise
     */
    async deleteDocument(id: string): Promise<boolean> {
        console.log(`deleteDocument(${id})`);
        if (!id) {
            console.log(`deleteDocument() error: Document id is missing`);
            throw new Error('DocMgr.deleteDocument() - Document id missing');
        }
        try {
            const response = await this.http.delete(urlPath + id);
            console.log('deleteDocument response=', response);
            return true;
        } catch (e: any) {
            console.error(new DocError(e));
            return false;
        }
    }

    /**
     * Delete all documents.
     *
     * @returns {Promise<void>}
     */
    async deleteDocuments(): Promise<void> {
        console.log('deleteDocuments()');
        const documents = await this.getDocuments();
        documents.map(async p => {
            await this.deleteDocument(p.id);
        });
    }

    /**
     * Duplicate a document.
     *
     * @param {string} id - The id of the document to clone
     *
     * @returns {DocumentInfo | null} The cloned document information or null if cloning fails
     */
    async cloneDocument(id: string): Promise<DocumentInfo | null> {
        console.log(`cloneDocument(${id})`);
        if (!id) {
            console.log(`cloneDocument() error: Document id is missing`);
            throw new Error(
                'DocumentMgr.cloneDocument() - Document id missing'
            );
        }
        let document: DocumentInfo;
        try {
            const response = await this.http.get(urlPath + id + '/copy');
            console.log('cloneDocument response=', response);
            document = response.data;
            return document;
        } catch (e: any) {
            console.error(new DocError(e));
            return null;
        }
    }

    /**
     * Duplicate a document and update the copy.
     *
     * @param {string} id - The id of the document to copy
     * @param {DocumentUpdate} data - The data to update the copied document
     *
     * @returns {DocumentInfo | null} The copied document information or null if copying fails
     */
    async copyDocument(
        id: string,
        data: DocumentUpdate
    ): Promise<DocumentInfo | null> {
        console.log(`copyDocument(${id})`);
        if (!id) {
            console.log(`copyDocument() error: Document id is missing`);
            throw new Error('DocumentMgr.copyDocument() - Document id missing');
        }
        let document: DocumentInfo;
        try {
            const response = await this.http.post(urlPath + id + '/copy', data);
            console.log('copyDocument response=', response);
            document = response.data;
            return document;
        } catch (e: any) {
            console.error(new DocError(e));
            return null;
        }
    }

    /**
     * Retrieves all user groups.
     *
     * @returns {UserGroupInfo[]} An array of user groups data
     */
    async getUserGroups(): Promise<UserGroupInfo[]> {
        console.log('getUserGroups()');
        try {
            const response = await this.http.get('/api/user_groups/');
            console.log('getUserGroups response=', response);
            return response.data.items;
        } catch (e: any) {
            console.error(new DocError(e));
            return [];
        }
    }

    /**
     * Retrieves a specific user group.
     *
     * @param {string} name - The name of the user group
     *
     * @returns {UserGroupInfo} The user group data
     */
    async getUserGroup(name: string): Promise<UserGroupInfo> {
        console.log(`getUserGroup(${name})`);
        try {
            const response = await this.http.get(
                '/api/user_groups/' + name + '/'
            );
            console.log('getUserGroup response=', response);
            //return response.data.members;
            let members: Person[] = [];
            for (var i = 0; i < response.data.members.length; i++) {
                const member = response.data.members[i];
                members.push({
                    department: member.department,
                    email: member.email,
                    employeeNumber: member.employeeNumber,
                    name: member.name,
                    title: member.title,
                });
            }
            return {
                id: response.data.id,
                deletable: response.data.deletable,
                members: members,
            };
        } catch (e: any) {
            console.error(new DocError(e));
            return { id: name, deletable: false, members: [] };
        }
    }

    /**
     * Sets the user group with the specified name and members.
     *
     * @param {string} name - The name of the user group
     * @param {Person[]} members - The list of members to set for the user group
     *
     * @returns {UserGroupInfo} The updated user group information
     */
    async setUserGroup(
        name: string,
        members: Person[]
    ): Promise<UserGroupInfo> {
        try {
            const response = await this.http.patch('/api/user_groups/' + name, {
                members: members,
            });
            console.log('setUserGroup response=', response);
            const body = response.data;
            return body.members;
        } catch (e: any) {
            console.error(new DocError(e));
            return { id: name, deletable: false, members: [] };
        }
    }

    /**
     * Create a user group based on the name and members.
     *
     * @param {string} name - The name of the user group
     * @param {Person[]} members - The list of members for the user group
     * @returns {UserGroupInfo} The members of the created user group
     */
    async createUserGroup(
        name: string,
        members: Person[]
    ): Promise<UserGroupInfo> {
        try {
            const response = await this.http.post('/api/user_groups/', {
                id: name,
                members: members,
                deletable: true,
            });
            console.log('createUserGroup response=', response);
            const body = response.data;
            return body.members;
        } catch (e: any) {
            console.error(new DocError(e));
            return { id: name, deletable: false, members: [] };
        }
    }

    /**
     * Delete a user group based on the name.
     *
     * @param {string} name - The name of the user group
     *
     * @returns {boolean} True if the user group is deleted successfully, false otherwise
     */
    async deleteUserGroup(name: string): Promise<boolean> {
        console.log(`deleteUserGroup(${name})`);
        if (!name) {
            console.log(`deleteDocument() error: Group name is missing`);
            throw new Error('DocMgr.deleteUserGroup() - Group name missing');
        }
        try {
            const response = await this.http.delete('/api/user_groups/' + name);
            console.log('deleteUserGroup response=', response);
            return true;
        } catch (e: any) {
            console.error(new DocError(e));
            return false;
        }
    }

    /**
     * Delete an attachment of a document based on the document ID and attachment ID.
     *
     * @param {string} documentId - The ID of the document
     * @param {string} attachmentId - The ID of the attachment to delete
     * @return {Promise<AttachmentInfo[] | null>} The deleted attachment info or null
     */
    async deleteAttachment(
        documentId: string,
        attachmentId: string
    ): Promise<AttachmentInfo[] | null> {
        console.log(`deleteAttachment(${documentId}, ${attachmentId})`);
        let url = `/api/docs/${docType}/${documentId}/attachments/${attachmentId}`;
        try {
            const response = await this.http.delete(url);
            console.log('deleteAttachment response=', response);
            const body = response.data;
            return body;
        } catch (e: any) {
            console.error(new DocError(e));
        }
        return null;
    }

    /**
     * Upload an attachment to a document.
     *
     * @summary This saves the attachment content in database & adds
     * attachment metadata to document.attachments
     *
     * @param documentId
     * @param file
     *
     * @returns {AttachmentInfo[]} The new list of attachments for the document
     */
    async uploadAttachment(
        documentId: string,
        file: File
    ): Promise<AttachmentInfo[]> {
        console.log(`uploadAttachment()`);
        console.log('file=', file);

        //@TODO: use localstorage during debug
        const formData = new FormData();
        //formData.append("documentId", documentId);
        formData.append('file', file);
        //await this.addAttachment({name: file.name, size: file.size, date: Date.now(), type: file.type});

        let url = `/api/docs/${docType}/${documentId}/attachments/`;
        try {
            const response = await this.http.post(url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log('uploadAttachment response=', response);
            const body = response.data;
            return body;
        } catch (e: any) {
            console.error(new DocError(e));
        }
        return [];
    }

    /**
     * A description of the entire function.
     *
     * @param document - The document object
     * @param {any} data - Additional data for the action
     *
     * @returns {DocumentInfo | null} A promise resolving to the response data or null.
     */
    async runAction(document: any, data: any): Promise<DocumentInfo | null> {
        if (!document || !document.id) {
            console.log(`runAction() error: Document id is missing`);
            throw new Error('DocMgr.runAction() - Document id missing');
        }
        console.log(`runAction(${document.id}) data=`, data);
        try {
            //const response = await this.http.post("/api/action/${type}/" + document.id, data);
            const response = await this.http.post(
                '/api/action/' + document.id,
                data
            );
            console.log('runAction response=', response);
            const body = response.data;
            return body;
        } catch (e: any) {
            const err = new DocError(e);
            console.error(err);
            throw err;
        }
    }

    /**
     * A function to retrieve user profile based on the provided email.
     *
     * @param {string} email - The email of the user to retrieve the profile
     *
     * @returns The user profile data retrieved from the server
     */
    async getUserProfile(email: string): Promise<any> {
        console.log(`getProfile(${email})`);
        let url = `/api/profile/${email}/`;
        try {
            const response = await this.http.get(url);
            console.log('getProfile response=', response);
            return response.data;
        } catch (e: any) {
            console.error(new DocError(e));
        }
        return null;
    }
}
