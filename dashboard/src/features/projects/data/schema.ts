import { z } from 'zod'

// Schema for project data
export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  category: z.string(),
  priority: z.string(),
  progress: z.number(),
})

export type Project = z.infer<typeof projectSchema>
