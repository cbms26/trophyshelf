import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../navigation/types';
import { color, font, radius, type } from '../theme/tokens';
import { CameraIcon, ShelfIcon, YearIcon } from './icons';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// Height of the bar plus breathing room, for floating buttons that sit above it.
export const BOTTOM_BAR_CLEARANCE = 80;

export default function BottomBar({ active }: { active: 'shelf' | 'year' }) {
  const navigation = useNavigation<Nav>();
  const tint = (tab: 'shelf' | 'year') => (active === tab ? color.text : color.textSecondary);
  return (
    <View style={styles.bottomBar}>
      <TouchableOpacity
        style={styles.tab}
        accessibilityRole="button"
        accessibilityLabel="Shelf"
        accessibilityState={{ selected: active === 'shelf' }}
        onPress={() => navigation.navigate('Shelf')}
      >
        <ShelfIcon size={22} color={tint('shelf')} strokeWidth={1.7} />
        <Text style={[styles.tabLabel, active === 'shelf' && styles.tabLabelActive, { color: tint('shelf') }]}>Shelf</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.enshrineBtn}
        accessibilityRole="button"
        accessibilityLabel="Enshrine a finished book"
        onPress={() => navigation.navigate('Capture')}
      >
        <CameraIcon size={19} color={color.onInk} strokeWidth={1.7} />
        <Text style={styles.enshrineLabel}>Enshrine</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tab}
        accessibilityRole="button"
        accessibilityLabel="Year"
        accessibilityState={{ selected: active === 'year' }}
        onPress={() => navigation.navigate('Year')}
      >
        <YearIcon size={22} color={tint('year')} strokeWidth={1.7} />
        <Text style={[styles.tabLabel, active === 'year' && styles.tabLabelActive, { color: tint('year') }]}>Year</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.divider,
    backgroundColor: color.bg,
    paddingHorizontal: 28,
    paddingTop: 10,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minWidth: 56,
    minHeight: 44,
  },
  tabLabel: {
    fontFamily: font.sansMedium,
    fontSize: 12,
    lineHeight: 16,
  },
  tabLabelActive: {
    fontFamily: font.sansSemiBold,
  },
  enshrineBtn: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: color.ink,
    borderRadius: radius.pill,
    paddingHorizontal: 22,
  },
  enshrineLabel: {
    ...type.button,
    fontSize: 15,
    color: color.onInk,
  },
});
