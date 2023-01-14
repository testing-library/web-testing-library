import {waitFor} from '../'

test('runs', async () => {
  await expect(waitFor(() => {})).resolves.toBeUndefined()
})
