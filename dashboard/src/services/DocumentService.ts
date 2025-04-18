/**
 * DocumentService - Service for managing knowledge base documents using Supabase
 */
import { supabase } from '@/lib/supabase/client';

export interface Document {
  title: string;
  content: string;
  path: string;
  metadata?: Record<string, any>;
  last_updated?: string;
}

// In-memory cache for documents
const documentCache = new Map<string, {
  document: Document;
  cachedAt: number;
}>();

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION_MS = 5 * 60 * 1000;

/**
 * Load a document from Supabase by path
 */
export async function loadDocument(path: string): Promise<Document> {
  console.log(`DocumentService.loadDocument("${path}")`);
  
  // Normalize the path - remove leading/trailing slashes, remove knowledge-base prefix
  const normalizedPath = path
    .replace(/^\/+|\/+$/g, '')
    .replace(/^knowledge-base\/?/, '');
  
  console.log(`DocumentService - Normalized path: "${normalizedPath}"`);
  
  // Check cache first for better performance
  const cachedEntry = documentCache.get(normalizedPath);
  if (cachedEntry && (Date.now() - cachedEntry.cachedAt) < CACHE_EXPIRATION_MS) {
    console.log(`DocumentService - Cache hit for path: "${normalizedPath}"`);
    return cachedEntry.document;
  }
  
  try {
    // Query Supabase for the document
    const { data, error } = await supabase
      .from('documentation')
      .select('*')
      .eq('path', normalizedPath)
      .single();
    
    if (error) {
      console.error(`DocumentService - Error fetching document: ${error.message}`);
      
      // Try fallback strategies if exact path not found
      return await findBestMatchingDocument(normalizedPath);
    }
    
    if (data) {
      console.log(`DocumentService - Found document for path: "${normalizedPath}"`);
      
      const document: Document = {
        title: data.title,
        content: data.content,
        path: normalizedPath,
        metadata: data.metadata,
        last_updated: data.last_updated
      };
      
      // Cache the document
      documentCache.set(normalizedPath, {
        document,
        cachedAt: Date.now()
      });
      
      return document;
    }
    
    // If we reach here, no document was found with the exact path
    return await findBestMatchingDocument(normalizedPath);
    
  } catch (error) {
    console.error(`DocumentService - Unexpected error:`, error);
    // Generate fallback content in case of errors
    return generateDocument(normalizedPath);
  }
}

/**
 * Find the best matching document for a given path
 */
async function findBestMatchingDocument(path: string): Promise<Document> {
  console.log(`DocumentService - Looking for best matching document for: "${path}"`);
  
  // Strategy 1: Try with .md extension
  if (!path.endsWith('.md')) {
    const pathWithExt = `${path}.md`;
    try {
      const { data } = await supabase
        .from('documentation')
        .select('*')
        .eq('path', pathWithExt)
        .single();
      
      if (data) {
        console.log(`DocumentService - Found document with .md extension: "${pathWithExt}"`);
        
        const document: Document = {
          title: data.title,
          content: data.content,
          path,
          metadata: data.metadata,
          last_updated: data.last_updated
        };
        
        return document;
      }
    } catch (error) {
      // Continue with other strategies
    }
  }
  
  // Strategy 2: Try to match a parent path
  const pathParts = path.split('/');
  while (pathParts.length > 0) {
    pathParts.pop();
    const parentPath = pathParts.join('/');
    
    if (parentPath) {
      try {
        const { data } = await supabase
          .from('documentation')
          .select('*')
          .eq('path', parentPath)
          .single();
        
        if (data) {
          console.log(`DocumentService - Found parent document: "${parentPath}"`);
          
          const document: Document = {
            title: data.title,
            content: data.content,
            path, // Keep original path for consistency
            metadata: data.metadata,
            last_updated: data.last_updated
          };
          
          return document;
        }
      } catch (error) {
        // Continue with other strategies
      }
    }
  }
  
  // Strategy 3: Find path with most similar segments using a LIKE query
  try {
    // Try to find documents with similar paths by taking the first segment
    const firstSegment = path.split('/')[0];
    
    if (firstSegment) {
      const { data } = await supabase
        .from('documentation')
        .select('*')
        .like('path', `${firstSegment}%`)
        .order('path', { ascending: true })
        .limit(1);
      
      if (data && data.length > 0) {
        console.log(`DocumentService - Found similar document: "${data[0].path}"`);
        
        const document: Document = {
          title: data[0].title,
          content: data[0].content,
          path, // Keep original path for consistency
          metadata: data[0].metadata,
          last_updated: data[0].last_updated
        };
        
        return document;
      }
    }
  } catch (error) {
    // Continue to fallback
  }
  
  // Fallback: Generate content for unknown path
  return generateDocument(path);
}

/**
 * Generate a document for an unknown path
 */
function generateDocument(path: string): Document {
  console.log(`DocumentService - Generating content for unknown path: "${path}"`);
  
  // Extract title from path
  const title = formatTitle(path);
  
  // Create breadcrumb text
  const breadcrumbs = path
    .split('/')
    .map(part => formatTitle(part))
    .join(' > ');
  
  // Create document sections
  const content = `# ${title}

## Path

${breadcrumbs}

## Overview

This document contains information about ${title.toLowerCase()}.

## Details

This page was automatically generated for the path: ${path}.

## Related Documents

${path
  .split('/')
  .map(part => `- ${formatTitle(part)}`)
  .join('\n')}

## Last Updated

${new Date().toLocaleDateString()}`;
  
  return {
    title,
    content,
    path,
    last_updated: new Date().toISOString()
  };
}

/**
 * Format a path segment as a title
 */
function formatTitle(pathSegment: string): string {
  if (!pathSegment) return 'Home';
  
  return pathSegment
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get all documents - useful for creating the sidebar
 */
export async function getAllDocuments(filter?: string): Promise<Document[]> {
  try {
    let query = supabase
      .from('documentation')
      .select('path, title, metadata, last_updated');
    
    // Apply filter if provided
    if (filter) {
      query = query.like('path', `${filter}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching all documents:', error);
      return [];
    }
    
    return data.map(item => ({
      path: item.path,
      title: item.title,
      content: '', // Don't load content for listings to save bandwidth
      metadata: item.metadata,
      last_updated: item.last_updated
    }));
  } catch (error) {
    console.error('Unexpected error fetching documents:', error);
    return [];
  }
}

/**
 * Create a new document or update an existing one
 */
export async function saveDocument(document: Document): Promise<Document | null> {
  try {
    // Normalize the path
    const normalizedPath = document.path
      .replace(/^\/+|\/+$/g, '')
      .replace(/^knowledge-base\/?/, '');
    
    const { data, error } = await supabase
      .from('documentation')
      .upsert({
        path: normalizedPath,
        title: document.title,
        content: document.content,
        metadata: document.metadata || {},
        last_updated: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving document:', error);
      return null;
    }
    
    // Update cache with the new document
    const savedDocument: Document = {
      title: data.title,
      content: data.content,
      path: data.path,
      metadata: data.metadata,
      last_updated: data.last_updated
    };
    
    documentCache.set(normalizedPath, {
      document: savedDocument,
      cachedAt: Date.now()
    });
    
    return savedDocument;
  } catch (error) {
    console.error('Unexpected error saving document:', error);
    return null;
  }
}

/**
 * Delete a document by path
 */
export async function deleteDocument(path: string): Promise<boolean> {
  try {
    // Normalize the path
    const normalizedPath = path
      .replace(/^\/+|\/+$/g, '')
      .replace(/^knowledge-base\/?/, '');
    
    const { error } = await supabase
      .from('documentation')
      .delete()
      .eq('path', normalizedPath);
    
    if (error) {
      console.error('Error deleting document:', error);
      return false;
    }
    
    // Remove from cache
    documentCache.delete(normalizedPath);
    
    return true;
  } catch (error) {
    console.error('Unexpected error deleting document:', error);
    return false;
  }
}

/**
 * Search for documents by keyword
 */
export async function searchDocuments(query: string): Promise<Document[]> {
  if (!query || query.trim() === '') {
    return [];
  }
  
  try {
    // Using ilike for case-insensitive search in both title and content
    const { data, error } = await supabase
      .from('documentation')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(20);
    
    if (error) {
      console.error('Error searching documents:', error);
      return [];
    }
    
    return data.map(item => ({
      title: item.title,
      content: item.content,
      path: item.path,
      metadata: item.metadata,
      last_updated: item.last_updated
    }));
  } catch (error) {
    console.error('Unexpected error searching documents:', error);
    return [];
  }
}

/**
 * Clear the document cache
 */
export function clearDocumentCache(): void {
  documentCache.clear();
}

/**
 * Singleton document service
 */
export const documentService = {
  loadDocument,
  getAllDocuments,
  saveDocument,
  deleteDocument,
  searchDocuments,
  clearDocumentCache
};
