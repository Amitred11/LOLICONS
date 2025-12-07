// components/DailyGoalsWidget.js

import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors';

// Progress Ring now reflects actual progress
const SimpleProgressRing = ({ size = 50, progress = 0 }) => {
    const angle = progress * 360;
    const progressStyle = {
        transform: [{ rotate: `${angle}deg` }],
    };

    return (
        <View style={[styles.ringContainer, { width: size, height: size, borderRadius: size / 2, borderColor: Colors.secondary + '40' }]}>
            {/* The colored progress part */}
            <View style={[styles.progressRing, progressStyle, { width: size, height: size, borderRadius: size / 2 }]} />
            
            <View style={[styles.ringInner, { borderRadius: (size - 8) / 2 }]} />
            <Ionicons name="flame" size={20} color={Colors.secondary} style={styles.ringIcon} />
        </View>
    );
};

const GoalRow = memo(({ goal, onPress }) => {
    const isCompleted = goal.progress >= goal.total;
    const progressPercentage = (goal.progress / goal.total) * 100;
    
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.goalRow}>
            {/* Progress Bar Background */}
            <View style={[styles.goalProgress, { width: `${progressPercentage}%`, backgroundColor: Colors.secondary + '20' }]}/>

            <View style={[styles.goalIcon, { backgroundColor: isCompleted ? Colors.secondary + '30' : 'transparent' }]}>
                <Ionicons name={goal.icon} size={20} color={isCompleted ? Colors.secondary : Colors.textSecondary} />
            </View>
            <View style={{ flex: 1, paddingHorizontal: 12 }}>
                <Text style={[styles.goalTitle, isCompleted && { textDecorationLine: 'line-through', color: Colors.textSecondary }]}>
                    {goal.title}
                </Text>
            </View>
            {isCompleted ? (
                <Ionicons name="checkmark-circle" size={24} color={Colors.secondary} />
            ) : (
                <Text style={styles.progressText}>{goal.progress}/{goal.total}</Text>
            )}
        </TouchableOpacity>
    );
});

const DailyGoalsWidget = ({ goals, dailyProgress, onGoalPress }) => {
    return (
        <View style={styles.goalCard}>
            <View style={styles.goalCardHeader}>
                <View>
                    <Text style={styles.sectionTitleNoPadding}>Daily Goals</Text>
                    <Text style={styles.goalCardSubtitle}>Build your reading habit</Text>
                </View>
                <SimpleProgressRing size={45} progress={dailyProgress} />
            </View>
            
            <View style={styles.goalsList}>
                {goals.map((goal) => (
                    // Pass the goal object on press
                    <GoalRow key={goal.id} goal={goal} onPress={() => onGoalPress(goal)} />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    goalCard: { backgroundColor: Colors.surface + '40', borderRadius: 20, padding: 20, marginHorizontal: 20, borderWidth: 1, borderColor: Colors.surface },
    goalCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitleNoPadding: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 20 },
    goalCardSubtitle: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 14 },
    goalsList: { gap: 12 },
    goalRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, padding: 12, borderRadius: 12, overflow: 'hidden' },
    goalIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
    goalTitle: { fontFamily: 'Poppins_500Medium', color: Colors.text, fontSize: 14, zIndex: 1 },
    progressText: { fontFamily: 'Poppins_600SemiBold', color: Colors.textSecondary, fontSize: 13, zIndex: 1 },
    goalProgress: { position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 0 },

    // Ring Styles
    ringContainer: { borderWidth: 4, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surface },
    ringInner: { position: 'absolute', top: 2, left: 2, right: 2, bottom: 2, backgroundColor: Colors.background },
    ringIcon: { position: 'absolute', zIndex: 2 },
    progressRing: { position: 'absolute', borderWidth: 4, borderColor: Colors.secondary, borderLeftColor: 'transparent', borderBottomColor: 'transparent', borderRightColor: 'transparent' },
});

export default memo(DailyGoalsWidget);