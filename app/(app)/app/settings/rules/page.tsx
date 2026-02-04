'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2, Play, Pencil, GripVertical } from 'lucide-react';
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

export default function EmailRulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [labels, setLabels] = useState<any[]>([]);

  // Form state
  const [ruleName, setRuleName] = useState('');
  const [conditions, setConditions] = useState<Condition[]>([
    { field: 'from', operator: 'contains', value: '' }
  ]);
  const [actions, setActions] = useState<Action[]>([
    { type: 'mark_as_read' }
  ]);
  const [enabled, setEnabled] = useState(true);

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
      setRuleName(rule.name);
      setConditions(rule.conditions);
      setActions(rule.actions);
      setEnabled(rule.enabled);
    } else {
      setEditingRule(null);
      setRuleName('');
      setConditions([{ field: 'from', operator: 'contains', value: '' }]);
      setActions([{ type: 'mark_as_read' }]);
      setEnabled(true);
    }
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditingRule(null);
  };

  const saveRule = async () => {
    if (!ruleName.trim()) {
      toast.error('Please enter a rule name');
      return;
    }

    if (conditions.some(c => !c.value && c.field !== 'has_attachment')) {
      toast.error('Please fill in all condition values');
      return;
    }

    try {
      const payload = {
        name: ruleName,
        conditions: conditions.map(c => ({
          ...c,
          value: c.field === 'has_attachment' ? true : c.value
        })),
        actions,
        enabled,
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

      const data = await response.json();

      if (response.ok) {
        toast.success(editingRule ? 'Rule updated' : 'Rule created');
        fetchRules();
        closeDialog();
      } else {
        toast.error(data.error || 'Failed to save rule');
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

  const addCondition = () => {
    setConditions([...conditions, { field: 'from', operator: 'contains', value: '' }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: keyof Condition, value: any) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditions(updated);
  };

  const addAction = () => {
    setActions([...actions, { type: 'mark_as_read' }]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, field: keyof Action, value: any) => {
    const updated = [...actions];
    updated[index] = { ...updated[index], [field]: value };
    setActions(updated);
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

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-4">
              {/* Rule Name */}
              <div>
                <Label htmlFor="rule-name">Rule Name</Label>
                <Input
                  id="rule-name"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  placeholder="e.g., Archive newsletters"
                  className="mt-1"
                />
              </div>

              {/* Conditions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Conditions (all must match)</Label>
                  <Button variant="outline" size="sm" onClick={addCondition}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Condition
                  </Button>
                </div>
                <div className="space-y-2">
                  {conditions.map((condition, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                      <Select
                        value={condition.field}
                        onValueChange={(value) => updateCondition(index, 'field', value)}
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

                      {condition.field !== 'has_attachment' && (
                        <>
                          <Select
                            value={condition.operator}
                            onValueChange={(value) => updateCondition(index, 'operator', value)}
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

                          <Input
                            value={condition.value as string}
                            onChange={(e) => updateCondition(index, 'value', e.target.value)}
                            placeholder="Value"
                            className="flex-1"
                          />
                        </>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCondition(index)}
                        disabled={conditions.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Actions</Label>
                  <Button variant="outline" size="sm" onClick={addAction}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Action
                  </Button>
                </div>
                <div className="space-y-2">
                  {actions.map((action, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                      <Select
                        value={action.type}
                        onValueChange={(value) => updateAction(index, 'type', value)}
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

                      {action.type === 'move_to_folder' && (
                        <Input
                          value={action.value || ''}
                          onChange={(e) => updateAction(index, 'value', e.target.value)}
                          placeholder="Folder name"
                          className="flex-1"
                        />
                      )}

                      {action.type === 'apply_label' && (
                        <Select
                          value={action.value}
                          onValueChange={(value) => updateAction(index, 'value', value)}
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

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAction(index)}
                        disabled={actions.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
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
                <Switch checked={enabled} onCheckedChange={setEnabled} />
              </div>
            </div>
          </ScrollArea>

          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={saveRule}>
              {editingRule ? 'Update Rule' : 'Create Rule'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
