import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CoverPlate from '../components/CoverPlate';
import { RootStackParamList } from '../navigation/types';
import { useBooks } from '../store/BooksContext';
import { color, font, gutter, radius, space, type } from '../theme/tokens';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SLIDES = [
  {
    title: 'A shelf worth keeping',
    body: 'TrophyShelf enshrines the books you finish — a plate, a date and a written inscription for every volume.',
    caption: null as string | null,
  },
  {
    title: "Snap it, don't type it",
    body: 'One photo of the cover fills in the title, author, genre and page count. Fix anything it gets wrong — it takes about eight seconds.',
    caption: 'Cover photos are sent to Google Gemini to be read. Your shelf stays on this phone.',
  },
  {
    title: 'Every finished book gets a plaque',
    body: 'Finish a book and TrophyShelf writes it an inscription of its own, then places it on your shelf for good.',
    caption: null,
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const { completeOnboarding } = useBooks();
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  const finish = () => {
    completeOnboarding();
    navigation.replace('Shelf');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.topRow}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <TouchableOpacity accessibilityRole="button" onPress={finish} hitSlop={12}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <CoverPlate style={styles.plate} elevation="lg" label="Your cover here" />
        <View style={styles.copy}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.paragraph}>{slide.body}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryBtn}
          accessibilityRole="button"
          onPress={() => (isLast ? finish() : setIndex((i) => i + 1))}
        >
          <Text style={styles.primaryLabel}>{isLast ? 'Get started' : 'Next'}</Text>
        </TouchableOpacity>
        {slide.caption ? <Text style={styles.caption}>{slide.caption}</Text> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.bg,
    paddingHorizontal: gutter,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingTop: space[1],
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: color.track,
  },
  dotActive: {
    width: 18,
    backgroundColor: color.ink,
  },
  skip: {
    fontFamily: font.sansMedium,
    fontSize: 15,
    color: color.textSecondary,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: space[8],
  },
  plate: {
    width: 148,
    aspectRatio: 2 / 3,
    alignSelf: 'center',
  },
  copy: {
    alignItems: 'center',
    gap: space[3],
  },
  title: {
    ...type.display,
    fontSize: 30,
    lineHeight: 36,
    textAlign: 'center',
  },
  paragraph: {
    ...type.body,
    color: color.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
  },
  footer: {
    gap: space[3],
    paddingBottom: space[4],
  },
  primaryBtn: {
    height: 52,
    backgroundColor: color.ink,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    ...type.button,
    color: color.onInk,
  },
  caption: {
    ...type.caption,
    textAlign: 'center',
  },
});
