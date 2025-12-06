import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors';

// Simple Progress Circle using border tricks (No SVG required)
const SimpleProgressRing = ({ size = 50, progress = 0 }) => {
    return (
        <View style={[styles.ringContainer, { width: size, height: size, borderRadius: size / 2 }]}>
            <View style={[styles.ringInner, { borderRadius: (size - 6) / 2 }]} />
            <Ionicons name="flame" size={20} color={Colors.secondary} style={styles.ringIcon} />
        </View>
    );
};

const GoalRow = memo(({ goal, onPress }) => {
    const isCompleted = goal.progress >= goal.total;
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.goalRow}>
            <View style={[styles.goalIcon, { backgroundColor: isCompleted ? Colors.secondary + '20' : Colors.surface }]}>
                <Ionicons name={goal.icon} size={20} color={isCompleted ? Colors.secondary : Colors.textSecondary} />
            </View>
            <View style={{ flex: 1, paddingHorizontal: 12 }}>
                <Text style={[styles.goalTitle, isCompleted && { textDecorationLine: 'line-through', opacity: 0.6 }]}>
                    {goal.title}
                </Text>
            </View>
            {isCompleted ? (
                <Ionicons name="checkmark-circle" size={24} color={Colors.secondary} />
            ) : (
                <View style={styles.radioButton} />
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
                {/* Replaced complex SVG chart with simple indicator to prevent crashes */}
                <SimpleProgressRing size={45} progress={dailyProgress} />
            </View>
            
            <View style={styles.goalsList}>
                {goals.map((goal) => (
                    <GoalRow key={goal.id} goal={goal} onPress={onGoalPress} /> 
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
    goalRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, padding: 12, borderRadius: 12 },
    goalIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    goalTitle: { fontFamily: 'Poppins_500Medium', color: Colors.text, fontSize: 14 },
    radioButton: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.textSecondary + '40' },
    
    // Ring Styles
    ringContainer: { borderWidth: 4, borderColor: Colors.secondary, justifyContent: 'center', alignItems: 'center' },
    ringInner: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderWidth: 2, borderColor: Colors.background },
    ringIcon: { position: 'absolute' }
});

// Ensure default export is correct
export default memo(DailyGoalsWidget);