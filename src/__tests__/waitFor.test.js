/**
 * @jest-environment node
 */

import * as prettyFormat from 'pretty-format'
import {waitFor} from '../'

function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return {promise, resolve, reject}
}

beforeEach(() => {
  jest.useRealTimers()
})

test('waits callback to not throw an error', async () => {
  const spy = jest.fn()
  // we are using random timeout here to simulate a real-time example
  // of an async operation calling a callback at a non-deterministic time
  const randomTimeout = Math.floor(Math.random() * 60)
  setTimeout(spy, randomTimeout)

  await waitFor(() => expect(spy).toHaveBeenCalledTimes(1))
  expect(spy).toHaveBeenCalledWith()
})

// we used to have a limitation where we had to set an interval of 0 to 1
// otherwise there would be problems. I don't think this limitation exists
// anymore, but we'll keep this test around to make sure a problem doesn't
// crop up.
test('can accept an interval of 0', () => waitFor(() => {}, {interval: 0}))

test('can timeout after the given timeout time', async () => {
  const error = new Error('throws every time')
  const result = await waitFor(
    () => {
      throw error
    },
    {timeout: 8, interval: 5},
  ).catch(e => e)
  expect(result).toBe(error)
})

test('if no error is thrown then throws a timeout error', async () => {
  const result = await waitFor(
    () => {
      // eslint-disable-next-line no-throw-literal
      throw undefined
    },
    {timeout: 8, interval: 5, onTimeout: e => e},
  ).catch(e => e)
  expect(result).toMatchInlineSnapshot(`[Error: Timed out in waitFor.]`)
})

test('if showOriginalStackTrace on a timeout error then the stack trace does not include this file', async () => {
  const result = await waitFor(
    () => {
      // eslint-disable-next-line no-throw-literal
      throw undefined
    },
    {timeout: 8, interval: 5, showOriginalStackTrace: true},
  ).catch(e => e)
  expect(result.stack).not.toMatch(__dirname)
})

test('uses full stack error trace when showOriginalStackTrace present', async () => {
  const error = new Error('Throws the full stack trace')
  // even if the error is a TestingLibraryElementError
  error.name = 'TestingLibraryElementError'
  const originalStackTrace = error.stack
  const result = await waitFor(
    () => {
      throw error
    },
    {timeout: 8, interval: 5, showOriginalStackTrace: true},
  ).catch(e => e)
  expect(result.stack).toBe(originalStackTrace)
})

test('throws nice error if provided callback is not a function', () => {
  const someElement = {}
  expect(() => waitFor(someElement)).toThrow(
    'Received `callback` arg must be a function',
  )
})

test('when a promise is returned, it does not call the callback again until that promise rejects', async () => {
  const sleep = t => new Promise(r => setTimeout(r, t))
  const p1 = deferred()
  const waitForCb = jest.fn(() => p1.promise)
  const waitForPromise = waitFor(waitForCb, {interval: 1})
  expect(waitForCb).toHaveBeenCalledTimes(1)
  waitForCb.mockClear()
  await sleep(50)
  expect(waitForCb).toHaveBeenCalledTimes(0)

  const p2 = deferred()
  waitForCb.mockImplementation(() => p2.promise)

  p1.reject('p1 rejection (should not fail this test)')
  await sleep(50)

  expect(waitForCb).toHaveBeenCalledTimes(1)
  p2.resolve()

  await waitForPromise
})

test('when a promise is returned, if that is not resolved within the timeout, then waitFor is rejected', async () => {
  const sleep = t => new Promise(r => setTimeout(r, t))
  const {promise} = deferred()
  const waitForError = waitFor(() => promise, {timeout: 1}).catch(e => e)
  await sleep(5)

  expect((await waitForError).message).toMatchInlineSnapshot(
    `Timed out in waitFor.`,
  )
})

test('does not work after it resolves', async () => {
  jest.useFakeTimers('modern')
  let context = 'initial'

  /** @type {import('../').FakeClock} */
  const clock = {
    // @testing-library/react usage to ensure `IS_REACT_ACT_ENVIRONMENT` is set when acting.
    advanceTimersByTime: async timeoutMS => {
      const originalContext = context
      context = 'act'
      try {
        jest.advanceTimersByTime(timeoutMS)
      } finally {
        context = originalContext
      }
    },
    flushPromises: async () => {
      const originalContext = context
      context = 'no-act'
      try {
        await await new Promise(r => {
          setTimeout(r, 0)
          jest.advanceTimersByTime(0)
        })
      } finally {
        context = originalContext
      }
    },
  }

  let data = null
  setTimeout(() => {
    data = 'resolved'
  }, 100)

  await waitFor(
    () => {
      // eslint-disable-next-line jest/no-conditional-in-test -- false-positive
      if (data === null) {
        throw new Error('not found')
      }
    },
    {clock, interval: 50},
  )

  expect(context).toEqual('initial')

  await Promise.resolve()

  expect(context).toEqual('initial')
})

/** @type {import('../').FakeClock} */
const jestFakeClock = {
  advanceTimersByTime: async timeoutMS => {
    jest.advanceTimersByTime(timeoutMS)
  },
}
describe.each([
  ['real timers', {useTimers: () => jest.useRealTimers(), clock: undefined}],
  [
    'fake legacy timers',
    {useTimers: () => jest.useFakeTimers('legacy'), clock: jestFakeClock},
  ],
  [
    'fake modern timers',
    {useTimers: () => jest.useFakeTimers('modern'), clock: jestFakeClock},
  ],
])(
  'waitFor DOM reference implementation using %s',
  (label, {useTimers, clock}) => {
    beforeEach(() => {
      useTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    test('void callback', async () => {
      await expect(waitFor(() => {}, {clock})).resolves.toBeUndefined()
    })

    test('callback passes after timeout', async () => {
      let state = 'pending'
      setTimeout(() => {
        state = 'done'
      }, 10)

      await expect(
        waitFor(
          () => {
            if (state !== 'done') {
              throw new Error('Not done')
            }
          },
          {clock, interval: 5},
        ),
      ).resolves.toBeUndefined()
    })

    test('timeout', async () => {
      const state = 'pending'

      await expect(
        waitFor(
          () => {
            if (state !== 'done') {
              throw new Error('Not done')
            }
          },
          {clock, timeout: 10},
        ),
      ).rejects.toThrowErrorMatchingSnapshot()
    })
  },
)
