import { useState, useEffect } from 'react';
import { relationshipRepository, EntityType, RelationshipType } from '../repositories/RelationshipRepository';
import Relationship from '../models/Relationship';
import { Subscription } from 'rxjs';

// Interface for relationship filters
interface RelationshipFilters {
  sourceType?: EntityType;
  sourceId?: string;
  relationshipType?: RelationshipType;
  targetType?: EntityType;
  targetId?: string;
}

interface UseRelationshipsResult {
  relationships: Relationship[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useRelationships(filters: RelationshipFilters = {}): UseRelationshipsResult {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Stringify filters for dependency array
  const filtersKey = JSON.stringify(filters);
  
  const fetchRelationships = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await relationshipRepository.getRelationships(filters);
      setRelationships(data);
    } catch (err) {
      console.error('Error in useRelationships:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    let subscription: Subscription;
    
    const initData = async () => {
      try {
        // Get initial data
        await fetchRelationships();
        
        // Subscribe to changes
        subscription = relationshipRepository.observeRelationships(filters).subscribe(updatedRelationships => {
          setRelationships(updatedRelationships);
        });
      } catch (err) {
        console.error('Error initializing useRelationships:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    };
    
    initData();
    
    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [filtersKey]);
  
  return { relationships, loading, error, refetch: fetchRelationships };
}

// Helper hook for getting all relationships for an entity
export function useEntityRelationships(entityType: EntityType | null, entityId: string | null): UseRelationshipsResult {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState<boolean>(entityType !== null && entityId !== null);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchRelationships = async () => {
    if (!entityType || !entityId) {
      setRelationships([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await relationshipRepository.getAllRelationshipsForEntity(entityType, entityId);
      setRelationships(data);
    } catch (err) {
      console.error(`Error in useEntityRelationships for ${entityType} ${entityId}:`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    let sourceSubscription: Subscription;
    let targetSubscription: Subscription;
    
    const initData = async () => {
      if (!entityType || !entityId) {
        setRelationships([]);
        setLoading(false);
        return;
      }
      
      try {
        // Get initial data
        await fetchRelationships();
        
        // Subscribe to changes (both as source and target)
        sourceSubscription = relationshipRepository
          .observeRelationshipsForSource(entityType, entityId)
          .subscribe(() => {
            // When relationships change, refetch all relationships
            fetchRelationships().catch(console.error);
          });
        
        targetSubscription = relationshipRepository
          .observeRelationshipsForTarget(entityType, entityId)
          .subscribe(() => {
            // When relationships change, refetch all relationships
            fetchRelationships().catch(console.error);
          });
      } catch (err) {
        console.error(`Error initializing useEntityRelationships for ${entityType} ${entityId}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    };
    
    initData();
    
    // Cleanup subscriptions on unmount
    return () => {
      if (sourceSubscription) {
        sourceSubscription.unsubscribe();
      }
      if (targetSubscription) {
        targetSubscription.unsubscribe();
      }
    };
  }, [entityType, entityId]);
  
  return { relationships, loading, error, refetch: fetchRelationships };
}
