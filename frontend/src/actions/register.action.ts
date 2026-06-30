import { registerUser } from '@/api/auth.api';
import { RegisterFormValues } from '@/schemas/auth.schema';

export async function registerAction(values: RegisterFormValues) {
  const { name, email, password, role } = values;
  return registerUser({ name, email, password, role });
}
