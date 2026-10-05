import { Schema, model, Types } from 'mongoose';

export type Priority = 'low' | 'medium' | 'high';

export interface ITask {
  user: Types.ObjectId;
  title: string;
  description: string;
  scheduledAt: Date;   // the "date-time" the task is planned for
  deadline: Date;      // the hard due date
  priority: Priority;
  category: string;    // free-form tag such as "Work" or "Study"
  completed: boolean;
}

const taskSchema = new Schema<ITask>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    scheduledAt: { type: Date, required: true },
    deadline: { type: Date, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    category: { type: String, default: 'General', trim: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default model<ITask>('Task', taskSchema);
