/**
 * DocumentServiceFactory - Factory for document service implementations
 * 
 * This factory chooses between Supabase implementation and fallback implementation
 * based on Supabase availability
 */
import { isSupabaseConfigured, checkSupabaseConnection } from '@/lib/supabase/client';
import { 
  Document,
  documentService as supabaseDocumentService
} from './DocumentService';
import { documentServiceFallback } from './DocumentServiceFallback';

// Interface for document service
export interface IDocumentService {
  loadDocument: (path: string) => Promise<Document>;
  getAllDocuments: (filter?: string) => Promise<Document[]>;
  saveDocument: (document: Document) => Promise<Document | null>;
  deleteDocument: (path: string) => Promise<boolean>;
  searchDocuments: (query: string) => Promise<Document[]>;
  clearDocumentCache: () => void;
}

// Flag to track whether we've already checked Supabase availability
let checkedSupabase = false;
let useSupabase = false;

/**
 * Get the appropriate document service implementation
 * Uses Supabase if available, falls back to mock implementation otherwise
 */
export async function getDocumentService(): Promise<IDocumentService> {
  // If we've already checked, return the cached decision
  if (checkedSupabase) {
    return useSupabase ? supabaseDocumentService : documentServiceFallback;
  }
  
  // Check if Supabase is configured
  if (isSupabaseConfigured()) {
    try {
      // Check if we can connect to Supabase
      const canConnect = await checkSupabaseConnection();
      
      if (canConnect) {
        console.log('Using Supabase document service');
        useSupabase = true;
        checkedSupabase = true;
        return supabaseDocumentService;
      }
    } catch (error) {
      // Errors will be caught and handled here
      console.warn('Error checking Supabase connection, using fallback service', error);
    }
  }
  
  // If we reach here, Supabase is not available
  console.log('Using fallback document service');
  useSupabase = false;
  checkedSupabase = true;
  return documentServiceFallback;
}

/**
 * Determine if we're using the Supabase service or the fallback
 */
export function isUsingSupabase(): boolean {
  return useSupabase;
}

/**
 * Force the use of a specific implementation
 * This is useful for testing
 */
export function forceUseSupabase(force: boolean): void {
  useSupabase = force;
  checkedSupabase = true;
}
