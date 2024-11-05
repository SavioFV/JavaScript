import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView, 
  Platform, 
  StatusBar,
  ListRenderItem
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface TaskItemProps {
  item: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ item, onToggle, onDelete }) => (
  <View style={styles.taskItem}>
    <TouchableOpacity
      style={[styles.checkbox, item.completed && styles.checkboxChecked]}
      onPress={() => onToggle(item.id)}
    />
    <Text style={[styles.taskText, item.completed && styles.taskTextCompleted]}>
      {item.title}
    </Text>
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => onDelete(item.id)}
    >
      <Text style={styles.deleteButtonText}>X</Text>
    </TouchableOpacity>
  </View>
);

const STORAGE_KEY = 'tasks';

export default function App(): React.JSX.Element {
  const [task, setTask] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadTasks = async (): Promise<void> => {
    try {
      const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTasks !== null) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      setTasks([]);
    }
  };

  const saveTasks = async (newTasks: Task[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleAddTask = (): void => {
    if (task.trim()) {
      const newTask: Task = {
        id: String(Date.now()),
        title: task,
        completed: false,
      };
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      setTask('');
    }
  };

  const handleToggleTask = (id: string): void => {
    const updatedTasks = tasks.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const handleDeleteTask = (id: string): void => {
    const updatedTasks = tasks.filter(item => item.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const renderItem: ListRenderItem<Task> = ({ item }) => (
    <TaskItem
      item={item}
      onToggle={handleToggleTask}
      onDelete={handleDeleteTask}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Lista de Tarefas</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={task}
            onChangeText={setTask}
            placeholder="Adicionar nova tarefa"
            placeholderTextColor="#666"
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <FlatList<Task>
          data={tasks}
          renderItem={renderItem}
          keyExtractor={(item: Task) => item.id}
          style={styles.taskList}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskList: {
    flex: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  deleteButton: {
    padding: 5,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: 'bold',
  },
});