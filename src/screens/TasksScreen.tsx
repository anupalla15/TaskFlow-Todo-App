import React, { useCallback, useEffect, useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import TaskCard from '../components/TaskCard';
import { Chip } from '../components/ui';
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../store/authSlice';
import { clearTasks, deleteTask, fetchTasks, setCategory, setFilter, setSort, SortMode, StatusFilter, toggleTask } from '../store/tasksSlice';
import { sortTasks } from '../utils/taskUtils';
import { colors, radius } from '../theme';
import { RootStackParamList } from '../navigation/types';

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' }, { key: 'active', label: 'To do' }, { key: 'done', label: 'Done' },
];
const SORTS: { key: SortMode; label: string }[] = [
  { key: 'smart', label: 'Smart order' }, { key: 'deadline', label: 'Deadline' }, { key: 'priority', label: 'Priority' },
];

export default function TasksScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Tasks'>) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const { items, loading, error, filter, sort, category } = useAppSelector((s) => s.tasks);

  const load = useCallback(() => { dispatch(fetchTasks()); }, [dispatch]);
  useEffect(() => { load(); }, [load]);

  // Apply status + category filters, then the chosen sort.
  const visible = useMemo(() => {
    let list = items;
    if (filter === 'active') list = list.filter((t) => !t.completed);
    if (filter === 'done') list = list.filter((t) => t.completed);
    if (category) list = list.filter((t) => t.category === category);
    return sortTasks(list, sort);
  }, [items, filter, sort, category]);

  const categories = useMemo(() => Array.from(new Set(items.map((t) => t.category))), [items]);
  const doneCount = items.filter((t) => t.completed).length;
  const progress = items.length ? doneCount / items.length : 0;

  const signOut = async () => { dispatch(clearTasks()); await dispatch(logout()); };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View style={{ flex: 1 }}>
          <Text style={s.hello}>Hi, {user?.name?.split(' ')[0]}</Text>
          <Text style={s.count}>
            {items.length === 0 ? 'Nothing planned yet' : `${doneCount} of ${items.length} tasks done`}
          </Text>
        </View>
        <Pressable onPress={signOut}><Text style={s.logout}>Log out</Text></Pressable>
      </View>

      {/* Progress bar */}
      <View style={s.track}><View style={[s.fill, { width: `${progress * 100}%` }]} /></View>

      <View style={s.controls}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTERS.map((f) => <Chip key={f.key} label={f.label} active={filter === f.key} onPress={() => dispatch(setFilter(f.key))} />)}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          {SORTS.map((o) => <Chip key={o.key} label={o.label} active={sort === o.key} color={colors.ink} onPress={() => dispatch(setSort(o.key))} />)}
        </ScrollView>
        {categories.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            <Chip label="Any category" active={category === null} color={colors.muted} onPress={() => dispatch(setCategory(null))} />
            {categories.map((c) => (
              <Chip key={c} label={c} active={category === c} color={colors.muted} onPress={() => dispatch(setCategory(category === c ? null : c))} />
            ))}
          </ScrollView>
        )}
      </View>

      {!!error && <Text style={s.error}>{error}</Text>}

      <FlatList
        data={visible}
        keyExtractor={(t) => t._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.primary} colors={[colors.primary]} />}
        renderItem={({ item }) => (
          <TaskCard task={item} onToggle={() => dispatch(toggleTask(item))} onDelete={() => dispatch(deleteTask(item._id))} />
        )}
        ListEmptyComponent={!loading ? (
          <View style={s.empty}>
            <Text style={s.emptyTitle}>{items.length ? 'No tasks match these filters' : 'Add your first task'}</Text>
            <Text style={s.emptyText}>{items.length ? 'Change the filter above to see more.' : 'Tap "New task" to set a start time, deadline and priority.'}</Text>
          </View>
        ) : null}
      />

      <Pressable style={s.fab} onPress={() => navigation.navigate('AddTask')}>
        <Text style={s.fabText}>+  New task</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12 },
  hello: { fontFamily: 'serif', fontSize: 30, fontWeight: '700', color: colors.ink },
  count: { fontSize: 14, color: colors.muted, marginTop: 2 },
  logout: { color: colors.primary, fontWeight: '700' },
  track: { height: 8, backgroundColor: colors.line, borderRadius: 4, marginHorizontal: 20, marginTop: 14, overflow: 'hidden' },
  fill: { height: 8, backgroundColor: colors.primary, borderRadius: 4 },
  controls: { paddingHorizontal: 20, paddingTop: 14 },
  error: { color: colors.danger, paddingHorizontal: 20, paddingTop: 8, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.ink },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 6 },
  fab: {
    position: 'absolute', bottom: 24, alignSelf: 'center', backgroundColor: colors.ink,
    paddingHorizontal: 28, height: 54, borderRadius: radius.lg, justifyContent: 'center', elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
