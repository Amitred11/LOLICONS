import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedProps, withTiming, withDelay } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CircularProgressChart = ({ size = 50, strokeWidth = 6, progress = 0.75 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progressValue = useSharedValue(0);

    useEffect(() => { 
        progressValue.value = withDelay(500, withTiming(progress, { duration: 1000 })); 
    }, [progress]);

    const animatedCircleProps = useAnimatedProps(() => ({ 
        strokeDashoffset: circumference * (1 - progressValue.value) 
    }));
    
    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <Circle cx={size / 2} cy={size / 2} r={radius} stroke={Colors.surface} strokeWidth={strokeWidth} />
                <AnimatedCircle 
                    cx={size / 2} cy={size / 2} r={radius} 
                    stroke={Colors.secondary} strokeWidth={strokeWidth} 
                    strokeDasharray={circumference} 
                    animatedProps={animatedCircleProps} 
                    strokeLinecap="round" 
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </Svg>
            <Ionicons name="flame" size={24} color={Colors.secondary} style={{ position: 'absolute' }} />
        </View>
    );
};

const GoalRow = ({ goal, onPress }) => {
    const isCompleted = goal.progress >= 1;
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
};

const DailyGoalsWidget = ({ goals, dailyProgress, onGoalPress }) => {
    return (
        <View style={styles.goalCard}>
            <View style={styles.goalCardHeader}>
                <View>
                    <Text style={styles.sectionTitleNoPadding}>Daily Goals</Text>
                    <Text style={styles.goalCardSubtitle}>Build your reading habit</Text>
                </View>
                <CircularProgressChart progress={dailyProgress} size={50} strokeWidth={6} />
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
});

export default DailyGoalsWidget;