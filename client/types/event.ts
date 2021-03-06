enum Role {
    Tank, Damage, Support, Any
}

interface Event {
    id: string,
    date: Date,
    role: Role,
    day: number
    placement: boolean
    diff: number | undefined
    sr: number | undefined
    map: string | undefined
    balance: string | undefined
    outcome: string | undefined
    ranked: boolean | undefined
}

export { Event, Role }
