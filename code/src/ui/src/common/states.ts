/**
 * Copyright (c) 2024 Discover Financial Services
 */
import { DocState, StateCallbackContext, User } from 'dlms-base';
export * from 'dlms-base';

/** User roles */
export const Role = {
    Administrator: {
        name: 'Admin',
        getMembers: 'Admin',
    },
    Requestor: {
        name: 'Requestor',
        getMembers: async function (ctx: StateCallbackContext) {
            return ctx.document.requestors;
        },
    },
    Reviewer: {
        name: 'Reviewer',
        getMembers: async function (ctx: StateCallbackContext) {
            return ctx.document.reviewers;
        },
    },
    Employee: {
        name: 'Employee',
        getMembers: 'Employee',
    },
    ReviewerGroup: {
        name: 'ReviewerGroup',
        getMembers: 'ReviewerGroup',
    },
};

const Administrator = Role.Administrator.name;
const Requestor = Role.Requestor.name;
const Reviewer = Role.Reviewer.name;
const Employee = Role.Employee.name;

/**
 * Checks if a user has a specific role based on the context and document provided.
 *
 * @param {AppContext} context - The context containing user information.
 * @param {any} document - The document to check against.
 * @param {string} role - The role to check for.
 * @returns {boolean} Returns true if the user has the specified role, otherwise false.
 */
export async function doesUserHaveRole(
    context: AppContext,
    document: any,
    role: string
) {
    console.log(`doesUserHaveRole(${role})`);
    const email = context.user.email;
    const roles = Role as any;
    if (roles[role]) {
        if (typeof roles[role].getMembers === 'function') {
            try {
                const members = await (roles[role].getMembers as Function)({
                    caller: context.user,
                    document,
                } as any);
                if (members) {
                    for (const member of members) {
                        if (member.email === email) {
                            return true;
                        }
                    }
                }
            } catch (e) {
                console.error('getMembers error: ', e);
            }
            return false;
        }
    }
    if (role === Employee && context.isEmployee) {
        return true;
    }
    if (context.isAdministrator) {
        return true;
    }
    return false;
}

export interface Phase {
    label: string;
    description: string;
}

/** Defines the phases of a document */
export interface Phases {
    created: Phase;
    underReview: Phase;
    //approved: Phase;
    done: Phase;
}

/** Describes the phases of a document */
export const phases: Phases = {
    created: {
        label: 'Request Created',
        description: '',
    },
    underReview: {
        label: 'Submitted & Under Review',
        description: '',
    },
    // approved: {
    //     label: "Request Approved",
    //     description: "",
    // },
    done: {
        label: 'Request Completed',
        description: '',
    },
};

export interface AppContext {
    user: User;
    isAdministrator: boolean;
    isRequestor: boolean;
    isReviewer: boolean;
    isEmployee: boolean;
    editMode: boolean;
    writeGroups: string[];
    readGroups: string[];

    setError?: any;
    setInfoText?: any;
    phaseDisplayed?: Phase | null;
    setShowDialog?: any;
    setShowSpinner?: any;
    showSection?: (section: string) => void;
    wasAdministrator?: boolean;
    show_checklist?: boolean;
    show_comments_section?: boolean;
    show_stepper_and_phases?: boolean;
    view_as_admin_only?: boolean;
    enable_print_option?: boolean;
    tabbed_document_view_switch?: boolean;
    info?: any;
}

export interface DocStates {
    [name: string]: PatentDocState;
}

export interface PatentDocState extends DocState {
    phase?: Phase;
    alwaysEnableNextState?: string[];
    showNextStateOnTab?: any;
}

export const docStates: DocStates = {
    start: {
        label: 'start',
        description: 'Start',
        puml: {
            content: ['User views Request Website'],
            color: 'Lime',
        },
        entry: async function () {
            return { groups: [] };
        },
        write: [],
        read: [],
        nextStates: {
            created: {
                groups: [Employee],
                label: 'Create Request',
                description: 'Create request.',
                puml: { label: ['Btn = Create Request'] },
            },
        },
    },

    created: {
        label: 'Created',
        description:
            'The request has been created.  Once all required questions are answered, it can be submitted for review.',
        phase: phases.created,
        puml: {
            title: 'Created',
            content: [
                'If Button = Create Request',
                'Requestor can update request',
            ],
            color: 'LightGreen',
        },
        entry: [Employee],
        onEntry: async function (ctx) {
            console.log('Enter document=', ctx.document);
            if (
                !ctx.document.requestors ||
                ctx.document.requestors.length === 0
            ) {
                ctx.document.requestors = ctx
                    .getDocMgr()
                    .createDefaultRequestors(ctx.getUserContext());
            }
            return {};
        },
        write: [Requestor, Administrator],
        read: [Requestor, Reviewer, Administrator],
        nextStates: {
            submitted: {
                groups: [Requestor, Administrator],
                label: 'Submit Request',
                description: 'Submit the request for review.',
                puml: { label: ['Btn = Submit'] },
            },
            cancelled: {
                groups: [Requestor, Reviewer, Administrator],
                label: 'Cancel Request',
                description:
                    'The request is cancelled and will no longer be pursued.',
                puml: { label: ['Add comments', 'Btn = Cancel'] },
                props: {
                    alwaysEnabled: 'checklist',
                },
            },
        },
    },

    submitted: {
        label: 'Submitted',
        description:
            'Thank you for submitting your request for a document. It will be reviewed.',
        phase: phases.underReview,
        puml: {
            title: 'Submitted',
            content: [
                'If Button = Submit, notify Administrator',
                'Requestor can update request',
                'Administrator assigns Reviewer',
            ],
            color: 'LightYellow',
        },
        entry: async function (ctx) {
            if (await ctx.isCallerInGroup([Requestor])) {
                ctx.notify(
                    [Administrator],
                    ``,
                    `Document request submitted by ${ctx.caller.name}.`
                );
            } else ctx.accessDeniedError();
            return { groups: [Employee] };
        },
        write: [Requestor, Reviewer, Administrator],
        read: [Requestor, Reviewer, Administrator],
        nextStates: {
            approved: {
                groups: [Reviewer, Administrator],
                label: 'Approve',
                description: 'Approve the request',
                puml: { label: ['Add comments', 'Btn = Approve'] },
            },
            denied: {
                groups: [Reviewer, Administrator],
                label: 'Deny',
                description: 'Decision is made and the request is denied.',
                puml: { label: ['Add comments', 'Btn = Deny'] },
                props: {
                    alwaysEnabled: 'checklist',
                },
            },
            cancelled: {
                groups: [Requestor, Administrator],
                label: 'Cancel Request',
                description:
                    'The request is cancelled and will no longer be pursued.',
                puml: { label: ['Add comments', 'Btn = Cancel'] },
                props: {
                    alwaysEnabled: 'checklist',
                },
            },
            moreinforequested: {
                groups: [Reviewer, Administrator],
                label: 'Request-Info',
                description: 'Need more info to make a decision.',
                puml: { label: ['Add comments', 'Btn = Request-Info'] },
                props: {
                    alwaysEnabled: 'checklist',
                },
            },
        },
    },

    approved: {
        label: 'Approved',
        description: 'The request has been approved.',
        phase: phases.done,
        puml: {
            title: 'Approved',
            content: [
                'If Reviewer & Button = Approved, then notify Requestor',
                'Requestor can update request',
            ],
            color: 'LightGreen',
        },
        entry: async function (ctx) {
            if (await ctx.isCallerInGroup([Reviewer, Administrator])) {
                ctx.notify(
                    [Requestor],
                    ``,
                    `Document request has been approved.`
                );
            } else ctx.accessDeniedError();
            return { groups: [Employee] };
        },
        write: [Administrator],
        read: [Requestor, Reviewer, Administrator],
        nextStates: {},
    },

    cancelled: {
        label: 'Cancelled',
        description: 'The request has been cancelled.',
        phase: phases.done,
        puml: {
            title: 'Cancelled',
            content: ['If Button = Cancel, then notify Requestor, Reviewer'],
            color: 'ffaaaa',
        },
        entry: async function (ctx) {
            if (await ctx.isCallerInGroup([Reviewer, Administrator])) {
                ctx.notify(
                    [Requestor, Reviewer, Administrator],
                    ``,
                    `Document has been cancelled.`
                );
            } else ctx.accessDeniedError();
            return { groups: [Employee] };
        },
        write: [Requestor, Reviewer, Administrator],
        read: [Requestor, Reviewer, Administrator],
        nextStates: {},
    },

    moreinforequested: {
        label: 'More Info Requested',
        description:
            'More details needed on this request in order to make a decision.',
        phase: phases.underReview,
        puml: {
            title: 'More-Info-Requested',
            content: [
                'If Reviewer & Button = Request-Info, then notify Requestor',
                'Requestor can update request',
            ],
            color: 'LightGreen',
        },
        entry: async function (ctx) {
            if (await ctx.isCallerInGroup([Reviewer, Administrator])) {
                ctx.notify(
                    [Requestor],
                    ``,
                    `Document needs more info in order to make a decision.`
                );
            } else ctx.accessDeniedError();
            return { groups: [Employee] };
        },
        write: [Requestor],
        read: [Requestor, Reviewer],
        nextStates: {
            submitted: {
                groups: [Requestor],
                label: 'Submit Request',
                description: 'Submit the request for review.',
                puml: { label: ['Btn = Submit'] },
            },
            cancelled: {
                groups: [Requestor],
                label: 'Cancel Request',
                description:
                    'The request is cancelled and will no longer be pursued.',
                puml: { label: ['Add comments', 'Btn = Cancel'] },
                props: {
                    alwaysEnabled: 'checklist',
                },
            },
        },
    },
    denied: {
        label: 'Denied',
        description: 'Decision is made and the request is denied.',
        phase: phases.done,
        puml: {
            title: 'Denied',
            content: [
                'If Reviewer & Button = Denied, then notify Requestor',
                'Requestor can update request',
            ],
            color: 'LightGreen',
        },
        entry: async function (ctx) {
            if (await ctx.isCallerInGroup([Reviewer, Administrator])) {
                ctx.notify([Requestor], ``, `Document request is denied.`);
            } else ctx.accessDeniedError();
            return { groups: [Employee] };
        },
        write: [Requestor],
        read: [Requestor, Reviewer],
        nextStates: {},
    },
};
