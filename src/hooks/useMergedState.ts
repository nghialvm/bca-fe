import { useState } from 'react'

export function useMergedState<T extends object>(
    initialState: T
): [T, (newState: Partial<T>) => void] {
    const [state, setState] = useState<T>(initialState)

    const setMergedState = (newState: Partial<T>) => {
        setState((prev) => ({
            ...prev,
            ...newState,
        }))
    }

    return [state, setMergedState]
}
