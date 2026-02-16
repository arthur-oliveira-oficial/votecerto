import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Função para mascarar CPF
 * Exibe apenas os 3 primeiros dígitos e os 2 últimos
 * Ex: 12345678901 -> 123.456.789-**
 */
export function mascararCpf(cpf: string | null | undefined): string {
  if (!cpf) return '-'

  // Remove formatação (pontos e hífen)
  const cpfNumeros = cpf.replace(/\D/g, '')

  if (cpfNumeros.length !== 11) return cpf

  // Formata: 3 primeiros + últimos 2 com máscara
  const parte1 = cpfNumeros.substring(0, 3)
  const parte2 = cpfNumeros.substring(3, 6)
  const parte3 = cpfNumeros.substring(6, 9)
  const parte4 = cpfNumeros.substring(9, 11)

  return `${parte1}.${parte2}.${parte3}-**`
}