import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CoverPlate from '../components/CoverPlate';
import { detectCover } from '../lib/detection';
import { RootStackParamList } from '../navigation/types';
import { useBooks } from '../store/BooksContext';
import { color, font } from '../theme/tokens';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Analyzing'>;
type Route = RouteProp<RootStackParamList, 'Analyzing'>;

const STEPS = ['Cover captured', 'Title and author found', 'Writing your inscription'];

export default function AnalyzingScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { books } = useBooks();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStepIndex(1), 550),
      setTimeout(() => setStepIndex(2), 1150),
      setTimeout(() => {
        const detected = detectCover(books.map((b) => b.title));
        navigation.replace('Confirm', { photoUri: params.photoUri, detected });
      }, 1750),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <CoverPlate style={styles.plate} elevation="md" imageUri={params.photoUri ?? undefined} label={params.photoUri ? undefined : 'captured cover'} />
      <View style={styles.copy}>
        <Text style={styles.title}>Reading the cover…</Text>
        <Text style={styles.body}>
          Pulling the title, author, genre and page count. You'll get to correct anything it misreads.
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${((stepIndex + 1) / STEPS.length) * 100}%` }]} />
      </View>
      <View style={styles.steps}>
        {STEPS.map((label, i) => (
          <View key={label} style={styles.stepRow}>
            <Text style={styles.stepMark}>{i < stepIndex ? '✓' : '·'}</Text>
            <Text style={[styles.stepLabel, i > stepIndex && styles.stepLabelMuted]}>{label}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 26,
  },
  plate: {
    width: 180,
    aspectRatio: 2 / 3,
  },
  copy: {
    alignItems: 'center',
    maxWidth: 250,
  },
  title: {
    fontFamily: font.heading,
    fontSize: 22,
    color: color.text,
    marginBottom: 6,
  },
  body: {
    fontFamily: font.body,
    fontSize: 12,
    lineHeight: 19,
    color: color.textMuted60,
    textAlign: 'center',
  },
  progressTrack: {
    width: 180,
    height: 1,
    backgroundColor: color.neutral300,
    overflow: 'hidden',
  },
  progressFill: {
    height: 1,
    backgroundColor: color.accent,
  },
  steps: {
    width: 210,
    gap: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepMark: {
    width: 14,
    textAlign: 'center',
    color: color.accent,
    fontSize: 12,
  },
  stepLabel: {
    fontFamily: font.body,
    fontSize: 12,
    color: color.text,
  },
  stepLabelMuted: {
    color: color.textMuted55,
  },
});
