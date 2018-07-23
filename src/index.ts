enum PromyseState {
    Pending = "PENDING",
    Fulfilled = "FULFILLED",
    Rejected = "REJECTED"
}

export class Promyse<T> {
    value?: T
    err?: Error
    subscribers: Promyse<any>[] = []
    state = PromyseState.Pending
    onFullfilled?: (value?: any) => T | undefined
    onRejected?: (err?: Error) => Error

    private handlers = {}
    
    resolve = (v?: T) => {
        if (this.state !== PromyseState.Pending) return
        this.state = PromyseState.Fulfilled
        this.value = v
        this.broadcast()
    }
    reject = (err?: Error) => {
        if (this.state !== PromyseState.Pending) return
        this.state = PromyseState.Rejected
        this.err = err
        this.broadcast()
    }

    constructor(handler: (resolve: (v?: T) => void, reject?: (err: Error) => void) => void) {
        handler(this.resolve, this.reject)
    }

    then<V>(onFullfilled: (value?: T) => V | undefined, onRejected?: (err?: Error) => Error): Promyse<V> {
        const subscriber = new Promyse<V>(() => {})
        subscriber.onFullfilled = onFullfilled
        subscriber.onRejected = onRejected

        this.subscribers.push(subscriber)
        this.broadcast()
        return subscriber
    }

    broadcast() {
        if (this.state === PromyseState.Pending) return
        const fulfilled = this.state == PromyseState.Fulfilled

        setTimeout(() => {
            this.subscribers.splice(0).forEach((s) => {
                if (fulfilled) {
                    return s.onFullfilled ? s.resolve(s.onFullfilled(this.value)) : s.resolve(this.value)
                } else {
                    return s.onRejected ? s.reject(s.onRejected(this.err)) : s.reject(this.err)
                }
            })
        }, 0)
    }

}