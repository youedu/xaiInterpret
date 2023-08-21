import { useState } from 'react';

export default () => {
    const [currentUser, setCurrentUser] = useState({ name: null });
    return { currentUser, setCurrentUser };
};
