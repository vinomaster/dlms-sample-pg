/**
 * Copyright (c) 2024 Discover Financial Services
 */
import {
    AttachmentInfo,
    EditorDoc,
    DocumentCreate,
    CommentUpdate,
    Person,
    UserGroupInfo,
} from '../common/common';

export interface IDocMgr {
    /**
     * Create a blank document object.
     * Optionally set the id
     *
     * @returns {Ideation}
     */
    createBlankDocument(): EditorDoc;

    createDocument(data?: DocumentCreate): Promise<EditorDoc | null>;

    /**
     * Save document to peristent storage
     *
     * @param document The document
     * @param key [Optional] Only the data for the key needs to be updated (comma separated string)
     */
    saveDocument(document: any, key: string): Promise<EditorDoc | null>;

    isDocumentSaveable(document: any): boolean;

    getDocument(id: string): Promise<EditorDoc | null>;

    getDocuments(config?: any): Promise<EditorDoc[]>;

    deleteDocument(id: string): Promise<boolean>;

    deleteDocuments(): Promise<void>;
}

export interface IActionMgr {
    runAction(document: any, data: any): Promise<EditorDoc | null>;
}

export interface IAttachmentMgr {
    deleteAttachment(
        documentId: string,
        attachmentId: string
    ): Promise<AttachmentInfo[] | null>;

    /**
     * Upload an attachment to a document.
     * This saves the attachment content in database & adds attachment metadata to document.attachments
     *
     * @param documentId
     * @param file
     * @returns AttachmentInfo[] The new list of attachments for the document
     */
    uploadAttachment(documentId: string, file: File): Promise<AttachmentInfo[]>;
}

export interface IServicesMgr {
    getUserProfile(email: string): Promise<any>;
}

export interface ICommentMgr {
    addComment(
        document: any,
        text: string,
        topic?: string,
        _private?: boolean,
        approved?: string
    ): Promise<EditorDoc | null>;

    deleteCommentForId(document: any, id: string): Promise<EditorDoc | null>;

    updateCommentForId(
        document: any,
        id: string,
        data: CommentUpdate
    ): Promise<EditorDoc | null>;
}

export interface IUserGroupMgr {
    getUserGroups(): Promise<UserGroupInfo[]>;

    getUserGroup(name: string): Promise<UserGroupInfo>;

    setUserGroup(name: string, members: Person[]): Promise<UserGroupInfo>;

    createUserGroup(name: string, members: Person[]): Promise<UserGroupInfo>;

    deleteUserGroup(name: string): Promise<boolean>;
}

export class DocError {
    status: number;
    statusText: string;
    message: string;

    constructor(e: any) {
        //super(e);
        if (e.response) {
            this.status = e.response.status;
            this.statusText = e.response.statusText;
            this.message = e.response.data.message;
        } else if (e.status) {
            this.status = e.status;
            this.statusText = e.statusText;
            this.message = e.message;
        } else if (e.message === 'Network Error') {
            this.status = 500;
            this.statusText = 'Network Error';
            this.message =
                "It could be that you don't have an internet connection, or the server is down.";
        } else {
            console.log(
                'DocError: Unknow error=',
                e,
                'json=',
                JSON.stringify(e)
            );
            this.status = 500;
            this.statusText = 'Unknown error calling server';
            this.message = 'Unknown error calling server';
        }
    }

    getStatus(): number {
        return this.status;
    }
    getStatusText(): string {
        return this.statusText;
    }
    getMessage(): string {
        return this.message;
    }
    toString(): string {
        return `Http error: status=${this.getStatus()} statusText="${this.getStatusText()}" message="${this.getMessage()}`;
    }
    toString1(): string {
        return JSON.stringify(this);
    }
}

export const throwTestError = () => {
    throw new DocError({
        status: 505,
        statusText: 'Test Message',
        message:
            'This is a test error message thrown by Managers.throwTestError().',
    });
};
