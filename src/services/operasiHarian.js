import { fetchApi } from './api'

export async function getOperasiHarian() {
    return await fetchApi('/v1/operasi-harian')
}