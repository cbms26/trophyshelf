import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { color, font, gutter, radius, space, type } from '../theme/tokens';

export type ActionItem = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

type Props = {
  visible: boolean;
  title?: string;
  items: ActionItem[];
  onClose: () => void;
};

export default function ActionMenu({ visible, title, items, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        {title ? (
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        ) : null}
        {items.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.item}
            accessibilityRole="button"
            onPress={() => {
              onClose();
              item.onPress();
            }}
          >
            <Text style={[styles.itemLabel, item.destructive && styles.destructive]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.item, styles.cancel]} accessibilityRole="button" onPress={onClose}>
          <Text style={styles.cancelLabel}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: color.backdrop,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: color.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: gutter,
    paddingTop: space[4],
    paddingBottom: space[8],
  },
  title: {
    ...type.caption,
    textAlign: 'center',
    paddingBottom: space[3],
  },
  item: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.divider,
  },
  itemLabel: {
    fontFamily: font.sansMedium,
    fontSize: 17,
    color: color.text,
  },
  destructive: {
    color: color.danger,
  },
  cancel: {
    marginTop: space[2],
    borderTopWidth: 0,
    backgroundColor: color.surface,
    borderRadius: radius.lg,
  },
  cancelLabel: {
    fontFamily: font.sansSemiBold,
    fontSize: 16,
    color: color.text,
  },
});
