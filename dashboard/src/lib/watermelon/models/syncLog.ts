import { Model } from '@nozbe/watermelondb';
import { text, date } from '@nozbe/watermelondb/decorators';

/**
 * SyncLog model for WatermelonDB
 * Used to track sync operations for debugging and monitoring
 */
export default class SyncLog extends Model {
  static table = 'sync_log';

  @text('operation') operation;
  @text('entity_type') entityType;
  @text('entity_id') entityId;
  @text('status') status;
  @text('error') error;
  @date('timestamp') timestamp;

  /**
   * Create a success log entry
   * @param operation The operation performed (e.g., 'pull', 'push', 'create')
   * @param entityType The type of entity (e.g., 'workspace', 'task')
   * @param entityId The ID of the entity
   */
  static success(database, operation, entityType, entityId) {
    return database.collections.get('sync_log').create(log => {
      log.operation = operation;
      log.entityType = entityType;
      log.entityId = entityId;
      log.status = 'success';
      log.timestamp = Date.now();
    });
  }

  /**
   * Create a failure log entry
   * @param operation The operation performed (e.g., 'pull', 'push', 'create')
   * @param entityType The type of entity (e.g., 'workspace', 'task')
   * @param entityId The ID of the entity
   * @param error The error message or object
   */
  static failure(database, operation, entityType, entityId, error) {
    return database.collections.get('sync_log').create(log => {
      log.operation = operation;
      log.entityType = entityType;
      log.entityId = entityId;
      log.status = 'failure';
      log.error = typeof error === 'string' ? error : JSON.stringify(error);
      log.timestamp = Date.now();
    });
  }

  /**
   * Find recent failures for an entity
   * @param database The WatermelonDB database instance
   * @param entityType The type of entity
   * @param entityId The ID of the entity
   * @param limit Maximum number of records to return
   */
  static async findRecentFailures(database, entityType, entityId, limit = 5) {
    return database.collections
      .get('sync_log')
      .query(
        Q.where('entity_type', entityType),
        Q.where('entity_id', entityId),
        Q.where('status', 'failure'),
        Q.sortBy('timestamp', Q.desc),
        Q.take(limit)
      )
      .fetch();
  }

  /**
   * Clean up old sync logs
   * @param database The WatermelonDB database instance
   * @param daysToKeep Number of days to keep logs
   */
  static async cleanupOldLogs(database, daysToKeep = 7) {
    const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    
    const oldLogs = await database.collections
      .get('sync_log')
      .query(
        Q.where('timestamp', Q.lt(cutoff))
      )
      .fetch();
    
    return database.batch(
      ...oldLogs.map(log => log.prepareDestroyPermanently())
    );
  }
}

// Import Q for queries - needs to be after the class definition to avoid circular dependencies
import { Q } from '@nozbe/watermelondb';
