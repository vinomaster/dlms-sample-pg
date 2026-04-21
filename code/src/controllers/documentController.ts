import { AppMgr } from '../appMgr';
import express from 'express';
import { Readable } from 'stream';
import crypto from 'crypto';
import {
    Controller,
    Route,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Request,
    Path,
    Query,
    UploadedFile,
} from 'tsoa';
import {
    docType,
    DocumentCreate,
    DocumentUpdate,
    DocumentInfo,
    DocumentList,
    CommentCreate,
    CommentUpdate,
    CommentInfo,
} from '../ui/src/common/common';
import { AttachmentInfo } from '../ui/src/common/common';
import { AttachmentModel, Logger, AttachmentModelCreate } from 'dlms-server';
import { MyUserProfileService } from '../myUserProfileService';
const log = new Logger('agc');

@Route('/api/profile')
export class ServicesController extends Controller {
    /**
     * Get user context based on a supplied email address.
     *
     * @param req Express request object
     * @param email User email
     *
     * @returns The user context, or an error message
     */
    @Get('{email}')
    public async getProfile(
        @Request() req: express.Request,
        @Path() email: string
    ): Promise<any> {
        try {
            const userProfile = new MyUserProfileService();
            const mgr = AppMgr.getInstance();
            mgr.getCtx(req);
            const data = await userProfile.get(email);
            return data;
        } catch (e: any) {
            return { error: e.message };
        }
    }
}

@Route('/api/action/{id}')
export class ActionController extends Controller {
    /**
     * Perform document action based on id
     *
     * @param req Express request object
     * @param id Document id
     * @param body Any data needed by the action
     *
     * @returns DocumentInfo for document
     */
    @Post()
    public async createDoc(
        @Request() req: express.Request,
        @Path() id: string,
        @Body() body: any
    ): Promise<DocumentInfo> {
        const mgr = AppMgr.getInstance();
        return await mgr.runActionForDoc(
            mgr.getCtx(req),
            { type: docType, id: id },
            body
        );
    }
}

@Route('/api')
export class DocumentController extends Controller {
    /**
     * Initialize a new document
     *
     * @param req Express request object
     * @param body Initialization data for the new document
     *
     * @returns DocumentInfo for created document
     */
    @Post('{docType}')
    public async createDoc(
        @Request() req: express.Request,
        @Body() body: DocumentCreate
    ): Promise<DocumentInfo> {
        const mgr = AppMgr.getInstance();
        return mgr.createDoc(mgr.getCtx(req), docType, body);
    }

    /**
     * Get documents based on a search string
     *
     * @param req Express request object
     * @param match Search string
     *
     * @returns DocumentList
     */
    @Get('{docType}')
    public async getDocs(
        @Request() req: express.Request,
        @Query() match?: string
    ): Promise<DocumentList> {
        const mgr = AppMgr.getInstance();
        const result = await mgr.getDocs(mgr.getCtx(req), docType, match || '');
        const rtn: any = {
            count: result.length,
            items: result,
        };
        return rtn;
    }

    /**
     * Get document based on id
     *
     * @param req Express request object
     * @param id Document id
     *
     * @returns DocumentInfo for document
     */
    @Get('{docType}/{id}')
    public async getDoc(
        @Request() req: express.Request,
        @Path() id: string
    ): Promise<DocumentInfo> {
        const mgr = AppMgr.getInstance();
        return mgr.getDoc(mgr.getCtx(req), { type: docType, id: id });
    }

    /**
     * Duplicate a document based on id
     *
     * @param req Express request object
     * @param id Document id
     *
     * @returns Newly cloned document
     */
    @Get('{docType}/{id}/copy')
    public async cloneDoc(
        @Request() req: express.Request,
        @Path() id: string
    ): Promise<DocumentInfo> {
        const mgr = AppMgr.getInstance();
        return mgr.cloneDoc(mgr.getCtx(req), { type: docType, id: id });
    }

    /**
     * Duplicate a document (based on id) and make updates to the copied document
     *
     * @param req Express request object
     * @param id Document id
     * @param args Changes to copied document
     *
     * @returns DocumentInfo for newly copied document
     */
    @Post('{docType}/{id}/copy')
    public async copyDoc(
        @Request() req: express.Request,
        @Path() id: string,
        @Body() args: DocumentUpdate
    ): Promise<DocumentInfo> {
        const mgr = AppMgr.getInstance();
        return mgr.copyDoc(mgr.getCtx(req), { type: docType, id: id }, args);
    }

    /**
     * Update a document based on id
     *
     * @param req Express request object
     * @param id Document id
     * @param args DocumentUpdate containing changes to copied document
     *
     * @returns DocumentInfo for updated document
     */
    @Patch('{docType}/{id}')
    public async updateDoc(
        @Request() req: express.Request,
        @Path() id: string,
        @Body() args: DocumentUpdate
    ): Promise<DocumentInfo> {
        const mgr = AppMgr.getInstance();
        return mgr.updateDoc(mgr.getCtx(req), { type: docType, id: id }, args);
    }

    /**
     * Delete a document
     *
     * @param req Express request object
     * @param id Document id
     *
     * @returns DocumentInfo for deleted document
     */
    @Delete('{docType}/{id}')
    public async deleteDoc(
        @Request() req: express.Request,
        @Path() id: string
    ): Promise<DocumentInfo> {
        const mgr = AppMgr.getInstance();
        return mgr.deleteDoc(mgr.getCtx(req), { type: docType, id: id });
    }

    /**
     * Add comment to document
     *
     * @param req Express request object
     * @param id Document id
     * @param args Values for the new comment
     *
     * @returns DocumentInfo for commented-on document
     */
    @Post('{docType}/{id}/comment')
    public async addComment(
        @Request() req: express.Request,
        @Path() id: string,
        @Body() args: CommentCreate
    ): Promise<DocumentInfo> {
        console.log(`addComment(${id})`);
        const mgr = AppMgr.getInstance();
        return mgr.addComment(mgr.getCtx(req), { type: docType, id: id }, args);
    }

    /**
     * Get comment based on document id and comment id
     *
     * @param req Express request object
     * @param id Document id
     * @param cid Comment id
     *
     * @returns DocumentInfo for document with requested comment
     */
    @Get('{docType}/{id}/comment/{cid}')
    public async getComment(
        @Request() req: express.Request,
        @Path() id: string,
        @Path() cid: string
    ): Promise<CommentInfo> {
        console.log(`getComment(${id}, ${cid})`);
        const mgr = AppMgr.getInstance();
        return mgr.getComment(mgr.getCtx(req), { type: docType, id: id }, cid);
    }

    /**
     * Update a comment based on document id and comment id
     *
     * @param req Express request object
     * @param id Document id
     * @param cid Comment id
     *
     * @returns DocumentInfo for document with updated comment
     */
    @Patch('{docType}/{id}/comment/{cid}')
    public async updateComment(
        @Request() req: express.Request,
        @Path() id: string,
        @Path() cid: string,
        @Body() args: CommentUpdate
    ): Promise<DocumentInfo> {
        console.log(`updateComment(${id}, ${cid})`);
        const mgr = AppMgr.getInstance();
        return mgr.updateComment(
            mgr.getCtx(req),
            { type: docType, id: id },
            cid,
            args
        );
    }

    /**
     * Delete a comment based on document id and comment id
     *
     * @param req Express request object
     * @param id Document id
     * @param cid Comment id
     *
     * @returns DocumentInfo for document with deleted comment
     */
    @Delete('{docType}/{id}/comment/{cid}')
    public async deleteComment(
        @Request() req: express.Request,
        @Path() id: string,
        @Path() cid: string
    ): Promise<DocumentInfo> {
        console.log(`deleteComment(${id}, ${cid})`);
        const mgr = AppMgr.getInstance();
        return mgr.deleteComment(
            mgr.getCtx(req),
            { type: docType, id: id },
            cid
        );
    }

    /**
     * Get AttachmentInfo object for attachment
     *
     * @param model Attachment model
     *
     * @returns AttachmentInfo
     */
    private toAttachmentInfo(model: AttachmentModel): AttachmentInfo {
        let r: AttachmentInfo = {
            id: model._id,
            hash: model.hash,
            collection: docType,
            doc: model.doc,
            name: model.name,
            size: model.size,
            date: model.date,
            type: model.type,
            url: `${AppMgr.getInstance().getBaseUrl()}/api/docs/${model.doc}/attachments/${model._id}/`,
        };
        return r;
    }

    /**
     * Get all attachments
     *
     * @param req Express request object
     *
     * @returns Array of attachments
     */
    @Get('/docs/attachments/')
    public async getAttachments(@Request() req: express.Request): Promise<any> {
        const mgr = await AppMgr.getInstance();
        const result = await mgr.getAttachments(mgr.getCtx(req));
        let r = [];
        for (const element of result) {
            r.push(this.toAttachmentInfo(element));
        }
        return {
            count: r.length,
            items: r,
        };
    }

    /**
     * Get all attachments for a document based on document id
     *
     * @param req Express request object
     * @param docId Document id
     *
     * @returns Array of attachments
     */
    @Get('/docs/{docId}/attachments/')
    public async getDocAttachments(
        @Request() req: express.Request,
        @Path() docId: string
    ): Promise<any> {
        const mgr = await AppMgr.getInstance();
        const doc = mgr.getDoc(mgr.getCtx(req), { type: docType, id: docId }); // Check to make sure user has read access to doc
        const result = await mgr.getAttachments(mgr.getCtx(req), {
            match: { doc: docId },
        });
        let r = [];
        for (var i = 0; i < result.length; i++) {
            r.push(this.toAttachmentInfo(result[i]));
        }
        return {
            count: r.length,
            items: r,
        };
    }

    /**
     * Get an attachment based on a document id and attachment id
     *
     * @param req Express request object
     * @param docId Document id
     * @param attachmentId Attachment id
     *
     * @returns Attachment data
     */
    @Get('/docs/{docId}/attachments/{attachmentId}')
    public async getDocAttachment(
        @Request() req: express.Request,
        @Path() docId: string,
        attachmentId: string
    ): Promise<any> {
        const mgr = await AppMgr.getInstance();
        const doc = mgr.getDoc(mgr.getCtx(req), { type: docType, id: docId }); // Check to make sure user has read access to doc
        const r = await mgr.getAttachment(mgr.getCtx(req), attachmentId);
        if (r != null) {
            this.setHeader('Content-Type', r.type);
            const readable = new Readable({
                read() {
                    this.push(r.data.buffer);
                    this.push(null);
                },
            });
            return readable;
        }
        this.setStatus(404);
    }

    /**
     * Delete an attachment based on a document id and attachment id
     *
     * @param req Express request object
     * @param docId Document id
     * @param attachmentId Attachment id
     *
     * @returns Deleted attachment info
     */
    @Delete('/docs/{docId}/attachments/{attachmentId}')
    public async deleteDocAttachments(
        @Request() req: express.Request,
        @Path() docId: string,
        attachmentId: string
    ): Promise<any> {
        const mgr = await AppMgr.getInstance();
        const ctx = mgr.getCtx(req);
        try {
            const attachment = await mgr.getAttachment(ctx, attachmentId);
            await mgr.deleteAttachment(ctx, attachment._id);
        } catch (e) {
            log.info("Attachment wasn't found");
        }

        const ds = { type: docType, id: docId };
        const doc = await mgr.getDoc(ctx, ds);
        let attachments = doc.attachments || [];
        for (var i = 0; i < attachments.length; i++) {
            if (attachments[i].id == attachmentId) {
                attachments.splice(i, 1);
                mgr.updateDoc(ctx, ds, { attachments: attachments });
                return attachments;
            }
        }
        this.setStatus(404);
    }

    /**
     * Upload and create attachments for a document based on document id
     *
     * @param req Express request object
     * @param docId Document id
     * @param file Express object containing information on file or files
     *
     * @returns Created attachment or attachments
     */
    @Post('/docs/{docId}/attachments/')
    public async createDocAttachments(
        @Request() req: express.Request,
        @Path() docId: string,
        @UploadedFile() file: Express.Multer.File
    ): Promise<any> {
        log.debug(`createDocAttachments doc=${docId})`);
        //log.debug("file=" + JSON.stringify(file));
        const hashSum = crypto.createHash('sha256');
        hashSum.update(file.buffer);
        const hash = hashSum.digest('hex');
        log.debug('hash=' + hash);

        const mgr = await AppMgr.getInstance();
        const ctx = mgr.getCtx(req);

        const ds = { type: docType, id: docId };
        const doc = await mgr.getDoc(ctx, ds);
        let attachments = doc.attachments || [];
        if (attachments.length > 0) {
            for (var i = 0; i < attachments.length; i++) {
                if (attachments[i].name == file.originalname) {
                    if (attachments[i].hash == hash) {
                        console.log('Uploaded identical file');
                        return attachments;
                    }
                    let r2 = await mgr.updateAttachment(
                        ctx,
                        attachments[i].id,
                        {
                            hash: hash,
                            size: file.buffer.length,
                            date: Date.now(),
                            data: file.buffer,
                        }
                    );
                    let ai: AttachmentInfo = {
                        ...attachments[i],
                        hash: r2.hash,
                        size: r2.size,
                        date: r2.date,
                    };
                    attachments[i] = ai;
                    console.log('Updated attachment:', ai);
                    await mgr.updateDoc(ctx, ds, { attachments: attachments });
                    return attachments;
                }
            }
        }

        let args: AttachmentModelCreate = {
            collection: docType,
            doc: docId,
            hash: hash,
            name: file.originalname,
            size: file.buffer.length,
            date: Date.now(),
            type: file.mimetype,
            data: file.buffer,
        };
        let r = await mgr.createAttachment(ctx, args);

        let attachment: AttachmentInfo = {
            id: r._id,
            hash: hash,
            name: file.originalname,
            size: file.buffer.length,
            date: Date.now(),
            type: file.mimetype,
            url: `${mgr.getBaseUrl()}/api/docs/${docId}/attachments/${r._id}/`,
        };
        attachments.push(attachment);
        await mgr.updateDoc(ctx, ds, { attachments: attachments });
        return attachments;
    }
}
