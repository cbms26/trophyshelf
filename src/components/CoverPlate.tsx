import { Image, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { color, font, radius, shadow } from '../theme/tokens';

// A book cover: the captured photo with softly rounded corners and an optional
// lift, or a flat placeholder when no photo has been taken. The shadow sits on
// the outer view and the clipping on the inner one, since iOS drops shadows on
// views that clip.
type CoverPlateProps = {
  style?: StyleProp<ViewStyle>;
  elevation?: 'sm' | 'md' | 'lg';
  label?: string;
  imageUri?: string;
};

export default function CoverPlate({ style, elevation, label, imageUri }: CoverPlateProps) {
  return (
    <View style={[styles.outer, elevation ? shadow[elevation] : null, style]}>
      <View style={styles.inner}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : label ? (
          <View style={styles.labelWrap}>
            <Text style={styles.label}>{label}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: radius.sm,
    backgroundColor: color.surface,
  },
  inner: {
    flex: 1,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
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
    fontFamily: font.sans,
    fontSize: 12,
    lineHeight: 16,
    color: color.textSecondary,
    textAlign: 'center',
  },
});
