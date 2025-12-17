import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@config/Colors';

export const FriendActionSheet = ({ 
    visible, onClose, isFriend, isBlocked, 
    onUnfriend, onAddFriend, onUnblock, onBlock, onReport 
}) => {
    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
            <Pressable style={styles.actionSheetOverlay} onPress={onClose}>
                <View style={styles.actionSheetContainer}>
                    {isFriend ? (
                        <TouchableOpacity style={styles.actionSheetButton} onPress={onUnfriend}>
                            <Ionicons name="person-remove-outline" size={20} color={'#FF453A'} />
                            <Text style={[styles.actionSheetText, {color: '#FF453A'}]}>Unfriend</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.actionSheetButton} onPress={onAddFriend}>
                            <Ionicons name="person-add-outline" size={20} color={Colors.primary} />
                            <Text style={styles.actionSheetText}>Add Friend</Text>
                        </TouchableOpacity>
                    )}

                    {isBlocked ? (
                        <TouchableOpacity style={styles.actionSheetButton} onPress={onUnblock}>
                            <Ionicons name="shield-checkmark-outline" size={20} color={'#34C759'} />
                            <Text style={[styles.actionSheetText, {color: '#34C759'}]}>Unblock</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.actionSheetButton} onPress={onBlock}>
                            <Ionicons name="shield-outline" size={20} color={'#FF453A'} />
                            <Text style={[styles.actionSheetText, {color: '#FF453A'}]}>Block User</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.actionSheetButton} onPress={onReport}>
                        <Ionicons name="flag-outline" size={20} color={'#FF9500'} />
                        <Text style={[styles.actionSheetText, {color: '#FF9500'}]}>Report User</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={[styles.actionSheetContainer, {marginTop: 10}]} onPress={onClose}>
                    <View style={styles.actionSheetButton}>
                        <Text style={[styles.actionSheetText, {fontWeight: 'bold'}]}>Cancel</Text>
                    </View>
                </TouchableOpacity>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    actionSheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end', padding: 20 },
    actionSheetContainer: { backgroundColor: '#2C2C2E', borderRadius: 14, overflow: 'hidden' },
    actionSheetButton: { paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.1)' },
    actionSheetText: { color: Colors.primary, fontSize: 17, fontWeight: '500' },
});