import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../authContext';
import { StorageService } from '../services/storageService';
import { Task } from '../types';
import { Plus, CheckSquare, Clock, AlertCircle, Trash2, Loader2, X, Check, Calendar } from 'lucide-react';

export const Tasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'Medium' as 'Low' | 'Medium' | 'High'
  });

  const refreshTasks = async () => {
    if (!user) return;
    setIsFetching(true);
    try {
      const data = await StorageService.getTasks(user.id);
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    refreshTasks();
  }, [user]);

  const toggleTask = async (task: Task) => {
    try {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t));
      await StorageService.updateTask(task.id, { isCompleted: !task.isCompleted });
    } catch (err) {
      console.error(err);
      refreshTasks();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete task?")) return;
    try {
      await StorageService.deleteTask(id);
      await refreshTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    try {
      const newTask: Task = {
        ...formData,
        id: crypto.randomUUID(),
        userId: user.id,
        isCompleted: false
      };
      await StorageService.addTask(newTask);
      await refreshTasks();
      setIsFormOpen(false);
      setFormData({
        title: '',
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'Medium'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [tasks]);

  if (isFetching && tasks.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
        <p className="text-slate-400 font-bold">Loading checklist...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a]">Event Checklist</h1>
          <p className="text-slate-500 mt-1">Keep track of your preparation steps</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-[#0f172a] hover:bg-slate-800 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Remaining Tasks</h2>
          {sortedTasks.filter(t => !t.isCompleted).length > 0 ? (
            sortedTasks.filter(t => !t.isCompleted).map(task => (
              <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={handleDelete} />
            ))
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-200 text-center">
              <p className="text-slate-400 text-sm">All caught up! Add a task to get started.</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Completed</h2>
          {sortedTasks.filter(t => t.isCompleted).map(task => (
            <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={handleDelete} />
          ))}
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[#0f172a]">New Task</h2>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><X /></button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Task Title</label>
                <input required className="w-full px-5 py-4 bg-slate-50 border-transparent focus:border-amber-500 rounded-2xl outline-none" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Priority</label>
                  <select className="w-full px-5 py-4 bg-slate-50 border-transparent focus:border-amber-500 rounded-2xl outline-none" value={formData.priority} onChange={e => setFormData(p => ({ ...p, priority: e.target.value as any }))}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Due Date</label>
                  <input type="date" className="w-full px-5 py-4 bg-slate-50 border-transparent focus:border-amber-500 rounded-2xl outline-none" value={formData.dueDate} onChange={e => setFormData(p => ({ ...p, dueDate: e.target.value }))} />
                </div>
              </div>
              <button disabled={isLoading} className="w-full py-4.5 bg-[#0f172a] text-white font-bold rounded-2xl shadow-xl hover:bg-slate-800 transition-all active:scale-95">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Task'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TaskItem = ({ task, onToggle, onDelete }: { task: Task, onToggle: any, onDelete: any }) => {
  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'High': return 'bg-rose-50 text-rose-500';
      case 'Medium': return 'bg-amber-50 text-amber-500';
      default: return 'bg-slate-50 text-slate-400';
    }
  };

  return (
    <div className={`group flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-2xl transition-all ${task.isCompleted ? 'opacity-60 bg-slate-50/50 grayscale' : 'hover:border-amber-200 shadow-sm'}`}>
      <button 
        onClick={() => onToggle(task)}
        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.isCompleted ? 'bg-amber-500 border-amber-500' : 'border-slate-200 hover:border-amber-400'}`}
      >
        {task.isCompleted && <Check className="w-4 h-4 text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        <h3 className={`font-bold text-slate-800 truncate ${task.isCompleted ? 'line-through' : ''}`}>{task.title}</h3>
        <div className="flex items-center gap-3 mt-1">
          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
            <Calendar className="w-3 h-3" />
            {task.dueDate}
          </div>
        </div>
      </div>
      <button onClick={() => onDelete(task.id)} className="p-2 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};