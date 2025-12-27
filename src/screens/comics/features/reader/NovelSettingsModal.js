import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const Colors = {
    bg: '#1A1A1A', 
    accent: '#5EEAD4', 
    text: '#FFFFFF', 
    textDim: '#9CA3AF', 
    border: '#333333', 
    activeBg: '#2A2A2A'
};

const SectionTitle = ({ title }) => (
    <Text style={{ color: Colors.textDim, fontSize: 12, fontWeight: 'bold', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
        {title}
    </Text>
);

const NovelSettingsModal = ({ visible, onClose, settings, onUpdateSettings }) => {
    const [activeTab, setActiveTab] = useState('TEXT');
    const updateSetting = (key, value) => onUpdateSettings(prev => ({ ...prev, [key]: value }));

    const renderTextTab = () => (
        <View style={styles.tabContent}>
            <SectionTitle title="Font Size" />
            <View style={styles.rowWrap}>
                {[16, 18, 22, 26].map(size => (
                    <TouchableOpacity 
                        key={size} 
                        style={[styles.smallBtn, settings.fontSize === size && styles.smallBtnActive]} 
                        onPress={() => updateSetting('fontSize', size)}
                    >
                        <Text style={[styles.smallBtnText, settings.fontSize === size && styles.smallBtnTextActive]}>{size}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <SectionTitle title="Font Family" />
            <View style={styles.buttonGrid}>
                {['Sans-Serif', 'Serif', 'Monospace'].map(font => {
                    const displayFont = Platform.OS === 'ios' ? (font === 'Serif' ? 'Georgia' : font === 'Monospace' ? 'Courier' : 'System') : font.toLowerCase();
                    return (
                        <TouchableOpacity 
                            key={font} 
                            style={[styles.blockBtn, settings.fontFamily === font && styles.blockBtnActive]} 
                            onPress={() => updateSetting('fontFamily', font)}
                        >
                            <Text style={[styles.blockBtnText, settings.fontFamily === font && styles.blockBtnTextActive, { fontFamily: displayFont }]}>{font}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );

    const renderLayoutTab = () => (
        <View style={styles.tabContent}>
            <SectionTitle title="Line Spacing" />
            <View style={styles.rowWrap}>
                {[1.4, 1.6, 1.8, 2.0].map(lh => (
                    <TouchableOpacity 
                        key={lh} 
                        style={[styles.smallBtn, { flex: 1 }, settings.lineHeightMultiplier === lh && styles.smallBtnActive]} 
                        onPress={() => updateSetting('lineHeightMultiplier', lh)}
                    >
                        <Text style={[styles.smallBtnText, settings.lineHeightMultiplier === lh && styles.smallBtnTextActive]}>{lh}x</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <SectionTitle title="Margins" />
            <View style={styles.rowWrap}>
                {[15, 20, 30].map(m => (
                    <TouchableOpacity 
                        key={m} 
                        style={[styles.smallBtn, { flex: 1 }, settings.margin === m && styles.smallBtnActive]} 
                        onPress={() => updateSetting('margin', m)}
                    >
                        <Text style={[styles.smallBtnText, settings.margin === m && styles.smallBtnTextActive]}>{m}px</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                </Pressable>
                
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Reader Settings</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    
                    {/* Theme Selector */}
                    <View style={styles.themeContainer}>
                        {[
                            { name: 'Dark', color: '#121212' },
                            { name: 'Sepia', color: '#F4ECD8' },
                            { name: 'Paper', color: '#FFFFFF' },
                            { name: 'OLED', color: '#000000' }
                        ].map(theme => (
                            <TouchableOpacity 
                                key={theme.name} 
                                style={[styles.themeBtn, settings.bg === theme.color && styles.themeBtnActive, { backgroundColor: theme.color }]} 
                                onPress={() => updateSetting('bg', theme.color)}
                            >
                                {settings.bg === theme.color && (
                                    <Ionicons 
                                        name="checkmark" 
                                        size={20} 
                                        color={theme.color === '#FFFFFF' || theme.color === '#F4ECD8' ? '#000' : '#fff'} 
                                    />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabsRow}>
                        {['TEXT', 'LAYOUT'].map(tab => (
                            <TouchableOpacity 
                                key={tab} 
                                style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]} 
                                onPress={() => setActiveTab(tab)}
                            >
                                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.bodyContent}>
                        {activeTab === 'TEXT' ? renderTextTab() : renderLayoutTab()}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    modalContent: { 
        backgroundColor: Colors.bg, 
        borderTopLeftRadius: 24, 
        borderTopRightRadius: 24, 
        borderWidth: 1, 
        borderColor: Colors.border, 
        paddingBottom: 40 
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
    title: { color: Colors.text, fontSize: 18, fontWeight: '700' },
    closeBtn: { padding: 8, backgroundColor: Colors.activeBg, borderRadius: 20 },
    themeContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: Colors.border },
    themeBtn: { width: 45, height: 45, borderRadius: 25, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
    themeBtnActive: { borderColor: Colors.accent },
    tabsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border },
    tabBtn: { flex: 1, paddingVertical: 15, alignItems: 'center' },
    tabBtnActive: { borderBottomWidth: 2, borderBottomColor: Colors.accent },
    tabText: { color: Colors.textDim, fontWeight: 'bold', fontSize: 13 },
    tabTextActive: { color: Colors.accent },
    bodyContent: { padding: 20 },
    rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
    smallBtn: { minWidth: 60, padding: 12, borderRadius: 12, backgroundColor: Colors.activeBg, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
    smallBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
    smallBtnText: { color: Colors.textDim, fontSize: 14, fontWeight: '600' },
    smallBtnTextActive: { color: '#000' },
    buttonGrid: { flexDirection: 'row', gap: 10 },
    blockBtn: { flex: 1, paddingVertical: 15, backgroundColor: Colors.activeBg, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
    blockBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
    blockBtnText: { color: Colors.textDim, fontSize: 13, fontWeight: '600' },
    blockBtnTextActive: { color: '#000' }
});

export default NovelSettingsModal;