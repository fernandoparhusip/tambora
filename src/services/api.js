const API_URL = 'http://localhost:8080'

export async function fetchApi(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        })

        if (!response.ok) {
            throw new Error(
                `Request gagal: ${response.status} ${response.statusText}`
            )
        }

        return await response.json()

    } catch (error) {
        console.error('API Error:', error)
        throw error
    }
}