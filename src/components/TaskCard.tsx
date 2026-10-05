import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Task } from '../types';
import { colors, priorityColor, radius } from '../theme';
import { deadlineLabel, formatDateTime, isOverdue } from '../utils/taskUtils';

interface Props { task: Task; onToggle: () => void; onDelete: () => void }

/** One task: colour rail = priority, checkbox = completed, pill = time left. */
export default function TaskCard({ task, onToggle, onDelete }: Props) {
  const overdue = isOverdue(task);
  const confirmDelete = () =>
    Alert.alert('Delete task', `Delete "${task.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);

  return (
    <View style={[s.card, task.completed && { opacity: 0.6 }]}>
      <View style={[s.rail, { backgroundColor: priorityColor[task.priority] }]} />
      <Pressable onPress={onToggle} hitSlop={10} style={[s.check, task.completed && s.checkOn]}>
        {task.completed && <Text style={s.tick}>✓</Text>}
      </Pressable>

      <View style={{ flex: 1 }}>
        <Text style={[s.title, task.completed && s.struck]} numberOfLines={2}>{task.title}</Text>
        {!!task.description && <Text style={s.desc} numberOfLines={2}>{task.description}</Text>}
        <Text style={s.meta}>Starts {formatDateTime(task.scheduledAt)}</Text>
        <View style={s.row}>
          <View style={[s.pill, { backgroundColor: task.completed ? colors.primarySoft : overdue ? '#F8D9D9' : colors.primarySoft }]}>
            <Text style={[s.pillText, { color: task.completed ? colors.primary : overdue ? colors.danger : colors.primary }]}>
              {task.completed ? 'Completed' : deadlineLabel(task)}
            </Text>
          </View>
          <View style={[s.pill, { backgroundColor: colors.bg }]}>
            <Text style={[s.pillText, { color: priorityColor[task.priority] }]}>{task.priority} priority</Text>
          </View>
          <View style={[s.pill, { backgroundColor: colors.bg }]}>
            <Text style={[s.pillText, { color: colors.muted }]}>{task.category}</Text>
          </View>
        </View>
      </View>

      <Pressable onPress={confirmDelete} hitSlop={10} style={s.del}>
        <Text style={s.delText}>Delete</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.surface, borderRadius: radius.md,
    padding: 14, paddingLeft: 20, marginBottom: 12, overflow: 'hidden', elevation: 2,
  },
  rail: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 6 },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: colors.primary, marginRight: 12, marginTop: 2, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.primary },
  tick: { color: '#fff', fontWeight: '800', fontSize: 14 },
  title: { fontSize: 17, fontWeight: '700', color: colors.ink },
  struck: { textDecorationLine: 'line-through' },
  desc: { fontSize: 14, color: colors.muted, marginTop: 2 },
  meta: { fontSize: 12, color: colors.muted, marginTop: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginRight: 6, marginBottom: 4 },
  pillText: { fontSize: 12, fontWeight: '700' },
  del: { paddingLeft: 8, paddingTop: 2 },
  delText: { color: colors.danger, fontSize: 12, fontWeight: '700' },
});
