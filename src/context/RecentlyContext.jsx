import { createContext, useContext, useState } from 'react';

const RecentUpdatesContext = createContext();

export const RecentUpdatesProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState(null);

    const openRecentUpdates = (groupId) => {
        setSelectedGroupId(groupId);
        setIsOpen(true);
    };

    const closeRecentUpdates = () => {
        setIsOpen(false);
        setSelectedGroupId(null);
    };

    const toggleRecentUpdates = (groupId) => {
        if (isOpen && selectedGroupId === groupId) {
            closeRecentUpdates();
        } else {
            openRecentUpdates(groupId);
        }
    };

    return (
        <RecentUpdatesContext.Provider
            value={{
                isOpen,
                selectedGroupId,
                openRecentUpdates,
                closeRecentUpdates,
                toggleRecentUpdates,
            }}
        >
            {children}
        </RecentUpdatesContext.Provider>
    );
};

export const useRecentUpdates = () => {
    const context = useContext(RecentUpdatesContext);
    if (!context) {
        throw new Error('useRecentUpdates must be used within RecentUpdatesProvider');
    }
    return context;
};