// @context/other/RewardContext.js

import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import GoalCompletionModal from '../../screens/home/components/modals/GoalCompletionModal';

const RewardContext = createContext(null);

export const RewardProvider = ({ children }) => {
    const [rewardState, setRewardState] = useState({
        visible: false,
        goal: null,
        oldXp: 0,
        newXp: 0,
    });

    const showReward = useCallback(({ goal, oldXp, newXp }) => {
        setRewardState({
            visible: true,
            goal,
            oldXp,
            newXp,
        });
    }, []);

    const hideReward = useCallback(() => {
        setRewardState(prev => ({ ...prev, visible: false }));
    }, []);

    const value = useMemo(() => ({ showReward }), [showReward]);

    return (
        <RewardContext.Provider value={value}>
            {children}
            {rewardState.visible && (
                <GoalCompletionModal
                    visible={rewardState.visible}
                    goal={rewardState.goal}
                    oldXp={rewardState.oldXp}
                    newXp={rewardState.newXp}
                    onClose={hideReward}
                />
            )}
        </RewardContext.Provider>
    );
};

export const useReward = () => {
    const context = useContext(RewardContext);
    if (!context) {
        throw new Error('useReward must be used within a RewardProvider');
    }
    return context;
};