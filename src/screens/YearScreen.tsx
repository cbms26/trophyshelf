import { Share, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomBar from '../components/BottomBar';
import { computeYearStats } from '../lib/yearStats';
import { useBooks } from '../store/BooksContext';
import { color, font } from '../theme/tokens';

const YEAR = new Date().getFullYear();

export default function YearScreen() {
  const { books } = useBooks();
  const stats = computeYearStats(books, YEAR);

  const share = () => {
    Share.share({
      message: `My ${YEAR} reading year on TrophyShelf: ${stats.volumes} volumes, ${stats.pages.toLocaleString()} pages.`,
    }).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Anno {YEAR}</Text>
        <Text style={styles.h2}>The Reading Year</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.bigStats}>
          <View style={styles.bigStat}>
            <Text style={styles.bigStatValue}>{stats.volumes}</Text>
            <Text style={styles.bigStatLabel}>Volumes</Text>
          </View>
          <View style={styles.bigStatDivider} />
          <View style={[styles.bigStat, { paddingLeft: 18 }]}>
            <Text style={styles.bigStatValue}>{stats.pages.toLocaleString()}</Text>
            <Text style={styles.bigStatLabel}>Pages</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>By month</Text>
          <View style={styles.monthsRow}>
            {stats.months.map((m, i) => (
              <View key={i} style={styles.monthCol}>
                <View style={[styles.monthBar, { height: m.h as any, backgroundColor: m.fill }]} />
                <Text style={styles.monthLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {stats.genres.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Where the year went</Text>
            {stats.genres.map((g) => (
              <View key={g.name} style={styles.genreRow}>
                <Text style={styles.genreName}>{g.name}</Text>
                <View style={styles.genreTrack}>
                  <View style={[styles.genreFill, { width: g.pct as any }]} />
                </View>
                <Text style={styles.genreCount}>{g.n}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={[styles.section, styles.lastSection]}>
          <Text style={styles.sectionLabel}>Of note</Text>
          {stats.notables.length > 0 ? (
            stats.notables.map((n) => (
              <View key={n.k} style={styles.notableRow}>
                <Text style={styles.notableKey}>{n.k}</Text>
                <Text style={styles.notableValue}>{n.v}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyNote}>Enshrine a book this year to see it here.</Text>
          )}
          <TouchableOpacity style={styles.shareBtn} accessibilityRole="button" onPress={share}>
            <Text style={styles.shareLabel}>Share the year as a card</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomBar active="year" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: color.text,
  },
  kicker: {
    fontFamily: font.body,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: color.accent,
    marginBottom: 6,
  },
  h2: {
    fontFamily: font.heading,
    fontSize: 30,
    letterSpacing: -0.6,
    color: color.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  bigStats: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: color.divider,
  },
  bigStat: {
    flex: 1,
    paddingVertical: 16,
  },
  bigStatDivider: {
    width: 1,
    backgroundColor: color.divider,
  },
  bigStatValue: {
    fontFamily: font.heading,
    fontWeight: '400',
    fontSize: 40,
    lineHeight: 40,
    color: color.text,
    fontVariant: ['tabular-nums', 'lining-nums'],
  },
  bigStatLabel: {
    fontFamily: font.body,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: color.textMuted55,
    marginTop: 4,
  },
  section: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: color.divider,
  },
  lastSection: {
    paddingBottom: 28,
  },
  sectionLabel: {
    fontFamily: font.body,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: color.textMuted55,
    marginBottom: 14,
  },
  monthsRow: {
    flexDirection: 'row',
    gap: 6,
    height: 96,
  },
  monthCol: {
    flex: 1,
    height: 96,
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 6,
  },
  monthBar: {
    width: '100%',
    borderWidth: 1,
    borderColor: color.accent,
  },
  monthLabel: {
    fontFamily: font.body,
    fontSize: 8,
    color: color.textMuted50,
    fontVariant: ['tabular-nums', 'lining-nums'],
  },
  genreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 9,
  },
  genreName: {
    fontFamily: font.body,
    fontSize: 12,
    width: 78,
    color: color.text,
  },
  genreTrack: {
    flex: 1,
    height: 7,
    borderWidth: 1,
    borderColor: color.accent,
  },
  genreFill: {
    height: 5,
    backgroundColor: color.accent,
    opacity: 0.55,
  },
  genreCount: {
    fontFamily: font.body,
    fontSize: 11,
    width: 20,
    textAlign: 'right',
    color: color.textMuted58,
    fontVariant: ['tabular-nums', 'lining-nums'],
  },
  notableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: color.divider,
  },
  notableKey: {
    fontFamily: font.body,
    fontSize: 12,
    color: color.textMuted58,
  },
  notableValue: {
    fontFamily: font.heading,
    fontSize: 14,
    color: color.text,
    textAlign: 'right',
    flexShrink: 1,
  },
  emptyNote: {
    fontFamily: font.body,
    fontSize: 12,
    color: color.textMuted60,
    paddingVertical: 8,
  },
  shareBtn: {
    backgroundColor: color.accent,
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  shareLabel: {
    fontFamily: font.heading,
    fontSize: 14,
    color: '#fff',
  },
});
