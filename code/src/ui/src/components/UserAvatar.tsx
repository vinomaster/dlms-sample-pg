/**
 * Copyright (c) 2024 Discover Financial Services
 */
import React from 'react';
import { Avatar } from '@mui/material';
import { Person } from 'dlms-base';

const getInitials = (name: string) => {
    var names = name.split(' '),
        initials = names[0].substring(0, 1).toUpperCase();
    if (names.length > 1) {
        initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
};

interface Props {
    user: Person;
    style?: any;
}

/**
 * Renders the user avatar component with the provided user information.
 *
 * @param {Person} props.user - The user object containing name and email information
 * @param props.style - The style object to apply to the avatar
 *
 * @returns {JSX.Element} The rendered UserAvatar component
 */
const UserAvatar: React.FC<Props> = ({ user, style }) => {
    const url = ''; // "https://.../" + encodeURI(user.email);
    return (
        <Avatar src={url} className="sm" style={style}>
            {getInitials(user.name)}
        </Avatar>
    );
};

export default UserAvatar;
