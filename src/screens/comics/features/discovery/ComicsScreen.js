import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Colors } from '@config/Colors';
import { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useModal } from '@context/other/ModalContext';

import LibraryView from '../library/LibraryView';
import HistoryView from '../library/HistoryView';
import BrowseView from './BrowseView';

// Imported Components
import { CollapsibleHeader, SearchOverlay } from '../../components/ScreenHeaders';

const Tab = createMaterialTopTabNavigator();
const EXPANDED_HEADER_HEIGHT = 120;

const ComicsScreen = () => {
    const insets = useSafeAreaInsets();
    const scrollY = useSharedValue(0);
    const modal = useModal();

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [filters, setFilters] = useState({ sort: 'az', status: 'All', type: 'All', genres: [] });

    const scrollHandler = useAnimatedScrollHandler((event) => {
        scrollY.value = Math.max(0, event.contentOffset.y);
    });

    const handleToggleSearch = (visible) => {
        setIsSearching(visible);
    };

    const handleCancelSearch = () => {
        setIsSearching(false);
        setSearchQuery('');
    };
    
    const showFilterModal = () => {
        modal.show('filter', { onApplyFilters: setFilters, currentFilters: filters });
    };

    const renderTabBar = (props) => {
        const currentRouteName = props.state.routes[props.state.index].name;
        
        return (
            <>
                <CollapsibleHeader
                    {...props}
                    scrollY={scrollY}
                    insets={insets}
                    currentRouteName={currentRouteName}
                    onToggleSearch={() => handleToggleSearch(true)}
                    onShowFilters={showFilterModal}
                />
                <SearchOverlay
                    isVisible={isSearching}
                    insets={insets}
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                    onCancel={handleCancelSearch}
                    currentRouteName={currentRouteName}
                />
            </>
        );
    };

    return (
        <Tab.Navigator
            tabBar={renderTabBar}
            sceneContainerStyle={{ backgroundColor: Colors.background }}
            screenOptions={{
                tabBarIndicatorStyle: { backgroundColor: Colors.secondary, height: 3, borderRadius: 3 },
                tabBarLabelStyle: { fontFamily: 'Poppins_600SemiBold', textTransform: 'capitalize', fontSize: 16 },
                tabBarActiveTintColor: Colors.secondary,
                tabBarInactiveTintColor: Colors.textSecondary,
            }}
        >
            <Tab.Screen name="Library">
                {() => <LibraryView scrollHandler={scrollHandler} headerHeight={EXPANDED_HEADER_HEIGHT} searchQuery={searchQuery} filters={filters} />}
            </Tab.Screen>
            <Tab.Screen name="History">
                {() => <HistoryView scrollHandler={scrollHandler} headerHeight={EXPANDED_HEADER_HEIGHT} searchQuery={searchQuery} />}
            </Tab.Screen>
            <Tab.Screen name="Browse">
                {() => <BrowseView scrollHandler={scrollHandler} headerHeight={EXPANDED_HEADER_HEIGHT} searchQuery={searchQuery} filters={filters} />}
            </Tab.Screen>
        </Tab.Navigator>
    );
};

export default ComicsScreen;