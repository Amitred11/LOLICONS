import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Pressable, Switch, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const Theme = {
    darkBg: '#121212',
    text: '#FFFFFF',
    textDim: '#9CA3AF',
    accent: '#5EEAD4',
    cardBg: '#1E2228', 
    btnBg: '#2A2E35',
    activeBg: '#2A303C',
    border: '#374151'
};

// --- Settings Components ---
export const SectionTitle = ({ title }) => (
    <Text style={styles.sectionHeader}>{title.toUpperCase()}</Text>
);

export const SubHeader = ({ title }) => (
    <Text style={styles.subHeader}>{title}</Text>
);

export const ToggleOption = ({ label, subLabel, value, onToggle }) => (
    <View style={styles.toggleRow}>
        <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={[styles.optionLabel, value && styles.optionLabelActive]}>{label}</Text>
            {subLabel && <Text style={styles.subLabel}>{subLabel}</Text>}
        </View>
        <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: '#374151', true: Theme.accent }}
            thumbColor={value ? '#fff' : '#9CA3AF'}
        />
    </View>
);

// --- Reader Page ---
export const MemoizedPage = memo(({ item, settings, onTab }) => {
    const isSingle = settings.mode === 'single';
    const imgHeight = isSingle ? height : (settings.fitHeight ? height : width * 1.4);
    const resizeMode = isSingle ? 'contain' : (settings.fitWidth ? 'cover' : 'contain');
    const imgWidth = settings.limitWidth ? width * 0.9 : width;
    const imageStyle = { opacity: settings.dim ? 0.7 : 1.0 };

    return (
        <Pressable 
            onPress={onTab}
            style={[ styles.pageContainer, isSingle ? { width, height } : { alignSelf: 'center', width: imgWidth, height: imgHeight } ]}
        >
            <Image source={{ uri: item.uri }} style={[ styles.pageImage, { resizeMode }, imageStyle ]} />
        </Pressable>
    );
});

// --- Reader Footer ---
export const ChapterEndFooter = ({ 
    comicTitle, 
    chapterLabel, 
    totalChapters, 
    coverUri,
    onPrevPage, 
    onPrevChapter, 
    onNextChapter, 
    onHome 
}) => {
    return (
        <View style={styles.footerContainer}>
            <View style={styles.footerTopRow}>
                <TouchableOpacity style={styles.navSquareBtn} onPress={onPrevPage} activeOpacity={0.7}>
                    {coverUri && <Image source={{ uri: coverUri }} style={styles.navSquareImage} />}
                    <View style={styles.navSquareOverlay} />
                </TouchableOpacity>

                <View style={styles.footerInfo}>
                    <Text style={styles.footerTitle} numberOfLines={3}>{comicTitle}</Text>
                    <Text style={styles.footerChapterInfo}>{chapterLabel} / {totalChapters || '?'}</Text>
                    <View style={styles.footerActions}>
                        <View style={styles.likeBtn}><Text style={styles.likeCount}>4</Text><Ionicons name="thumbs-up" size={18} color="#FFF" /></View>
                        <TouchableOpacity style={styles.homeBtn} onPress={onHome}><Ionicons name="home" size={20} color="#FFF" /></TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.footerBottomRow}>
                <TouchableOpacity style={styles.splitBtn} onPress={onPrevChapter} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={20} color={Theme.textDim} />
                    <Text style={[styles.splitBtnText, { color: Theme.textDim }]}>PREV</Text>
                </TouchableOpacity>
                <View style={styles.splitSeparator} />
                <TouchableOpacity style={styles.splitBtn} onPress={onNextChapter} activeOpacity={0.7}>
                    <Text style={[styles.splitBtnText, { color: '#FFF' }]}>NEXT</Text>
                    <Ionicons name="chevron-forward" size={20} color="#FFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionHeader: { color: Theme.accent, fontSize: 11, fontWeight: '800', marginBottom: 10, marginTop: 5, letterSpacing: 1, opacity: 0.8 },
    subHeader: { color: Theme.textDim, fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 2 },
    toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5, paddingVertical: 1 },
    optionLabel: { color: Theme.text, fontSize: 14, fontWeight: '500' },
    optionLabelActive: { color: Theme.text },
    subLabel: { color: Theme.textDim, fontSize: 11, marginTop: 2 },
    pageContainer: { justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent', overflow: 'hidden' },
    pageImage: { width: '100%', height: '100%' },
    footerContainer: { width: '94%', alignSelf: 'center', backgroundColor: Theme.cardBg, borderRadius: 12, marginTop: 40, marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#333' },
    footerTopRow: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2A2E35' },
    navSquareBtn: { width: 80, height: 80, borderRadius: 8, marginRight: 16, overflow: 'hidden', position: 'relative', backgroundColor: Theme.btnBg },
    navSquareImage: { width: '100%', height: '100%', position: 'absolute' },
    footerInfo: { flex: 1, justifyContent: 'center' },
    footerTitle: { color: Theme.text, fontSize: 14, fontWeight: '700', marginBottom: 4, lineHeight: 20 },
    footerChapterInfo: { color: Theme.textDim, fontSize: 12, marginBottom: 8 },
    footerActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 12 },
    likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    likeCount: { color: Theme.text, fontWeight: 'bold', fontSize: 12 },
    homeBtn: { backgroundColor: Theme.btnBg, padding: 8, borderRadius: 8 },
    footerBottomRow: { flexDirection: 'row', height: 60, alignItems: 'center' },
    splitBtn: { flex: 1, height: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Theme.cardBg },
    splitBtnText: { fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
    splitSeparator: { width: 1, height: '40%', backgroundColor: Theme.accent }
});