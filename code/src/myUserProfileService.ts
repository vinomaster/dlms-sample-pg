/**
 * Copyright (c) 2024 Discover Financial Services
 */
import { UserContext } from 'dlms-base';
import { UserProfileService, Config, throwErr } from 'dlms-server';
import { Role } from './ui/src/common/states';

export const users = [
    {
        id: 'requestor',
        name: 'Requestor',
        roles: [Role.Employee.name],
        department: 'Product Development',
        email: 'requestor@test.com',
        title: 'Project Lead',
        employeeNumber: '1234',
    },
    {
        id: 'admin',
        name: 'Admin',
        roles: [Role.Administrator.name],
        department: 'Computer Room',
        email: 'admin@test.com',
        title: 'Tech Guru',
        employeeNumber: '3456',
    },
    {
        id: 'reviewer',
        name: 'Reviewer',
        roles: [Role.Employee.name],
        department: 'Product Development',
        email: 'reviewer@test.com',
        title: 'Director',
        employeeNumber: '9876',
    },
];

const passwords: any = {
    admin: 'pw',
    reviewer: 'pw',
    requestor: 'pw',
};

export class MyUserProfileService implements UserProfileService {
    /**
     * Get profile object from claims
     *
     * @param {any} claimsOrUid - The user claims or UID to retrieve the profile.
     * @returns {Promise<UserContext[]>} LDAP profile object
     */
    async get(claimsOrUid: any): Promise<UserContext[]> {
        console.log(`MyUserProfileService.get: claims=${claimsOrUid}`);
        const email =
            typeof claimsOrUid === 'string' ? claimsOrUid : claimsOrUid.email;
        for (const u of users) {
            if (u.email == email || u.id == email) {
                return [
                    {
                        user: u,
                    },
                ];
            }
        }
        throwErr(
            500,
            'Get profile from claims failed - try to log in again later.'
        );
    }

    /**
     * Verify user authentication based on provided user ID and password.
     *
     * @param {string} uid - The user ID to verify.
     * @param {string} pwd - The password associated with the user ID.
     * @returns {Promise<UserContext>} The user context object upon successful verification.
     */
    async verify(uid: string, pwd: string): Promise<UserContext> {
        console.log(`MyUserProfileService.verify: uid=${uid}`);
        if (!passwords.hasOwnProperty(uid) && !(passwords[uid] == pwd)) {
            throwErr(500, 'Authentication failed.');
        }
        return (await this.get(uid))[0];
    }
}
