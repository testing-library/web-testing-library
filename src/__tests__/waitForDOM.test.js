/**
 * @jest-environment jsdom
 */

import * as prettyFormat from 'pretty-format'
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

function getWindowFromNode(node) {
  if (node.defaultView) {
    // node is document
    return node.defaultView
  } else if (node.ownerDocument && node.ownerDocument.defaultView) {
    // node is a DOM node
    return node.ownerDocument.defaultView
  } else {
    // node is window
    return node.window
  }
}

/**
 * Reference implementation of `waitFor` when a DOM is available.
 * Supports fake timers and configureable instrumentation.
 */
function waitFor(
  callback,
  {
    container = document,
    interval = 50,
    mutationObserverOptions = {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    },
    timeout = 1000,
  } = {},
) {
  function getElementError(message) {
    const prettifiedDOM = prettyFormat(container)
    const error = new Error(
      [message, prettifiedDOM].filter(Boolean).join('\n\n'),
    )
    error.name = 'TestingLibraryElementError'
    return error
  }

  function handleTimeout(error) {
    error.message = getElementError(error.message).message
    return error
  }

  function advanceTimersWrapper(cb) {
    // /dom config. /react uses act() here
    return cb()
  }

  function runWithExpensiveErrorDiagnosticsDisabled() {
    // /dom would disable certain config options when running callback
    return callback()
  }

  /** @type {import('../').FakeClock} */
  const jestFakeClock = {
    advanceTimersByTime: timeoutMS => {
      advanceTimersWrapper(() => {
        jest.advanceTimersByTime(timeoutMS)
      })
    },
    flushPromises: () => {
      return advanceTimersWrapper(async () => {
        await new Promise(r => {
          setTimeout(r, 0)
          jest.advanceTimersByTime(0)
        })
      })
    },
  }
  const clock = jestFakeTimersAreEnabled() ? jestFakeClock : undefined
  const controller = new AbortController()

  return new Promise((resolve, reject) => {
    let promiseStatus = 'idle'

    function onDone(error, result) {
      controller.abort()
      if (error === null) {
        resolve(result)
      } else {
        reject(error)
      }
    }

    function checkCallbackWithExpensiveErrorDiagnosticsDisabled() {
      if (promiseStatus === 'pending') return undefined

      const result = runWithExpensiveErrorDiagnosticsDisabled()
      if (typeof result?.then === 'function') {
        promiseStatus = 'pending'
        return result.then(
          resolvedValue => {
            promiseStatus = 'resolved'
            return resolvedValue
          },
          rejectedValue => {
            promiseStatus = 'rejected'
            throw rejectedValue
          },
        )
      }
      return result
    }

    waitForWeb(checkCallbackWithExpensiveErrorDiagnosticsDisabled, {
      clock,
      interval,
      onTimeout: handleTimeout,
      signal: controller.signal,
      timeout,
    }).then(
      result => {
        onDone(null, result)
      },
      error => {
        // https://webidl.spec.whatwg.org/#idl-DOMException
        // https://dom.spec.whatwg.org/#ref-for-dom-abortcontroller-abortcontroller%E2%91%A0
        const isAbortError =
          error.name === 'AbortError' && error.code === DOMException.ABORT_ERR
        // Ignore abort errors
        if (!isAbortError) {
          onDone(error, null)
        }
      },
    )

    const {MutationObserver} = getWindowFromNode(container)
    const observer = new MutationObserver(
      checkCallbackWithExpensiveErrorDiagnosticsDisabled,
    )
    observer.observe(container, mutationObserverOptions)
    controller.signal.addEventListener('abort', () => {
      observer.disconnect()
    })
  })
}

test('runs', async () => {
  await expect(waitFor(() => {})).resolves.toBeUndefined()
})
