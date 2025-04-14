import database from '../database';
import { Q } from '@nozbe/watermelondb';

/**
 * IdMapping utilities for synchronization
 * These functions help map between local WatermelonDB IDs and remote Supabase IDs
 */

/**
 * Find the local ID for a remote ID
 * @param table The table name
 * @param remoteId The remote ID to look up
 * @returns The local ID if found, null otherwise
 */
export async function findLocalId(table: string, remoteId: string): Promise<string | null> {
  try {
    const record = await database.get(table).query(
      Q.where('remote_id', remoteId)
    ).fetch();
    
    if (record.length > 0) {
      return record[0].id;
    }
    
    return null;
  } catch (error) {
    console.error(`Error finding local ID for ${table} with remote ID ${remoteId}:`, error);
    return null;
  }
}

/**
 * Find the remote ID for a local ID
 * @param table The table name
 * @param localId The local ID to look up
 * @returns The remote ID if found, null otherwise
 */
export async function findRemoteId(table: string, localId: string): Promise<string | null> {
  try {
    const record = await database.get(table).find(localId);
    return record.remoteId || null;
  } catch (error) {
    console.error(`Error finding remote ID for ${table} with local ID ${localId}:`, error);
    return null;
  }
}

/**
 * Create a mapping of remote IDs to local IDs for a table
 * @param table The table name
 * @param remoteIds Array of remote IDs to map
 * @returns Map of remote IDs to local IDs
 */
export async function createRemoteToLocalIdMap(
  table: string,
  remoteIds: string[]
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  
  if (remoteIds.length === 0) {
    return map;
  }
  
  try {
    // Query all records that match the remote IDs
    const records = await database.get(table).query(
      Q.where('remote_id', Q.oneOf(remoteIds))
    ).fetch();
    
    // Create the mapping
    for (const record of records) {
      if (record.remoteId) {
        map.set(record.remoteId, record.id);
      }
    }
    
    return map;
  } catch (error) {
    console.error(`Error creating ID map for ${table}:`, error);
    return map;
  }
}

/**
 * Create a mapping of local IDs to remote IDs for a table
 * @param table The table name
 * @param localIds Array of local IDs to map
 * @returns Map of local IDs to remote IDs
 */
export async function createLocalToRemoteIdMap(
  table: string,
  localIds: string[]
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  
  if (localIds.length === 0) {
    return map;
  }
  
  try {
    // Query all records that match the local IDs
    const records = await database.collect(
      ...localIds.map(id => database.get(table).findAndObserve(id))
    );
    
    // Create the mapping
    for (const record of records) {
      if (record.remoteId) {
        map.set(record.id, record.remoteId);
      }
    }
    
    return map;
  } catch (error) {
    console.error(`Error creating ID map for ${table}:`, error);
    return map;
  }
}
