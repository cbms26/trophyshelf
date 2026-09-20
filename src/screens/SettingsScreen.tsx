import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../config';
import { RootStackParamList } from '../navigation/types';
import { useBooks } from '../store/BooksContext';
import { color, font, radius } from '../theme/tokens';

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
          <Text style={styles.iconGlyph}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Section label="Account">
          <Row label="Signed in as" value="Not signed in" />
          <Text style={styles.hint}>
            Accounts and cloud sync are coming — for now your shelf lives only on this device.
          </Text>
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

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.card}>{children}</View>
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
      <Text style={styles.rowChevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: color.divider,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlyph: {
    fontSize: 18,
    color: color.text,
  },
  headerTitle: {
    fontFamily: font.heading,
    fontSize: 15,
    color: color.text,
  },
  content: {
    padding: 20,
    gap: 22,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: font.body,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: color.textMuted55,
  },
  card: {
    borderWidth: 1,
    borderColor: color.divider,
    borderRadius: radius.md,
    paddingHorizontal: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: color.divider,
  },
  rowLabel: {
    fontFamily: font.body,
    fontSize: 13,
    color: color.text,
  },
  rowValue: {
    fontFamily: font.body,
    fontSize: 13,
    color: color.textMuted58,
    fontVariant: ['tabular-nums', 'lining-nums'],
  },
  rowChevron: {
    fontSize: 18,
    color: color.textMuted55,
  },
  hint: {
    fontFamily: font.body,
    fontStyle: 'italic',
    fontSize: 12,
    lineHeight: 18,
    color: color.textMuted60,
    paddingVertical: 12,
  },
});
