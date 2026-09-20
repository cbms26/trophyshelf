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
import { color, font, radius } from '../theme/tokens';
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
              placeholderTextColor={color.textMuted55}
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
    backgroundColor: 'rgba(45, 43, 43, 0.5)',
  },
  sheet: {
    backgroundColor: color.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.divider,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 36,
    gap: 6,
  },
  kicker: {
    fontFamily: font.body,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: color.accent,
  },
  title: {
    fontFamily: font.heading,
    fontSize: 22,
    lineHeight: 26,
    color: color.text,
  },
  author: {
    fontFamily: font.body,
    fontStyle: 'italic',
    fontSize: 13,
    color: color.textMuted62,
    marginBottom: 10,
  },
  field: {
    gap: 5,
  },
  fieldLabel: {
    fontFamily: font.body,
    fontSize: 12,
    color: color.textMuted70,
  },
  input: {
    minHeight: 38,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: font.body,
    fontSize: 14,
    color: color.text,
    borderWidth: 1,
    borderColor: color.divider,
    borderRadius: radius.md,
    backgroundColor: color.bg,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: color.divider,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryLabel: {
    fontFamily: font.heading,
    fontSize: 14,
    color: color.text,
  },
  primaryBtn: {
    flex: 1.4,
    backgroundColor: color.accent,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryLabel: {
    fontFamily: font.heading,
    fontSize: 14,
    color: '#fff',
  },
  disabled: {
    opacity: 0.6,
  },
});
