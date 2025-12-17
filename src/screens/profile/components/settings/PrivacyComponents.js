import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Colors } from '@config/Colors';

export const UserListItem = ({ user, onPress, buttonText, buttonColor, isDestructive }) => (
    <View style={styles.userItem}>
        <Image source={{ uri: user.avatar || 'https://via.placeholder.com/150' }} style={styles.userAvatar} />
        <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userHandle}>@{user.handle}</Text>
            {user.blockedDate && <Text style={styles.blockedDate}>Blocked: {user.blockedDate}</Text>}
        </View>
        <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: isDestructive ? 'rgba(255,68,68,0.1)' : Colors.primary }]} 
            onPress={onPress}
        >
            <Text style={[styles.actionBtnText, { color: isDestructive ? '#FF4444' : '#FFF' }]}>{buttonText}</Text>
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    userItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
    userAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface },
    userInfo: { flex: 1, marginLeft: 12 },
    userName: { color: Colors.text, fontSize: 15, fontFamily: 'Poppins_500Medium' },
    userHandle: { color: Colors.textSecondary, fontSize: 13 },
    blockedDate: { color: Colors.danger, fontSize: 11, marginTop: 2 },
    actionBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8 },
    actionBtnText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold' },
});