export interface Loan {
  id: number
  bookTitle: string
  isbn: string
  borrowedAt: string
}

export class LoanService {
  private static authHeader(token: string) {
    return { Authorization: `Bearer ${token}` }
  }

  static async fetchMyLoans(token: string): Promise<Loan[]> {
    const res = await fetch('/api/loans/me', {
      headers: this.authHeader(token),
    })
    if (res.status === 401) throw new Error('UNAUTHORIZED')
    if (!res.ok) throw new Error('Failed to load loans')
    return res.json()
  }

  static async returnLoan(loanId: number, token: string): Promise<void> {
    const res = await fetch(`/api/loans/${loanId}/return`, {
      method: 'PUT',
      headers: this.authHeader(token),
    })
    if (res.status === 401) throw new Error('UNAUTHORIZED')
    if (!res.ok) {
      const d = await res.json().catch(() => ({}))
      throw new Error(d.message ?? 'Return failed')
    }
  }
}
