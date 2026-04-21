/**
 * Copyright (c) 2024 Discover Financial Services
 */
import { Person, UserGroupInfo } from '../common/common';
import { DocMgr } from './DocMgr';

export class Admin {
    async init() {
        console.log('Admin.init()');
    }

    async setMembers(group: string, members: any): Promise<void> {
        console.log(`setMembers(${group}, ${members})`);
        await DocMgr.getInstance().setUserGroup(group, members);
    }

    async getGroups(): Promise<UserGroupInfo[]> {
        console.log('getGroups()');
        const groups = await DocMgr.getInstance().getUserGroups();
        return groups;
    }

    async getMembers(group: string): Promise<Person[]> {
        console.log(`getMembers(${group})`);
        const r = await DocMgr.getInstance().getUserGroup(group);
        return r.members;
    }

    async getGroup(group: string): Promise<UserGroupInfo> {
        console.log(`getGroup(${group})`);
        const r = await DocMgr.getInstance().getUserGroup(group);
        return r;
    }

    async addGroup(group: string): Promise<UserGroupInfo> {
        console.log(`addGroup(${group})`);
        let groups = await this.getGroups();
        for (var g of groups) {
            if (g.id === group) {
                return g;
            }
        }
        await DocMgr.getInstance().createUserGroup(group, []);
        //console.log(" -- added; new group=",group);
        return await this.getGroup(group);
    }

    async deleteGroup(group: string): Promise<boolean> {
        console.log(`deleteGroup(${group})`);
        let r = await DocMgr.getInstance().deleteUserGroup(group);
        return r;
    }
}
