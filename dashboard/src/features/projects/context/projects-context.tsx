import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { Project } from '../data/schema'

type ProjectsDialogType = 'create' | 'update' | 'delete' | 'import'

interface ProjectsContextType {
  open: ProjectsDialogType | null
  setOpen: (str: ProjectsDialogType | null) => void
  currentRow: Project | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Project | null>>
}

const ProjectsContext = React.createContext<ProjectsContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function ProjectsProvider({ children }: Props) {
  const [open, setOpen] = useDialogState<ProjectsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Project | null>(null)
  return (
    <ProjectsContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ProjectsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useProjects = () => {
  const projectsContext = React.useContext(ProjectsContext)

  if (!projectsContext) {
    throw new Error('useProjects has to be used within <ProjectsContext.Provider>')
  }

  return projectsContext
}
