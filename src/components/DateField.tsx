import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { colors, radius } from '../theme';
import { formatDateTime } from '../utils/taskUtils';

/**
 * Android shows separate date and time dialogs, so we open the date dialog,
 * then the time dialog, and merge both into a single Date.
 */
export function DateField({ label, value, onChange, minimumDate }: {
  label: string; value: Date; onChange: (d: Date) => void; minimumDate?: Date;
}) {
  const open = () => {
    DateTimePickerAndroid.open({
      value, mode: 'date', minimumDate,
      onChange: (e, picked) => {
        if (e.type !== 'set' || !picked) return;
        DateTimePickerAndroid.open({
          value: picked, mode: 'time',
          onChange: (e2, time) => {
            if (e2.type !== 'set' || !time) return;
            const merged = new Date(picked);
            merged.setHours(time.getHours(), time.getMinutes(), 0, 0);
            onChange(merged);
          },
        });
      },
    });
  };
  return (
    <View style={{ flex: 1 }}>
      <Text style={s.label}>{label}</Text>
      <Pressable onPress={open} style={s.box}>
        <Text style={s.value}>{formatDateTime(value.toISOString())}</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: colors.muted, marginBottom: 6 },
  box: { backgroundColor: colors.surface, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.line, padding: 14 },
  value: { fontSize: 15, color: colors.ink, fontWeight: '600' },
});
