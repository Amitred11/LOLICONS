import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Pressable, Switch } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const Colors = {
    bg: '#1E2022',
    accent: '#5EEAD4',
    text: '#FFFFFF',
    textDim: '#9CA3AF',
    border: '#374151',
    inputBg: '#111827',
};

// --- REUSABLE COMPONENTS ---

const RadioOption = ({ label, selected, onPress }) => (
    <TouchableOpacity style={styles.radioRow} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
            {selected && <View style={styles.radioInner} />}
        </View>
        <Text style={[styles.optionLabel, selected && styles.optionLabelActive]}>{label}</Text>
    </TouchableOpacity>
);

const ToggleOption = ({ label, value, onToggle }) => (
    <View style={styles.toggleRow}>
        <Switch 
            value={value} 
            onValueChange={onToggle}
            trackColor={{ false: '#374151', true: Colors.accent }}
            thumbColor={value ? '#fff' : '#9CA3AF'}
        />
        <Text style={[styles.optionLabel, value && styles.optionLabelActive]}>{label}</Text>
    </View>
);

const ShortcutItem = ({ keys, description }) => (
    <View style={styles.shortcutRow}>
        <View style={styles.keyContainer}>
            <Text style={styles.keyText}>{keys}</Text>
        </View>
        <Text style={styles.shortcutDesc}>{description}</Text>
    </View>
);

// --- MAIN COMPONENT ---

const ReaderSettingsModal = ({ visible, onClose, settings = {}, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('LAYOUT'); 

    // Safe update function
    const update = (key, val) => {
        if(onUpdate) {
            onUpdate(prev => ({ ...prev, [key]: val }));
        }
    };

    // Safe settings access 
    const mode = settings.mode || 'webtoon';
    const progressBar = settings.progressBar || 'left';
    const currentBg = settings.bg;

    const renderLayoutTab = () => (
        <ScrollView style={styles.tabScroll} contentContainerStyle={{ paddingBottom: 20 }}>
             <Text style={styles.sectionHeader}>Page Display Style</Text>
             <View style={styles.buttonGrid}>
                 {['Single Page', 'Long Strip'].map(m => {
                     const stateKey = m === 'Long Strip' ? 'webtoon' : 'single'; 
                     const isSelected = mode === stateKey;
                     return (
                        <TouchableOpacity 
                            key={m}
                            style={[styles.blockBtn, isSelected && styles.blockBtnActive]}
                            onPress={() => update('mode', stateKey)}
                        >
                            <MaterialCommunityIcons 
                                name={m === 'Long Strip' ? "view-stream" : "file-document-outline"} 
                                size={20} 
                                color={isSelected ? '#000' : Colors.textDim} 
                            />
                            <Text style={[styles.blockBtnText, isSelected && styles.blockBtnTextActive]}>
                                {m.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                     );
                 })}
             </View>
             
             <Text style={[styles.sectionHeader, { marginTop: 20 }]}>Progress Bar Position</Text>
             <View style={styles.rowWrap}>
                 {['Top', 'Bottom', 'Left', 'Right', 'None'].map(pos => {
                     const isSelected = progressBar === pos.toLowerCase();
                     return (
                        <TouchableOpacity 
                            key={pos} 
                            style={[styles.smallBtn, isSelected && styles.smallBtnActive]}
                            onPress={() => update('progressBar', pos.toLowerCase())}
                        >
                            <Text style={[styles.smallBtnText, isSelected && styles.smallBtnTextActive]}>
                                {pos === 'None' ? '— NONE' : pos.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                     )
                 })}
             </View>
        </ScrollView>
    );

    const renderImageTab = () => (
        <ScrollView style={styles.tabScroll} contentContainerStyle={{ paddingBottom: 20 }}>
            <Text style={styles.sectionHeader}>Image Loading</Text>
            <View style={styles.groupContainer}>
                <RadioOption label="Do not preload" selected={settings.preload === 'none'} onPress={() => update('preload', 'none')} />
                <RadioOption label="Preload some images" selected={settings.preload === 'some'} onPress={() => update('preload', 'some')} />
                <RadioOption label="Preload all images" selected={settings.preload === 'all'} onPress={() => update('preload', 'all')} />
            </View>

            <Text style={styles.sectionHeader}>Image Sizing</Text>
            <View style={styles.groupContainer}>
                <ToggleOption label="Fit width (Expand to edges)" value={settings.fitWidth} onToggle={(v) => update('fitWidth', v)} />
                <ToggleOption label="Fit height (See full page)" value={settings.fitHeight} onToggle={(v) => update('fitHeight', v)} />
                <ToggleOption label="Limit max width (90%)" value={settings.limitWidth} onToggle={(v) => update('limitWidth', v)} />
            </View>

            <Text style={styles.sectionHeader}>Image Coloring</Text>
            <View style={styles.groupContainer}>
                <ToggleOption label="Greyscale pages" value={settings.greyscale} onToggle={(v) => update('greyscale', v)} />
                <ToggleOption label="Dim pages (Night mode)" value={settings.dim} onToggle={(v) => update('dim', v)} />
            </View>
        </ScrollView>
    );

    const renderShortcutsTab = () => (
        <ScrollView style={styles.tabScroll} contentContainerStyle={{ paddingBottom: 20 }}>
            <Text style={styles.sectionHeader}>Keyboard Shortcuts</Text>
            <View style={styles.groupContainer}>
                <ShortcutItem keys="H" description="Toggle show/hide header" />
                <ShortcutItem keys="M" description="Toggle show/hide menu" />
                <ShortcutItem keys="N" description="Skip forward a chapter" />
                <ShortcutItem keys="B" description="Skip backward a chapter" />
                <ShortcutItem keys="→" description="Skip forward a page" />
                <ShortcutItem keys="←" description="Skip backward a page" />
            </View>
        </ScrollView>
    );

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
                    <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                </Pressable>

                <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Advanced Settings</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={10}>
                            <Ionicons name="close" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Theme Toggle */}
                    <View style={styles.themeRow}>
                        <TouchableOpacity 
                            style={[styles.themeBtn, currentBg === '#FFFFFF' && styles.themeBtnActive]}
                            onPress={() => update('bg', '#FFFFFF')}
                        >
                            <MaterialCommunityIcons name="weather-sunny" size={20} color={currentBg === '#FFFFFF' ? '#000' : Colors.textDim} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.themeBtn, currentBg === '#121212' && styles.themeBtnActive]}
                            onPress={() => update('bg', '#121212')}
                        >
                            <MaterialCommunityIcons name="weather-night" size={20} color={currentBg === '#121212' ? '#000' : Colors.textDim} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.themeBtn, currentBg === '#000000' && styles.themeBtnActive]}
                            onPress={() => update('bg', '#000000')}
                        >
                            <Ionicons name="moon" size={18} color={currentBg === '#000000' ? '#fff' : Colors.textDim} />
                        </TouchableOpacity>
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabsRow}>
                        {['LAYOUT', 'IMAGE', 'SHORTCUTS'].map(tab => (
                            <TouchableOpacity 
                                key={tab} 
                                style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
                                onPress={() => setActiveTab(tab)}
                            >
                                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Body - UPDATED to ensure visibility */}
                    <View style={styles.bodyContent}>
                        {activeTab === 'LAYOUT' && renderLayoutTab()}
                        {activeTab === 'IMAGE' && renderImageTab()}
                        {activeTab === 'SHORTCUTS' && renderShortcutsTab()}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
    modalContent: { 
        width: '90%', 
        height: '65%', // FIX: Added fixed height to ensure children render
        backgroundColor: Colors.bg, 
        borderRadius: 12, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
        shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 10
    },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#2A2A2E' },
    title: { color: Colors.text, fontSize: 18, fontWeight: '700' },
    closeBtn: { padding: 4, backgroundColor: Colors.border, borderRadius: 20 },

    themeRow: { flexDirection: 'row', margin: 16, backgroundColor: '#111827', borderRadius: 8, padding: 4 },
    themeBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 6 },
    themeBtnActive: { backgroundColor: Colors.accent },

    tabsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border },
    tabBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, marginBottom: -1, borderBottomColor: 'transparent' },
    tabBtnActive: { borderBottomColor: Colors.accent },
    tabText: { color: Colors.textDim, fontWeight: '700', fontSize: 12 },
    tabTextActive: { color: Colors.accent },

    // FIX: Removed backgroundColor here to avoid overriding, kept flex:1 so it fills the '65%' height
    bodyContent: { flex: 1, backgroundColor: Colors.bg }, 
    tabScroll: { padding: 16 },

    sectionHeader: { color: Colors.textDim, fontSize: 12, fontWeight: 'bold', marginBottom: 12, marginTop: 4, letterSpacing: 0.5 },
    groupContainer: { marginBottom: 20 },

    buttonGrid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    blockBtn: { flex: 1, backgroundColor: '#111827', paddingVertical: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 8, gap: 8, borderWidth: 1, borderColor: Colors.border },
    blockBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
    blockBtnText: { color: Colors.textDim, fontSize: 11, fontWeight: '700' },
    blockBtnTextActive: { color: '#000' },

    rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    smallBtn: { backgroundColor: '#111827', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6, borderWidth: 1, borderColor: Colors.border },
    smallBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
    smallBtnText: { color: Colors.textDim, fontSize: 11, fontWeight: '700' },
    smallBtnTextActive: { color: '#000' },

    radioRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.textDim, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    radioOuterActive: { borderColor: Colors.accent },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.accent },
    
    toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    optionLabel: { color: Colors.textDim, fontSize: 14, flex: 1 },
    optionLabelActive: { color: Colors.text },

    shortcutRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    keyContainer: { width: 70, alignItems: 'flex-end', marginRight: 16 },
    keyText: { color: '#fff', fontWeight: '800', fontSize: 12, backgroundColor: '#374151', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
    shortcutDesc: { color: Colors.textDim, fontSize: 13, flex: 1 },
});

export default ReaderSettingsModal;