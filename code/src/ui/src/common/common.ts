/**
 * Copyright (c) 2024 Discover Financial Services
 */
import { Person, AttachmentInfo } from 'dlms-base';

export * from 'dlms-base';

export interface Requestor extends Person {
    owner: boolean;
    requested?: boolean;
}

export interface CommentHistory {
    date: number;
    user: Person;
}

export interface CommentInfo {
    id: string;
    date: number;
    user: Person;
    topic: string;
    text: string;
    edited?: CommentHistory[];
    approved?: string;
    private?: boolean;
}

export interface CommentCreate {
    topic: string;
    text: string;
    private?: boolean;
    approved?: string;
}

export interface CommentUpdate {
    topic?: string;
    text?: string;
    private?: boolean;
    approved?: string;
}

export interface StateHistory {
    state: string;
    date: number;
    email?: string;
}

export type Version = string;

export const docType = 'dlmsExample';
export type EditorDoc = any;
export type EditorInfo = DocInfo;
export type DocumentInfo = DocInfo;
export type DocumentUpdate = DocUpdate;
export type DocumentCreate = DocCreate;

export type DocumentList = DocList;
export type DocumentSummary = DocSummary;

export interface DocInfo extends DocSummary {
    stateHistory: StateHistory[];
    comments: CommentInfo[];
    attachments?: AttachmentInfo[];
}

export interface DocCreate {
    requestors?: Requestor[];
    reviewers?: Person[];
    deliveryTeam?: Person[];

    agreement?: boolean;

    planningMotivation?: string;
    planningObjectives?: number;
    planningAudience?: string;
    planningRules?: string;
    planningThemes?: string;
    planningChallenges?: string;
    planningWinningTopics?: string;
    planningIncubation?: string;
    planningPlatforms?: string;

    logisticsTimeline?: string;
    logisticsDuration?: string;
    logisticsLocation?: string;
    logisticsPlatform?: string;
    logisticsInfrastructureBuilt?: string;

    marketingBudget?: string;
    marketingPrizeCategories?: string;
    marketingPrizes?: string;
    marketingGuidelines?: string;
    marketingChannels?: string;
    marketingActivities?: string;

    title?: string;
}

export interface DocUpdate extends DocCreate {
    state?: string;
    comment?: CommentCreate;
    attachments?: AttachmentInfo[];
    $set?: any;
}

export interface DocList {
    count: number;
    items: DocSummary[];
}

export interface DocSummary {
    id: string;
    state: string;

    requestors: Requestor[];
    reviewers: Person[];
    deliveryTeam: Person[];

    agreement: boolean;

    planningMotivation: string;
    planningObjectives: number;
    planningAudience: string;
    planningRules: string;
    planningThemes: string;
    planningChallenges: string;
    planningWinningTopics: string;
    planningIncubation: string;
    planningPlatforms: string;

    logisticsTimeline: string;
    logisticsDuration: string;
    logisticsLocation: string;
    logisticsPlatform: string;
    logisticsInfrastructureBuilt: string;

    marketingBudget: string;
    marketingPrizeCategories: string;
    marketingPrizes: string;
    marketingGuidelines: string;
    marketingChannels: string;
    marketingActivities: string;

    title: string;
    dateCreated: number;
    dateUpdated: number;

    curStateRead?: string[]; // cache of current state read group
    curStateWrite?: string[]; // cache of current state write group
}
