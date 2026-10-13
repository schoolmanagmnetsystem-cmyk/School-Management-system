/** Route paths and roles allowed by frontend guards (must match backend intent). */
export const ROLE_ACCESS = {
  '/platform': ['super_admin'],
  '/academic-periods': ['school_admin', 'admin', 'principal'],
  '/guardians': ['school_admin', 'admin', 'principal', 'receptionist', 'parent'],
  '/finance-operations': ['school_admin', 'admin', 'accountant'],
  '/students': ['school_admin', 'admin', 'principal', 'accountant', 'receptionist', 'teacher', 'student', 'parent'],
  '/teachers': ['school_admin', 'admin', 'principal', 'receptionist', 'teacher'],
  '/courses': ['school_admin', 'admin', 'principal', 'receptionist', 'teacher', 'student', 'parent'],
  '/attendance': ['school_admin', 'admin', 'principal', 'teacher', 'student', 'parent'],
  '/finance': ['school_admin', 'admin', 'principal', 'accountant', 'student', 'parent'],
  '/results': ['school_admin', 'admin', 'principal', 'teacher', 'student', 'parent'],
  '/mentorship': ['school_admin', 'admin', 'principal', 'teacher', 'student', 'parent'],
};

export function canAccessRoute(path, role) {
  const allowedRoles = ROLE_ACCESS[path];
  if (!allowedRoles) return true;
  return allowedRoles.includes(role);
}
