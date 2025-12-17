import React, { useRef, useEffect } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Modal, 
    TextInput, Animated, Dimensions, ScrollView, Switch 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@config/Colors';

const { height } = Dimensions.get('window');

// --- 3. ANIMATED CHAT LIST ITEM ---
export const AnimatedChatItem = ({ index, children }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 500,
            delay: index * 60,
            useNativeDriver: true
        }).start();
    }, []);

    const translateY = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0]
    });

    return (
        <Animated.View style={{ opacity: animatedValue, transform: [{ translateY }] }}>
            {children}
        </Animated.View>
    );
};

// --- 4. FAVORITES RAIL ---
export const FavoritesRail = ({ chats, onSelect }) => {
    const favorites = chats.filter(c => c.pinned || c.isOnline).slice(0, 5);
    
    if (favorites.length === 0) return null;

    return (
        <View style={styles.railContainer}>
            <Text style={styles.railTitle}>Favorites</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                {favorites.map((item) => (
                    <TouchableOpacity 
                        key={item.id} 
                        style={styles.favItem} 
                        onPress={() => onSelect(item)} 
                        activeOpacity={0.8}
                    >
                        <View style={styles.favAvatarContainer}>
                            {item.avatar ? (
                                <Image source={{ uri: item.avatar }} style={styles.favAvatar} />
                            ) : (
                                <LinearGradient colors={[Colors.primary, '#8E2DE2']} style={styles.favPlaceholder}>
                                    <Text style={styles.favInitials}>{item.name.charAt(0)}</Text>
                                </LinearGradient>
                            )}
                            {item.isOnline && <View style={styles.favOnlineBadge} />}
                        </View>
                        <Text style={styles.favName} numberOfLines={1}>{item.name.split(' ')[0]}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

// --- 5. MEMBER PREVIEW ---
export const MemberPreview = ({ members, onManage }) => (
    <View style={styles.memberListContainer}>
        <View style={styles.memberListHeader}>
            <Text style={styles.memberCount}>{members?.length || 0} Members</Text>
            <TouchableOpacity onPress={onManage}>
                <Text style={styles.seeAllText}>Manage</Text>
            </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 15, paddingRight: 20 }}>
            {members && members.slice(0, 5).map((member, index) => {
                const name = member.nickname || member.name || member;
                const uri = member.avatar || `https://i.pravatar.cc/150?u=${member.id || index}`;
                return (
                    <View key={index} style={styles.memberItem}>
                        <Image source={{ uri: uri }} style={styles.memberAvatar} />
                        <Text style={styles.memberName} numberOfLines={1}>{name}</Text>
                    </View>
                );
            })}
            <TouchableOpacity style={[styles.memberItem, styles.addMemberBtn]} onPress={onManage}>
                <Text style={styles.moreMembersText}>+{members?.length > 5 ? members.length - 5 : ''}</Text>
            </TouchableOpacity>
        </ScrollView>
    </View>
);

// --- 8. ATTACHMENT ITEM ---
export const AttachmentItem = ({ icon, color, label, onPress }) => (
    <TouchableOpacity style={styles.attachItem} onPress={onPress}>
        <View style={[styles.attachIconBg, { backgroundColor: color }]}>
            <Ionicons name={icon} size={24} color="#FFF" />
        </View>
        <Text style={styles.attachLabel}>{label}</Text>
    </TouchableOpacity>
);

// --- 9. EMOJI PICKER ---
export const EmojiPicker = ({ onSelect }) => {
    const emojis = ['😀','😂','😍','🔥','👍','🎉','❤️','😭','😡','👻','👽','🤖','💩','💀','👀','🧠','👋','🙏'];
    return (
      <View style={{ height: 50, backgroundColor: '#111' }}>
        <FlatList 
            data={emojis} 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ paddingHorizontal: 10 }}
            renderItem={({ item }) => (
                <TouchableOpacity onPress={() => onSelect(item)} style={{ padding: 10 }}>
                    <Text style={{ fontSize: 24 }}>{item}</Text>
                </TouchableOpacity>
            )} 
            keyExtractor={(item) => item} 
        />
      </View>
    );
};

const styles = StyleSheet.create({
    // --- Full Screen Image Styles ---
    fsImageContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
    fsCloseBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10 },
    fsImage: { width: '100%', height: '100%' },

    // --- Favorites Rail Styles ---
    railContainer: { marginBottom: 20 },
    railTitle: { fontSize: 18, fontWeight: '700', color: '#FFF', marginLeft: 20, marginBottom: 12 },
    favItem: { alignItems: 'center', marginRight: 15, width: 64 },
    favAvatarContainer: { marginBottom: 6 },
    favAvatar: { width: 60, height: 60, borderRadius: 22, borderWidth: 2, borderColor: '#1E1E1E' },
    favPlaceholder: { width: 60, height: 60, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1E1E1E' },
    favInitials: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
    favOnlineBadge: { position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#34C759', borderWidth: 2, borderColor: '#09090b' },
    favName: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '500' },

    // --- Settings / Member Preview Styles ---
    memberListContainer: { marginTop: 20, paddingLeft: 20 },
    memberListHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20, marginBottom: 12 },
    memberCount: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700' },
    seeAllText: { color: Colors.primary, fontSize: 12, fontWeight: '600' },
    memberItem: { alignItems: 'center', width: 60 },
    memberAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#333' },
    memberName: { color: Colors.textSecondary, fontSize: 11, marginTop: 6, fontWeight: '500' },
    addMemberBtn: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', width: 50, height: 50, borderRadius: 25 },
    moreMembersText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '700' },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16 },
    settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    destructiveIconBox: { backgroundColor: 'rgba(255, 69, 58, 0.15)' },
    settingText: { color: Colors.text, fontSize: 16, fontWeight: '500' },
    subTitle: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
    destructiveText: { color: '#FF453A' },

    // --- Prompt Styles ---
    promptOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    promptContent: { width: '80%', backgroundColor: '#1E1E1E', borderRadius: 20, padding: 20 },
    promptTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    promptInput: { backgroundColor: '#333', borderRadius: 10, padding: 12, color: '#FFF', fontSize: 16, marginBottom: 20 },
    promptBtns: { flexDirection: 'row', justifyContent: 'space-between' },
    promptBtn: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 10, backgroundColor: '#333', marginRight: 10 },
    promptConfirm: { backgroundColor: Colors.primary, marginRight: 0 },
    promptBtnText: { color: '#FFF', fontWeight: '600' },

    // --- Attachment Item Styles ---
    attachItem: { alignItems: 'center', width: 70 },
    attachIconBg: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    attachLabel: { color: Colors.textSecondary, fontSize: 12 },
});