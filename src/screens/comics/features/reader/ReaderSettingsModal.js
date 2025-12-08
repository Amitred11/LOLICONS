// ReaderSettingsModal.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable, Switch, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const Colors = {
    bg: '#1E2022',
    accent: '#5EEAD4',
    text: '#FFFFFF',
    textDim: '#9CA3AF',
    border: '#374151',
    inputBg: '#111827',
    activeBg: '#2A303C'
};

// --- REUSABLE COMPONENTS ---

const SectionTitle = ({ title }) => (
    <Text style={styles.sectionHeader}>{title.toUpperCase()}</Text>
);

const SubHeader = ({ title }) => (
    <Text style={styles.subHeader}>{title}</Text>
);

const ToggleOption = ({ label, subLabel, value, onToggle }) => (
    <View style={styles.toggleRow}>
        <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={[styles.optionLabel, value && styles.optionLabelActive]}>{label}</Text>
            {subLabel && <Text style={styles.subLabel}>{subLabel}</Text>}
        </View>
        <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: '#374151', true: Colors.accent }}
            thumbColor={value ? '#fff' : '#9CA3AF'}
        />
    </View>
);

// --- MAIN COMPONENT ---

const ReaderSettingsModal = ({ visible, onClose, settings = {}, onUpdateSettings }) => {
    const [activeTab, setActiveTab] = useState('LAYOUT');

    const updateSetting = (key, value) => {
        onUpdateSettings(prevSettings => ({ ...prevSettings, [key]: value }));
    };

    // --- TAB: LAYOUT ---
    const renderLayoutTab = () => (
        <View style={styles.tabContent}>
            <SectionTitle title="Reading Mode" />
            <View style={styles.buttonGrid}>
                {['Single Page', 'Long Strip'].map(m => {
                    const stateKey = m === 'Long Strip' ? 'webtoon' : 'single';
                    const isSelected = settings.mode === stateKey;
                    return (
                        <TouchableOpacity
                            key={m}
                            style={[styles.blockBtn, isSelected && styles.blockBtnActive]}
                            onPress={() => updateSetting('mode', stateKey)}
                        >
                            <MaterialCommunityIcons
                                name={m === 'Long Strip' ? "view-stream" : "file-document-outline"}
                                size={22}
                                color={isSelected ? '#000' : Colors.textDim}
                            />
                            <Text style={[styles.blockBtnText, isSelected && styles.blockBtnTextActive]}>
                                {m}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Reading Direction (Single Page Only) */}
            {settings.mode === 'single' && (
                <>
                    <SectionTitle title="Reading Direction" />
                    <View style={styles.rowWrap}>
                        <TouchableOpacity 
                            style={[styles.smallBtn, settings.direction === 'rtl' && styles.smallBtnActive]}
                            onPress={() => updateSetting('direction', 'rtl')}
                        >
                            <MaterialCommunityIcons name="book-open-page-variant" size={18} color={settings.direction === 'rtl' ? '#000' : Colors.textDim} />
                            <Text style={[styles.smallBtnText, settings.direction === 'rtl' && styles.smallBtnTextActive]}>Right to Left</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.smallBtn, settings.direction === 'ltr' && styles.smallBtnActive]}
                            onPress={() => updateSetting('direction', 'ltr')}
                        >
                            <MaterialCommunityIcons name="book-open-page-variant-outline" size={18} color={settings.direction === 'ltr' ? '#000' : Colors.textDim} />
                            <Text style={[styles.smallBtnText, settings.direction === 'ltr' && styles.smallBtnTextActive]}>Left to Right</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            {/* Page Gap (Webtoon Only) */}
            {settings.mode === 'webtoon' && (
                <>
                    <SectionTitle title="Page Spacing" />
                    <View style={styles.rowWrap}>
                        {[0, 10, 20].map(gap => (
                            <TouchableOpacity
                                key={gap}
                                style={[styles.smallBtn, settings.margin === gap && styles.smallBtnActive, { flex: 1, justifyContent: 'center' }]}
                                onPress={() => updateSetting('margin', gap)}
                            >
                                <Text style={[styles.smallBtnText, settings.margin === gap && styles.smallBtnTextActive]}>
                                    {gap === 0 ? 'None' : `${gap}px`}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}
        </View>
    );

    // --- TAB: VISUALS ---
    const renderVisualsTab = () => (
        <View style={styles.tabContent}>
            <SectionTitle title="Scaling" />
            <View style={styles.groupContainer}>
                <ToggleOption 
                    label="Fit Width" 
                    subLabel="Stretch to edges"
                    value={settings.fitWidth} 
                    onToggle={(v) => updateSetting('fitWidth', v)} 
                />
                <ToggleOption 
                    label="Fit Height" 
                    subLabel="Show full page"
                    value={settings.fitHeight} 
                    onToggle={(v) => updateSetting('fitHeight', v)} 
                />
                <ToggleOption 
                    label="Limit Max Width" 
                    subLabel="For wide screens"
                    value={settings.limitWidth} 
                    onToggle={(v) => updateSetting('limitWidth', v)} 
                />
            </View>

            <SectionTitle title="Filters" />
            <View style={styles.groupContainer}>
                <ToggleOption 
                    label="Night Mode (Dim)" 
                    value={settings.dim} 
                    onToggle={(v) => updateSetting('dim', v)} 
                />
                <ToggleOption 
                    label="Greyscale" 
                    value={settings.greyscale} 
                    onToggle={(v) => updateSetting('greyscale', v)} 
                />
            </View>
        </View>
    );

    // --- TAB: SYSTEM ---
    const renderSystemTab = () => (
        <View style={styles.tabContent}>
            <SectionTitle title="Performance" />
            <View style={styles.groupContainer}>
                <SubHeader title="Preload Images" />
                <View style={styles.segmentContainer}>
                    {['none', 'some', 'all'].map(opt => (
                        <TouchableOpacity 
                            key={opt}
                            style={[styles.segmentBtn, settings.preload === opt && styles.segmentBtnActive]}
                            onPress={() => updateSetting('preload', opt)}
                        >
                            <Text style={[styles.segmentText, settings.preload === opt && styles.segmentTextActive]}>
                                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <SectionTitle title="Behavior" />
            <View style={styles.groupContainer}>
                <ToggleOption 
                    label="Keep Screen On" 
                    value={settings.keepAwake} 
                    onToggle={(v) => updateSetting('keepAwake', v)} 
                />
                <ToggleOption 
                    label="Tap to Scroll" 
                    value={settings.tapScroll} 
                    onToggle={(v) => updateSetting('tapScroll', v)} 
                />
                 <ToggleOption 
                    label="Volume Key Scrolling" 
                    value={settings.volumeScroll} 
                    onToggle={(v) => updateSetting('volumeScroll', v)} 
                />
            </View>
        </View>
    );

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
                    <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                </Pressable>

                <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.title}>Reader Settings</Text>
                            <Text style={styles.subtitle}>Customize your experience</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={15}>
                            <Ionicons name="close" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Theme Bar */}
                    <View style={styles.themeContainer}>
                        <TouchableOpacity
                            style={[styles.themeBtn, settings.bg === '#FFFFFF' && styles.themeBtnActive]}
                            onPress={() => updateSetting('bg', '#FFFFFF')}
                        >
                            <MaterialCommunityIcons name="white-balance-sunny" size={24} color={settings.bg === '#FFFFFF' ? '#000' : Colors.textDim} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.themeBtn, settings.bg === '#121212' && styles.themeBtnActive]}
                            onPress={() => updateSetting('bg', '#121212')}
                        >
                            <MaterialCommunityIcons name="weather-night" size={24} color={settings.bg === '#121212' ? '#000' : Colors.textDim} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.themeBtn, settings.bg === '#000000' && styles.themeBtnActive]}
                            onPress={() => updateSetting('bg', '#000000')}
                        >
                            <Ionicons name="moon" size={22} color={settings.bg === '#000000' ? '#fff' : Colors.textDim} />
                        </TouchableOpacity>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabsRow}>
                        {['LAYOUT', 'VISUALS', 'SYSTEM'].map(tab => (
                            <TouchableOpacity
                                key={tab}
                                style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                                onPress={() => setActiveTab(tab)}
                            >
                                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Body */}
                    <View style={styles.bodyContent}>
                        {activeTab === 'LAYOUT' && renderLayoutTab()}
                        {activeTab === 'VISUALS' && renderVisualsTab()}
                        {activeTab === 'SYSTEM' && renderSystemTab()}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalContent: {
        width: '92%',
        // Changed from flex: 1 to auto width maxHeight to wrap content
        maxHeight: '85%', 
        backgroundColor: Colors.bg,
        borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
        shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 15
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingBottom: 15, alignItems: 'center' },
    title: { color: Colors.text, fontSize: 18, fontWeight: '700', letterSpacing: 0.5 },
    subtitle: { color: Colors.textDim, fontSize: 12, marginTop: 2 },
    closeBtn: { padding: 6, backgroundColor: Colors.border, borderRadius: 20 },

    // Theme Bar
    themeContainer: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 15, backgroundColor: '#111827', borderRadius: 10, padding: 4 },
    themeBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8 },
    themeBtnActive: { backgroundColor: Colors.accent },

    // Tabs
    tabsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border, paddingHorizontal: 10 },
    tabBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 3, marginBottom: -1, borderBottomColor: 'transparent' },
    tabBtnActive: { borderBottomColor: Colors.accent },
    tabText: { color: Colors.textDim, fontWeight: '700', fontSize: 12, letterSpacing: 1 },
    tabTextActive: { color: Colors.accent },

    // Fixed: Removed flex: 1 so it wraps content
    bodyContent: { backgroundColor: Colors.bg },
    
    // Fixed: Removed flex: 1 so it wraps content
    tabContent: { padding: 20 },

    sectionHeader: { color: Colors.accent, fontSize: 11, fontWeight: '800', marginBottom: 10, marginTop: 5, letterSpacing: 1, opacity: 0.8 },
    subHeader: { color: Colors.textDim, fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 2 },
    
    groupContainer: { marginBottom: 16, backgroundColor: Colors.activeBg, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#333' },

    // Buttons
    buttonGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    blockBtn: { flex: 1, backgroundColor: Colors.activeBg, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 10, gap: 8, borderWidth: 1, borderColor: Colors.border },
    blockBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
    blockBtnText: { color: Colors.textDim, fontSize: 12, fontWeight: '700' },
    blockBtnTextActive: { color: '#000' },

    rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
    smallBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.activeBg, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
    smallBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
    smallBtnText: { color: Colors.textDim, fontSize: 12, fontWeight: '600' },
    smallBtnTextActive: { color: '#000' },

    toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5, paddingVertical: 1 },
    optionLabel: { color: Colors.text, fontSize: 14, fontWeight: '500' },
    optionLabelActive: { color: Colors.text },
    subLabel: { color: Colors.textDim, fontSize: 11, marginTop: 2 },

    // Segmented Control
    segmentContainer: { flexDirection: 'row', backgroundColor: '#111827', borderRadius: 8, padding: 3 },
    segmentBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 6 },
    segmentBtnActive: { backgroundColor: '#374151' },
    segmentText: { color: Colors.textDim, fontSize: 12, fontWeight: '600' },
    segmentTextActive: { color: Colors.text },
});

export default ReaderSettingsModal;