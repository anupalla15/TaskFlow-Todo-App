import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Chip, Field } from '../components/ui';
import { DateField } from '../components/DateField';
import { useAppDispatch } from '../store';
import { addTask } from '../store/tasksSlice';
import { colors, priorityColor } from '../theme';
import { Priority } from '../types';
import { RootStackParamList } from '../navigation/types';

const CATEGORIES = ['General', 'Work', 'Study', 'Personal', 'Health'];
const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

export default function AddTaskScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'AddTask'>) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState('General');
  const [scheduledAt, setScheduledAt] = useState(new Date());
  const [deadline, setDeadline] = useState(new Date(Date.now() + 24 * 3600 * 1000));
  const [saving, setSaving] = useState(false);
  const [titleError, setTitleError] = useState('');

  const save = async () => {
    if (!title.trim()) return setTitleError('Give the task a title');
    if (deadline < scheduledAt) return Alert.alert('Check the dates', 'The deadline must be after the start time.');
    setSaving(true);
    const result = await dispatch(addTask({
      title: title.trim(), description: description.trim(), priority, category,
      scheduledAt: scheduledAt.toISOString(), deadline: deadline.toISOString(),
    }));
    setSaving(false);
    if (addTask.fulfilled.match(result)) navigation.goBack();
    else Alert.alert('Could not save', (result.payload as string) ?? 'Try again');
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
      <Field label="Title" value={title} onChangeText={(t) => { setTitle(t); setTitleError(''); }} error={titleError} placeholder="Submit assignment" />
      <Field label="Description" value={description} onChangeText={setDescription} multiline placeholder="Optional details" />

      <View style={s.dates}>
        <DateField label="Starts" value={scheduledAt} onChange={(d) => { setScheduledAt(d); if (deadline < d) setDeadline(d); }} />
        <View style={{ width: 12 }} />
        <DateField label="Deadline" value={deadline} onChange={setDeadline} minimumDate={scheduledAt} />
      </View>

      <Text style={s.label}>Priority</Text>
      <View style={s.row}>
        {PRIORITIES.map((p) => (
          <Chip key={p} label={p} active={priority === p} color={priorityColor[p]} onPress={() => setPriority(p)} />
        ))}
      </View>

      <Text style={s.label}>Category</Text>
      <View style={[s.row, { flexWrap: 'wrap' }]}>
        {CATEGORIES.map((c) => <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />)}
      </View>

      <View style={{ marginTop: 28 }}><Button title="Save task" onPress={save} loading={saving} /></View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 40 },
  dates: { flexDirection: 'row', marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: colors.muted, marginBottom: 8, marginTop: 4 },
  row: { flexDirection: 'row', marginBottom: 14 },
});
