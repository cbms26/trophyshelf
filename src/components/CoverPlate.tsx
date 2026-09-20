import { Image, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';
import { color, radius, shadow } from '../theme/tokens';

// Diagonal stripe placeholder standing in for a real cover photo, plus the
// `.plate` treatment from the design system: a thick surface-colour mat with
// a hairline outline, as if the cover were tipped into a book plate. Renders
// a real photo instead of the placeholder once one has been captured.
type CoverPlateProps = {
  style?: StyleProp<ViewStyle>;
  elevation?: 'sm' | 'md' | 'lg';
  patternScale?: number;
  label?: string;
  imageUri?: string;
};

let patternId = 0;

export default function CoverPlate({ style, elevation, patternScale = 1, label, imageUri }: CoverPlateProps) {
  const id = ++patternId;
  const band = 6 * patternScale;
  return (
    <View style={[styles.mat, elevation ? shadow[elevation] : null, style]}>
      <View style={styles.inner}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <>
            <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
              <Defs>
                <Pattern id={`stripe-${id}`} width={band * 2} height={band * 2} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <Rect width={band * 2} height={band * 2} fill={color.neutral300} />
                  <Rect x={0} width={band} height={band * 2} fill={color.neutral200} />
                </Pattern>
              </Defs>
              <Rect width="100%" height="100%" fill={`url(#stripe-${id})`} />
            </Svg>
            {label ? (
              <View style={styles.labelWrap}>
                <Text style={styles.label}>{label}</Text>
              </View>
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mat: {
    borderWidth: 6,
    borderColor: color.surface,
    backgroundColor: color.surface,
    borderRadius: radius.sm,
  },
  inner: {
    flex: 1,
    borderWidth: 1,
    borderColor: color.divider,
    overflow: 'hidden',
  },
  labelWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  label: {
    fontFamily: 'monospace',
    fontSize: 9,
    lineHeight: 13,
    color: color.neutral700,
    textAlign: 'center',
  },
});
