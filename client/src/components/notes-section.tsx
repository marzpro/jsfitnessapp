import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface NotesSectionProps {
  notes: string;
  onSave: (notes: string) => void;
  isLoading: boolean;
  isSaving: boolean;
}

const NotesSection = ({ notes, onSave, isLoading, isSaving }: NotesSectionProps) => {
  const [noteText, setNoteText] = useState(notes);
  
  // Update note text when notes prop changes
  useEffect(() => {
    setNoteText(notes);
  }, [notes]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteText(e.target.value);
  };
  
  const handleSave = () => {
    onSave(noteText);
  };

  return (
    <div className="mt-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex items-center">
          <i className="fas fa-sticky-note text-yellow-500 mr-2"></i>
          <h3 className="text-lg font-semibold text-gray-800">Daily Notes</h3>
        </div>
        <div className="p-4">
          {isLoading ? (
            <div className="h-24 flex items-center justify-center text-gray-500">
              Loading notes...
            </div>
          ) : (
            <>
              <Textarea
                placeholder="Add notes about your day, how you felt, etc."
                rows={3}
                value={noteText}
                onChange={handleChange}
                className="w-full resize-none"
              />
              <div className="mt-2 flex justify-end">
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-1"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-1"></i>
                      Save Notes
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesSection;
