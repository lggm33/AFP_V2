// Re-export types from shared-types package
export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
} from '@afp/shared-types';

// Import specific types directly
export type { ApiResponse } from '@afp/shared-types/dist/api/common';

export type {
  EmailProcessingRequest,
  EmailProcessingResponse,
} from '@afp/shared-types/dist/api/email-accounts';
