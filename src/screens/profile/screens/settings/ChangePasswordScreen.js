import React, { useState } from 'react';
import { 
    View, Text, StyleSheet, TouchableOpacity, StatusBar, 
    TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Keyboard 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@config/Colors'; 
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAlert } from '@context/AlertContext'; 
import { useProfile } from '@context/ProfileContext';

// ... PasswordInput Component (same as before) ...
const PasswordInput = ({ label, value, onChangeText, placeholder, isSecure, onToggleSecurity }) => (
    <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={Colors.textSecondary + '80'}
                secureTextEntry={isSecure}
                autoCapitalize="none"
            />
            <TouchableOpacity onPress={onToggleSecurity} style={styles.eyeIcon}>
                <Ionicons 
                    name={isSecure ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={Colors.textSecondary} 
                />
            </TouchableOpacity>
        </View>
    </View>
);

const ChangePasswordScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { showAlert } = useAlert();
    const { changePassword } = useProfile(); // Context Bridge

    const [form, setForm] = useState({ current: '', new: '', confirm: '' });
    const [visibility, setVisibility] = useState({ current: true, new: true, confirm: true });
    const [isLoading, setIsLoading] = useState(false);

    const toggleVisibility = (field) => setVisibility(prev => ({ ...prev, [field]: !prev[field] }));

    const handleUpdate = async () => {
        Keyboard.dismiss();
        if (!form.current || !form.new || !form.confirm) return showAlert({ title: "Missing Fields", message: "Fill all fields.", type: 'error' });
        if (form.new.length < 6) return showAlert({ title: "Weak Password", message: "Min 6 chars.", type: 'error' });
        if (form.new !== form.confirm) return showAlert({ title: "Mismatch", message: "Passwords don't match.", type: 'error' });

        setIsLoading(true);
        try {
            const response = await changePassword(form.current, form.new);
            if (response.success) {
                showAlert({ title: "Success", message: "Password updated.", type: 'success', btnText: "Back", onClose: () => navigation.goBack() });
            } else { throw new Error(response.message); }
        } catch (error) {
            showAlert({ title: "Error", message: error.message || "Failed to update.", type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };
    
    // ... Render (Same as before)
    return (
        <LinearGradient colors={[Colors.background, '#1a1a2e']} style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Change Password</Text>
                <View style={styles.headerButton} />
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"} 
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                    
                    <Text style={styles.instructionText}>
                        Your new password must be different from previously used passwords.
                    </Text>

                    <PasswordInput 
                        label="Current Password"
                        placeholder="Enter current password"
                        value={form.current}
                        onChangeText={(text) => setForm(prev => ({...prev, current: text}))}
                        isSecure={visibility.current}
                        onToggleSecurity={() => toggleVisibility('current')}
                    />

                    <PasswordInput 
                        label="New Password"
                        placeholder="Enter new password"
                        value={form.new}
                        onChangeText={(text) => setForm(prev => ({...prev, new: text}))}
                        isSecure={visibility.new}
                        onToggleSecurity={() => toggleVisibility('new')}
                    />

                    <PasswordInput 
                        label="Confirm New Password"
                        placeholder="Re-enter new password"
                        value={form.confirm}
                        onChangeText={(text) => setForm(prev => ({...prev, confirm: text}))}
                        isSecure={visibility.confirm}
                        onToggleSecurity={() => toggleVisibility('confirm')}
                    />

                    {/* Requirements / Hints */}
                    <View style={styles.requirementsContainer}>
                        <Text style={styles.reqTitle}>Password requirements:</Text>
                        <View style={styles.reqItem}>
                            <Ionicons name={form.new.length >= 6 ? "checkmark-circle" : "ellipse-outline"} size={14} color={form.new.length >= 6 ? Colors.success || '#2ecc71' : Colors.textSecondary} />
                            <Text style={[styles.reqText, form.new.length >= 6 && styles.reqTextActive]}>Minimum 6 characters</Text>
                        </View>
                        <View style={styles.reqItem}>
                            <Ionicons name={(form.new && form.new === form.confirm) ? "checkmark-circle" : "ellipse-outline"} size={14} color={(form.new && form.new === form.confirm) ? Colors.success || '#2ecc71' : Colors.textSecondary} />
                            <Text style={[styles.reqText, (form.new && form.new === form.confirm) && styles.reqTextActive]}>Passwords match</Text>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={[styles.updateBtn, isLoading && { opacity: 0.7 }]} 
                        onPress={handleUpdate}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.updateBtnText}>Update Password</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};
// ... styles (same as provided)
const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: Colors.surface + '80' },
    headerTitle: { fontFamily: 'Poppins_600SemiBold', color: Colors.text, fontSize: 18 },
    headerButton: { padding: 10, minWidth: 40, alignItems: 'center' },
    
    scrollContainer: { padding: 25 },
    instructionText: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, marginBottom: 25, lineHeight: 22 },

    inputGroup: { marginBottom: 20 },
    label: { fontFamily: 'Poppins_500Medium', color: Colors.text, marginBottom: 8, fontSize: 14 },
    inputContainer: { 
        flexDirection: 'row', alignItems: 'center', 
        backgroundColor: 'rgba(255,255,255,0.05)', 
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', 
        borderRadius: 12, paddingHorizontal: 15, height: 50 
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, color: Colors.text, fontFamily: 'Poppins_400Regular', height: '100%' },
    eyeIcon: { padding: 5 },

    requirementsContainer: { marginTop: 0, marginBottom: 30, padding: 15, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 10 },
    reqTitle: { fontFamily: 'Poppins_500Medium', color: Colors.textSecondary, fontSize: 12, marginBottom: 10 },
    reqItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 5, gap: 8 },
    reqText: { fontFamily: 'Poppins_400Regular', color: Colors.textSecondary, fontSize: 12 },
    reqTextActive: { color: Colors.text },

    updateBtn: { 
        backgroundColor: Colors.primary || '#6200EE', 
        height: 55, borderRadius: 16, 
        justifyContent: 'center', alignItems: 'center',
        shadowColor: Colors.primary, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5
    },
    updateBtnText: { fontFamily: 'Poppins_600SemiBold', color: '#FFF', fontSize: 16 }
});

export default ChangePasswordScreen;