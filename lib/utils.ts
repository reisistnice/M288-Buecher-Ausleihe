export function decodeUsername(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return (
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ??
      payload.unique_name ??
      payload.name ??
      payload.username ??
      ''
    )
  } catch {
    return ''
  }
}

export function decodeEmail(token: string): string {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return (
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ??
      payload.email ??
      ''
    )
  } catch {
    return ''
  }
}

export function decodeUserId(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    const raw =
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/serialnumber'] ??
      payload.userId ??
      payload.sub ??
      null
    return raw !== null ? Number(raw) : null
  } catch {
    return null
  }
}

export function decodeExpiry(token: string): Date | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload.exp ? new Date(payload.exp * 1000) : null
  } catch {
    return null
  }
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
