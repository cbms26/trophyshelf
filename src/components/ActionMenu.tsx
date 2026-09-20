import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { color, font, radius } from '../theme/tokens';

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
          <Text style={styles.title} numberOfLines={1}>
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
    backgroundColor: 'rgba(45, 43, 43, 0.5)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: color.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.divider,
    paddingTop: 10,
    paddingBottom: 30,
  },
  title: {
    fontFamily: font.body,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: color.textMuted55,
    textAlign: 'center',
    paddingVertical: 8,
  },
  item: {
    paddingVertical: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: color.divider,
  },
  itemLabel: {
    fontFamily: font.heading,
    fontSize: 16,
    color: color.text,
  },
  destructive: {
    color: '#9b3b2f',
  },
  cancel: {
    marginTop: 6,
    borderTopWidth: 0,
  },
  cancelLabel: {
    fontFamily: font.body,
    fontSize: 14,
    color: color.textMuted60,
  },
});
