import React, { useState, useEffect } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, TextInput, 
    TouchableOpacity, ActivityIndicator, Alert, Switch 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@config/Colors';
import { ProfileAPI } from '@api/MockProfileService'; // Assuming your Profile API path
import { useCommunity } from '@context/main/CommunityContext';
import { useAlert } from '@context/other/AlertContext';

const CommunitySettingsScreen = ({ navigation }) => {
    const { submitGuildProposal, isSubmitting } = useCommunity();
    
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showToast, showAlert } = useAlert();
    // Form State
    const [guildName, setGuildName] = useState('');
    const [description, setDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);

    const REQUIRED_XP = 50000;


    useEffect(() => {
        loadStatus();
    }, []);

    const loadStatus = async () => {
        const res = await ProfileAPI.getProfile();
        if (res.success) setUserProfile(res.data);
        setLoading(false);
    };

    const handleRequest = async () => {
        if (!guildName || !description) {
            showAlert({
                title: "Error",
                message: "Please fill in all fields.",
                type: "error",
                btnText: "Okay",
            });
            return;
        }

        const success = await submitGuildProposal(userProfile.id, {
            name: guildName,
            description,
            type: isPrivate ? 'private' : 'public',
        });

        if (success) {
            showToast("Success", "Your realm founding proposal has been sent to the Primordial Apex.", 'success');
            navigation.goBack();
        }
    };

    if (loading) return (
        <View style={styles.centered}><ActivityIndicator color={Colors.primary} /></View>
    );

    const hasRequirement = userProfile?.xp >= REQUIRED_XP;

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Realm Founding</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Requirement Card */}
            <View style={[styles.card, !hasRequirement && styles.cardLocked]}>
                <View style={styles.cardHeader}>
                    <MaterialCommunityIcons 
                        name={hasRequirement ? "shield-check" : "shield-lock"} 
                        size={24} 
                        color={hasRequirement ? Colors.secondary : Colors.danger} 
                    />
                    <Text style={styles.cardTitle}>Founding Requirements</Text>
                </View>
                
                <View style={styles.reqRow}>
                    <Text style={styles.reqLabel}>Required Rank:</Text>
                    <Text style={[styles.reqValue, { color: '#FFD700' }]}>Sovereign of the Gods (主)</Text>
                </View>
                
                <View style={styles.reqRow}>
                    <Text style={styles.reqLabel}>Your Progress:</Text>
                    <Text style={[styles.reqValue, { color: hasRequirement ? Colors.secondary : Colors.danger }]}>
                        {userProfile?.xp} / {REQUIRED_XP} XP
                    </Text>
                </View>

                {!hasRequirement && (
                    <Text style={styles.warningText}>
                        You lack the spiritual authority to found a realm. Continue cultivating to unlock this feature.
                    </Text>
                )}
            </View>

            {/* Form Section */}
            <View style={[styles.form, !hasRequirement && { opacity: 0.3 }]} pointerEvents={hasRequirement ? 'auto' : 'none'}>
                <Text style={styles.label}>Realm Name</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="e.g. The Shadow Sect" 
                    placeholderTextColor="#444"
                    value={guildName}
                    onChangeText={setGuildName}
                />

                <Text style={styles.label}>Purpose & Description</Text>
                <TextInput 
                    style={[styles.input, styles.textArea]} 
                    placeholder="What is the goal of this community?" 
                    placeholderTextColor="#444"
                    multiline
                    numberOfLines={4}
                    value={description}
                    onChangeText={setDescription}
                />

                <View style={styles.switchRow}>
                    <View>
                        <Text style={styles.label}>Private Realm</Text>
                        <Text style={styles.subLabel}>Requires approval for new members to join.</Text>
                    </View>
                    <Switch 
                        value={isPrivate} 
                        onValueChange={setIsPrivate}
                        trackColor={{ false: '#222', true: Colors.primary }}
                    />
                </View>

                <TouchableOpacity 
                    style={[styles.submitBtn, !hasRequirement && styles.submitBtnDisabled]}
                    onPress={handleRequest}
                    disabled={!hasRequirement || isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text style={styles.submitBtnText}>Submit Founding Proposal</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#050505' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050505' },
    header: { 
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
        paddingHorizontal: 20, paddingTop: 60, marginBottom: 30 
    },
    headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '900' },
    
    card: { 
        backgroundColor: '#111', marginHorizontal: 20, borderRadius: 20, 
        padding: 20, borderWidth: 1, borderColor: '#222', marginBottom: 30 
    },
    cardLocked: { borderColor: 'rgba(239, 68, 68, 0.3)' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
    cardTitle: { color: '#FFF', fontSize: 16, fontWeight: '800' },
    reqRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    reqLabel: { color: '#94a3b8', fontSize: 14 },
    reqValue: { fontWeight: 'bold' },
    warningText: { color: '#EF4444', fontSize: 12, marginTop: 15, fontStyle: 'italic' },

    form: { paddingHorizontal: 20 },
    label: { color: '#FFF', fontSize: 14, fontWeight: '700', marginBottom: 8 },
    subLabel: { color: '#94a3b8', fontSize: 12, marginBottom: 8 },
    input: { 
        backgroundColor: '#111', borderRadius: 12, padding: 15, 
        color: '#FFF', borderWidth: 1, borderColor: '#222', marginBottom: 20 
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    switchRow: { 
        flexDirection: 'row', justifyContent: 'space-between', 
        alignItems: 'center', marginBottom: 30 
    },
    submitBtn: { 
        backgroundColor: Colors.primary, padding: 18, 
        borderRadius: 15, alignItems: 'center' 
    },
    submitBtnDisabled: { backgroundColor: '#333' },
    submitBtnText: { color: '#000', fontWeight: '900', fontSize: 16 }
});

export default CommunitySettingsScreen;