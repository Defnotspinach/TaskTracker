import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Spinner from '../ui/Spinner';

const schema = z.object({
  title:       z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category:    z.string().min(1, 'Category is required'),
  status:      z.enum(['todo', 'in-progress', 'hold', 'testing', 'done']),
  priority:    z.enum(['low', 'medium', 'high', 'critical']),
  dueDate:     z.string().min(1, 'Due date is required'),
});

export default function TaskForm({ defaultValues, categories, onSubmit, onCancel, loading }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || {
      status: 'todo', priority: 'medium', dueDate: '', title: '', description: '', category: '',
    },
  });

  useEffect(() => {
    if (defaultValues) reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Title <span className="text-red-500">*</span></label>
        <input {...register('title')} className="input" placeholder="Task title" />
        {errors.title && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="label">Description</label>
        <textarea {...register('description')} className="input min-h-[80px] resize-none" placeholder="Optional description" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Category <span className="text-red-500">*</span></label>
          <select {...register('category')} className="input">
            <option value="">Select category</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          {errors.category && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.category.message}</p>}
        </div>

        <div>
          <label className="label">Status</label>
          <select {...register('status')} className="input">
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="hold">Hold</option>
            <option value="testing">Testing</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Priority</label>
          <select {...register('priority')} className="input">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="label">Due Date <span className="text-red-500">*</span></label>
          <input {...register('dueDate')} type="date" className="input" />
          {errors.dueDate && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.dueDate.message}</p>}
        </div>
      </div>

      <div className="flex gap-3 pt-2 justify-end">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading && <Spinner />}
          {defaultValues ? 'Save Changes' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
