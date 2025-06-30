import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Check, X as XIcon } from "lucide-react"
import { Input } from "@/components/ui/input"

interface NameEditProps {
  initialName: string
  onSave: (newName: string) => void
  onCancel: () => void
}

export const NameEdit: React.FC<NameEditProps> = ({ initialName, onSave, onCancel }) => {
  const [newName, setNewName] = useState(initialName)

  const handleSave = useCallback(() => {
    if (newName.trim()) {
      onSave(newName.trim())
    }
  }, [newName, onSave])

  const handleCancel = useCallback(() => {
    setNewName(initialName)
    onCancel()
  }, [initialName, onCancel])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewName(e.target.value)
  }, [])

  // Handle Enter key for saving and Escape key for canceling
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSave()
      } else if (e.key === "Escape") {
        handleCancel()
      }
    },
    [handleSave, handleCancel]
  )

  useEffect(() => {
    setNewName(initialName)
  }, [initialName])

  return (
    <div className="flex items-center">
      <Input
        type="text"
        value={newName}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSave}
        className="ml-1"
        aria-label="Save rename"
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCancel}
        className="ml-1"
        aria-label="Cancel rename"
      >
        <XIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}