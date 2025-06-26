export interface Newsletter {
    id: number;
    title: string;
    sender: string;
    senderEmail: string;
    subject: string;
    content: string;
    htmlContent?: string;
    isRead: boolean;
    isStarred: boolean;
    isArchived: boolean;
    tags?: string[];
    folder: string;
    receivedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    categoryId?: number;
  }
  
  export interface Folder {
    id: number;
    name: string;
    color: string;
    icon: string;
    isSystem: boolean;
    count?: number;
  }
  
  export interface Tag {
    id: number;
    name: string;
    color: string;
  }
  
  export interface SearchFilters {
    query?: string;
    folder?: string;
    tags?: string[];
    isRead?: boolean;
    isStarred?: boolean;
    dateRange?: {
      from: Date;
      to: Date;
    };
  }
  
  export interface KeyboardShortcut {
    key: string;
    description: string;
    action: () => void;
  }
  