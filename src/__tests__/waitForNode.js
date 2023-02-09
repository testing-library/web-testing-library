/**
 * @jest-environment node
 */

import {waitFor as waitForWeb} from '../'

function sleep(timeoutMS, signal) {
  return new Promise((resolve, reject) => {
    const timeoutID = setTimeout(() => {
      resolve()
    }, timeoutMS)
    signal?.addEventListener('abort', reason => {
      clearTimeout(timeoutID)
      reject(reason)
    })
  })
}

function jestFakeTimersAreEnabled() {
  /* istanbul ignore else */
  // eslint-disable-next-line
  if (typeof jest !== 'undefined' && jest !== null) {
    return (
      // legacy timers
      setTimeout._isMockFunction === true ||
      // modern timers
      Object.prototype.hasOwnProperty.call(setTimeout, 'clock')
    )
  }
  // istanbul ignore next
  return false
}

/**
 * Reference implementation of `waitFor` that supports Jest fake timers
 */
function waitFor(callback, options) {
  /** @type {import('../').FakeClock} */
  const jestFakeClock = {
    advanceTimersByTime: timeoutMS => {
      jest.advanceTimersByTime(timeoutMS)
    },
    flushPromises: () => {
      return new Promise(r => {
        setTimeout(r, 0)
        jest.advanceTimersByTime(0)
      })
    },
  }
  const clock = jestFakeTimersAreEnabled() ? jestFakeClock : undefined

  return waitForWeb(callback, {
    clock,
    ...options,
  })
}

// TODO: Use jest.replaceProperty(global, 'Error', ErrorWithoutStack) and `jest.restoreAllMocks`
let originalError
beforeEach(() => {
  originalError = global.Error
})
afterEach(() => {
  global.Error = originalError
})

test('runs', async () => {
  await expect(waitFor(() => {})).resolves.toBeUndefined()
})

test('ensures the given callback is a function', () => {
  expect(() => waitFor(null)).toThrowErrorMatchingInlineSnapshot(
    `Received \`callback\` arg must be a function`,
  )
})

const testAbortController =
  typeof AbortController === 'undefined' ? test.skip : test

describe('using fake modern timers', () => {
  beforeEach(() => {
    jest.useFakeTimers('modern')
  })
  afterEach(() => {
    jest.useRealTimers()
  })

  test('times out after 1s by default', async () => {
    let resolved = false
    setTimeout(() => {
      resolved = true
    }, 1000)

    await expect(
      waitFor(() => {
        if (!resolved) {
          throw new Error('Not resolved')
        }
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`Not resolved`)
  })

  test('times out even if the callback never settled', async () => {
    await expect(
      waitFor(() => {
        return new Promise(() => {})
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`Timed out in waitFor.`)
  })

  test('callback can return a promise and is not called again until the promise resolved', async () => {
    const callback = jest.fn(() => {
      return sleep(20)
    })

    await expect(waitFor(callback, {interval: 1})).resolves.toBeUndefined()
    // We configured the waitFor call to ping every 1ms.
    // But the callback only resolved after 20ms.
    // If we would ping as instructed, we'd have 20+1 calls (1 initial, 20 for pings).
    // But the implementation waits for callback to resolve first before checking again.
    expect(callback).toHaveBeenCalledTimes(1)
  })

  test('callback is not called again until the promise rejects', async () => {
    const callback = jest.fn(async () => {
      await sleep(20)
      throw new Error('Not done')
    })

    await expect(
      waitFor(callback, {interval: 1, timeout: 30}),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`Not done`)
    // We configured the waitFor call to ping every 1ms.
    // But the callback only rejected after 20ms.
    // If we would ping as instructed, we'd have 30+1 calls (1 initial, 30 for pings until timeout was reached).
    // But the implementation waits for callback to resolve first before checking again.
    // So we have 1 for the initial check (that takes 20ms) and one for an interval check after the initial check resolved.
    // Next ping would happen at 40ms but we already timed out at this point
    expect(callback).toHaveBeenCalledTimes(2)
  })

  test('massages the stack trace to point to the waitFor call not the callback call', async () => {
    let waitForError
    try {
      await waitFor(
        () => {
          return sleep(100)
        },
        {showOriginalStackTrace: false, interval: 100, timeout: 1},
      )
    } catch (caughtError) {
      waitForError = caughtError
    }

    const stackTrace = waitForError.stack.split('\n').slice(1)
    // The earlier a stackframe points to the actual callsite the better
    const testStackFrame = stackTrace[1]
    const fileLocationRegexp = /\((.*):\d+:\d+\)$/
    expect(testStackFrame).toMatch(fileLocationRegexp)
    const [, fileLocation] = testStackFrame.match(fileLocationRegexp)
    expect(fileLocation).toBe(__filename)
  })

  test('does not crash in runtimes without Error.prototype.stack', async () => {
    class ErrorWithoutStack extends Error {
      // Not the same as "not having" but close enough
      // stack a non-standard property so we have to guard against stack not existing
      stack = undefined
    }
    const originalGlobalError = global.Error
    global.Error = ErrorWithoutStack
    let waitForError
    try {
      await waitFor(
        () => {
          return sleep(100)
        },
        {interval: 100, timeout: 1},
      )
    } catch (caughtError) {
      waitForError = caughtError
    }
    // Restore early so that Jest can use Error.prototype.stack again
    // Still need global restore in case something goes wrong.
    global.Error = originalGlobalError

    // Feel free to update this snapshot.
    // It's only used to highlight how bad the default stack trace is if we timeout
    // The only frame pointing to this test is the one from the wrapper.
    // An actual test would not have any frames pointing to this test.
    expect(waitForError.stack).toBeUndefined()
  })

  test('can be configured to throw an error with the original stack trace', async () => {
    let waitForError
    try {
      await waitFor(
        () => {
          return sleep(100)
        },
        {showOriginalStackTrace: true, interval: 100, timeout: 1},
      )
    } catch (caughtError) {
      waitForError = caughtError
    }

    // Feel free to update this snapshot.
    // It's only used to highlight how bad the default stack trace is if we timeout
    // The only frame pointing to this test is the one from the wrapper.
    // An actual test would not have any frames pointing to this test.
    expect(waitForError.stack).toMatchInlineSnapshot(`
      Error: Timed out in waitFor.
          at handleTimeout (<PROJECT_ROOT>/src/waitFor.ts:146:17)
          at callTimer (<PROJECT_ROOT>/node_modules/@sinonjs/fake-timers/src/fake-timers-src.js:729:24)
          at doTickInner (<PROJECT_ROOT>/node_modules/@sinonjs/fake-timers/src/fake-timers-src.js:1289:29)
          at doTick (<PROJECT_ROOT>/node_modules/@sinonjs/fake-timers/src/fake-timers-src.js:1370:20)
          at Object.tick (<PROJECT_ROOT>/node_modules/@sinonjs/fake-timers/src/fake-timers-src.js:1378:20)
          at FakeTimers.advanceTimersByTime (<PROJECT_ROOT>/node_modules/@jest/fake-timers/build/modernFakeTimers.js:101:19)
          at Object.advanceTimersByTime (<PROJECT_ROOT>/node_modules/jest-runtime/build/index.js:2228:26)
          at Object.advanceTimersByTime (<PROJECT_ROOT>/src/__tests__/waitForNode.js:41:12)
          at <PROJECT_ROOT>/src/waitFor.ts:80:15
          at new Promise (<anonymous>)
    `)
  })

  testAbortController('can be aborted with an AbortSignal', async () => {
    const callback = jest.fn(() => {
      throw new Error('not done')
    })
    const controller = new AbortController()
    const waitForError = waitFor(callback, {
      signal: controller.signal,
    })

    controller.abort('Bailing out')

    await expect(waitForError).rejects.toThrowErrorMatchingInlineSnapshot(
      `Aborted: Bailing out`,
    )
    // Initial check + one ping (after which we yield which gives us a chance to advance to the controller.abort call)
    expect(callback).toHaveBeenCalledTimes(2)
  })

  testAbortController(
    'does not even ping if the signal is already aborted',
    async () => {
      const callback = jest.fn(() => {
        throw new Error('not done')
      })
      const controller = new AbortController()
      controller.abort('Bailing out')

      const waitForError = waitFor(callback, {
        signal: controller.signal,
      })

      await expect(waitForError).rejects.toThrowErrorMatchingInlineSnapshot(
        `Aborted: Bailing out`,
      )
      // Just the initial check
      expect(callback).toHaveBeenCalledTimes(1)
    },
  )
})
