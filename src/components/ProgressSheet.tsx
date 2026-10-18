import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { color, gutter, radius, space, type } from '../theme/tokens';
import { Book } from '../types';

type Props = {
  book: Book | null;
  onClose: () => void;
  onUpdate: (pagesRead: number) => void;
  onFinish: () => Promise<void>;
};

export default function ProgressSheet({ book, onClose, onUpdate, onFinish }: Props) {
  const [pagesRead, setPagesRead] = useState('');
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    setPagesRead(book ? String(book.pagesRead || '') : '');
    setFinishing(false);
  }, [book?.id]);

  if (!book) return null;

  const parsed = Math.min(book.pages || Number.MAX_SAFE_INTEGER, parseInt(pagesRead, 10) || 0);

  const finish = async () => {
    setFinishing(true);
    try {
      await onFinish();
    } finally {
      setFinishing(false);
    }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={finishing ? undefined : onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} pointerEvents="box-none">
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <Text style={styles.kicker}>Reading now</Text>
          <Text style={styles.title} numberOfLines={2}>
            {book.title}
          </Text>
          <Text style={styles.author}>{book.author}</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Pages read{book.pages ? ` of ${book.pages}` : ''}</Text>
            <TextInput
              style={styles.input}
              value={pagesRead}
              onChangeText={setPagesRead}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={color.placeholder}
              editable={!finishing}
            />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              accessibilityRole="button"
              onPress={() => onUpdate(parsed)}
              disabled={finishing}
            >
              <Text style={styles.secondaryLabel}>Update progress</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryBtn, finishing && styles.disabled]}
              accessibilityRole="button"
              onPress={finish}
              disabled={finishing}
            >
              <Text style={styles.primaryLabel}>{finishing ? 'Engraving the plaque…' : 'Mark as finished'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: color.backdrop,
  },
  sheet: {
    backgroundColor: color.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: gutter,
    paddingTop: space[2],
    paddingBottom: 36,
    gap: space[1],
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.track,
    marginBottom: space[4],
  },
  kicker: {
    ...type.label,
  },
  title: {
    ...type.title,
  },
  author: {
    ...type.body,
    fontSize: 15,
    lineHeight: 22,
    color: color.textSecondary,
    marginBottom: space[4],
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    ...type.label,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...type.body,
    lineHeight: 22,
    backgroundColor: color.surface,
    borderRadius: radius.md,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: space[5],
  },
  secondaryBtn: {
    flex: 1,
    height: 52,
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: {
    ...type.button,
    fontSize: 15,
    color: color.text,
  },
  primaryBtn: {
    flex: 1.4,
    height: 52,
    backgroundColor: color.ink,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    ...type.button,
    fontSize: 15,
    color: color.onInk,
  },
  disabled: {
    opacity: 0.6,
  },
});
