import React from 'react';

import { AuthProvider } from '../hooks/Auth';

const AppProvider: React.FC = ({ children }) => (
    <AuthProvider>
        {children}
    </AuthProvider>
);

export default AppProvider;
