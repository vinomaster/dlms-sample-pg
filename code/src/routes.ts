/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { Controller, ValidationService, FieldErrors, ValidateError, TsoaRoute, HttpStatusCodeLiteral, TsoaResponse, fetchMiddlewares } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ServicesController } from './controllers/documentController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ActionController } from './controllers/documentController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DocumentController } from './controllers/documentController';
import type { RequestHandler, Router } from 'express';
const multer = require('multer');
const upload = multer();

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "StateHistory": {
        "dataType": "refObject",
        "properties": {
            "state": {"dataType":"string","required":true},
            "date": {"dataType":"double","required":true},
            "email": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Person": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "department": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "title": {"dataType":"string","required":true},
            "employeeNumber": {"dataType":"string","required":true},
        },
        "additionalProperties": {"dataType":"any"},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CommentHistory": {
        "dataType": "refObject",
        "properties": {
            "date": {"dataType":"double","required":true},
            "user": {"ref":"Person","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CommentInfo": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "date": {"dataType":"double","required":true},
            "user": {"ref":"Person","required":true},
            "topic": {"dataType":"string","required":true},
            "text": {"dataType":"string","required":true},
            "edited": {"dataType":"array","array":{"dataType":"refObject","ref":"CommentHistory"}},
            "approved": {"dataType":"string"},
            "private": {"dataType":"boolean"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AttachmentInfo": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "hash": {"dataType":"string","required":true},
            "collection": {"dataType":"string"},
            "doc": {"dataType":"string"},
            "name": {"dataType":"string","required":true},
            "size": {"dataType":"double","required":true},
            "date": {"dataType":"double","required":true},
            "type": {"dataType":"string","required":true},
            "url": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Requestor": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "department": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "title": {"dataType":"string","required":true},
            "employeeNumber": {"dataType":"string","required":true},
            "owner": {"dataType":"boolean","required":true},
            "requested": {"dataType":"boolean"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DocInfo": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "state": {"dataType":"string","required":true},
            "requestors": {"dataType":"array","array":{"dataType":"refObject","ref":"Requestor"},"required":true},
            "reviewers": {"dataType":"array","array":{"dataType":"refObject","ref":"Person"},"required":true},
            "deliveryTeam": {"dataType":"array","array":{"dataType":"refObject","ref":"Person"},"required":true},
            "agreement": {"dataType":"boolean","required":true},
            "planningMotivation": {"dataType":"string","required":true},
            "planningObjectives": {"dataType":"double","required":true},
            "planningAudience": {"dataType":"string","required":true},
            "planningRules": {"dataType":"string","required":true},
            "planningThemes": {"dataType":"string","required":true},
            "planningChallenges": {"dataType":"string","required":true},
            "planningWinningTopics": {"dataType":"string","required":true},
            "planningIncubation": {"dataType":"string","required":true},
            "planningPlatforms": {"dataType":"string","required":true},
            "logisticsTimeline": {"dataType":"string","required":true},
            "logisticsDuration": {"dataType":"string","required":true},
            "logisticsLocation": {"dataType":"string","required":true},
            "logisticsPlatform": {"dataType":"string","required":true},
            "logisticsInfrastructureBuilt": {"dataType":"string","required":true},
            "marketingBudget": {"dataType":"string","required":true},
            "marketingPrizeCategories": {"dataType":"string","required":true},
            "marketingPrizes": {"dataType":"string","required":true},
            "marketingGuidelines": {"dataType":"string","required":true},
            "marketingChannels": {"dataType":"string","required":true},
            "marketingActivities": {"dataType":"string","required":true},
            "title": {"dataType":"string","required":true},
            "dateCreated": {"dataType":"double","required":true},
            "dateUpdated": {"dataType":"double","required":true},
            "curStateRead": {"dataType":"array","array":{"dataType":"string"}},
            "curStateWrite": {"dataType":"array","array":{"dataType":"string"}},
            "stateHistory": {"dataType":"array","array":{"dataType":"refObject","ref":"StateHistory"},"required":true},
            "comments": {"dataType":"array","array":{"dataType":"refObject","ref":"CommentInfo"},"required":true},
            "attachments": {"dataType":"array","array":{"dataType":"refObject","ref":"AttachmentInfo"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DocumentInfo": {
        "dataType": "refAlias",
        "type": {"ref":"DocInfo","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DocCreate": {
        "dataType": "refObject",
        "properties": {
            "requestors": {"dataType":"array","array":{"dataType":"refObject","ref":"Requestor"}},
            "reviewers": {"dataType":"array","array":{"dataType":"refObject","ref":"Person"}},
            "deliveryTeam": {"dataType":"array","array":{"dataType":"refObject","ref":"Person"}},
            "agreement": {"dataType":"boolean"},
            "planningMotivation": {"dataType":"string"},
            "planningObjectives": {"dataType":"double"},
            "planningAudience": {"dataType":"string"},
            "planningRules": {"dataType":"string"},
            "planningThemes": {"dataType":"string"},
            "planningChallenges": {"dataType":"string"},
            "planningWinningTopics": {"dataType":"string"},
            "planningIncubation": {"dataType":"string"},
            "planningPlatforms": {"dataType":"string"},
            "logisticsTimeline": {"dataType":"string"},
            "logisticsDuration": {"dataType":"string"},
            "logisticsLocation": {"dataType":"string"},
            "logisticsPlatform": {"dataType":"string"},
            "logisticsInfrastructureBuilt": {"dataType":"string"},
            "marketingBudget": {"dataType":"string"},
            "marketingPrizeCategories": {"dataType":"string"},
            "marketingPrizes": {"dataType":"string"},
            "marketingGuidelines": {"dataType":"string"},
            "marketingChannels": {"dataType":"string"},
            "marketingActivities": {"dataType":"string"},
            "title": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DocumentCreate": {
        "dataType": "refAlias",
        "type": {"ref":"DocCreate","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DocSummary": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "state": {"dataType":"string","required":true},
            "requestors": {"dataType":"array","array":{"dataType":"refObject","ref":"Requestor"},"required":true},
            "reviewers": {"dataType":"array","array":{"dataType":"refObject","ref":"Person"},"required":true},
            "deliveryTeam": {"dataType":"array","array":{"dataType":"refObject","ref":"Person"},"required":true},
            "agreement": {"dataType":"boolean","required":true},
            "planningMotivation": {"dataType":"string","required":true},
            "planningObjectives": {"dataType":"double","required":true},
            "planningAudience": {"dataType":"string","required":true},
            "planningRules": {"dataType":"string","required":true},
            "planningThemes": {"dataType":"string","required":true},
            "planningChallenges": {"dataType":"string","required":true},
            "planningWinningTopics": {"dataType":"string","required":true},
            "planningIncubation": {"dataType":"string","required":true},
            "planningPlatforms": {"dataType":"string","required":true},
            "logisticsTimeline": {"dataType":"string","required":true},
            "logisticsDuration": {"dataType":"string","required":true},
            "logisticsLocation": {"dataType":"string","required":true},
            "logisticsPlatform": {"dataType":"string","required":true},
            "logisticsInfrastructureBuilt": {"dataType":"string","required":true},
            "marketingBudget": {"dataType":"string","required":true},
            "marketingPrizeCategories": {"dataType":"string","required":true},
            "marketingPrizes": {"dataType":"string","required":true},
            "marketingGuidelines": {"dataType":"string","required":true},
            "marketingChannels": {"dataType":"string","required":true},
            "marketingActivities": {"dataType":"string","required":true},
            "title": {"dataType":"string","required":true},
            "dateCreated": {"dataType":"double","required":true},
            "dateUpdated": {"dataType":"double","required":true},
            "curStateRead": {"dataType":"array","array":{"dataType":"string"}},
            "curStateWrite": {"dataType":"array","array":{"dataType":"string"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DocList": {
        "dataType": "refObject",
        "properties": {
            "count": {"dataType":"double","required":true},
            "items": {"dataType":"array","array":{"dataType":"refObject","ref":"DocSummary"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DocumentList": {
        "dataType": "refAlias",
        "type": {"ref":"DocList","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CommentCreate": {
        "dataType": "refObject",
        "properties": {
            "topic": {"dataType":"string","required":true},
            "text": {"dataType":"string","required":true},
            "private": {"dataType":"boolean"},
            "approved": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DocUpdate": {
        "dataType": "refObject",
        "properties": {
            "requestors": {"dataType":"array","array":{"dataType":"refObject","ref":"Requestor"}},
            "reviewers": {"dataType":"array","array":{"dataType":"refObject","ref":"Person"}},
            "deliveryTeam": {"dataType":"array","array":{"dataType":"refObject","ref":"Person"}},
            "agreement": {"dataType":"boolean"},
            "planningMotivation": {"dataType":"string"},
            "planningObjectives": {"dataType":"double"},
            "planningAudience": {"dataType":"string"},
            "planningRules": {"dataType":"string"},
            "planningThemes": {"dataType":"string"},
            "planningChallenges": {"dataType":"string"},
            "planningWinningTopics": {"dataType":"string"},
            "planningIncubation": {"dataType":"string"},
            "planningPlatforms": {"dataType":"string"},
            "logisticsTimeline": {"dataType":"string"},
            "logisticsDuration": {"dataType":"string"},
            "logisticsLocation": {"dataType":"string"},
            "logisticsPlatform": {"dataType":"string"},
            "logisticsInfrastructureBuilt": {"dataType":"string"},
            "marketingBudget": {"dataType":"string"},
            "marketingPrizeCategories": {"dataType":"string"},
            "marketingPrizes": {"dataType":"string"},
            "marketingGuidelines": {"dataType":"string"},
            "marketingChannels": {"dataType":"string"},
            "marketingActivities": {"dataType":"string"},
            "title": {"dataType":"string"},
            "state": {"dataType":"string"},
            "comment": {"ref":"CommentCreate"},
            "attachments": {"dataType":"array","array":{"dataType":"refObject","ref":"AttachmentInfo"}},
            "$set": {"dataType":"any"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DocumentUpdate": {
        "dataType": "refAlias",
        "type": {"ref":"DocUpdate","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CommentUpdate": {
        "dataType": "refObject",
        "properties": {
            "topic": {"dataType":"string"},
            "text": {"dataType":"string"},
            "private": {"dataType":"boolean"},
            "approved": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const validationService = new ValidationService(models);

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

export function RegisterRoutes(app: Router) {
    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################
        app.get('/api/profile/:email',
            ...(fetchMiddlewares<RequestHandler>(ServicesController)),
            ...(fetchMiddlewares<RequestHandler>(ServicesController.prototype.getProfile)),

            function ServicesController_getProfile(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    email: {"in":"path","name":"email","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ServicesController();


              const promise = controller.getProfile.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/action/:id',
            ...(fetchMiddlewares<RequestHandler>(ActionController)),
            ...(fetchMiddlewares<RequestHandler>(ActionController.prototype.createDoc)),

            function ActionController_createDoc(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
                    body: {"in":"body","name":"body","required":true,"dataType":"any"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new ActionController();


              const promise = controller.createDoc.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/:docType',
            ...(fetchMiddlewares<RequestHandler>(DocumentController)),
            ...(fetchMiddlewares<RequestHandler>(DocumentController.prototype.createDoc)),

            function DocumentController_createDoc(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    body: {"in":"body","name":"body","required":true,"ref":"DocumentCreate"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DocumentController();


              const promise = controller.createDoc.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/:docType',
            ...(fetchMiddlewares<RequestHandler>(DocumentController)),
            ...(fetchMiddlewares<RequestHandler>(DocumentController.prototype.getDocs)),

            function DocumentController_getDocs(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    match: {"in":"query","name":"match","dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DocumentController();


              const promise = controller.getDocs.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/:docType/:id',
            ...(fetchMiddlewares<RequestHandler>(DocumentController)),
            ...(fetchMiddlewares<RequestHandler>(DocumentController.prototype.getDoc)),

            function DocumentController_getDoc(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DocumentController();


              const promise = controller.getDoc.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/:docType/:id/copy',
            ...(fetchMiddlewares<RequestHandler>(DocumentController)),
            ...(fetchMiddlewares<RequestHandler>(DocumentController.prototype.cloneDoc)),

            function DocumentController_cloneDoc(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DocumentController();


              const promise = controller.cloneDoc.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/:docType/:id/copy',
            ...(fetchMiddlewares<RequestHandler>(DocumentController)),
            ...(fetchMiddlewares<RequestHandler>(DocumentController.prototype.copyDoc)),

            function DocumentController_copyDoc(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
                    args: {"in":"body","name":"args","required":true,"ref":"DocumentUpdate"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DocumentController();


              const promise = controller.copyDoc.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.patch('/api/:docType/:id',
            ...(fetchMiddlewares<RequestHandler>(DocumentController)),
            ...(fetchMiddlewares<RequestHandler>(DocumentController.prototype.updateDoc)),

            function DocumentController_updateDoc(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
                    args: {"in":"body","name":"args","required":true,"ref":"DocumentUpdate"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DocumentController();


              const promise = controller.updateDoc.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/:docType/:id',
            ...(fetchMiddlewares<RequestHandler>(DocumentController)),
            ...(fetchMiddlewares<RequestHandler>(DocumentController.prototype.deleteDoc)),

            function DocumentController_deleteDoc(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DocumentController();


              const promise = controller.deleteDoc.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/:docType/:id/comment',
            ...(fetchMiddlewares<RequestHandler>(DocumentController)),
            ...(fetchMiddlewares<RequestHandler>(DocumentController.prototype.addComment)),

            function DocumentController_addComment(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
                    args: {"in":"body","name":"args","required":true,"ref":"CommentCreate"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DocumentController();


              const promise = controller.addComment.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/:docType/:id/comment/:cid',
            ...(fetchMiddlewares<RequestHandler>(DocumentController)),
            ...(fetchMiddlewares<RequestHandler>(DocumentController.prototype.getComment)),

            function DocumentController_getComment(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
                    cid: {"in":"path","name":"cid","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DocumentController();


              const promise = controller.getComment.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.patch('/api/:docType/:id/comment/:cid',
            ...(fetchMiddlewares<RequestHandler>(DocumentController)),
            ...(fetchMiddlewares<RequestHandler>(DocumentController.prototype.updateComment)),

            function DocumentController_updateComment(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
                    cid: {"in":"path","name":"cid","required":true,"dataType":"string"},
                    args: {"in":"body","name":"args","required":true,"ref":"CommentUpdate"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DocumentController();


              const promise = controller.updateComment.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/:docType/:id/comment/:cid',
            ...(fetchMiddlewares<RequestHandler>(DocumentController)),
            ...(fetchMiddlewares<RequestHandler>(DocumentController.prototype.deleteComment)),

            function DocumentController_deleteComment(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    id: {"in":"path","name":"id","required":true,"dataType":"string"},
                    cid: {"in":"path","name":"cid","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DocumentController();


              const promise = controller.deleteComment.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/docs/attachments',
            ...(fetchMiddlewares<RequestHandler>(DocumentController)),
            ...(fetchMiddlewares<RequestHandler>(DocumentController.prototype.getAttachments)),

            function DocumentController_getAttachments(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DocumentController();


              const promise = controller.getAttachments.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/docs/:docId/attachments',
            ...(fetchMiddlewares<RequestHandler>(DocumentController)),
            ...(fetchMiddlewares<RequestHandler>(DocumentController.prototype.getDocAttachments)),

            function DocumentController_getDocAttachments(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    docId: {"in":"path","name":"docId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DocumentController();


              const promise = controller.getDocAttachments.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.get('/api/docs/:docId/attachments/:attachmentId',
            ...(fetchMiddlewares<RequestHandler>(DocumentController)),
            ...(fetchMiddlewares<RequestHandler>(DocumentController.prototype.getDocAttachment)),

            function DocumentController_getDocAttachment(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    docId: {"in":"path","name":"docId","required":true,"dataType":"string"},
                    attachmentId: {"in":"path","name":"attachmentId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DocumentController();


              const promise = controller.getDocAttachment.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.delete('/api/docs/:docId/attachments/:attachmentId',
            ...(fetchMiddlewares<RequestHandler>(DocumentController)),
            ...(fetchMiddlewares<RequestHandler>(DocumentController.prototype.deleteDocAttachments)),

            function DocumentController_deleteDocAttachments(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    docId: {"in":"path","name":"docId","required":true,"dataType":"string"},
                    attachmentId: {"in":"path","name":"attachmentId","required":true,"dataType":"string"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DocumentController();


              const promise = controller.deleteDocAttachments.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        app.post('/api/docs/:docId/attachments',
            upload.single('file'),
            ...(fetchMiddlewares<RequestHandler>(DocumentController)),
            ...(fetchMiddlewares<RequestHandler>(DocumentController.prototype.createDocAttachments)),

            function DocumentController_createDocAttachments(request: any, response: any, next: any) {
            const args = {
                    req: {"in":"request","name":"req","required":true,"dataType":"object"},
                    docId: {"in":"path","name":"docId","required":true,"dataType":"string"},
                    file: {"in":"formData","name":"file","required":true,"dataType":"file"},
            };

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = getValidatedArgs(args, request, response);

                const controller = new DocumentController();


              const promise = controller.createDocAttachments.apply(controller, validatedArgs as any);
              promiseHandler(controller, promise, response, undefined, next);
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function isController(object: any): object is Controller {
        return 'getHeaders' in object && 'getStatus' in object && 'setStatus' in object;
    }

    function promiseHandler(controllerObj: any, promise: any, response: any, successStatus: any, next: any) {
        return Promise.resolve(promise)
            .then((data: any) => {
                let statusCode = successStatus;
                let headers;
                if (isController(controllerObj)) {
                    headers = controllerObj.getHeaders();
                    statusCode = controllerObj.getStatus() || statusCode;
                }

                // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                returnHandler(response, statusCode, data, headers)
            })
            .catch((error: any) => next(error));
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function returnHandler(response: any, statusCode?: number, data?: any, headers: any = {}) {
        if (response.headersSent) {
            return;
        }
        Object.keys(headers).forEach((name: string) => {
            response.set(name, headers[name]);
        });
        if (data && typeof data.pipe === 'function' && data.readable && typeof data._read === 'function') {
            response.status(statusCode || 200)
            data.pipe(response);
        } else if (data !== null && data !== undefined) {
            response.status(statusCode || 200).json(data);
        } else {
            response.status(statusCode || 204).end();
        }
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function responder(response: any): TsoaResponse<HttpStatusCodeLiteral, unknown>  {
        return function(status, data, headers) {
            returnHandler(response, status, data, headers);
        };
    };

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function getValidatedArgs(args: any, request: any, response: any): any[] {
        const fieldErrors: FieldErrors  = {};
        const values = Object.keys(args).map((key) => {
            const name = args[key].name;
            switch (args[key].in) {
                case 'request':
                    return request;
                case 'query':
                    return validationService.ValidateParam(args[key], request.query[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'queries':
                    return validationService.ValidateParam(args[key], request.query, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'path':
                    return validationService.ValidateParam(args[key], request.params[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'header':
                    return validationService.ValidateParam(args[key], request.header(name), name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'body':
                    return validationService.ValidateParam(args[key], request.body, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'body-prop':
                    return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, 'body.', {"noImplicitAdditionalProperties":"throw-on-extras"});
                case 'formData':
                    if (args[key].dataType === 'file') {
                        return validationService.ValidateParam(args[key], request.file, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    } else if (args[key].dataType === 'array' && args[key].array.dataType === 'file') {
                        return validationService.ValidateParam(args[key], request.files, name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    } else {
                        return validationService.ValidateParam(args[key], request.body[name], name, fieldErrors, undefined, {"noImplicitAdditionalProperties":"throw-on-extras"});
                    }
                case 'res':
                    return responder(response);
            }
        });

        if (Object.keys(fieldErrors).length > 0) {
            throw new ValidateError(fieldErrors, '');
        }
        return values;
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
