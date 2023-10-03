// This is so the stack trace the developer sees is one that's
// closer to their code (because async stack traces are hard to follow).
function copyStackTrace(target: Error, source: Error) {
  if (source.stack !== undefined) {
    target.stack = source.stack.replace(source.message, target.message)
  }
}

export interface FakeClock {
  advanceTimersByTime: (timeoutMS: number) => Promise<void>
  flushPromises: () => Promise<void>
}

export interface WaitForOptions {
  clock?: FakeClock
  /**
   * @default 50
   */
  interval?: number
  onTimeout?: (error: unknown) => unknown
  signal?: AbortSignal
  /**
   * @default false
   */
  showOriginalStackTrace?: boolean
  /**
   * @default 1000
   */
  timeout?: number
}

interface WaitForImplOptions extends WaitForOptions {
  stackTraceError: Error
}

function waitForImpl<T>(
  callback: () => T | Promise<T>,
  {
    clock,
    timeout = 1000,
    showOriginalStackTrace = false,
    stackTraceError,
    interval = 50,
    onTimeout = error => {
      return error
    },
    signal,
  }: WaitForImplOptions,
) {
  if (typeof callback !== 'function') {
    throw new TypeError('Received `callback` arg must be a function')
  }

  return new Promise(async (resolve, reject) => {
    let lastError: unknown
    let finished = false
    let promiseStatus = 'idle'

    const overallTimeoutTimer = setTimeout(handleTimeout, timeout)
    const intervalId = setInterval(checkCallback, interval)

    if (signal !== undefined) {
      if (signal.aborted) {
        onDone(new Error(`Aborted: ${signal.reason}`), null)
      }
      signal.addEventListener('abort', () => {
        onDone(new Error(`Aborted: ${signal.reason}`), null)
      })
    }

    checkCallback()

    if (clock !== undefined) {
      // this is a dangerous rule to disable because it could lead to an
      // infinite loop. However, eslint isn't smart enough to know that we're
      // setting finished inside `onDone` which will be called when we're done
      // waiting or when we've timed out.
      // eslint-disable-next-line no-unmodified-loop-condition, @typescript-eslint/no-unnecessary-condition
      while (!finished && !signal?.aborted) {
        // In this rare case, we *need* to wait for in-flight promises
        // to resolve before continuing. We don't need to take advantage
        // of parallelization so we're fine.
        // https://stackoverflow.com/a/59243586/971592
        // eslint-disable-next-line no-await-in-loop
        await clock.advanceTimersByTime(interval)
      }
    }

    function onDone(error: null, result: unknown): void
    function onDone(error: unknown, result: null): void
    function onDone(error: null | unknown, result: null | unknown) {
      finished = true
      clearTimeout(overallTimeoutTimer)
      clearInterval(intervalId)

      if (error) {
        reject(error)
      } else {
        resolve(result)
      }
    }

    function checkCallback() {
      if (promiseStatus === 'pending') return
      try {
        const result = callback()
        if (
          result !== null &&
          typeof result === 'object' &&
          typeof (result as any).then === 'function'
        ) {
          const thenable = result as PromiseLike<T>
          promiseStatus = 'pending'
          thenable.then(
            resolvedValue => {
              promiseStatus = 'resolved'
              onDone(null, resolvedValue)
            },
            rejectedValue => {
              promiseStatus = 'rejected'
              lastError = rejectedValue
            },
          )
        } else {
          onDone(null, result)
        }
        // If `callback` throws, wait for the next mutation, interval, or timeout.
      } catch (error: unknown) {
        // Save the most recent callback error to reject the promise with it in the event of a timeout
        lastError = error
      }
    }

    function handleTimeout() {
      let error: Error
      if (lastError) {
        error = lastError as Error
      } else {
        error = new Error('Timed out in waitFor.')
        if (!showOriginalStackTrace) {
          copyStackTrace(error, stackTraceError)
        }
      }
      onDone(onTimeout(error), null)
    }
  })
}

export default function waitFor(
  callback: () => void | Promise<void>,
  options: WaitForOptions,
) {
  // create the error here so its stack trace is as close to the
  // calling code as possible
  const stackTraceError = new Error('STACK_TRACE_MESSAGE')
  return waitForImpl(callback, {stackTraceError, ...options})
}
