type User = {
  permissions: string[];
  roles: string[];
};

type validateUserPermissionsParams = {
  user: User;
  permissions?: string[];
  roles?: string[];
};

export function validateUserPermissions({
  user,
  permissions,
  roles,
}: validateUserPermissionsParams) {
  if (permissions?.length > 0) {
    // array.some retorna true caso alguma das condições dentro da função estiverem satisfeitas
    const hasAllPermissions = permissions.some((permission) => {
      return user.permissions.includes(permission);
    });

    if (!hasAllPermissions) {
      return false;
    }
  }

  if (roles?.length > 0) {
    // array.every retorna true caso todas as condições dentro da função estiverem satisfeitas
    const hasAllRoles = roles.every((role) => {
      return user.roles.includes(role);
    });

    if (!hasAllRoles) {
      return false;
    }
  }

  return true;
}
