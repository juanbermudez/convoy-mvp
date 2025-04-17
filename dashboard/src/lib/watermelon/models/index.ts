/**
 * WatermelonDB Models
 * 
 * This file exports all WatermelonDB models for the Convoy data architecture.
 */

import Workspace from './workspace';
import Project from './project';
import Workstream from './workstream';
import Task from './task';
import Relationship from './relationship';

/**
 * All Watermelon models
 */
export const AllModels = [
  Workspace,
  Project,
  Workstream,
  Task,
  Relationship
];

export {
  Workspace,
  Project,
  Workstream,
  Task,
  Relationship
};
