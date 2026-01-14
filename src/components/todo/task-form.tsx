"use client";

import { useState, useEffect } from "react";
import { X, Plus, Calendar as CalendarIcon } from "lucide-react";
import { Task, TaskStatus, TaskPriority, CreateTaskInput } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date-utils";

interface TaskFormProps {
  task?: Task;
  onSubmit: (taskData: CreateTaskInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "on-hold", label: "On Hold" },
];

const priorityOptions: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export function TaskForm({ task, onSubmit, onCancel, isSubmitting = false }: TaskFormProps) {
  const [content, setContent] = useState(task?.content || "");
  const [status, setStatus] = useState<TaskStatus>(task?.status || "upcoming");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || "medium");
  const [deadline, setDeadline] = useState<Date | undefined>(
    task?.deadline ? new Date(task.deadline) : undefined
  );
  const [tags, setTags] = useState<string[]>(task?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<{ content?: string }>({});

  const validate = () => {
    const newErrors: { content?: string } = {};

    if (!content.trim()) {
      newErrors.content = "Task content is required";
    } else if (content.trim().length < 3) {
      newErrors.content = "Task content must be at least 3 characters";
    } else if (content.trim().length > 500) {
      newErrors.content = "Task content must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const taskData: CreateTaskInput = {
      content: content.trim(),
      status,
      priority,
      deadline: deadline ? deadline.toISOString().split("T")[0] : null,
      tags: tags.filter((tag) => tag.trim().length > 0),
      userId: null,
    };

    onSubmit(taskData);
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Task Content */}
      <div className="space-y-2">
        <Label htmlFor="content" className="required">
          Task Description
        </Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (errors.content) setErrors({ ...errors, content: undefined });
          }}
          placeholder="What needs to be done?"
          className={cn(
            "min-h-[100px] resize-none",
            errors.content && "border-destructive focus-visible:ring-destructive"
          )}
          disabled={isSubmitting}
          aria-invalid={!!errors.content}
          aria-describedby={errors.content ? "content-error" : undefined}
        />
        {errors.content && (
          <p id="content-error" className="text-sm text-destructive">
            {errors.content}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {content.length}/500 characters
        </p>
      </div>

      {/* Status and Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)} disabled={isSubmitting}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)} disabled={isSubmitting}>
            <SelectTrigger id="priority">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Deadline */}
      <div className="space-y-2">
        <Label htmlFor="deadline">Deadline (Optional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="deadline"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !deadline && "text-muted-foreground"
              )}
              disabled={isSubmitting}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {deadline ? formatDate(deadline) : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={deadline}
              onSelect={setDeadline}
              initialFocus
            />
            {deadline && (
              <div className="p-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeadline(undefined)}
                  className="w-full"
                >
                  Clear deadline
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tag-input">Tags (Optional)</Label>
        <div className="flex gap-2">
          <Input
            id="tag-input"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            placeholder="Add a tag"
            disabled={isSubmitting}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddTag}
            disabled={!tagInput.trim() || isSubmitting}
            aria-label="Add tag"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 hover:text-destructive"
                  disabled={isSubmitting}
                  aria-label={`Remove ${tag} tag`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : task ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  );
}
