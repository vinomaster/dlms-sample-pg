/**
 * Copyright (c) 2024 Discover Financial Services
 * Polyglot edition: AppMgr passes pgUrl instead of mongoUrl.
 * All business logic (getDocs, createDoc, updateDoc, clone, copy, comments) is
 * verbatim from the original dlms-sample appMgr.ts.
 */
import { DocMgr, UserContext, Logger, DocSpec, throwErr } from 'dlms-server';
import {
    docType,
    DocumentUpdate,
    DocumentInfo,
    StateHistory,
    CommentInfo,
    CommentCreate,
    CommentUpdate,
} from './ui/src/common/common';
import { docStates, Role } from './ui/src/common/states';
import { Requestor } from './ui/src/common/common';
import { v4 as uuidv4 } from 'uuid';
import { MyUserProfileService } from './myUserProfileService';

const log = new Logger('appMgr');

const GROUP_ADMIN = 'Admin';
const GROUP_REVIEWER = 'ReviewerGroup';

export class AppMgr extends DocMgr {
    public static async init(simpleInit?: boolean): Promise<AppMgr> {
        log.debug(`Initializing app manager`);
        const pm = new AppMgr();
        DocMgr.setInstance(pm);
        await pm.init(simpleInit);
        log.debug(`Finished initializing app manager`);
        return pm;
    }

    public static getInstance(): AppMgr {
        return DocMgr.getInstance() as AppMgr;
    }

    constructor() {
        super({
            appName: docType,
            documents: {
                [docType]: { states: docStates, docRoles: Role },
            },
            adminGroups: [GROUP_ADMIN],
            email: 'admin@test.com',
            userGroups: [
                { id: GROUP_ADMIN, deletable: false },
                { id: GROUP_REVIEWER, deletable: false },
            ],
            adminRole: GROUP_ADMIN,
            roles: [],
            userProfileService: new MyUserProfileService(),
            // pgUrl is picked up from DATABASE_URL / PG_* environment variables
            // by PgAdapter if not explicitly passed here
        });
    }

    public async init(simpleInit?: boolean) {
        await super.init(simpleInit);
    }

    public async getRoles(ctx: UserContext): Promise<string[]> {
        const result = [Role.Employee.name];
        if (await this.isAdmin(ctx)) {
            result.push(Role.Administrator.name);
        }
        if (await this.isInUserGroups(ctx, [GROUP_REVIEWER])) {
            result.push(Role.Reviewer.name);
        }
        return result;
    }

    public async getDocs(
        ctx: UserContext,
        type: string,
        button: string
    ): Promise<any[]> {
        let match: any = {};
        if (button === 'mine') {
            match = this.createMyUserMatchFilter(ctx, 'requestors');
        } else if (button === 'managed') {
            match = {};
        } else if (button === 'assigned') {
            if (await this.isAdmin(ctx)) {
                match = {};
            } else {
                match = {
                    $or: [this.createMyUserMatchFilter(ctx, 'reviewers')],
                };
            }
        }
        const result = await super.getDocs(ctx, docType, match);
        return result;
    }

    public async createDoc(
        ctx: UserContext,
        type: string,
        args: any
    ): Promise<DocumentInfo> {
        const now = Date.now();
        const pi: DocumentInfo = {
            id: '',
            requestors: args.requestors || this.createDefaultRequestors(ctx),
            reviewers: args.reviewers || [],
            deliveryTeam: args.deliveryTeam || [],

            title: args.title || '',
            dateCreated: now,
            dateUpdated: now,
            state: 'created',

            agreement: args.agreement || false,
            planningMotivation: args.planningMotivation || '',
            planningObjectives: args.planningObjectives || '',
            planningAudience: args.planningAudience || '',
            planningRules: args.planningRules || '',
            planningThemes: args.planningThemes || '',
            planningChallenges: args.planningChallenges || '',
            planningWinningTopics: args.planningWinningTopics || '',
            planningIncubation: args.planningIncubation || '',
            planningPlatforms: args.planningPlatforms || '',

            logisticsTimeline: args.logisticsTimeline || '',
            logisticsDuration: args.logisticsDuration || '',
            logisticsLocation: args.logisticsLocation || '',
            logisticsPlatform: args.logisticsPlatform || '',
            logisticsInfrastructureBuilt: args.logisticsInfrastructureBuilt || '',

            marketingBudget: args.marketingBudget || '',
            marketingPrizeCategories: args.marketingPrizeCategories || '',
            marketingPrizes: args.marketingPrizes || '',
            marketingGuidelines: args.marketingGuidelines || '',
            marketingChannels: args.marketingChannels || '',
            marketingActivities: args.marketingActivities || '',

            stateHistory: [
                { state: 'created', date: now, email: ctx.user.email },
            ],
            comments: [],
            attachments: [],
        };
        delete (pi as any).id;
        const rtn = (await super.createDoc(ctx, docType, pi)) as DocumentInfo;
        log.debug(`Request created: ${JSON.stringify(rtn, null, 4)}`);
        return rtn;
    }

    public async updateDoc(
        ctx: UserContext,
        ds: DocSpec,
        args: DocumentUpdate
    ): Promise<DocumentInfo> {
        const id = ds.id;
        const anyArgs: any = args;
        const comments: CommentInfo[] = [];
        const now = Date.now();
        const newState = args.state;
        const toPush: any = {};
        const person = { ...ctx.user } as any;
        delete person.id;
        delete person.roles;
        if (args.comment) {
            comments.push({
                id: uuidv4(),
                user: person,
                text: args.comment.text,
                topic: args.comment.topic,
                date: now,
                approved: args.comment.approved || '',
                private: args.comment.private || false,
            });
            delete args.comment;
        }
        if (newState) {
            const newStateLabel = docStates[newState].label;
            comments.push({
                id: uuidv4(),
                user: person,
                text: `<p>Changed to state '${newStateLabel}'<p>`,
                topic: 'state',
                date: now,
                approved: '',
                private: false,
            });
            const sh: StateHistory = {
                state: newState,
                date: now,
                email: ctx.user.email,
            };
            toPush.stateHistory = sh;
        }
        if (comments.length > 0) {
            log.debug(`Adding the following comments: ${JSON.stringify(comments, null, 4)}`);
            toPush.comments = { $each: comments };
        }
        anyArgs['$push'] = toPush;
        anyArgs.dateUpdated = now;
        log.debug(`Updating ${docType}, args=${JSON.stringify(args, null, 4)}`);
        return (await super.updateDoc(ctx, ds, args)) as DocumentInfo;
    }

    public async cloneDoc(ctx: UserContext, ds: DocSpec): Promise<any> {
        const id = ds.id;
        console.log(`cloneDoc(${id})`);
        const now = Date.now();
        const doc = await super.getDoc(ctx, ds);
        delete doc.id;
        let s = doc.title;
        if (doc.fileNumber) { s = doc.fileNumber + ': ' + s; }
        doc.comments.push({
            user: ctx.user,
            text: `<p>Request copied from <a href="/details/${id}">${s}</a><p>`,
            date: now,
            approved: '',
        });
        const newDoc = (await super.createDoc(ctx, ds.type, doc)) as DocumentInfo;
        return newDoc;
    }

    public async copyDoc(ctx: UserContext, ds: DocSpec, args: DocumentUpdate): Promise<any> {
        const id = ds.id;
        console.log(`copyDoc(${id})`);
        const now = Date.now();
        const doc = await super.getDoc(ctx, ds);
        delete doc.id;
        const newDoc = { ...doc, ...args };
        let s = doc.title;
        if (doc.fileNumber) { s = doc.fileNumber + ': ' + s; }
        newDoc.comments.push({
            user: ctx.user,
            text: `<p>Request copied from <a href="/details/${id}">${s}</a><p>`,
            date: now,
            approved: '',
        });
        return (await super.createDoc(ctx, ds.type, newDoc)) as DocumentInfo;
    }

    public async addComment(ctx: UserContext, ds: DocSpec, args: CommentCreate): Promise<any> {
        console.log(`addComment(${ds.id}, ${JSON.stringify(args)})`);
        const doc = await this.getDoc(ctx, ds);
        const person = { ...ctx.user } as any;
        delete person.id; delete person.roles;
        const comment = {
            id: uuidv4(), user: person, text: args.text, topic: args.topic,
            approved: args.approved || '', private: args.private || false, date: Date.now(),
        };
        let data = { $push: { comments: comment } };
        console.log('Add comment =', data);
        return (await super.updateDoc(ctx, ds, data)) as DocumentInfo;
    }

    public async getComment(ctx: UserContext, ds: DocSpec, cid: string): Promise<CommentInfo> {
        const doc = await this.getDoc(ctx, ds);
        for (var i in doc.comments) {
            if (doc.comments[i].id == cid) { return doc.comments[i]; }
        }
        throwErr(404, `Comment ${cid} not found`);
    }

    public async updateComment(ctx: UserContext, ds: DocSpec, cid: string, args: CommentUpdate): Promise<DocumentInfo> {
        console.log(`updateComment(${ds.id}, ${cid}, ${JSON.stringify(args)})`);
        const doc = await this.getDoc(ctx, ds);
        for (var i in doc.comments) {
            if (doc.comments[i].id == cid) {
                const comment = { ...doc.comments[i], ...args };
                if (comment.edited === undefined) { comment.edited = []; }
                delete (comment.user as any).id; delete (comment.user as any).roles;
                if (args.text !== undefined) {
                    comment.edited.push({ date: comment.date, user: comment.user });
                    comment.date = Date.now();
                    const user = { ...ctx.user } as any;
                    delete user.id; delete user.roles;
                    comment.user = user;
                }
                let data = { $set: { ['comments.' + i]: comment } };
                console.log('Updated comment =', data);
                return (await super.updateDoc(ctx, ds, data)) as DocumentInfo;
            }
        }
        throwErr(404, `Comment ${cid} not found`);
    }

    public async deleteComment(ctx: UserContext, ds: DocSpec, cid: string): Promise<DocumentInfo> {
        console.log(`deleteComment(${ds.id}, ${cid})`);
        const comment = await this.getComment(ctx, ds, cid);
        if (comment.user.email == ctx.user.email || (await this.isAdmin(ctx))) {
            const filter = { $pull: { comments: { id: cid } } };
            return (await super.updateDoc(ctx, ds, filter)) as DocumentInfo;
        }
        throwErr(400, `User does not have permission to delete comment ${cid}`);
    }

    private createDefaultRequestors(ctx: UserContext): Requestor[] {
        const me = ctx.user;
        return [{
            name: me.name, email: me.email, title: me.title,
            department: me.department, employeeNumber: me.employeeNumber, owner: true,
        }];
    }
}
