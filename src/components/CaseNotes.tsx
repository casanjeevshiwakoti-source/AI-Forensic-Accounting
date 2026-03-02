import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { MessageSquarePlus, User } from 'lucide-react';
import type { CaseNote } from '../utils/types';

interface CaseNotesProps {
  caseId: string;
  notes: CaseNote[];
  onAddNote: (content: string) => void;
}

export function CaseNotes({ caseId, notes, onAddNote }: CaseNotesProps) {
  const [newNote, setNewNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newNote.trim();
    if (trimmed) {
      onAddNote(trimmed);
      setNewNote('');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note or finding..."
          rows={3}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
        />
        <Button type="submit" disabled={!newNote.trim()} className="self-end">
          <MessageSquarePlus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </form>

      <div className="space-y-4">
        <h3 className="font-semibold text-slate-200">
          Notes ({notes.length})
        </h3>
        {notes.length > 0 ? (
          <div className="space-y-3">
            {[...notes].reverse().map((note) => (
              <Card key={note.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-slate-200">{note.author}</span>
                      <span className="text-slate-500">
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-300 mt-1 whitespace-pre-wrap">{note.content}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">No notes yet. Add your first note above.</p>
        )}
      </div>
    </div>
  );
}
