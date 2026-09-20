import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CoverPlate from '../components/CoverPlate';
import { RootStackParamList } from '../navigation/types';
import { useBooks } from '../store/BooksContext';
import { color, font, radius, space } from '../theme/tokens';

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
    caption: 'Photos are processed on our servers and stored with your account.',
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
        <TouchableOpacity accessibilityRole="button" onPress={finish}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <CoverPlate style={styles.plate} elevation="lg" label="cover photo" />
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
    paddingHorizontal: space[6],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  dots: {
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    width: 20,
    height: 2,
    backgroundColor: color.neutral300,
  },
  dotActive: {
    backgroundColor: color.accent,
  },
  skip: {
    fontFamily: font.body,
    fontSize: 12,
    color: color.accent,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: space[6],
  },
  plate: {
    width: 150,
    aspectRatio: 2 / 3,
    alignSelf: 'center',
    transform: [{ rotate: '-2deg' }],
  },
  copy: {
    alignItems: 'center',
  },
  title: {
    fontFamily: font.heading,
    fontWeight: '400',
    fontSize: 30,
    lineHeight: 34,
    color: color.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  paragraph: {
    fontFamily: font.body,
    fontSize: 13,
    lineHeight: 22,
    color: color.textMuted65,
    textAlign: 'center',
    maxWidth: 300,
  },
  footer: {
    gap: 10,
    paddingBottom: space[8],
  },
  primaryBtn: {
    backgroundColor: color.accent,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryLabel: {
    fontFamily: font.heading,
    fontSize: 14,
    color: '#fff',
  },
  caption: {
    fontFamily: font.body,
    fontSize: 11,
    color: color.textMuted50,
    textAlign: 'center',
  },
});
