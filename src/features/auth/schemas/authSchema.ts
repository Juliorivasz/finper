import { z } from "zod";

export const authSchema = z.object({
  email: z.string().email({ message: "Por favor, ingresa un correo válido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

export type AuthFormValues = z.infer<typeof authSchema>;
