import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  QuestionMarkIcon,
  StopwatchIcon,
} from '@radix-ui/react-icons'

export const statuses = [
  {
    value: 'backlog',
    label: 'Backlog',
    icon: QuestionMarkIcon,
  },
  {
    value: 'todo',
    label: 'Todo',
    icon: CircleIcon,
  },
  {
    value: 'in progress',
    label: 'In Progress',
    icon: StopwatchIcon,
  },
  {
    value: 'done',
    label: 'Done',
    icon: CheckCircledIcon,
  },
  {
    value: 'canceled',
    label: 'Canceled',
    icon: CrossCircledIcon,
  },
]

export const categories = [
  {
    value: 'frontend',
    label: 'Frontend',
  },
  {
    value: 'backend',
    label: 'Backend',
  },
  {
    value: 'mobile',
    label: 'Mobile',
  },
  {
    value: 'infrastructure',
    label: 'Infrastructure',
  },
  {
    value: 'devops',
    label: 'DevOps',
  },
  {
    value: 'fullstack',
    label: 'Fullstack',
  },
  {
    value: 'security',
    label: 'Security',
  },
]

export const priorities = [
  {
    value: 'low',
    label: 'Low',
    icon: ArrowDownIcon,
  },
  {
    value: 'medium',
    label: 'Medium',
    icon: ArrowRightIcon,
  },
  {
    value: 'high',
    label: 'High',
    icon: ArrowUpIcon,
  },
]
