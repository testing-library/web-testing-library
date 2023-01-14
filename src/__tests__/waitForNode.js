/**
 * @jest-environment node
 */

import {waitFor as waitForWeb} from '../'

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
function waitFor(callback, {interval = 50, timeout = 1000} = {}) {
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
    interval,
    timeout,
  })
}

test('runs', async () => {
  await expect(waitFor(() => {})).resolves.toBeUndefined()
})
