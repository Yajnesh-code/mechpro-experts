export type UserRole =
  | 'admin'
  | 'corporate'
  | 'fleet'
  | 'broker'
  | 'insurance'
  | 'workshop';

export type UserStatus =
  | 'pending_email'
  | 'pending_mobile'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'inactive';
