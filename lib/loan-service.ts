export interface Loan {
  id: number
  bookTitle: string
  loanDate: string
}

export class LoanService {
  static async fetchMyLoans(): Promise<Loan[]> {
    const res = await fetch('/api/loans/me')
    if (res.status === 401) throw new Error('UNAUTHORIZED')
    if (!res.ok) throw new Error('Failed to load loans')
    return res.json()
  }

  static async returnLoan(loanId: number, token?: string | null): Promise<void> {
    const res = await fetch(`/api/loans/${loanId}/return`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (res.status === 401) throw new Error('UNAUTHORIZED')
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      throw new Error(d.message ?? 'Return failed')
    }
  }
}
