import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import { Children, Fragment } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackIcon, ChevronRightIcon } from '../components/icons';
import { API_BASE_URL } from '../config';
import { RootStackParamList } from '../navigation/types';
import { useBooks } from '../store/BooksContext';
import { color, gutter, radius, space, type } from '../theme/tokens';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export default function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { finished, reading } = useBooks();
  const version = Constants.expoConfig?.version ?? '—';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => navigation.goBack()}
        >
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Section label="Your data" hint="Your shelf lives only on this device. Deleting the app deletes your shelf.">
          <Row label="Saved on" value="This device" />
        </Section>

        <Section label="Your shelf">
          <Row label="Enshrined" value={String(finished.length)} />
          <Row label="Reading now" value={String(reading.length)} />
        </Section>

        <Section label="About">
          <LinkRow label="Privacy policy" url={`${API_BASE_URL}/privacy`} />
          <LinkRow label="Terms of use" url={`${API_BASE_URL}/terms`} />
          <Row label="Version" value={version} />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

// A grouped list: hairlines between rows, none above the first or below the last.
function Section({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  const rows = Children.toArray(children);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.card}>
        {rows.map((row, i) => (
          <Fragment key={i}>
            {i > 0 ? <View style={styles.separator} /> : null}
            {row}
          </Fragment>
        ))}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function LinkRow({ label, url }: { label: string; url: string }) {
  return (
    <TouchableOpacity style={styles.row} accessibilityRole="link" onPress={() => Linking.openURL(url).catch(() => {})}>
      <Text style={styles.rowLabel}>{label}</Text>
      <ChevronRightIcon color={color.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.bg,
  },
  header: {
    paddingHorizontal: 14,
    paddingTop: space[1],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...type.headerTitle,
  },
  content: {
    paddingHorizontal: gutter,
    paddingTop: space[4],
    paddingBottom: space[8],
    gap: 28,
  },
  section: {
    gap: space[2],
  },
  sectionLabel: {
    ...type.label,
    paddingHorizontal: space[1],
  },
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    paddingHorizontal: space[4],
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: color.track,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 52,
  },
  rowLabel: {
    ...type.body,
  },
  rowValue: {
    ...type.body,
    color: color.textSecondary,
    fontVariant: ['tabular-nums', 'lining-nums'],
  },
  hint: {
    ...type.caption,
    paddingHorizontal: space[1],
  },
});
