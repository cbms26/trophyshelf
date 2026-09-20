import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../navigation/types';
import { color, font } from '../theme/tokens';
import { CameraIcon, MedalIcon, ShelfIcon } from './icons';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function BottomBar({ active }: { active: 'shelf' | 'year' }) {
  const navigation = useNavigation<Nav>();
  return (
    <View style={styles.bottomBar}>
      <TouchableOpacity
        style={styles.tab}
        accessibilityRole="button"
        accessibilityLabel="Shelf"
        onPress={() => navigation.navigate('Shelf')}
      >
        <ShelfIcon color={active === 'shelf' ? color.accent : color.textMuted50} />
        <Text style={[styles.tabLabel, { color: active === 'shelf' ? color.accent : color.textMuted50 }]}>Shelf</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.enshrineBtn}
        accessibilityRole="button"
        accessibilityLabel="Enshrine a finished book"
        onPress={() => navigation.navigate('Capture')}
      >
        <CameraIcon color="#fff" />
        <Text style={styles.enshrineLabel}>Enshrine</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tab}
        accessibilityRole="button"
        accessibilityLabel="Year"
        onPress={() => navigation.navigate('Year')}
      >
        <MedalIcon size={20} color={active === 'year' ? color.accent : color.textMuted50} />
        <Text style={[styles.tabLabel, { color: active === 'year' ? color.accent : color.textMuted50 }]}>Year</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: color.divider,
    backgroundColor: color.bg,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tab: {
    alignItems: 'center',
    gap: 3,
    minWidth: 56,
  },
  tabLabel: {
    fontFamily: font.body,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  enshrineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: color.accent,
    borderRadius: 9999,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  enshrineLabel: {
    fontFamily: font.heading,
    fontSize: 14,
    color: '#fff',
  },
});
