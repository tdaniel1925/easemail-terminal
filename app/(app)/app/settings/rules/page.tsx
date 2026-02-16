'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Play, Pencil, GripVertical, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Condition {
  field: 'from' | 'to' | 'subject' | 'body' | 'has_attachment';
  operator: 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'not_contains';
  value: string | boolean;
}

interface Action {
  type: 'move_to_folder' | 'apply_label' | 'mark_as_read' | 'mark_as_starred' | 'delete' | 'archive';
  value?: string;
}

interface Rule {
  id: string;
  name: string;
  conditions: Condition[];
  actions: Action[];
  enabled: boolean;
  priority: number;
  created_at: string;
}

// Validation schema
const conditionSchema = z.object({
  field: z.enum(['from', 'to', 'subject', 'body', 'has_attachment']),
  operator: z.enum(['contains', 'equals', 'starts_with', 'ends_with', 'not_contains']),
  value: z.union([z.string(), z.boolean()]),
}).refine(
  (data) => {
    // has_attachment doesn't need a string value
    if (data.field === 'has_attachment') return true;
    // Other fields require a non-empty string value
    return typeof data.value === 'string' && data.value.trim().length > 0;
  },
  { message: 'Value is required for this condition', path: ['value'] }
);

const actionSchema = z.object({
  type: z.enum(['move_to_folder', 'apply_label', 'mark_as_read', 'mark_as_starred', 'delete', 'archive']),
  value: z.string().optional(),
}).refine(
  (data) => {
    // move_to_folder and apply_label require a value
    if (data.type === 'move_to_folder' || data.type === 'apply_label') {
      return data.value && data.value.trim().length > 0;
    }
    return true;
  },
  { message: 'Value is required for this action', path: ['value'] }
);

const ruleSchema = z.object({
  name: z.string().min(1, 'Rule name is required').max(100, 'Rule name is too long'),
  conditions: z.array(conditionSchema).min(1, 'At least one condition is required'),
  actions: z.array(actionSchema).min(1, 'At least one action is required'),
  enabled: z.boolean(),
});

type RuleFormData = z.infer<typeof ruleSchema>;

export default function EmailRulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [labels, setLabels] = useState<any[]>([]);

  // Form with validation
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      name: '',
      conditions: [{ field: 'from', operator: 'contains', value: '' }],
      actions: [{ type: 'mark_as_read' }],
      enabled: true,
    },
  });

  // Field arrays for dynamic conditions and actions
  const { fields: conditionFields, append: appendCondition, remove: removeCondition } = useFieldArray({
    control,
    name: 'conditions',
  });

  const { fields: actionFields, append: appendAction, remove: removeAction } = useFieldArray({
    control,
    name: 'actions',
  });

  useEffect(() => {
    fetchRules();
    fetchLabels();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await fetch('/api/email-rules');
      const data = await response.json();
      if (response.ok && data.rules) {
        setRules(data.rules);
      }
    } catch (error) {
      console.error('Failed to fetch rules:', error);
      toast.error('Failed to load rules');
    } finally {
      setLoading(false);
    }
  };

  const fetchLabels = async () => {
    try {
      const response = await fetch('/api/labels');
      const data = await response.json();
      if (response.ok && data.labels) {
        setLabels(data.labels);
      }
    } catch (error) {
      console.error('Failed to fetch labels:', error);
    }
  };

  const openDialog = (rule?: Rule) => {
    if (rule) {
      setEditingRule(rule);
      reset({
        name: rule.name,
        conditions: rule.conditions,
        actions: rule.actions,
        enabled: rule.enabled,
      });
    } else {
      setEditingRule(null);
      reset({
        name: '',
        conditions: [{ field: 'from', operator: 'contains', value: '' }],
        actions: [{ type: 'mark_as_read' }],
        enabled: true,
      });
    }
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingRule(null);
    reset();
  };

  const onSubmit = async (data: RuleFormData) => {
    try {
      const payload = {
        name: data.name,
        conditions: data.conditions.map(c => ({
          ...c,
          value: c.field === 'has_attachment' ? true : c.value
        })),
        actions: data.actions,
        enabled: data.enabled,
        priority: editingRule?.priority || rules.length,
      };

      const response = editingRule
        ? await fetch(`/api/email-rules/${editingRule.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/email-rules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

      const responseData = await response.json();

      if (response.ok) {
        toast.success(editingRule ? 'Rule updated' : 'Rule created');
        fetchRules();
        closeDialog();
      } else {
        toast.error(responseData.error || 'Failed to save rule');
      }
    } catch (error) {
      console.error('Failed to save rule:', error);
      toast.error('Failed to save rule');
    }
  };

  const deleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      const response = await fetch(`/api/email-rules/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Rule deleted');
        fetchRules();
      } else {
        toast.error('Failed to delete rule');
      }
    } catch (error) {
      console.error('Failed to delete rule:', error);
      toast.error('Failed to delete rule');
    }
  };

  const toggleRule = async (rule: Rule) => {
    try {
      const response = await fetch(`/api/email-rules/${rule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !rule.enabled }),
      });

      if (response.ok) {
        toast.success(rule.enabled ? 'Rule disabled' : 'Rule enabled');
        fetchRules();
      } else {
        toast.error('Failed to update rule');
      }
    } catch (error) {
      console.error('Failed to toggle rule:', error);
      toast.error('Failed to update rule');
    }
  };

  const runRule = async (id: string) => {
    try {
      toast.info('Processing rule...');
      const response = await fetch('/api/email-rules/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleId: id }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Rule processed successfully');
      } else {
        toast.error(data.error || 'Failed to process rule');
      }
    } catch (error) {
      console.error('Failed to run rule:', error);
      toast.error('Failed to run rule');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading rules...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Email Rules</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Automate your email workflow with custom rules
            </p>
          </div>
          <Button onClick={() => openDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Create Rule
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-4">
          {rules.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No rules yet</p>
              <Button onClick={() => openDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Create your first rule
              </Button>
            </div>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <GripVertical className="h-5 w-5 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{rule.name}</h3>
                        {!rule.enabled && (
                          <Badge variant="secondary" className="text-xs">Disabled</Badge>
                        )}
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <div>
                          <span className="text-muted-foreground">When:</span>{' '}
                          {rule.conditions.map((c, i) => (
                            <span key={i}>
                              {i > 0 && ' AND '}
                              <Badge variant="outline" className="text-xs">
                                {c.field} {c.operator} "{c.value}"
                              </Badge>
                            </span>
                          ))}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Then:</span>{' '}
                          {rule.actions.map((a, i) => (
                            <span key={i}>
                              {i > 0 && ', '}
                              <Badge variant="outline" className="text-xs">
                                {a.type.replace(/_/g, ' ')}
                                {a.value && `: ${a.value}`}
                              </Badge>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => toggleRule(rule)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => runRule(rule.id)}
                      title="Run rule now"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDialog(rule)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRule(rule.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={closeDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit Rule' : 'Create Rule'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6 py-4">
                {/* Rule Name */}
                <div>
                  <Label htmlFor="rule-name">Rule Name *</Label>
                  <Input
                    id="rule-name"
                    {...register('name')}
                    placeholder="e.g., Archive newsletters"
                    className="mt-1"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                  )}
                </div>

              {/* Conditions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Conditions (all must match) *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendCondition({ field: 'from', operator: 'contains', value: '' })}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Condition
                  </Button>
                </div>
                <div className="space-y-2">
                  {conditionFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2 p-3 border rounded-lg">
                      <Controller
                        name={`conditions.${index}.field`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="from">From</SelectItem>
                              <SelectItem value="to">To</SelectItem>
                              <SelectItem value="subject">Subject</SelectItem>
                              <SelectItem value="body">Body</SelectItem>
                              <SelectItem value="has_attachment">Has attachment</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />

                      <Controller
                        name={`conditions.${index}.field`}
                        control={control}
                        render={({ field: fieldValue }) => (
                          fieldValue.value !== 'has_attachment' && (
                            <>
                              <Controller
                                name={`conditions.${index}.operator`}
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger className="w-[140px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="contains">Contains</SelectItem>
                                      <SelectItem value="equals">Equals</SelectItem>
                                      <SelectItem value="starts_with">Starts with</SelectItem>
                                      <SelectItem value="ends_with">Ends with</SelectItem>
                                      <SelectItem value="not_contains">Not contains</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                              />

                              <div className="flex-1">
                                <Input
                                  {...register(`conditions.${index}.value` as const)}
                                  placeholder="Value"
                                />
                              </div>
                            </>
                          )
                        )}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCondition(index)}
                        disabled={conditionFields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {errors.conditions && (
                    <p className="text-sm text-destructive">{errors.conditions.message}</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Actions *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendAction({ type: 'mark_as_read' })}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Action
                  </Button>
                </div>
                <div className="space-y-2">
                  {actionFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2 p-3 border rounded-lg">
                      <Controller
                        name={`actions.${index}.type`}
                        control={control}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mark_as_read">Mark as read</SelectItem>
                              <SelectItem value="mark_as_starred">Mark as starred</SelectItem>
                              <SelectItem value="archive">Archive</SelectItem>
                              <SelectItem value="delete">Delete</SelectItem>
                              <SelectItem value="move_to_folder">Move to folder</SelectItem>
                              <SelectItem value="apply_label">Apply label</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />

                      <Controller
                        name={`actions.${index}.type`}
                        control={control}
                        render={({ field: typeField }) => (
                          <>
                            {typeField.value === 'move_to_folder' && (
                              <Input
                                {...register(`actions.${index}.value` as const)}
                                placeholder="Folder name"
                                className="flex-1"
                              />
                            )}

                            {typeField.value === 'apply_label' && (
                              <Controller
                                name={`actions.${index}.value`}
                                control={control}
                                render={({ field }) => (
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger className="flex-1">
                                      <SelectValue placeholder="Select label" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {labels.map(label => (
                                        <SelectItem key={label.id} value={label.name}>
                                          {label.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              />
                            )}
                          </>
                        )}
                      />

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAction(index)}
                        disabled={actionFields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {errors.actions && (
                    <p className="text-sm text-destructive">{errors.actions.message}</p>
                  )}
                </div>
              </div>

              {/* Enable/Disable */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label>Enable Rule</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Disabled rules won't run automatically
                  </p>
                </div>
                <Controller
                  name="enabled"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>
          </ScrollArea>

          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={closeDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingRule ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                editingRule ? 'Update Rule' : 'Create Rule'
              )}
            </Button>
          </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
