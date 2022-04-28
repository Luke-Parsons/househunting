import { getHouseAddress } from '../src/houseInfo'

test('should show welcome message', () => {
  expect( getHouseAddress("42","E15 3PJ")).toMatchInlineSnapshot(`"Welcome to ts-jest!!!"`)
})
